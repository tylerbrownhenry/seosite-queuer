const q = require('q'),
     checkSocial = require('../../../actions/checkSocial/index');

function process(_input) {
     let promise = q.defer();
     input = _input.params;
     checkSocial(input.url, input.socialInfo.twitterUsername).then((results) => {
          return promise.resolve({
               social: {
                    results: results,
                    onPage: input.socialInfo
               }
          });
     }).catch((e) => {
          return promise.reject({
               social: 'failed:checkSocial'
          });
     });
     return promise.promise;
}

module.exports = {
     process: process
};
