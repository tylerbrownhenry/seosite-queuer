var dynamoose = require('dynamoose');
var settings = require("../../settings/requests");
// var requestSchema = require("../../models/request");
// var Request = dynamoose.model('Request', requestSchema);
/**
 * consumer of a capture request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processCapture(msg,ch) {
     var type = 'capture';
     settings.types[type](msg).then(function (response) {
          console.log('consumers/capture.js callback');
          var propName = 'captures[' + response.size + ']';
          console.warn('UPDATE USER AND SCAN WHEN CAPTURES ARE TAKEN');
          // User.collection.findOneAndUpdate({
          //      uid: msg.uid
          // }, {
          //      $inc: {
          //           'activity.captures.monthly.count': 1,
          //           'activity.captures.daily.count': 1
          //      }
          // }, function (err, user) {
          //      console.log('processCapture err?', err);
          // });
          //
          // Scan.collection.findOneAndUpdate({
          //           requestId: response.requestId
          //      }, {
          //           $set: {
          //                [propName]: response.url
          //           }
          //      },
          //      function (e, r, s) {
          //           ch.ack(msg);
          //      });

     }).catch(function (err) {
          console.log('consumers/capture.js error happened making capture');
          ch.ack(msg);
     })
}

module.exports = processCapture;
