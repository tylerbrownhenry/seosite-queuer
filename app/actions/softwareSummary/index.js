var wappalyzer = require('wappalyzer');
var q = require('q');

module.exports = function (url) {
     var promise = q.defer();
     wappalyzer.analyze(url)
          .then(json => {
               promise.resolve(json);
          })
          .catch(error => {
               promise.reject(error);
          });
     return promise.promise;
};
