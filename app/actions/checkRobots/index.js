let bhttp = require("bhttp"),
_ = require("underscore"),
libxmljs = require("libxmljs");

function checkSiteMap(url, resp, callback) {
     bhttp.get(url, {}, function (err, response) {
          if (response && response.body) {
               try {
                    var text = response.body.toString();
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

function checkRobots(url, hostname, callback) {
     var siteMapUrl = hostname + 'sitemap.xml';
     bhttp.get(url, {}, (err, response) => {
          if (response && response.body && response.headers['content-type'] === 'text/plain') {
               let lines = response.body.toString().split(/\r?\n/g),
               resp = {
                 robots: true,
                 sitemap: false
               },
               siteMapFound = _.find(lines, (line) => {
                    var _line = line.toLowerCase();
                    if (_line.indexOf('sitemap:') !== -1) {
                         _line = _line.split(/sitemap:/g)
                         if (typeof _line === 'object' && _line[1]) {
                           console.log('siteMapUrl', siteMapUrl);
                              siteMapUrl = _line[1];
                              checkSiteMap(siteMapUrl, resp, callback);
                              return line;
                         }
                    }
               });
               if(typeof siteMapFound === 'undefined'){
                 callback(resp);
               }
          } else {
               var resp = {
                    robots: false
               };
               checkSiteMap(siteMapUrl, resp, callback);
          }
     });
}

module.exports = function (resource, callback) {
     checkRobots(resource.url, resource.hostname, function (resp) {
          if (resp) {
               callback(null, resp);
          } else {
               callback(true);
          }
     });
}
