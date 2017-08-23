var processAction = require("../../settings/requests").types.pageScan,
     notify = require('../../actions/notify').notify,
     retry =  require('../../settings/requests/retry').publish,
     actions =  require('../../settings/requests/actions').actions,
     utils =  require('../../utils');
/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} cj  rabbitMQ channel
 */
function processSummary(msg, ch) {
     var type = 'page:scan';
     var input = JSON.parse(msg.content);
     processAction(msg,'process').then((response)=>{
       console.log('processSummary sucesss ',response);
          if (response.notify === true) {
               notify(response);
          }
          utils.retryUpdateRequest({
               requestId: input.requestId
          }, q.defer());
          ch.ack(msg);
     }).catch((err) => {
       console.log('processSummary err',err);
          const _action = actions[input.action];
          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               return ch.nack(msg);
          }
          if (input.isRetry !== true) {
               if (_action.retry.can === true) {
                    retry(err);
               }
          } else {
            utils.retryUpdateRequest({
                 requestId: input.requestId
            }, q.defer());
          }
          ch.ack(msg);
          promise.reject();
     });
}
module.exports = processSummary;
