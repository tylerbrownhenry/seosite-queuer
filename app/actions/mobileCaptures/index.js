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
         console.log('mobileCapture failed (invalid url)');
          deferred.reject({
               requestId: requestId,
               status: 'error',
               data: 'Captures not taken'
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
                    status: 'success',
                    captures: res,
                    requestId: requestId,
                    data: 'Captures taken'
               });
          }).catch((e) => {
               console.log('mobileCapture failed',e);
               deferred.reject({
                    requestId: requestId,
                    status: 'error',
                    data: 'Captures not taken'
               });
          });
     }
     return deferred.promise;
}

module.exports = {
     doit: prepareScreenshots
}
