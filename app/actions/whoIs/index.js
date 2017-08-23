var whois = require('whois');
var q = require('q');
const {
     URL
} = require('url');
module.exports = function (url) {
     var promise = q.defer();
     // Not sure if need hostname
     //
     var hostUrl = new URL(url);

     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     // Not valid per their terms and conditions/
     whois.lookup(hostUrl.hostname, function(err, data) {
         if(err){
           promise.reject('err:getting:whois');
         } else {
           promise.resolve(data);
         }
     });
     return promise.promise;
};
