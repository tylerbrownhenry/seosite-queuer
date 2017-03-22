var utils = require('../utils');
// The contents of these types of files should be included in the HAR.
var ALLOWED_CONTENT_TYPES = ['css', 'js', 'json', 'doc'];

/**
 * creates an object of the page performance
 * @param  {Object} page contents of the scanned page
 * @return {Object}      a log object of the scanned page
 */
function createHAR(page) {
     var address = page.address;
     var title = page.title;
     var startTime = page.startTime;
     var types = page.types;

     var entries = [];

     Object.keys(page.resources).forEach(function (key) {
          var resource = page.resources[key];
          console.log('resource',resource);
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
               console.log('requestime',request.time);
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
module.exports = createHAR;
