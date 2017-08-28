const puppeteer = require('puppeteer'),
     q = require('q'),
     _ = require('underscore');

/**
 * formats a resource object endReply property
 * @param  {Object} request
 */
function createEndReply(request) {
     let contentType;
     headers = {};
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

/**
 * formats a resource object
 * @param  {Object} response
 * @param  {Object} request
 */
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

/**
 * adds the completed information to a resource
 * @param  {Object} response
 * @param  {Object} request
 */
function completeResource(response, request) {
     if (request && response.resources[request._requestId]) {
          response.resources[request._requestId].endReply = createEndReply(request);
     }
     return response;
}

/**
 * if want to add something to the response it is added
 * @param  {Object} options
 * @param  {Object} response
 */
function extendResponse(options, response) {
     if (typeof options.addToResponse === 'object') {
          response = _.extend(response, options.addToResponse);
     }
     return response;
}

/**
 * adds defaults to options
 * @param  {Object} options
 */
function extendOptions(options) {

     if (options.processRequest === true) {
          options.processRequest = processRequest;
          options.completeResource = completeResource;
     }

     if (typeof options.checkElements === 'undefined') {
          options.checkElements = () => {};
     }
     if (typeof options.checkElementResults === 'undefined') {
          options.checkElementResults = (r) => {return r;};
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

/**
 * opens a url in headless chrome and does requests actions on the content
 * @param  {Object} options configurations for performing on the url/html content
 */
module.exports = function (options) {
     console.log('browse/open init');
     var deferred = q.defer();
     (async(options) => {
          console.log('browse/open aysnc');

          let resourcesComplete = q.defer(),
               response = extendResponse(options, {
                    requestId: options.requestId,
                    address: options.address,
                    resources: {}
               }),
               requests = {
                    stopping: false,
                    running: 0,
                    total: 0,
                    failed: 0,
                    finished: 0,
               },
               browser,
               page;

          options = extendOptions(options);

          try {
               browser = await puppeteer.launch({
                    timeout: 3000
               }).catch((e) => {
                    console.log('test', e);
               })
               console.log('browse/open aysnc2');
               page = await browser.newPage();

          } catch (e) {
               console.log('3', e);
          }
          console.log('browse/open extendOptions');

          /**
           * after the page is finished loading, we can process the information received
           * @param  {Object} page            headless chrome page object
           * @param  {Object} browser         headless chrome instance
           * @param  {Object} requests        object managing the resources of a page
           * @param  {Object} response        object to return with results for page
           * @param  {Boolean} forceStop      is this being called to stop the page from continuing to load
           */
          function evaluatePage(page, browser, requests, response, forceStop) {
               requests.stopping = true;
               requests.forceStop = forceStop;
               requests.evaluating = true;

               resourcesComplete.promise.then(function () {
                    if (typeof options.evalutePage == 'function') {
                         console.log('browse/open resourcesComplete evalutePage', options.address);
                         let checkElements = {};
                         page.evaluate(options.checkElements).then((res)=> {
                              checkElements = options.checkElementResults(response, options, res);
                              page.evaluate(options.evalutePage).then((res)=> {
                                   if (typeof options.evaluteResults == 'function') {
                                        try {
                                             return options.evaluteResults(response, options, res);
                                        } catch (e) {
                                             console.log('e evaluteResults', e);
                                             browser.close();
                                             deferred.reject(e);
                                        }
                                   }
                                   return;
                              }).then((res)=> {
                                   res.checkElements = checkElements;
                                   requests.complete = true;
                                   browser.close();
                                   deferred.resolve(res);
                              }).catch((e)=> {
                                   console.log('browse/open resourcesComplete err --->', e);
                                   browser.close();
                                   deferred.reject(e);
                              });
                         }).catch((e) => {
                              console.log('browse/open tapTargetCheck err -->', e);
                              browser.close();
                              deferred.reject(e);

                         })
                    }
                    if (typeof options.customAction === 'function') {
                         options.customAction(page, browser, response, options, deferred);
                    }
               }).catch(function (e) {
                    console.log('browse/open resourcesComplete err', e);
                    deferred.reject(e);
               });
          }

          /**
           * checks if it's time to stop accepting resource requests on the page
           * @param  {Object} requests object managing resource loading
           * @return {Boolean}
           */
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

          /**
           * decides if enough resource have been loaded
           * @param  {String} key      type of resource completed failed/finished
           * @param  {Object} page     headless browser object
           * @param  {Object} browser  headless browser instance
           * @param  {Object} requests object managing requests being made
           */
          function conditionalComplete(key, page, browser, requests) {
               requests[key]++;
               requests.running--;
               if (requests.total > 100 && requests.stopping !== true) {
                    evaluatePage(page, browser, requests, response, true);
               } else {
                    conditionalStop(requests);
               }
          }

          /**
           * checks if page respond with a success
           * @param  {Object} res response after page loads
           * @return {Boolean} yes/no if page is successfully loaded
           */
          function checkStatus(res) {
               if (res.ok !== true) {
                    deferred.reject('Failed to load the URL');
                    browser.close();
                    return false;
               }
               return true;
          }

          /**
           * wrapper for saving resource information, if needed
           * @param  {Object} page     headless browser object
           * @param  {Object} browser  headless browser instance
           * @param  {Object} requests object managing requests being made
           * @param  {Object} response information gathered from page scan
           * @param  {String} key      type of resource completed failed/finished
           */
          function _completeResource(page, browser, request, response, key) {
               response.endTime = new Date();
               if (options.completeResource) {
                    response = options.completeResource(response, request);
               }
               conditionalComplete(key, page, browser, requests);
          }
          console.log('browse/open request');
          page.on('request', (request) => {
               console.log('request', requests);
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
          console.log('browse/open requestfailed');

          page.on('requestfailed', (request) => {
               _completeResource(page, browser, request, response, 'failed')
          });

          page.on('requestfinished', (request) => {
               _completeResource(page, browser, request, response, 'finished')
          });

          page.on('pageerror', (request) => {
               response.endTime = new Date();
               evaluatePage(page, browser, requests, response, true);
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

          console.log('browse/open emulate');
          if (typeof options.emulate == 'function') {
               await options.emulate(page);
          }

          options.waitFor = {
               waitUntil: 'networkidle',
               networkIdleTimeout: 500
          };

          console.log('browse/open startTime');

          response.startTime = new Date();
          console.log('page request in', options.address);
          await page.goto(options.address, options.waitFor).then((res) => {
               console.log('page request out', res.headers);
               try {

                    if (res && res.headers) {
                         response.headers = res.headers;
                         for (var key of res.headers.keys()) {
                              if (key.toLowerCase() == 'content-type') {
                                   response.mimeType = res.headers.get(key);
                              }
                         }
                    }
                    checkStatus(res);
               } catch (e) {
                    console.log('e', e);
               }
               console.log('requests', requests);
               if (requests.stopping !== true) {
                    evaluatePage(page, browser, requests, response);
               }
               conditionalComplete('index', page, browser, requests);
          }).catch((e) => {
               if (requests.complete !== true) {
                    try {
                         console.log('browse/open goto failed', e, 'options.address', options.address);
                         browser.close();
                         deferred.reject(e);
                    } catch (e) {
                         console.log('failed rehect', e);
                    }
               } else {
                    console.log('failed already rejected?', e);
               }
          })
     })(options);
     return deferred.promise;
}
