let open = require('../browse/open');
let sharp = require('sharp');
let q = require('q');
let _ = require('underscore');
let saveImageToAWS = require('./saveCapture');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

/**
 * saves a thumbnail image of the current page being scanned
 * @param  {Object}   page          phantomJS page object
 * @param  {String}   filename      name of the file
 * @param  {Function} callback      success callback
 * @param  {Function}   errorCallback error callback
 */
function saveImage(_filename, thumbName, device, requestId, callback, errorCallback) {
     sharp(_filename)
          .resize(200)
          .toFile(thumbName, function (err, info) {
               saveImageToAWS(_filename, thumbName, function (err, url) {
                    /** Delete both files */
                    if (err === 'success') {
                         callback(url);
                    } else {
                         errorCallback(err)
                    }
               }, requestId, device);
          });
}

function handleSave(filename, thumbName, requestId, device) {
     var promise = q.defer();
     saveImage(filename, thumbName, requestId, device,
          function (url) {
               promise.resolve({
                    err: null,
                    size: device,
                    url: url
               });
          },
          function (err) {
               promise.reject({
                    err: err,
                    size: device
               });
          });
     return promise.promise;
}

function takeScreenShot(opts, device) {
     console.log('CUSTOM ACTION NEVER DIE!-->', opts);
     var promise = q.defer();

     open({
          emulate: function (page) {
               console.log('test');
               return page.emulate(iPhone);
          },
          viewPortSettings: 'disabled',
          customAction: function (page, browser, response, options, deferred) {
               console.log('CUSTOM ACTION NEVER DIE!');

               console.log('TEST-->>');
               var filename = opts.siteName + device + '.png';
               var imageDir = './temp/';
               var _filename = imageDir + filename;
               var thumbName = imageDir + '_thumb_' + filename;

               page.screenshot({
                    path: _filename
               }).then(function () {
                    console.log('_filename TEST-->>',_filename);
                    handleSave(_filename, thumbName, opts.requestId, device).then(function (res) {
                         browser.close();
                         deferred.resolve(res);
                    }).catch(function (e) {
                      console.log('--TEST-->>>', e);
                         browser.close();
                         deferred.resolve(e);
                    });
               }).catch(function (e) {
                    console.log('--TEST-->>>', e);

               });
          },
          address: opts.siteURL,
          requestId: opts.requestId
     }).then(function (res) {
          console.log('test');
          promise.resolve(res);
     }).catch(function (e) {
          console.log('test2');
          promise.reject(e);
     })
     return promise.promise;
}

module.exports = takeScreenShot;
