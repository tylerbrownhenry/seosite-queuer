let _ = require('underscore'),
     sh = require('shorthash'),
     process = require('./method/minifyCheck').init,
     q = require('q'),
     _mime = require('mime'),
     publisher = require('../../../amqp-connections/publisher'),
     ResourceModel = require('../../../models/resource'),
     utils = require('../../../utils'),
     interest = {
          "content-type": {
               "text/css": 'css',
               "text/css; charset=utf-8": 'css',
               "text/javascript": 'js',
               "text/javascript; charset=UTF-8": 'js',
               "application/x-javascript": 'js',
               "application/x-javascript; charset=UTF-8": 'js',
               "application/x-javascript; charset=utf-8": 'js',
               "application/javascript": 'js',
               "application/javascript; charset=UTF-8": 'js',
          },
          "content-encoding": {
               "gzip": true
          },
          "cache-control": true,
          "server": true
     };
const {
     URL
} = require('url');

function checkByType(resource) {
     let testType = interest["content-type"][resource.type];
     if (typeof testType !== 'undefined') {
          return testType;
     }
     if (resource && resource.type && resource.type !== null) {
          let type = _mime.extension(resource.type);
          if (type === 'application/octet-stream') {
               return null;
          }
          if (type) {
               return type;
          }
     }
     return null;
}

function checkByFileExtension(resource) {
     let type;
     if (resource && resource.file) {
          type = _mime.lookup(resource.file);
     }
     if (!type || type === 'application/octet-stream') {
          return null;
     }
     return type;
}

const listTypes = {
     css: 'css',
     js: 'js',
     'application/javascript': 'js',
     gif: 'img',
     jpeg: 'img',
     jpg: 'img',
     png: 'img',
     bmp: 'img',
     html: 'html',
     'application/font-woff': 'other',
     'font/opentype': 'other',
     'application/x-font-ttf': 'other',
     "application/font-sfnt": 'other',
     "application/font-tdpfr": 'other',
     "application/font-woff2": 'other',
     json: 'other',
     'application/octet-stream': 'other'
};

function findType(resource) {
     var type = checkByType(resource);
     if (type === null) {
          type = checkByFileExtension(resource);
     }
     if (type === null || !listTypes[type]) {
          type = 'other';
     } else {
          type = listTypes[type];
     }
     return type;
}

function checkHeaders(e) {
     let resp = {
          gZippable: null,
          contentType: null,
          acceptableGzip: null,
          cached: null,
          server: null
     }
     _.each(e.response.headers, (header, _key) => {
          let key = _key.toLowerCase();
          if (typeof interest[key] !== 'undefined') {
               if (key === "content-type") {
                    resp.gZippable = true;
                    resp.contentType = header;
               } else if (header.name === "content-encoding") {
                    resp.acceptableGzip = (typeof interest[key][header] !== 'undefined') ? true : false;
               } else if (header.name === 'cache-control') {
                    resp.cached = true;
               } else if (header.name === 'server') {
                    resp.server = header;
               }
          }
     });
     return resp;
}

/**
 * constructor for a resource object
 * @param {Object} e information about a resource found on a page
 */
function Resource(e) {
     if (!e || !e.response || !e.request) {
          return {
               status: 'failed'
          }
     }
     let headers = checkHeaders(e);
     return {
          duration: e.time,
          start: e.startedDateTime,
          timings: e.timings,
          url: e.request.url,
          status: e.response.status,
          gzip: (headers.gZippable) ? headers.acceptableGzip : null,
          type: headers.contentType,
          cached: headers.cached,
          minified: null,
          server: headers.server,
          bodySize: e.response.bodySize
     }
}

/**
 * turns any discovered page resources into Resource Objects
 * @param  {Object} scan [description]
 * @return {Array}      [description]
 */
function postProcess(scan) {
     let response = [];
     if (scan && scan.log && scan.log.entries) {
          _.each(scan.log.entries, (entry) => {
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
function publish(data) {
     let deferred = q.defer(),
          input = data.params.input,
          res = data.params.res,
          resources = postProcess(res),
          commands = [],
          checkResource = [],
          hostUrl = new URL(utils.convertUrl(input.url)),
          hostname = hostUrl.protocol + '//' + hostUrl.hostname,
          robotsUrl = hostname + '/robots.txt',
          robots = {
               url: robotsUrl,
               hostname: hostname,
               type: 'robots',
               status: 0,
               cleanType: 'robots',
               _id: sh.unique(robotsUrl + input.requestId),
               requestId: input.requestId
          };

     checkResource.push(robots);
     commands.push(robots);
     var first = true;

     resources = _.uniq(resources, function (item, key, a) {
          return item.url;
     });

     _.each(resources, (resource) => {
          let cleanType = findType(resource),
               canMinify = false;
          if (cleanType === 'img' || cleanType === 'js' || cleanType === 'css' || cleanType === 'html') {
               canMinify = true;
          }
          let hostname = null;
          try {
               hostname = new URL(resource.url).hostname
          } catch (e) {
               hostname = null;
          }
          let _resource = {
               mainPage: first,
               url: resource.url,
               hostname: hostname,
               timings: resource.timings,
               start: resource.start,
               duration: resource.duration,
               cached: resource.cached,
               gzip: resource.gzip,
               canMinify: canMinify,
               minified: resource.minified,
               bodySize: resource.bodySize,
               type: resource.type,
               cleanType: cleanType,
               _id: sh.unique(resource.url + input.requestId),
               status: resource.status,
               server: resource.server,
               requestId: input.requestId
          }
          if (canMinify === false) {
               _resource.scanStatus = 'complete';
          }
          commands.push(_resource);
          if (canMinify === true) {
               checkResource.push(_resource);
          }
          first = false;
     });

     deferred.resolve({
          commands: commands,
          processes: checkResource.length
     });
return deferred.promise;
}

function init(data) {
     let deferred = q.defer(),
          commands = data.params.commands,
          requestId = data.params.requestId;
     utils.batchPut(ResourceModel, commands, (err, e) => {
          if (err !== null) {
               deferred.reject();
          } else {
               _.each(commands, (_command) => {
                  let isProcess = _command.canMinify === true || _command.type === 'robots';
                   if(isProcess){
                    let buffer = new Buffer(JSON.stringify({
                         url: _command.url,
                         type: _command.cleanType,
                         hostname: _command.hostname,
                         requestId: _command.requestId,
                         _id: _command._id,
                         command: 'process',
                         action: 'checkResources'
                    }));
                    publisher.publish("", "actions", buffer);
                  }
               });
               deferred.resolve();
          }
     });
     return deferred.promise;
}

module.exports = {
     process: process,
     Resource: Resource,
     publish: publish,
     init: init,
     checkHeaders: checkHeaders,
     findType: findType,
     checkByFileExtension: checkByFileExtension,
     checkByType: checkByType,
     postProcess: postProcess
};
