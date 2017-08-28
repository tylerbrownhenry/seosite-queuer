const processResponses = require('./processResponses'),
     utils = require('./utils'),
     q = require('q'),
     checkElements = require('../tapTargetCheck/index'),
     evaluatePageContent = require('./evaluatePageContent'),
     evaluteResults = require('./evaluteResults'),
     open = require('./open');

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

/**
 * wrapper for opening a url in headless browser and collecting resource data
 * @param  {Object} opts options for the page scan
 */
function openPage(opts) {
     let deferred = q.defer();
     open({
          addToResponse: {
               resources: {},
          },
          processRequest: true,
          checkElements: checkElements,
          checkElementResults: function(response,option,resp){
              return {failed:resp.failed};
          },
          evalutePage: evaluatePageContent,
          evaluteResults: evaluteResults,
          address: opts.url,
          requestId: opts.requestId
     }).then(function (har) {
          deferred.resolve(har);
     }).catch(function (e) {
          console.log('browser/index openPage open failed',e);
          deferred.reject(e);
     })
     return deferred.promise;
}

/**
 * wrapper for opening, then processes the response
 * @param  {Object} opts options for the page scan
 */
module.exports = function (opts) {
     let deferred = q.defer();
     openPage(opts).then((data) => {
          processResponses({
               data: data,
               options: opts
          }).then((res) => {
               deferred.resolve(res);
          }).catch((e) => {
              console.log('browse/index openPage processResponses failed', e);
               deferred.reject(e);
          })
     }).catch((e) => {
          console.log('browse/index openPage failed', e);
          deferred.reject(e);
     });
     return deferred.promise;
}
