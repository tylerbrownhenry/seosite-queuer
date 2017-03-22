var dynamoose = require('dynamoose');
var settings = require("../../settings/requests");
// var requestSchema = require("../../models/request");
// var Request = dynamoose.model('Request', requestSchema);
/**
 * consumer of a page request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */

function processPage(msg,ch) {
    console.log('consumers/page.js processPage');
    var type = 'page';
    settings.types[type](msg).then(function (response, message, requestId) {
         console.log('consumers/page.js ackking message page');
         console.warn('CREDIT USER FOR THEIR CONSUMPTION');
        //  User.collection.findOneAndUpdate({
        //       uid: msg.uid
        //  }, {
        //       $inc: {
        //            'activity.pages.monthly.count': 1,
        //            'activity.pages.daily.count': 1
        //       }
        //  }, function (err, user) {
        //       console.log('consumers/page.js')
        //  });

         ch.ack(msg);
    }).catch(function (err) {
         console.log('consumers/page.js request failed');
         console.warn('UPDATE REQUEST WHEN FAILS');
         ch.ack(msg);
        //  Request.collection.findOneAndUpdate({
        //            requestId: err.requestId
        //       }, {
        //            $set: {
        //                 failedReason: err.message,
        //                 status: err.status
        //            }
        //       },
        //       function (e, r, s) {
        //            console.log('consumers/page.js request failed');
        //       });
    })
}
module.exports = processPage;
