var dynamoose = require('dynamoose'),
settings = require("../../settings/requests");
/**
 * consumer of a capture request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processCustomerUpdates(msg, ch) {
     var type = 'customerUpdates';
     console.log('customerUpdates.js --> begin');
     settings.types[type](msg).then(function (response) {
       console.log('customerUpdates.js --> done');
          ch.ack(msg);
     });
}

module.exports = processCustomerUpdates;
