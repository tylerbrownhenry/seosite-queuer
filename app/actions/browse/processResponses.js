const _ = require('underscore'),
     q = require('q'),
     entryHandler = require('./handleEntry').entryHandler;

/**
 * handles entries individually
 * @param  {Object} opts page scan data and options
 */
function processResponses(opts) {
     let deferred = q.defer();
     opts = opts || {};
     let data = opts.data;
     options = opts.options || {},
          reqPromises = [],
          failed = false;
     if (!data) {
          console.log('processResponses entryHandler err', e);
          deferred.reject('Could not process the page');
          return deferred.promise;
     }
     _.each(_.keys(data.log.entries), (key, idx) => {
          try {
               var entry = data.log.entries[key];
               reqPromises.push(new entryHandler(entry, idx, options));
          } catch (e) {
               console.log('processResponses entryHandler err', e);
               failed = true;
               deferred.reject(e);
          }
     });
     if (failed !== true) {
          q.all(reqPromises).then((responses) => {
               _.each(_.keys(responses), function (key) {
                    var res = responses[key];
                    data.log.entries[res.idx] = res.data;
               });
               deferred.resolve(data);
          }).catch((e) => {
               console.log('processResponses err', e);
               deferred.reject(e);
          });
     }
     return deferred.promise;
}

module.exports = processResponses;
