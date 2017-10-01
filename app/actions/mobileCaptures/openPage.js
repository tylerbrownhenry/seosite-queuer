const open = require('../browse/open'),
     sharp = require('sharp'),
     q = require('q'),
     sh = require('shorthash'),
     _ = require('underscore'),
     saveImageToAWS = require('./saveCapture'),
     devices = require('puppeteer/DeviceDescriptors');

/**
 * saves a thumbnail image of the current page being scanned
 * @param  {Object} page          phantomJS page object
 * @param  {String} filename  name for the image being generated
 * @param  {String} thumbName name for the thumbnail being generated
 * @param  {Object} device    type of device to emulate
 * @param  {String} requestId
 * @param  {Function} callback      success callback
 * @param  {Function} errorCallback error callback
 */
function saveImage(_filename, thumbName, device, requestId, callback, errorCallback) {
     sharp(_filename)
          .resize(200)
          .toFile(thumbName, (err, info) => {
               saveImageToAWS(_filename, thumbName, (err, url) => {
                    if (err === 'success') {
                         callback(url);
                    } else {
                         errorCallback('error:capture:save:to:aws')
                    }
               }, requestId, device);
          });
}

/**
 * wrapper for saving
 * @param  {String} filename  name for the image being generated
 * @param  {String} thumbName name for the thumbnail being generated
 * @param  {String} requestId
 * @param  {Object} device    type of device to emulate
 * @return {Object}           promise
 */
function handleSave(filename, thumbName, requestId, device) {
     var promise = q.defer();
     saveImage(filename, thumbName, requestId, device,
          (url) => {
               promise.resolve({
                    device: device,
                    url: url
               });
          },
          (e) => {
               promise.reject(e);
          });
     return promise.promise;
}

/**
 * process to go open a chrome browser, take a screeshot and save it to AWS
 * @param  {Object} opts   options for capture
 * @param  {Object} device device to emulate for screenshot
 * @return {Object}        deferred
 */
function takeScreenShot(opts, device) {
     var deferred = q.defer();
     open({
          emulate: (page) => {
                if(typeof devices[device] !== 'undefined'){
                  return page.emulate(devices[device]);
                } else {
                  const sizes = device.split('x'),
                  viewPortSettings = {
                    width: Number(sizes[0]),
                    height: Number(sizes[1])
                  }
                  return page.setViewport(viewPortSettings);
                }
          },
          viewPortSettings: 'disabled',
          customAction: (page, browser, response, options, deferred) => {
               let filename = sh.unique(opts.siteName) + device + '.png',
               imageDir = './temp/',
               _filename = imageDir + filename,
               thumbName = imageDir + '_thumb_' + filename;

               page.screenshot({
                    path: _filename
               }).then(() => {
                    handleSave(_filename, thumbName, opts.requestId, device).then((res) => {
                         browser.close();
                         deferred.resolve(res);
                    }).catch((e) => {
                         browser.close();
                         deferred.reject(e);
                    });
               }).catch((e) => {
                 console.log('error:captures:screenshot',e);
                    browser.close();
                    deferred.reject('error:captures:screenshot');
               });
          },
          address: opts.siteURL,
          requestId: opts.requestId
     }).then((res) => {
          deferred.resolve(res);
     }).catch((e) => {
          deferred.reject(e);
     })
     return deferred.promise;
}

module.exports = takeScreenShot;
