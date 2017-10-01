const q = require('q'),
     checkSSL = require('../../../actions/checkSSL/index');

function process(_input) {
     let promise = q.defer(),
          input = _input.params,
          requestId = input.requestId;
     checkSSL(input.url).then(function (results) {
          return promise.resolve({
               sslEnabled: results
          });
     }).catch(function (err) {
          return promise.reject({
               sslEnabled: 'failed:checkSSL'
          });
     });
     return promise.promise;
}

module.exports = {
     process: process
};
