var _ = require('underscore');
var q = require('Q');
var scrapeHtml = require("../linkChecker/initScrapeHtml");
var saveImage = require("../../mobileCaptures/index").saveImage;
var createHAR = require('./createHAR');
var errors = require('../errors');

function extractEmails(text) {
     return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function findMime(page) {
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
  console.log('run options',options);
     page.address = options.url;
     page.customHeaders = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
     };
     page.resources = {};
     page.types = {};
     page.options = options;
     // page.onResourceTimeout = function(e) {
     //     console.log('timeout!');
     //   console.log(e.errorCode);   // it'll probably be 408
     //   console.log(e.errorString); // it'll probably be 'Network timeout on resource'
     //   console.log(e.url);         // the url whose request timed out
     //   phantom.exit(1);
     // };
     setTimeout(function () {
          console.log('done yet?');
          page.get("content", function (content) {
               console.log('done yet?',content);
          }, function () {
               console.log('done yet?');
          })
     }, 5000)
     try {
          page.set("viewportSize", {
               width: 1920,
               height: 1080
          });
          page.open(page.address, function (err, status) {
                console.log('open',status,'err',err);


              //  var thumb = saveThumb(page, opts);
              // var thumg = 'test...';
               console.log('status', status, 'err', err);
               if (status !== 'success') {
                    var statusMessage = '';
                    if (status) {
                         statusMessage = '( Status : ' + status + ' )';
                    }
                    promise.reject(new errors.ConnectionError('Failed to load the URL ' + statusMessage));
               }

               setTimeout(function () {
                    console.log('yo!');
                    page.get('cookies', function (err, cookies) {
                         if (err) {
                              return console.error("Error occurred running `page.get('cookies')`:\n" + err);
                         }
                         page.get('content', function (err, content) {
                              ph.exit();
                              if (err) {
                                   return console.error("Error occurred running `page.get('content')`:\n" + err);
                              }

                              page.cookies = (cookies || []).map(function (cookie) {
                                   if ('expiry' in cookie) {
                                        cookie.expires = new Date(cookie.expiry * 1000).toISOString();
                                        delete cookie.expiry;
                                   }
                                   return cookie;
                              });



                              page.content = {
                                   mimeType: findMime(page),
                                   size: content.length,
                              };
                              var emails = extractEmails(content);
                              var passedEmails = [];

                              console.log('actions/sniff/index.js');
                              // console.log('thumb',thumb);
                              scrapeHtml(content, page.address, page.customHeaders).then(function (instance) {
                                   console.log('test');
                                   var har = createHAR(page);
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
                                        promise.resolve(har);
                                  //  });
                              }).catch(function (err) {
                                   console.log('err', err);
                                   promise.reject(err);
                              });
                         });
                    });
               }, options.delay * 1000);

               console.log('options.delay', options.delay);
          });
     } catch (err) {
          console.log('err', err);
     }
}


function createPage(opts) {
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
               console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
               console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
          };

          page.onLoadError = function (_casper, url) {
               console.log("[onLoadError]: ", url);
          }
          page.onTimeout = function (err) {
               console.log("[Timeout]: ", err);
          };

          page.onLoadFinished = function (status) {
               var url = page.address;
               // for (var i = 100 - 1; i >= 0; i--) {
               //     console.log('page.address',page);
               // }
               console.log("status: " + status);
               // page.render("google.png");
               // phantom.exit();
          };
          console.log('createPage3');
          run(page, promise, ph, options);
     } catch (err) {
          console.log('createPage err', err);
          promise.reject(err)
     }
     return promise.promise;
}

module.exports = createPage;
