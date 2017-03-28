var summary = require("../../settings/requests").types.summary,
     notify = require('../../actions/notify'),
     retry =  require('../../settings/requests/retry').publish;
/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} cj  rabbitMQ channel
 */
function processSummary(msg, ch) {
     console.log('consumers/summary.js -> processSummary');
     var type = 'summary';
     summary(msg).then(function (response) {
          console.log('consumers/summary.js request success');
          console.log('response', response);
          if (response.notify === true) {
               notify(response);
          }
          ch.ack(msg);
     }).catch(function (err) {
          console.log('consumers/summary.js request failed');
          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               ch.nack(msg);
          } else if (err.retry === true) {
                console.log('retry');
                err.objectType = 'request';
                retry(err);
          }
          ch.ack(msg);
     })
}
module.exports = processSummary;
