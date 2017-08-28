let bhttp = require("bhttp"),
     _ = require("underscore"),
     libxmljs = require("libxmljs");

/**
 * queries the sitemap url to see if has a response that is xml
 * @param  {String}   url      [description]
 * @param  {Object}   resp     [description]
 * @param  {Function} callback [description]
 */
function checkSiteMap(siteMapUrl, resp, callback) {
     bhttp.get(siteMapUrl, {
          responseTimeout: 30000
     }, (err, response) => {
          if (response && response.body) {
               try {
                    let text = response.body.toString();
                    libxmljs.parseXml(text);
                    resp.sitemap = true;
               } catch (e) {
                    resp.sitemap = false;
               }
          } else {
               resp.sitemap = false;
          }
          callback(resp)
     });
}

/**
 * parses the url to find a link for the sitemap
 * @param  {String}   url      expected url to robots file
 * @param  {String}   hostname hostname of the base url
 * @param  {Function} callback
 */
function checkRobots(robotsUrl, hostname, callback) {
     let siteMapUrl = hostname + '/sitemap.xml';
     bhttp.get(robotsUrl, {
          responseTimeout: 30000
     }, (err, response) => {
          if (response && response.body && response.headers['content-type'] === 'text/plain') {
               let lines = response.body.toString().split(/\r?\n/g),
                    resp = {
                         robots: true,
                         sitemap: false
                    },
                    siteMapFound = _.find(lines, (line) => {
                         let _line = line.toLowerCase();
                         if (_line.indexOf('sitemap:') !== -1) {
                              _line = _line.split(/sitemap:/g)
                              if (typeof _line === 'object' && _line[1]) {
                                   siteMapUrl = _line[1];
                                   checkSiteMap(siteMapUrl, resp, callback);
                                   return line;
                              }
                         }
                    });
               if (typeof siteMapFound === 'undefined') {
                    callback(resp);
               }
          } else {
               let resp = {
                    robots: false
               };
               checkSiteMap(siteMapUrl, resp, callback);
          }
     });
}

/**
 * wrapper for checkRobots
 * @param  {Object}   resource
 * @param  {Function} callback
 */
module.exports = function (resource, callback) {
     checkRobots(resource.url, resource.hostname, (resp) => {
          if (resp) {
               callback(null, resp);
          } else {
               callback(true);
          }
     });
}
