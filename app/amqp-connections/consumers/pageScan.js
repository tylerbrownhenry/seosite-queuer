var processAction = require("../../settings/requests").types.pageScan,
     notify = require('../../actions/notify').notify,
     retry =  require('../../settings/requests/retry').publish,
     actions =  require('../../settings/requests/actions'),
     utils =  require('../../utils'),
     q =  require('q');
/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 * @param  {object} cj  rabbitMQ channel
 */
function processSummary(msg, ch) {
     var type = 'page:scan';
     var input = JSON.parse(msg.content);

     let myVar = setTimeout(function(){
        console.log('timed out processSummary',JSON.parse(msg.content));
      }, 30000);
     processAction(msg,'process').then((response)=>{
       clearTimeout(myVar);
       actions.checkTest(input,response)
       console.log('processSummary sucesss ',response);
          if (response.notify === true) {
               notify(response);
          }
          utils.retryUpdateRequest({
               requestId: input.requestId
          }, q.defer());
          ch.ack(msg);
     }).catch((err) => {
       clearTimeout(myVar);

       console.log('processSummary err',err,input);
      //  console.log('processSummary err input.action',input.action);
          const _action = actions.actions.pageScan;
          console.log('processSummary err _action',_action);
          try{

          if (err.notify === true) {
               notify(err);
          }
          if (err.softRetry === true) {
               return ch.nack(msg);
          }
          if (input.isRetry !== true) {
            console.log('processSummary err _action --> retry',_action.retry);
               if (_action.retry && _action.retry.can === true) {
                    retry(err);
               }
          } else {
            utils.retryUpdateRequest({
                 requestId: input.requestId
            }, q.defer());
          }
          ch.ack(msg);
        }catch(e){
            console.log('pageSCan err complete',e);
        }

     });
}
module.exports = processSummary;
