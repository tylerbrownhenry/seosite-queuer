var _ = require('underscore');
var q = require('Q');
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
     // console.log('processResponses 1', data.log.entries);
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
          console.log('err', err);
          promise.reject(err);
     }).finally(function(err,res){
       console.log('finally',err,res);
     })
     return promise.promise;
}

module.exports = processResponses;
