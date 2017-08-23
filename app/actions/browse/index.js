processResponses = require('./processResponses'),
     utils = require('./utils'),
     q = require('q');

const evaluatePageContent = require('./evaluatePageContent');
const evaluteResults = require('./evaluteResults');
const open = require('./open');

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

function openPage(opts) {
     var promise = q.defer();
     open({
          addToResponse: {
               resources: {},
          },
          processRequest: true,
          evalutePage: evaluatePageContent,
          evaluteResults: evaluteResults,
          address: opts.url,
          requestId: opts.requestId
     }).then(function (har) {
          promise.resolve(har);
     }).catch(function (e) {
          promise.reject(e);
     })
     return promise.promise;
}

function har(opts) {
     var promise = q.defer();
     openPage(opts).then(function (data) {
          processResponses({
               data: data,
               options: opts
          }).then(function (res) {
               promise.resolve(res);
          }).catch(function (err) {
               promise.reject(err);
          })
     }).catch(function (err) {
          promise.reject(err);
     });
     return promise.promise;
}

module.exports.har = har;
