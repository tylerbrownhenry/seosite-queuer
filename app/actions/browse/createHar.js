// var utils = require('../../utils'),
_ = require('underscore');
// The contents of these types of files should be included in the HAR.
var ALLOWED_CONTENT_TYPES = ['css', 'js', 'json', 'doc'];

function processResource(page, key, entries, address) {
     var resource = page.resources[key],
          request = resource.request,
          startReply = resource.startReply,
          endReply = resource.endReply,
          error = resource.error;
     if (!request || !startReply || !endReply) {
          return;
     }

     // Exclude data URIs from the HAR
     if (request.url.substring(0, 5).toLowerCase() === 'data:') {
          return;
     }

     if (typeof request.time === 'string') {
          request.time = new Date(request.time);
     }

     if (error) {
          startReply.bodySize = 0;
          startReply.time = 0;
          endReply.time = 0;
          endReply.content = {};
          endReply.contentType = null;
          endReply.headers = [];
          endReply.status = null;
     }

     var requestTime = new Date(request.time).getTime();;
     var startReplyTime = new Date(startReply.time).getTime();
     var endReplyTime = new Date(endReply.time).getTime();

     var startedDateTime = request.time.toISOString();
     var time = endReplyTime - requestTime;

     var waitTime = startReplyTime - requestTime;
     var receivedTime = endReplyTime - startReplyTime;

     entries.push({
          pageref: address,
          request: {
               bodySize: startReply.bodySize,
               cookies: [],
               headers: request.headers,
               headersSize: 0,
               httpVersion: 'HTTP/1.1',
               method: request.method,
               queryString: [],
               url: request.url
          },
          response: {
               bodySize: endReply.bodySize,
               headers: endReply.headers,
               httpVersion: 'HTTP/1.1',
               redirectURL: '',
               status: endReply.status,
               statusText: endReply.statusText,
               content: {
                    mimeType: endReply.contentType,
                    size: endReply.bodySize
               }
          },
          startedDateTime: startedDateTime,
          time: time,
          timings: {
               wait: waitTime,
               receive: receivedTime
          }
     });
}

/**
 * creates an object of the page performance
 * @param  {Object} page contents of the scanned page
 * @return {Object}      a log object of the scanned page
 */
function createHAR(page) {
     var address = page.address,
          title = page.title,
          isoTime = page.startTime.toISOString(),
          endTime = new Date(page.endTime).getTime(),
          startTime = new Date(page.startTime).getTime(),
          onLoadTime = endTime - startTime;

     var entries = [];

     _.each(_.keys(page.resources), function (key) {
          processResource(page, key, entries, address);
     });

     return {
          log: {
               entries: entries,
               cookies: page.cookies,
               content: page.content,
               pages: [{
                    startedDateTime: isoTime,
                    id: address,
                    title: title,
                    pageTimings: {
                         onLoad: onLoadTime
                    }
               }]
          }
     };
}
module.exports = createHAR;
