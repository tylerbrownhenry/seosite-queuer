var dynamoose = require('dynamoose');
var settings = require("../../settings/requests");
// var requestSchema = require("../../models/request");
// var Request = dynamoose.model('Request', requestSchema);
/**
 * consumer of a link request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processLink(msg,ch) {
     console.log('consumer/link.js processLink');
     var type = 'link';
     settings.types[type](msg).then(function (ok) {
          console.log('consumer/link.js ackking message processLink', ok, msg);
          console.warn('CREDIT THE USER FOR CONSUMPTION');
          // User.collection.findOneAndUpdate({
          //      uid: msg.uid
          // }, {
          //      $inc: {
          //           'activity.links.monthly.count': 1,
          //           'activity.links.daily.count': 1
          //      }
          // }, function (err, user) {
          //      console.log('consumer/link.js  user');
          // });
          ch.ack(msg);
     }).catch(function (err) {
          console.log('consumer/link.js  failed message');
          ch.ack(msg);
          errorHandler(amqpConn, e);
     });
}
module.exports = processLink;
