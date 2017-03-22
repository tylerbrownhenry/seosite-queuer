var retry = require("../../settings/requests").types.retry;
/**
 * consumer of a retry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} ch rabbitMQ channel object
 */
function processRequest(msg,ch) {
    console.log('consumers/retry.js processRequest');
    retry(msg).then(function (response) {
         ch.ack(msg);
    }).catch(function (err) {
         ch.ack(msg);
    });
}
module.exports = processRequest;
