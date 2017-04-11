var retryInit = require("../../settings/requests").types.retry,
     notify = require('../../actions/notify'),
     retry =  require('../../settings/requests/retry').publish;

/**
 * consumer of a retry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} ch rabbitMQ channel object
 */
function processRequest(msg,ch) {
    // console.log('consumers/retry.js processRequest');
    retryInit(msg,ch).then(function (response) {
          // console.log('consumers/retry.js request success');
          if (response && response.notify === true) {
               notify(response);
          }
          //console.log('ACK--1',msg);
          ch.ack(msg);
    }).catch(function (err) {
        // console.log('consumers/retry.js request failed',err);
          if (err && err.notify === true) {
               notify(err);
          }
          if (err && err.softRetry === true) {
               return ch.nack(msg);
          } else if (err && err.retry === true) {
                // console.log('retry');
                err.objectType = 'request';
                retry(err).then(function(){
                  ch.ack(msg);
                }).catch(function(e){
                  if(typeof e === 'object' && e.retry === true){
                    ch.nack(msg);
                  } else {
                    ch.ack();
                  }
                });
          }
    });
}
module.exports = processRequest;
