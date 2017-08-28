let markedRequestAsFailed = require('./markedRequestAsFailed'),
     reject = require('./reject'),
     q = require('q'),
     utils = require('../../../../utils'),
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
  console.log('processUrl1',input);
     var promise = q.defer();
     try{


     sniff({
          url: utils.convertUrl(input.url),
          uid: input.uid,
          options: input.options,
          requestId: input.requestId
     }).then(function (res) {
       console.log('processUrl2');
          processHar(input, res);
          return promise.resolve();
     }).catch(function (err) {
          console.log('processURl err', err,'input',input);
          try {
               var retry = shouldRetry(input, err)
              //  if () {
                    // reject(input.promise,
                    //      _.extend({
                    //           message: 'error:scan:retry',
                    //           statusType: 'scan',
                    //           notify: true,
                    //           retry: retry,
                    //           retryCommand: 'request.pageScan.processUrl',
                    //           retryOptions: input
                    //      }, input));
              //  }
               markedRequestAsFailed(_.extend({
                   message: 'error:scan:retry',
                   statusType: 'scan',
                   notify: true,
                   retry: retry,
                   retryCommand: 'request.pageScan.processUrl',
                   retryOptions: input
               }, input),'processURL-->');
               return promise.reject({});
          } catch (e) {
               console.log('eee', e);
          }
     });
   }catch(e){
     console.log('e',e);
   }
     return promise.promise;
}

module.exports = processUrl;
