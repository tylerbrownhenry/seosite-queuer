var _ = require('underscore');
var q = require('q');
var entryHandler = require('../handleEntry');
function processResponses(opts) {
     var promise = q.defer();
     opts = opts || {};
     var data = opts.data;
     var options = opts.options || {};
     var reqPromises = [];
     if (!data) {
          promise.reject('PhantomJS could not process the page');
     }
     console.log('processResponses -->');
     _.each(_.keys(data.log.entries), function (key, idx) {
          try {
               var entry = data.log.entries[key];
               reqPromises.push(new entryHandler(entry, idx, key, options));
          } catch (err) {
               promise.reject(err);
          }
     });
     q.all(reqPromises).then(function (responses) {
          _.each(_.keys(responses), function (key) {
               var res = responses[key];
               data.log.entries[res.idx] = res.data;
          });
          promise.resolve(data);
     }).catch(function (err) {
          console.log('processResponses err');
          promise.reject(err);
     });
     return promise.promise;
}

module.exports = processResponses;
