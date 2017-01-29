var http = require('http');
var zlib = require('zlib');

var phantom = require('node-phantom-simple');
var Prom = require('es6-promise').Promise;
var request = require('request');

var errors = require('./errors');
var utils = require('./utils');
var emailValidator = require("email-validator").validate;
var pkg = require('../../package');
var _ = require('underscore');
// var uglify    = require('uglify-js');
                
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
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
  var phantomInstance;
  return phantom.create().then(function (ph) {
    phantomInstance = ph;

    // ph.onLoadStarted = function () {
    //     console.log('load started!!!');
    //   ph.startTime = new Date();
    // };
    return utils.promisify(ph.createPage)().then(function (page) {
      return createPage({
        options: opts,
        page: page,
        ph: ph
      });
    });
  }).catch(function (err) {
    console.log('err',err);
    phantomInstance.exit();  // Abort PhantomJS when an error occurs.
  });
}


function createPage(opts) {
  opts = opts || {};

  var options = opts.options || {};
  options.delay = options.delay || 0;

  var page = opts.page;
  var ph = opts.ph;

    page.onLoadStarted = function (req) {
        console.log('load started!!!');
      this.startTime = new Date();
    };

    page.onResourceRequested = function (req) {
        // console.log('onResourceRequested1',req,req.id);
        var r = req[0];
        this.resources[r.id] = {
            request: r,
            startReply: null,
            endReply: null
        };
    };

    page.onResourceReceived = function (res) {
        // console.log('onResourceReceived2',res,res.stage);
        this.endTime = new Date();
        if(typeof this.resources[res.id] === 'undefined'){
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
    page.onLoadFinished = function(status) {
        var url = page.address;
      // for (var i = 100 - 1; i >= 0; i--) {
      //     console.log('page.address',page);
      // }
        // console.log("Loaded: " + url);
        // page.render("google.png");
        // phantom.exit();
    };

    // page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.$';
    // page.settings.javascriptEnabled = false;
    // page.settings.loadImages = false;

  return new Prom(function (resolve, reject) {
    page.address = options.url;
    page.customHeaders = {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    page.resources = {};
    page.types = {};
    page.options = options;



    // Clear browser cache/cookies/localStorage.
    // TODO: Figure out a way to do this with SlimerJS. (This works fine in PhantomJS.)
    //fs.removeTree(page.offlineStoragePath);

    return page.open(page.address, function (err, status) {
      if (status !== 'success') {
        return reject(
          new errors.ConnectionError('Failed to load the URL (status: ' + status + ')'));
      }



      setTimeout(function () {

        page.get('cookies', function (err, cookies) {

          if (err) {
            return console.error(
              "Error occurred running `page.get('cookies')`:\n" + err);
          }

          page.get('content', function (err, content) {

            ph.exit();

            if (err) {
              return console.error(
                "Error occurred running `page.get('content')`:\n" + err);
            }

            page.cookies = (cookies || []).map(function (cookie) {
              if ('expiry' in cookie) {
                // Convert Unix timestamp to ISO 8601 timestamp.
                cookie.expires = new Date(cookie.expiry * 1000).toISOString();

                // Remove `expiry` since it was renamed to `expires`
                // (per the HAR spec).
                delete cookie.expiry;
              }

              return cookie;
            });

            function extractEmails (text){
                return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
            }

            page.content = {
              // Extract `Content-Type` from root (i.e., first) resource.
              mimeType: '1' in (page.resources && page.resources['1'] && page.resources['1'].endReply ) ? page.resources['1'].endReply.contentType : null,
              size: content.length,
              // text: options.bodies ? content : null,
              // minified : minifiedTest(content)
            };
            var emails = extractEmails(content);
            var passedEmails = [];
            _.each(emails,function(email){
                if(emailValidator(email)){
                    passedEmails.push(email);
                }
            })

            function ProcessedLink(link){
                var isGzip = false;
                var cachedControlled = false;
                var contentType = null;
                _.each(link.response.headers,function(detail){
                    if(detail.name === 'Content-Encoding'){
                        if(detail.value === 'gzip'){
                            isGzip = true;
                        }
                    }
                    if(detail.name === "Cache-Control"){
                        cachedControlled = true
                    }
                    if(detail.name === "Content-Type"){
                        contentType = detail.value;
                    }
                });
                return {
                    url: (link && link.request && link.request.url) ? link.request.url : null,
                    isGzip: isGzip,
                    cachedControlled: cachedControlled,
                    contentType: contentType,
                    compression: (link && link.response && link.response.content && link.response.content.compression) ? link.response.content.compression : null,
                    compression: (link && link.response && link.response.content && link.response.content.compression) ? link.response.content.compression : null,
                    status: (link && link.response && link.response.status) ? link.response.status : null
                }
            }

            var scrapeHtml = require("./linkChecker/initScrapeHtml");
            // console.log('headers',page);

            scrapeHtml(content,page.address,page.customHeaders).then(function(instance){
                // console.log('links',links.foundLinks.length);
                var har = createHAR(page);
                har.links = instance.foundLinks;
                har.url = {
                    resolvedUrl: page.finalUrl,
                    url: page.address
                }; 
                har.emails = passedEmails;
                har.redirects = page.redirects;
                // instance._tree
                resolve(har);
            });

            // Doing this for resourves from har */ 
            // var processedLinks = [];
            // _.each(links.foundLinks,function(link){
                // processedLinks.push(new ProcessedLink(link));
            // });
            
            // })

          });
        });

      }, options.delay * 1000);
    });
  });
}


function createHAR(page) {
    // console.log('page!',page);
  var address = page.address;
  var title = page.title;
  var startTime = page.startTime;
  var types = page.types;

  var entries = [];

  Object.keys(page.resources).forEach(function (key) {
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
    // console.log('request.time line 215',request.time);
    // console.log('endReply.time line 215',typeof endReply.time);
    // console.log('endReply.time line 215',new Date(endReply.time).getTime());




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
      creator: {
        name: pkg.name,
        version: pkg.version
      },
      entries: entries,
      cookies: page.cookies,
      content: page.content,
      pages: [
        {
          startedDateTime: startTime.toISOString(),
          id: address,
          title: title,
          pageTimings: {
            onLoad: new Date(page.endTime).getTime() - new Date(page.startTime).getTime()
          }
        }
      ],
      version: pkg.version
    }
  };
}


function processResponses(opts) {
  opts = opts || {};

  var data = opts.data;
  var options = opts.options || {};

  var reqOpts = {};
  var reqPromises = [];

  if (!data) {
    throw 'PhantomJS could not process the page';
  }

  // Fetch each request separately.
  Object.keys(data.log.entries).forEach(function (key, idx) {
    var entry = data.log.entries[key];

    reqPromises.push(new Prom(function (resolve) {
      reqOpts = {
        method: entry.request.method,
        url: entry.request.url,
        headers: {}
      };
      entry.request.headers.forEach(function (header) {
        reqOpts.headers[header.name] = header.value;
      });

      var rawReqHeaders = 'HTTP/1.1 GET ' + entry.request.url + '\r\n';
      Object.keys(reqOpts.headers).forEach(function (headerKey) {
        rawReqHeaders += headerKey + ': ' + reqOpts.headers[headerKey] + '\r\n';
      });
      rawReqHeaders += '\r\n';

      request(reqOpts).on('response', function (res) {
        // Raw headers were added in v0.12
        // (https://github.com/joyent/node/issues/4844), but let's
        // reconstruct them for backwards compatibility.
        var rawResHeaders = ('HTTP/' + res.httpVersion + ' ' + res.statusCode +
                          ' ' + http.STATUS_CODES[res.statusCode] + '\r\n');
        Object.keys(res.headers).forEach(function (headerKey) {
          rawResHeaders += headerKey + ': ' + res.headers[headerKey] + '\r\n';
        });
        rawResHeaders += '\r\n';

        var uncompressedSize = 0;  // size after uncompression
        var bodySize = 0;  // bytes size over the wire
        var body = '';  // plain text body (after uncompressing gzip/deflate)

        function tally() {
          entry.request.headerSize = Buffer.byteLength(rawReqHeaders, 'utf8');

          if (options.bodies && ALLOWED_CONTENT_TYPES.indexOf(entry.response.content._type) !== -1) {
            // Store only human-readable content (i.e., not binary)
            // (and if the user actually wants the response bodies in the HAR).
            entry.response.content.text = body;
          }


            // function minifiedTest(text,go){
            //     if(typeof text !== 'undefined' && go === true){
            //         return {
            //             min: uglify(text).length,
            //             orig: text.length
            //         }
            //     }
            //     return null;
            // }

          entry.response.bodySize = bodySize;
          // entry.response.content.minified = minifiedTest(body, entry.response.content.mimeType === 'text/javascript');
          entry.response.content.headersSize = Buffer.byteLength(rawResHeaders, 'utf8');
          entry.response.content.size = uncompressedSize;
          entry.response.content.compression = uncompressedSize - bodySize;
          entry.response.content.bodySize = bodySize + entry.response.content.compression;

          resolve({idx: idx, data: entry});
        }

        switch (res.headers['content-encoding']) {
          case 'gzip':
            var gzip = zlib.createGunzip();

            gzip.on('data', function (data) {
              body += data;
              uncompressedSize += data.length;
            }).on('end', function () {
              tally();
            });

            res.on('data', function (data) {
              bodySize += data.length;
            }).pipe(gzip);

            break;
          case 'deflate':
            var deflate = zlib.createInflate();

            deflate.on('data', function (data) {
              body += data;
              uncompressedSize += data.length;
            }).on('end', function () {
              tally();
            });

            res.on('data', function (data) {
              bodySize += data.length;
            }).pipe(deflate);

            break;
          default:
            res.on('data', function (data) {
              body += data;
              uncompressedSize += bodySize += data.length;
            }).on('end', function () {
              tally();
            });

            break;
        }
      });

    }));
  });

  return Prom.all(reqPromises).then(function (responses) {
    Object.keys(responses).forEach(function (key) {
      var res = responses[key];
      data.log.entries[res.idx] = res.data;
    });
    return data;
  });
}





function har(opts) {
    console.log('here!');
  return openPage(opts).then(function (data) {
    console.log('sniff/index.js open page callback success');
    var res = processResponses({
      data: data,
      options: opts
    });
    // console.log('data',data);
    // console.log('res',res);
    return res;
  }).catch(function(err){
    console.log('error');
    console.log('error',err);
  })
}

module.exports.har = har;