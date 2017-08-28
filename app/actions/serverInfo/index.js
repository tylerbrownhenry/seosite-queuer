let q = require('q'),
     _ = require('underscore'),
     dns = require('native-dns'),
     dnsNs = require('dns'),
     {
          URL
     } = require('url');

/**
 * finds ip from url
 * @param  {String} url
 */
function checkIp(url) {
     let deferred = q.defer(),
          myVar = setTimeout(function () {
               console.log('timed out serverInfo checkIp');
          }, 30000);
     dns.lookup(url, (err, address, family) => {
          clearTimeout(myVar);
          if (!err && typeof address != 'undefined') {
               deferred.resolve({
                    'ip': address
               });
          } else {
               console.log('serverInfo lookup ip error');
               deferred.resolve({
                    'ip': null
               });
          }
     });
     return deferred.promise;
}

/**
 * finds name servers of url
 * @param  {String} url
 */
function checkNameServers(url) {
     let deferred = q.defer(),
          myVar = setTimeout(function () {
               console.log('timed out checkNameServers');
          }, 30000);
     url = url.replace(/^(www\.)/, "");
     dnsNs.resolveNs(url, function (err, addresses) {
         clearTimeout(myVar);
          if (err) {
               console.log('resolveNs error', err);
               deferred.resolve({
                    nameservers: null
               });
          } else {
               deferred.resolve({
                    nameservers: addresses
               });
          }
     });
     return deferred.promise;
};

/**
 * wrapper for checking IP address and nameservers of a url
 * @param  {String} url
 */
function checkInfo(url) {
     var deferred = q.defer();
     var hostUrl = new URL(url).hostname;
     try {

          if (typeof hostUrl === 'undefined') {
               deferred.reject(null);
          } else {

               let myVar = setTimeout(function () {
                    console.log('timed out serverInfo');
               }, 30000);
               q.all([checkIp(hostUrl), checkNameServers(hostUrl)]).then(function (res) {
                    clearTimeout(myVar);
                    var resp = {};
                    _.each(res, function (item) {
                         var key = _.keys(item)[0];
                         resp[key] = item[key];
                    })
                    deferred.resolve(resp);
               }).catch(function (e) {
                    console.log('serverInfo error', e);
                    clearTimeout(myVar);
                    deferred.reject(err);
               });
          }
     } catch (e) {
          console.log('serverInfo error', e);
     }
     return deferred.promise;
}
module.exports = checkInfo;
