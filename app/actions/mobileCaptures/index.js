var q = require('q');
var _ = require('underscore');
var openPage = require('./openPage');

function doit(url, requestId, devices) {
     let promise = q.defer();
     let siteURL = url;
     let siteName = siteURL.replace('http://', '');
     let promises = [];
     let options = {
       requestId: requestId,
       imageDir: './images/',
       siteName: siteName.replace('.', '_').replace('/', '_') + '_',
       siteURL: siteURL
     };
     _.each(devices, function (device) {
          promises.push(openPage(options,device));
     })
     q.all(promises).then(function(res){
       promise.resolve({
            status: 'success',
            captures: res,
            requestId: requestId,
            data: 'Captures taken'
       });
     }).catch(function(err){
       promise.reject({
            requestId: requestId,
            status: 'error',
            data: 'Captures not taken'
       });
     })
     return promise.promise;
}

module.exports = {
     doit: doit
}
