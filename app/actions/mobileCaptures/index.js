const q = require('q'),
     _ = require('underscore'),
     openPage = require('./openPage');

/**
 * prepares internal request for taking screenshots
 * @param  {String} url
 * @param  {String} requestId
 * @param  {Array} devices   devices to emulate
 */
function prepareScreenshots(url, requestId, devices) {
     let deferred = q.defer();
     if (typeof url !== 'string') {
          deferred.reject({
               error: 'error:captures:url:invalid'
          });
     } else {
          let siteURL = url,
               siteName = siteURL.replace('http://', ''),
               promises = [],
               options = {
                    requestId: requestId,
                    imageDir: './images/',
                    siteName: siteName.replace('.', '_').replace('/', '_') + '_',
                    siteURL: siteURL
               };
          _.each(devices, (device) => {
               promises.push(openPage(options, device));
          });
          
          q.all(promises).then((res) => {
               deferred.resolve({
                    captures: res,
               });
          }).catch((err) => {
               deferred.reject({
                    error: err
               });
          });
     }
     return deferred.promise;
}

module.exports = {
     doit: prepareScreenshots
}
