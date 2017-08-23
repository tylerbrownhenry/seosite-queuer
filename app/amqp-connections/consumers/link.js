var dynamoose = require('dynamoose'),
     settings = require("../../settings/requests"),
     notify = require('../../actions/notify').notify,
     retry = require('../../settings/requests/retry').publish,
     q = require('q');

/**
 * consumer of a link request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processLink(msg, ch) {
     console.log('consumer/link.js processLink');
     var type = 'link';
     var promise = q.defer();
     settings.types.link(msg).then(function (response) {
          console.log('consumer/link.js ackking message processLink', response);
          if (response && response.notify === true) {
               notify(response);
          }
          ch.ack(msg);
          promise.resolve(response);

     }).catch(function (err) {
          console.log('consumer/link.js  failed message', err);
          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               //console.log('break0');
               ch.nack(msg);
               //console.log('break4');
          } else if (err.retry === true) {
               //console.log('retry');
               err.objectType = 'link';
               //console.log('break2', typeof retry);
               retry(err);
               //console.log('break3');
          }
          //console.log('break4');
          ch.ack(msg);
          promise.reject(err);
          //console.log('consumer/link.js  failed message', err);
     });
     return promise.promise;
}
module.exports = processLink;
