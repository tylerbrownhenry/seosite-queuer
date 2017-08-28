var dnsNs = require('dns');
var q = require('q');

const {
     URL
} = require('url');

(function checkNameServers(url) {
  url = 'http://www.mariojacome.com';
  var promise = q.defer();
  var hostUrl = new URL(url);
  console.log('URL', hostUrl);
     var promise = q.defer();
     let myVar = setTimeout(function () {
          console.log('timed out serverInfo checkNameServers');
     }, 30000);
     dnsNs.resolveNs(url, function (err, addresses) {
       console.log('err',err);
       console.log('addresses',addresses);
       clearTimeout(myVar);
          if (err) {
               promise.resolve({
                    nameservers: null
               });
          } else {
               promise.resolve({
                    nameservers: addresses
               });
          }
     });
     return promise.promise;
})();
