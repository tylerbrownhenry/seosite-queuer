var dynamoose = require('dynamoose'),
     settings = require("../../settings/requests"),
     notify = require('../../actions/notify').notify,
    //  retry = require('../../settings/requests/resour').publish,
     q = require('q');

/**
 * consumer of a link request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processResource(msg, ch) {
    //  console.log('consumer/link.js processResource',msg);
     let type = 'link',
     promise = q.defer();
     let myVar = setTimeout(function(){
        console.log('timed out resource',JSON.parse(msg.content));
      }, 30000);
     settings.types.resource(msg).then(function (response) {
          console.log('consumer/link.js ackking message processResource', response);
          clearTimeout(myVar);
          if (response.notify === true) {
               notify(response);
          }
          ch.ack(msg);
          promise.resolve(response);

     }).catch(function (err) {
       clearTimeout(myVar);

          console.log('consumer/link.js  failed message', err);
          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               console.log('break0',err);
               ch.nack(msg);
          } else if (err.retry === true) {
               console.log('break1',err);
               err.objectType = 'link';
               retry(err);
          }
          ch.ack(msg);
          promise.reject(err);
     });
     return promise.promise;
}
module.exports = processResource;
