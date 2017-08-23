const puppeteer = require('puppeteer');
const q = require('q');
const evaluatePageContent = require('./evaluatePageContent');
const evaluteResults = require('./evaluteResults');

(async(options) => {

     const browser = await puppeteer.launch();
     const page = await browser.newPage();
     let response = {
       resources:[]
     };
     let requests = {
          stopping: false,
          running: 0,
          total: 0,
          failed: 0,
          finished: 0,
     };
     let resources = [];

     function evaluatePage(page, browser, requests, conditionalStop, response) {
          let promise = q.defer();
          requests.stopping = true;
          requests.evaluating = true;
          if (typeof options.evaluatePage === 'undefined') {
               options.evaluatePage = () => {
                    return
               };
          }
          if (typeof options.evaluteResults === 'undefined') {
               options.evaluteResults = () => {
                    return
               };
          }

          options.customHeaders = {
               'Cache-Control': 'no-cache',
               'Pragma': 'no-cache'
          };
          page.evaluate(options.evalutePage).then(function (pageInfo) {
               return options.evaluteResults(response, options, pageInfo);
          }).then(function (pageInfo) {
               browser.close();
          })

          // page.evaluate(function (content) {
          //   //  var seosite_base = window.getComputedStyle(document.querySelector('body'));
          //
          //    const anchors = document.querySelectorAll('div');
          //    return Promise.resolve({achors:anchors});
          //  })
          //  .then(function (e) {
          //    console.log('resp',resp);
          //       requests.evaluating = false;
          //       conditionalStop(requests);
          //       promise.resolve();
          //  })
          // return promise.promise;
     }

     function conditionalStop(requests) {
          if (requests.stopping === true) {
               if (requests.running < 1 && requests.evaluating !== true) {
                    console.log('STOP!');
                    browser.close();
                    console.log('STOP!!');
               }
               return true;
          }
          return false;
     }

     function conditionalComplete(key, page, browser, requests) {
          requests[key]++;
          requests.running--;
          if (requests.total > 100 && requests.stopping !== true) {
               console.log('Stopping overflow');
               evaluatePage(page, browser, requests, conditionalStop);
          } else {
               conditionalStop(requests);
          }
     }

     function checkStatus(res) {
          if (res.ok !== true) {
               promise.reject('Failed to load the URL');
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
               requests.running++;
               requests.total++;
               response.resources[request._requestId] = {
                    request: request,
                    startReply: null,
                    endReply: null
               };
          }
     });
     page.on('load', function (request) {
          if (requests.stopping !== true) {
               /*
               If not forced closed begin process here
               */
               evaluatePage(page, browser, requests, conditionalStop, response);
          }
     });

     //
     //  page.onLoadStarted = function (req) {
     //       console.log('LOAD STARTED');
     //       this.startTime = new Date();
     //  };
     //  page.onResourceRequested = function (req) {
     //       var r = req[0];
     //       response.resources[r.id] = {
     //            request: r,
     //            startReply: null,
     //            endReply: null
     //       };
     //  };
     //
     //  page.onResourceReceived = function (res) {
     //       this.endTime = new Date();
     //       if (typeof this.resources[res.id] === 'undefined') {
     //            this.resources[res.id] = {
     //                 request: res,
     //                 startReply: null,
     //                 endReply: null
     //            };
     //       }
     //
     //       if (res.stage === 'start') {
     //            this.resources[res.id].startReply = res;
     //       }
     //       if (res.stage === 'end') {
     //            this.resources[res.id].endReply = res;
     //       }
     //  };

     page.on('requestfailed', function (request) {
       console.log('test1');
          response.resources[request._requestId].endReply = request;
          response.endTime = new Date();
          conditionalComplete('failed', page, browser, requests);
     });

     page.on('requestfinished', function (request) {
       console.log('test2',request);
          response.resources[request._requestId].endReply = request;
          response.endTime = new Date();
          conditionalComplete('finished', page, browser, requests);
     });

     page.on('pageerror', function (request) {
          response.endTime = new Date();
          evaluatePage(page, browser, requests, conditionalStop, response);
     });

     page.on('response', function (load) {

     });

     let viewPortSettings = {
          width: 1920,
          height: 1080
     };

     if (options.viewPortSettings) {
          viewPortSettings = options.viewPortSettings
     }

     page.setViewport(viewPortSettings);

     await page.goto(options.address, {
          waitUntil: 'networkidle',
          networkIdleTimeout: 5
     }).then(function (res) {
          if (res && res.headers) {
               response.headers = res.headers;
          }
          response.startTime = new Date();
          checkStatus(res);
     });

})({
     viewPortSettings: {
          width: 1920,
          height: 1080
     },
     evalutePage: evaluatePageContent,
     evaluteResults: evaluteResults,
     address: 'http://mariojacome.com',
     requestId: 'random'
});
