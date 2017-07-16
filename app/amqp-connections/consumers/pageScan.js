var pageScan = require("../../settings/requests").types.pageScan,
     notify = require('../../actions/notify'),
     retry =  require('../../settings/requests/retry').publish;
/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} cj  rabbitMQ channel
 */
function processSummary(msg, ch) {
     //console.log('consumers/pageScan.js -> processSummary');
     var type = 'page:scan';
     pageScan(msg).then(function (response) {
          console.log('consumers/pageScan.js request success',response);
          if (response.notify === true) {
               notify(response);
          }
          ch.ack(msg);
     }).catch(function (err) {
          console.log('consumers/pageScan.js request failed');
          if (err.notify === true) {
               notify(err);
               console.log('retry1');
          }
          if (err.softRetry === true) {
              console.log('retry2');
               ch.nack(msg);
          } else if (err.retry === true) {
                console.log('retry3');
                err.objectType = 'request';
                retry(err);
          }
          ch.ack(msg);
     })
}
module.exports = processSummary;
