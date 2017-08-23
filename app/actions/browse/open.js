const puppeteer = require('puppeteer');
const q = require('q');
const _ = require('underscore');

function createEndReply(request) {
     var contentType;
     var headers = {};
     var contentLength;
     if (request && request._response) {
          for (var key of request._response.headers.keys()) {
               headers[key] = request._response.headers.get(key)
               if (key.toLowerCase() == 'content-type') {
                    contentType = request._response.headers.get(key);
               }
               if (key.toLowerCase() == 'content-length') {
                    contentLength = request._response.headers.get(key);
               }
          }
     } else if (!request) {
          request = {
               status: null,
               ok: null
          }
     }
     return {
          bodySize: contentLength,
          time: new Date(),
          headers: headers,
          status: request.status,
          statusText: request.ok,
          contentType: contentType
     }
}

function processRequest(response, request) {
      response.resources[request._requestId] = {
          request: {
               time: new Date(),
               url: request.url,
               headers: request.headers,
               method: request.method
          },
          startReply: {
               time: new Date(),
               bodySize: 0
          },
          endReply: {
               bodySize: null,
               time: null,
               contentType: null,
               headers: null,
               status: null,
               statusText: null,
               contentType: null,
               body: null
          }
     };
     return response;
}

function completeResource(response, request) {
     if (request && response.resources[request._requestId]) {
          response.resources[request._requestId].endReply = createEndReply(request);
     }
     return response;
}

function extendResponse(options, response) {
     if (typeof options.addToResponse === 'object') {
          response = _.extend(response, options.addToResponse);
     }
     return response;
}

function extendOptions(options) {

     if (options.processRequest === true) {
          options.processRequest = processRequest;
          options.completeResource = completeResource;
     }

     if (typeof options.customHeaders === 'undefined') {
          options.customHeaders = {
               'Cache-Control': 'no-cache',
               'Pragma': 'no-cache'
          };
     }
     if (typeof options.viewPortSettings === 'undefined') {
          options.viewPortSettings = {
               width: 1920,
               height: 1080
          }
     }
     return options;
}

module.exports = function (options) {
     var deferred = q.defer();
     (async(options) => {
          let resourcesComplete = q.defer();
          const browser = await puppeteer.launch();
          const page = await browser.newPage();

          let response = extendResponse(options, {
               requestId: options.requestId,
               address: options.address,
               resources: {}
          });

          options = extendOptions(options);

          let requests = {
               stopping: false,
               running: 0,
               total: 0,
               failed: 0,
               finished: 0,
          };

          function evaluatePage(page, browser, requests, conditionalStop, response, forceStop) {
               requests.stopping = true;

               requests.forceStop = forceStop;
               requests.evaluating = true;

               resourcesComplete.promise.then(function () {
                    if (typeof options.evalutePage == 'function') {
                         page.evaluate(options.evalutePage).then(function (pageInfo) {
                              if (typeof options.evaluteResults == 'function') {
                                   return options.evaluteResults(response, options, pageInfo);
                              }
                              return;
                         }).then(function (pageInfo) {
                              browser.close();
                              deferred.resolve(pageInfo);
                         }).catch(function (e) {
                              console.log('page scan error!', e);
                         });
                    }
                    if (typeof options.customAction === 'function') {
                         options.customAction(page, browser, response, options, deferred);
                    }
               }).catch(function (err) {
                    deferred.reject();
               });
          }

          function conditionalStop(requests) {
               if (requests.forceStop === true || (requests.stopping && requests.running < 1)) {
                    requests.forceStop = true;
                    if (requests.running < 1) {
                         if (requests.evaluating !== true) {
                              browser.close();
                         }
                         resourcesComplete.resolve();
                    }
                    return true;
               }
               return false;
          }

          function conditionalComplete(key, page, browser, requests) {
               requests[key]++;
               requests.running--;
               if (requests.total > 100 && requests.stopping !== true) {
                    evaluatePage(page, browser, requests, conditionalStop, response, true);
               } else {
                    conditionalStop(requests);
               }
          }

          function checkStatus(res) {
               if (res.ok !== true) {
                    deferred.reject('Failed to load the URL');
                    browser.close();
                    return false;
               }
               return true;
          }

          /*
           Requests
           */
          page.on('request', function (request) {
               if (conditionalStop(requests) === false) {
                    if (request) {
                         requests.running++;
                         requests.total++;
                         if (typeof options.processRequest === 'function') {
                              return request = options.processRequest(response, request);
                         }
                    }
               }
          });

          function _completeResource(page, browser, request, response, key) {
               response.endTime = new Date();
               if (options.completeResource) {
                    response = options.completeResource(response, request);
               }
               conditionalComplete(key, page, browser, requests);
          }

          page.on('requestfailed', function (request) {
               _completeResource(page, browser, request, response, 'failed')
          });

          page.on('requestfinished', function (request) {
               _completeResource(page, browser, request, response, 'finished')
          });

          page.on('pageerror', function (request) {
               response.endTime = new Date();
               evaluatePage(page, browser, requests, conditionalStop, response, true);
          });

          let viewPortSettings = {
               width: 1920,
               height: 1080
          };

          if (options.viewPortSettings) {
               viewPortSettings = options.viewPortSettings
          }
          if (options.viewPortSettings !== 'disabled') {
               page.setViewport(viewPortSettings);
          }

          if (typeof options.emulate == 'function') {
               await options.emulate(page);
          }

          options.waitFor = {
               waitUntil: 'networkidle',
               networkIdleTimeout: 500
          };
          await page.goto(options.address, options.waitFor).then(function (res) {
               if (res && res.headers) {
                    response.headers = res.headers;
                    for (var key of res.headers.keys()) {
                         if (key.toLowerCase() == 'content-type') {
                              response.mimeType = res.headers.get(key);
                         }
                    }
               }
               response.startTime = new Date();
               checkStatus(res);
               if (requests.stopping !== true) {
                    evaluatePage(page, browser, requests, conditionalStop, response);
               }
          }).catch(function (err) {
               deferred.reject(err);
          })
     })(options);
     return deferred.promise;
}
