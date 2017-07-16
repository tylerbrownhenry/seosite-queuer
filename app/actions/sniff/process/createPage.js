var _ = require('underscore');
var q = require('q');
var scrapeHtml = require("../linkChecker/initScrapeHtml");
var saveImage = require("../../mobileCaptures/index").saveImage;
var createHAR = require('./createHAR');
var errors = require('../errors');

function extractEmails(text) {
     return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function findMime(page) {
  // console.log('page--->',page.resources);
     if (page.resources && page.resources['1'] && page.resources['1'].endReply && page.resources['1'].endReply.contentType) {
          if (page.resources['1'].endReply.contentType) {
               return page.resources['1'].endReply.contentType['1']
          }
     }
     return null;
}

function saveThumb(page, opts) {
     var promise = q.defer();
     saveImage(page, 'thumb' + opts.options.requestId + '.png', function (thumb) {
          promise.resolve(thumb);
     }, function (err) {
          promise.resolve(null);
     });
     return promise.promise;
}

function run(page, promise, ph, options) {
  console.log('page',page,'options.url',options.url);
     page.address = options.url;
     page.customHeaders = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
     };
     page.resources = {};
     page.types = {};
     page.options = options;
     var connectWaitTimeout = setTimeout(function () {
          // page.get("content", function (content) {
              //  console.log('done yet?');
          // }, function () {
               //console.log('done yet?');
          // })
     }, 5000)
     try {
          page.set("viewportSize", {
               width: 1920,
               height: 1080
          });
          console.log('PAGE.address',page.address);
          page.open(page.address, function (err, status) {


              //  var thumb = saveThumb(page, opts);
              // var thumg = 'test...';
               console.log('status', status, 'err', err);
               if (status !== 'success') {
                    var statusMessage = '';
                    if (status) {
                         statusMessage = '( Status : ' + status + ' )';
                    }
                    promise.reject(new errors.ConnectionError('Failed to load the URL ' + statusMessage));
                    ph.exit();
                    return;
               }

              contentWaitTimeout = setTimeout(function () {
                    //// console.log('yo!');
                    page.get('cookies', function (err, cookies) {
                      console.log('cookies--->',JSON.stringify(cookies));
                         if (err) {
                              //// return //console.error("Error occurred running `page.get('cookies')`:\n" + err);
                         }
                         page.get('content', function (err, content) {
                              console.log('content---> err',err);
                              clearTimeout(connectWaitTimeout);
                              clearTimeout(contentWaitTimeout);
                              if (err) {
                                    ph.exit();
                                   return //console.error("Error occurred running `page.get('content')`:\n" + err);
                              }

                              //// console.log('content--->',err);
                              page.cookies = (cookies || []).map(function (cookie) {
                                   if ('expiry' in cookie) {
                                        cookie.expires = new Date(cookie.expiry * 1000).toISOString();
                                        delete cookie.expiry;
                                   }
                                   return cookie;
                              });
                              //// console.log('content--->',err);



                              page.content = {
                                   mimeType: findMime(page),
                                   size: content.length,
                              };
                              var emails = extractEmails(content);
                              var passedEmails = [];

                              // console.log('actions/sniff/index.js');
                              console.log('thumb');
                              scrapeHtml(content, page.address, page.customHeaders).then(function (instance) {
                                  console.log('createHAR');
                                  var har = createHAR(page);
                                  console.log('har',har);
                                   har.links = instance.foundLinks;
                                   har.url = {
                                        resolvedUrl: page.finalUrl,
                                        url: page.address
                                   };
                                   har.emails = passedEmails;
                                   har.redirects = page.redirects;
                                  //  thumb.then(function (res) {
                                        // har.thumb = res;
                                        har.thumb = 'this.jpg';
                                        ph.exit();  
                                        promise.resolve(har);
                                        console.log('har');
                                  //  });
                              }).catch(function (err) {
                                   //console.log('err', err);
                                   promise.reject(err);
                              });
                         });
                    });
               }, options.delay * 1000);

               //console.log('options.delay', options.delay);
          });
     } catch (err) {
          clearTimeout(connectWaitTimeout);
          clearTimeout(contentWaitTimeout);
          //console.log('err', err);
     }
}


function createPage(opts) {
  //// console.log('createPage opts',opts);
     var promise = q.defer();
     try {
          opts = opts || {};

          var options = opts.options || {};
          options.delay = options.delay || 0;

          var page = opts.page;
          var ph = opts.ph;

          page.onLoadStarted = function (req) {
               this.startTime = new Date();
          };
          page.onResourceRequested = function (req) {
               var r = req[0];
               this.resources[r.id] = {
                    request: r,
                    startReply: null,
                    endReply: null
               };
          };

          page.onResourceReceived = function (res) {
               this.endTime = new Date();
               if (typeof this.resources[res.id] === 'undefined') {
                    this.resources[res.id] = {
                         request: res,
                         startReply: null,
                         endReply: null
                    };
               }
               if (res.stage === 'start') {
                    this.resources[res.id].startReply = res;
               }
               if (res.stage === 'end') {
                    this.resources[res.id].endReply = res;
               }
          };
          page.finalUrl = page.address;
          page.redirects = 0;
          page.onUrlChanged = function (targetUrl) {
               page.redirects++
                    page.finalUrl = targetUrl;
          };

          page.onResourceError = function (resourceError) {
               //console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
               //console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
          };

          page.onLoadError = function (_casper, url) {
               //console.log("[onLoadError]: ", url);
          }
          page.onTimeout = function (err) {
               //console.log("[Timeout]: ", err);
          };

          page.onLoadFinished = function (status) {
               var url = page.address;
               // for (var i = 100 - 1; i >= 0; i--) {
                  ////  console.log('page.address',page);
               // }
               //console.log("status: " + status);
               // page.render("google.png");
              //  phantom.exit();
          };
          // console.log('createPage3',page);
          run(page, promise, ph, options);
     } catch (err) {
          //console.log('createPage err', err);
          promise.reject(err)
     }
     return promise.promise;
}

module.exports = createPage;
