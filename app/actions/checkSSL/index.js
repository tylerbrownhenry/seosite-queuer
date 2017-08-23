var https = require('https');
var q = require('q');
const {
     URL
} = require('url');

module.exports = function (url) {
     var promise = q.defer();
     console.log('HERE4', url);

     var hostUrl = new URL(url);

     var options = {
          host: hostUrl.hostname,
          method: 'get',
          path: '/'
     };

     var req = https.request(options,
          function (res) {
               promise.resolve((res.socket.authorized) ? 'ssl:enabled' : 'ssl:not:enabled');
          });

     /* http on error? test before host part*/

     req.on('error', function (e) {
          // console.error('error', e);
          promise.reject('ssl:not:enabled');
     });

     req.end();
     return promise.promise;
};
