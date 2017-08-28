const wappalyzer = require('wappalyzer'),
     q = require('q');

module.exports = function (url) {
     let promise = q.defer(),
          myVar = setTimeout(function () {
               console.log('timed out wappalyzer');
          }, 30000);
          try{

     wappalyzer.analyze(url)
          .then(json => {
               clearTimeout(myVar);
               promise.resolve(json);
          })
          .catch(error => {
               clearTimeout(myVar);
               console.log('wappalyzer failed', error);
               promise.reject(error);
          });
        }catch(e){
          console.log('eeee',e);
        }

     return promise.promise;
};
