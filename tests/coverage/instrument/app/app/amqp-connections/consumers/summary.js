var settings = require("../../settings/requests"),
     dynamoose = require('dynamoose'),
     notify = require('../../actions/notify'),
     requestSchema = require("../../models/request"),
     utils = require("../../utils"),
     Request = dynamoose.model('Request', requestSchema),
     retry = require('../../settings/requests/retry').publish;

/**
 * consumer of a page sumamry request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processSummary(msg,ch) {
     console.log('processSummary');
    //  ch.ack(msg);
     var type = 'summary';
     settings.types[type](msg).then(function (response) {
          console.log('consumers/summary.js ackking message summary');
          console.log('response',response);
          if(response.notify === true){
            // notify()
            notify(response)
            // notify(response.type, response.uid, response.requestId, response.status, response.page, response.message, response.statusType)
          }
          ch.ack(msg);
     }).catch(function (err) {
          console.log('consumers/summary.js request failed',err);
          /**
           * A page summary has a number of tasks that it needs to do before being considered complete.
           * 1. If scanning links, all links must be scanned
           * 2. If saving meta data, all meta data must be processed
           * 3. If saving resources, all resoucres must be processed
           * 4. Page itself must get contacted and the html must get parsed
           *
           * Of these their are also a couple api calls involved in saving the data.
           * 1. BatchPut of all of the link Objects
           * 2. Update count of scan object
           * 3. Request is marked active
           */

           /**
            * Api Call: Request is marked active -->
            * Pass -->
            *   Sniff Url
            *   Pass -->
            *     processResources
            *     processMetaData
            *     Pass -->
            *       Save Scan
            *         Pass -->
            *           If Scanning Links and there are links
            *             Process links
            *               batchPut
            *                 Pass -->
            *                   updateCount
            *                     Pass -->
            *                       Publish links individually?
            *                         Pass -->
            *                            Fogetabout it
            *                            (Eventually as the links are consumed they check the Request process list to see if all the links have been scanned)
            *                            (What if a single link is not sent to the queue... how can we tell when to finish the scan?)
            *                         Fail -->
            *                           (Problem) Link will remain unscanned?
            *
            *                     Fail -->
            *                       (Should) send to rabbitMQ to process later (maybe make this happen before processLinks)
            *                 Fail -->
            *                  (Should) Send batchPut to rabbit to process later
            *           Else
            *             Update Request as complete
            *               Pass -->
            *                 Done
            *               Fail -->
            *                 (Should) Send request to save back to rabbitMQ to process later
            *         Fail -->
            *           (Should) Publish unsaved scan to rabbitMQ, and restart here.
            *     Fail -->
            *       No retry, likely an object bug (should be preventable / codeable / bulletproofable)
            *   Fail -->
            *     Todo:
            *     Check why failed
            *     If timed out, do we retry?
            *     If 500 do not retry..
            *     etc.
            * Fail -->
            *   Message nacked (Retrying)
            *
            */

            // function rejectRetry(promise,input,command){
            //
            // }
            //
            // function rejectNotify(promise,input,command){
            //
            // }
            // function rejectNotifyRetry(){
            //
            // }
            var statusTypes = {
              database: true,
              invalidInput: true,
              system: true
            };

          if(err.notify === true){

          }

          if(err.softRetry === true){
            ch.nack(msg);
          } else if(err.retry === true){
            ch.ack(msg);
            err.objectType = 'request';
            retry(err)
          }
          if(err.requestId === null){
              return;
          }
          // utils.updateBy(Request, {
          //           requestId: err.requestId
          //      }, {
          //           $PUT: {
          //                failedReason: err.message,
          //                status: err.status
          //           }
          //      },
          //      function (e, r, s) {
          //           console.log('consumers/summary.js request failed ? is this a failure?');
          //      });
     })
}
module.exports = processSummary;
