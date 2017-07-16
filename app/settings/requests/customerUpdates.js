var q = require('q');

function _customerUpdates(msg) {
    console.log('settings/requests/customerUpdates --> in');
     var promise = q.defer();
          console.log('settings/requests/customerUpdates --> done');
          promise.resolve({
               status: 'success'
          });
     return promise.promise;
}

module.exports = _customerUpdates;
