const https = require('https'),
     q = require('q'),
     {
          URL
     } = require('url');
/**
 * https check, attempts to connect to url with https and waits to see if certificate exists
 * @param  {String} url
 * @return {Object}     promise
 */
module.exports = (url) => {
     let deferred = q.defer(),
          hostUrl = new URL(url),
          options = {
               host: hostUrl.hostname,
               timeout: 30000,
               method: 'get',
               path: '/'
          },
          req = https.request(options,
               (res) => {
                    if (res && res.socket) {
                         deferred.resolve((res.socket.authorized) ? 'ssl:enabled' : 'ssl:not:enabled');
                    } else {
                         deferred.resolve('ssl:not:enabled');
                    }
               });
     req.on('error', (e) => {
          deferred.reject('ssl:not:enabled');
     });
     req.end();
     return deferred.promise;
};
