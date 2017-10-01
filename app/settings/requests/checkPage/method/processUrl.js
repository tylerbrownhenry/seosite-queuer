// let markedRequestAsFailed = require('./markedRequestAsFailed'),
    //  reject = require('./reject'),
     let q = require('q'),
     utils = require('../../../../utils'),
     sniff = require('../../../../actions/browse/index'),
     _ = require('underscore');
    //  processHar = require('./processHar');

/**
 * wrapper function for url sniff
 * @param  {Object} input request Object
 */
function processUrl(input,actions) {
     let deferred = q.defer();
     sniff({
          url: utils.convertUrl(input.url),
          options: input.options,
          requestId: input.requestId,
          actions: actions
     }).then((res) => {
          deferred.resolve(res);
     }).catch((err) => {
          deferred.reject(err);
     });
     return deferred.promise;
}

module.exports = processUrl;
