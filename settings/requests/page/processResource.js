var _ = require('underscore');
var interest = {
     "Content-Type": {
          "text/css": true,
          "text/css; charset=utf-8": true,
          "text/javascript": true,
          "text/javascript; charset=UTF-8": true,
          "application/x-javascript": true,
          "application/x-javascript; charset=UTF-8": true,
          "application/javascript": true,
          "application/javascript; charset=UTF-8": true,
     },
     "Content-Encoding": {
          "gzip": true
     },
     "Cache-Control": true
};

/**
 * constructor for a resource object
 * @param {object} e information about a resource found on a page
 */
function Resource(e) {
     var acceptableGzip = null;
     var gZippable = null;
     var contentType = null;
     var cached = false;
     console.log('processResponse.js resource ', e);
     if (!e || !e.response) {
          return {
               status: 'failed'
          }
     }
     _.each(e.response.headers, function (header) {
          if (typeof interest[header.name] !== 'undefined') {
               if (header.name === "Content-Type") {
                    gZippable = true;
                    contentType = header.value;
               } else if (header.name === "Content-Encoding") {
                    acceptableGzip = (interest[header.name][header.value] === true) ? true : false;
               } else if (header.name === 'Cache-Control') {
                    cached = true;
               }
          }
     });
     return {
          duration: e.time,
          start: e.startedDateTime,
          timings: e.timings,
          url: e.request.url,
          status: e.response.status,
          gzip: (gZippable) ? acceptableGzip : null,
          type: contentType,
          cached: cached,
          minified: null
     }
}
module.exports = Resource;
