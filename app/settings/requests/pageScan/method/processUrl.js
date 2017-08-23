let markedRequestAsFailed = require('./markedRequestAsFailed'),
     reject = require('./reject'),
     q = require('q'),
     sniff = require('../../../../actions/browse/index'),
     _ = require('underscore'),
     processHar = require('./processHar');

/**
 * checks if a failed page scan should be marked for a retry
 * @param  {Object} input request object
 * @param  {Object} err   error response from page scan
 * @return {Boolean}
 */
function shouldRetry(input, err) {
     console.log('shouldRetry ** should have better logic eventually', input, input.isRetry === true);
     if (input.isRetry === true) {
          return false;
     }
     return true;
}

/**
 * wrapper function for url sniff
 * @param  {Object} input request Object
 */
function processUrl(input) {
     var promise = q.defer();
     sniff.har({
          url: input.url,
          uid: input.uid,
          options: input.options,
          requestId: input.requestId
     }).then(function (res) {
          processHar(input, res);
          return promise.resolve();
     }).catch(function (err) {
       console.log('err',err);
          if (shouldRetry(input, err)) {
               return reject(input.promise,
                    _.extend({
                         message: 'error:scan:retry',
                         statusType: 'scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.pageScan.processUrl',
                         retryOptions: input
                    }, input));
          }
          markedRequestAsFailed(_.extend({
               message: 'error:unable:to:scan',
          }, input));
          return promise.reject({});
     });
     return promise.promise;
}

module.exports = processUrl;
