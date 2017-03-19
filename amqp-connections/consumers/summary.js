var settings = require("../../settings/requests"),
     dynamoose = require('dynamoose'),
     requestSchema = require("../../schemas/requestSchema"),
     utils = require("../../app/utils"),
     Request = dynamoose.model('Request', requestSchema);
/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processSummary(msg,ch) {
     console.log('processSummary');
     ch.ack(msg);
     var type = 'summary';
     settings.types[type](msg).then(function (response, message, requestId) {
          console.log('consumers/summary.js ackking message summary');
          ch.ack(msg);
     }).catch(function (err) {
          console.log('consumers/summary.jsrequest failed');
          ch.ack(msg);
          utils.updateBy(Request, {
                    requestId: err.requestId
               }, {
                    $PUT: {
                         failedReason: err.message,
                         status: err.status
                    }
               },
               function (e, r, s) {
                    console.log('consumers/summary.js request failed ? is this a failure?');
               });
     })
}
module.exports = processSummary;
