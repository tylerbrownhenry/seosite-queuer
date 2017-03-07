var http = require('http');
var zlib = require('zlib');

var phantom = require('node-phantom-simple');
var Prom = require('es6-promise').Promise;
var request = require('request');
var saveImage = require("../mobileCaptures/index").saveImage;

var errors = require('./errors');
var utils = require('./utils');
var _ = require('underscore');
var q = require('Q');
var entryHandler = require('./handleEntry');

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        function pad(n) {
            return n < 10 ? '0' + n : n;
        }

        function ms(n) {
            return n < 10 ? '00' + n : n < 100 ? '0' + n : n
        }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

// The contents of these types of files should be included in the HAR.
var ALLOWED_CONTENT_TYPES = ['css', 'js', 'json', 'doc'];

phantom.create = utils.promisify(phantom.create);

function openPage(opts) {
    var promise = q.defer();
    var phantomInstance;
    phantom.create().then(function(ph) {
        phantomInstance = ph;
        ph.createPage(function(err,page) {
            if(err){
                promise.reject(err);
            } else{      
               createPage({
                    options: opts,
                    page: page,
                    ph: ph
                }).then(function(res){
                     promise.resolve(res);
                }).catch(function(err){
                    promise.reject(err);
                    if (typeof ph !== 'undefined' && typeof ph.exit === 'function') {
                        ph.exit(); // Abort PhantomJS when an error occurs.
                    }
                });
            }
        });
    }).catch(function(err) {
        console.log('err', err);
        promise.reject(err);
        if (typeof ph !== 'undefined' && typeof ph.exit === 'function') {
            ph.exit(); // Abort PhantomJS when an error occurs.
        }
    });
    return promise.promise;
}

function createPage(opts) {
    var promise = q.defer();
    try {
        opts = opts || {};

        var options = opts.options || {};
        options.delay = options.delay || 0;

        var page = opts.page;
        var ph = opts.ph;

        page.onLoadStarted = function(req) {
            this.startTime = new Date();
        };
        page.onResourceRequested = function(req) {
            var r = req[0];
            this.resources[r.id] = {
                request: r,
                startReply: null,
                endReply: null
            };
        };

        page.onResourceReceived = function(res) {
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
        page.onUrlChanged = function(targetUrl) {
            page.redirects++
            page.finalUrl = targetUrl;
        };


        page.onResourceError = function(resourceError) {
          console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
          console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
        };

        page.onLoadError = function (_casper, url) {
            console.log("[onLoadError]: ", url );
        }
        page.onTimeout =  function (err) {
            console.log( "[Timeout]: ", err );
        };


        page.onLoadFinished = function(status) {
            var url = page.address;
            // for (var i = 100 - 1; i >= 0; i--) {
            //     console.log('page.address',page);
            // }
            console.log("status: " + status);
            // page.render("google.png");
            // phantom.exit();
        };
        console.log('createPage3');
        function run(page,promise,ph,options){
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
            setTimeout(function() {
               console.log('done yet?');
                page.get("content", function(content) {
                   console.log('done yet?');
                },function(){
                   console.log('done yet?');
               })
            }, 5000)


        try{ 
            page.set("viewportSize", { width: 1920, height: 1080 });
            page.open(page.address, function(err, status) {
                    function saveThumb(page,opts){
                        var promise = q.defer();
                        saveImage(page,'thumb' + opts.options.requestId + '.png',function(thumb){
                            promise.resolve(thumb);
                         },function(err){
                            promise.resolve(null);
                        });
                        return promise.promise;
                    }
                 
                    var thumb = saveThumb(page,opts);

                    console.log('status',status,'err',err);
                    if (status !== 'success') {
                        var statusMessage = '';
                        if(status){
                            statusMessage = '( Status : ' + status + ' )';
                        }
                        promise.reject(new errors.ConnectionError('Failed to load the URL '+ statusMessage));
                    }

                    setTimeout(function() {
                        console.log('yo!');
                        page.get('cookies', function(err, cookies) {
                            if (err) {
                                return console.error("Error occurred running `page.get('cookies')`:\n" + err);
                            }
                            page.get('content', function(err, content) {
                                ph.exit();
                                if (err) {
                                    return console.error("Error occurred running `page.get('content')`:\n" + err);
                                }

                                page.cookies = (cookies || []).map(function(cookie) {
                                    if ('expiry' in cookie) {
                                        cookie.expires = new Date(cookie.expiry * 1000).toISOString();
                                        delete cookie.expiry;
                                    }
                                    return cookie;
                                });

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

                                page.content = {
                                    mimeType: findMime(page),
                                    size: content.length,
                                };
                                var emails = extractEmails(content);
                                var passedEmails = [];
                                var scrapeHtml = require("./linkChecker/initScrapeHtml");
                                console.log('LOOOKING FOR REqUEST ID ',opts);
                                    // console.log('thumb',thumb);
                                    scrapeHtml(content, page.address, page.customHeaders).then(function(instance) {
                                        console.log('test');
                                        var har = createHAR(page);
                                        har.links = instance.foundLinks;
                                        har.url = {
                                            resolvedUrl: page.finalUrl,
                                            url: page.address
                                        };
                                        har.emails = passedEmails;
                                        har.redirects = page.redirects;   
                                        thumb.then(function(res){
                                            har.thumb = res;
                                            promise.resolve(har);
                                        });                       
                                    }).catch(function(err){
                                        console.log('err',err);
                                        promise.reject(err);
                                    });
                                });
                        });
                    }, options.delay * 1000);

            
                console.log('options.delay',options.delay);
            });
            }
            catch(err){
                console.log('err',err);   
            }
        }
        run(page,promise,ph,options);
    } catch (err) {
        console.log('createPage err',err);
        promise.reject(err)
    }
    return promise.promise;
}


function createHAR(page) {
    // console.log('page!',page);
    var address = page.address;
    var title = page.title;
    var startTime = page.startTime;
    var types = page.types;

    var entries = [];

    Object.keys(page.resources).forEach(function(key) {
        var resource = page.resources[key];
        var request = resource.request;
        var startReply = resource.startReply;
        var endReply = resource.endReply;
        var error = resource.error;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude data URIs from the HAR because they aren't
        // included in the spec.
        if (request.url.substring(0, 5).toLowerCase() === 'data:') {
            return;
        }

        var resType = types[request.url];
        if (!resType && endReply.contentType &&
            typeof endReply.contentType === 'string') {
            resType = utils.getType(endReply.contentType, request.url);
        }

        if (typeof request.time === 'string') {
            // console.log('requestime',request.time);
            request.time = new Date(request.time);
        }

        if (error) {
            startReply.bodySize = 0;
            startReply.time = 0;
            endReply.time = 0;
            endReply.content = {};
            endReply.contentType = null;
            endReply.headers = [];
            endReply.statusText = utils.getErrorString(error);
            endReply.status = null;
            resType = null;
        }

        entries.push({
            cache: {},
            pageref: address,
            request: {
                // Accurate `bodySize` blocked on https://github.com/ariya/phantomjs/pull/11484
                // bodySize: -1,
                bodySize: startReply.bodySize,
                cookies: [],
                headers: request.headers,
                // Accurate `headersSize` blocked on https://github.com/ariya/phantomjs/pull/11484
                // headersSize: -1,
                headersSize: 0,
                httpVersion: 'HTTP/1.1',
                method: request.method,
                queryString: [],
                url: request.url
            },
            response: {
                // Accurate `bodySize` (after gzip/deflate) blocked on https://github.com/ariya/phantomjs/issues/10156
                // bodySize: -1,
                bodySize: endReply.bodySize,
                cookies: [],
                headers: endReply.headers,
                headersSize: -1,
                httpVersion: 'HTTP/1.1',
                redirectURL: '',
                status: endReply.status,
                statusText: endReply.statusText,
                content: {
                    _type: resType,
                    mimeType: endReply.contentType,
                    size: endReply.bodySize,
                    // This will be empty because of this PhantomJS bug: https://github.com/ariya/phantomjs/pull/11484
                    // Fortunately, in `processResponses` we have a workaround :)
                    text: page.options.bodies && ALLOWED_CONTENT_TYPES.indexOf(endReply.contentType) !== -1 ? endReply.body : null
                }
            },
            startedDateTime: request.time.toISOString(),
            time: new Date(endReply.time).getTime() - new Date(request.time).getTime(),
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: new Date(startReply.time).getTime() - new Date(request.time).getTime(),
                receive: new Date(endReply.time).getTime() - new Date(startReply.time).getTime(),
                ssl: -1
            }
        });
    });

    return {
        log: {
            entries: entries,
            cookies: page.cookies,
            content: page.content,
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: new Date(page.endTime).getTime() - new Date(page.startTime).getTime()
                }
            }]
        }
    };
}


function processResponses(opts) {
    var promise = q.defer();
    opts = opts || {};
    var data = opts.data;
    var options = opts.options || {};
    var reqPromises = [];
    if (!data) {
        promise.reject('PhantomJS could not process the page');
    }
    // console.log('processResponses 1', data.log.entries);
    _.each(_.keys(data.log.entries), function(key, idx) {
        try {
            var entry = data.log.entries[key];
            reqPromises.push(new entryHandler(entry, idx, key, options));
        } catch (err) {
            promise.reject(err);
        }
    });
    q.all(reqPromises).then(function(responses) {
        _.each(_.keys(responses), function(key) {
            var res = responses[key];
            data.log.entries[res.idx] = res.data;
        });
        promise.resolve(data);
    }).catch(function(err) {
        console.log('err', err);
        promise.reject(err);
    });
    return promise.promise;
}

function har(opts) {
    var promise = q.defer();
    openPage(opts).then(function(data) {
        console.log('success');
        processResponses({
            data: data,
            options: opts
        }).then(function(res) {
            promise.resolve(res);
        }).catch(function(err) {
            promise.reject(err);
        })
    }).catch(function(err) {
        console.log('--error', err,'error');
        promise.reject(err);
    });
    return promise.promise;
}

module.exports.har = har;