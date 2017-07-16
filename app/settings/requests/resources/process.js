var _ = require('underscore'),
sh = require('shorthash'),
ResourceModel = require('../../../models/resource'),
utils = require('../../../utils'),
interest = {
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
 * @param {Object} e information about a resource found on a page
 */
function Resource(e) {
     var acceptableGzip = null;
     var gZippable = null;
     var contentType = null;
     var cached = false;
     //console.log('processResponse.js resource ', e);
     if (!e || !e.response || !e.request) {
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

/**
 * turns any discovered page resources into Resource Objects
 * @param  {[type]} scan [description]
 * @return {[type]}      [description]
 */
function postProcess(scan) {
     var response = [];
     if (scan && scan.log && scan.log.entries) {
          _.each(scan.log.entries, function (entry) {
               response.push(new Resource(entry))
          });
     }
     return response;
}

/**
 * publishes the message to get the screen captures for this request
 * @param  {Object} input page request object
 * @param  {Object} res   parsed information from url
 */
function processResources(input, res) {
     if (input.options
       && input.options.save
       && input.options.save.resources === true){
         var resources = postProcess(res);
         var commands = [];
         _.each(resources, function (resource) {
              commands.push({
                url: resource.url,
                timings: resource.timings,
                start: resource.start,
                duration: resource.duration,
                cached: resource.cached,
                gzip: resource.gzip,
                minified: resource.minified,
                type: resource.type,
                _id: sh.unique(JSON.stringify(resource) + input.requestId),
                status: resource.status,
               requestId: input.requestId
              });
         });

         utils.batchPut(ResourceModel, commands, function (err, e) {
              console.log('err', e);
              if (err !== null) {

              }
         })
          return resources;
     }
     return;
}
module.exports.processResources = processResources;
module.exports.postProcess = postProcess;
module.exports.Resource = Resource;
