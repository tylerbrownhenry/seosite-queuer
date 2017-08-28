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
     let myVar = setTimeout(function(){
        console.log('timed out link!!',JSON.parse(msg.content));
      }, 30000);
     settings.types.link(msg).then(function (response) {
       clearTimeout(myVar);
          console.log('consumer/link.js ackking message processLink', response);
          if (response && response.notify === true) {
               notify(response);
          }
          ch.ack(msg);
          promise.resolve(response);

     }).catch(function (err) {
       clearTimeout(myVar);
          console.log('consumer/link.js failed message', err);
          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               ch.nack(msg);
          } else if (err.retry === true) {
               err.objectType = 'link';
               retry(err);
          }
          ch.ack(msg);
          promise.reject(err);
     });
     return promise.promise;
}
module.exports = processLink;
