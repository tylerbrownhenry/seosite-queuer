const q = require('q'),
     serverInfo = require('../../../actions/serverInfo/index');

function process(data) {
     let promise = q.defer();
     serverInfo(data.params.url).then(function (results) {
          promise.resolve({
               serverInfo: results
          });
     }).catch(function (err) {
          promise.reject({
               serverInfo: 'failed:serverInfo'
          });
     });
     return promise.promise;
}

module.exports = {
     process: process
};
