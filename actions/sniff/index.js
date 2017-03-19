// var phantom = require('phantom');
// var phantom = require('node-phantom');
var phantom = require('node-phantom-simple');
var processResponses = require('./process/processResponses');
var createPage = require('./process/createPage');
var utils = require('./utils');
var q = require('q');

if (!Date.prototype.toISOString) {
     Date.prototype.toISOString = function () {
          function pad(n) {
               return n < 10 ? '0' + n : n;
          }

          function ms(n) {
               return n < 10 ? '00' + n : n < 100 ? '0' + n : n
          }
          return this.getFullYear() + '-' +
               pad(this.getMonth() + 1) + '-' +
               pad(this.getDate()) + 'T' +
               pad(this.getHours()) + ':' +
               pad(this.getMinutes()) + ':' +
               pad(this.getSeconds()) + '.' +
               ms(this.getMilliseconds()) + 'Z';
     }
}

// phantom.create = utils.promisify(phantom.create);

function openPage(opts) {
     var promise = q.defer();
     var phantomInstance;
     phantom.create({
          path: require('phantomjs').path
     }, function (err, ph) {
          if (err) {
               console.log('err', err);
               promise.reject(err);
               if (typeof ph !== 'undefined' && typeof ph.exit === 'function') {
                    return ph.exit(); // Abort PhantomJS when an error occurs.
               }
          }
          phantomInstance = ph;
          ph.createPage(function (err, page) {
               if (err) {
                    promise.reject(err);
               } else {
                    createPage({
                         options: opts,
                         page: page,
                         ph: ph
                    }).then(function (res) {
                         promise.resolve(res);
                    }).catch(function (err) {
                         promise.reject(err);
                         if (typeof ph !== 'undefined' && typeof ph.exit === 'function') {
                              ph.exit(); // Abort PhantomJS when an error occurs.
                         }
                    });
               }
          });
     });
     return promise.promise;
}

function har(opts) {
     var promise = q.defer();
     openPage(opts).then(function (data) {
          console.log('success');
          processResponses({
               data: data,
               options: opts
          }).then(function (res) {
               console.log('res', res);
               promise.resolve(res);
          }).catch(function (err) {
               console.log('res', res);
               promise.reject(err);
          })
     }).catch(function (err) {
          console.log('--error', err, 'error');
          promise.reject(err);
     });
     return promise.promise;
}

module.exports.har = har;
