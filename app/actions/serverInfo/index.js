var q = require('q');
var _ = require('underscore');
var dns = require('native-dns');
var dnsNs = require('dns');

const {
     URL
} = require('url');

function checkIp(url) {
     var promise = q.defer();
     dns.lookup(url, (err, address, family) => {
          if (!err && typeof address != 'undefined') {
               promise.resolve({
                    'ip': address
               });
          } else {
               promise.resolve({
                    'ip': null
               });
          }
     });
     return promise.promise;
}

function checkNameServers(url) {
     var promise = q.defer();
     dnsNs.resolveNs(url, function (err, addresses) {
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
};

function checkInfo(url) {
  console.log('URL',url);
     var promise = q.defer();
     var hostUrl = new URL(url).hostname;
     try{

     if (typeof hostUrl === 'undefined') {
          promise.reject(null);
     } else {

          q.all([checkIp(hostUrl), checkNameServers(hostUrl)]).then(function (res) {
               var resp = {};
               _.each(res, function (item) {
                    var key = _.keys(item)[0];
                    resp[key] = item[key];
               })
               promise.resolve(resp);
          }).catch(function (err) {
               promise.reject(err);
          });
     }
   }catch(e){
     console.log('e',e);
   }
     return promise.promise;
}
module.exports = checkInfo;
