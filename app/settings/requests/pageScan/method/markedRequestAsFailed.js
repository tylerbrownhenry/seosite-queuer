let utils = require('../../../../utils'),
dynamoose = require('dynamoose'),
reject = require('./reject'),
_ = require('underscore'),
resolve = require('./resolve'),
requestSchema = require("../../../../models/request"),
Request = dynamoose.model('Request', requestSchema);

/**
 * save request status as failed
 * @param  {Object} input
 */
function markedRequestAsFailed(input) {
     utils.updateBy(Request, {
          requestId: input.requestId
     }, {
          $PUT: {
               status: 'failed',
               failedReason: input.message
          }
     }, (_err) => {
          if (_err === null) {
               return reject(input.promise,
                    _.extend({
                         statusType: 'failed',
                         message: input.message,
                         notify: true
                    }, input))
          } else {
               return reject(input.promise,
                    _.extend({
                         system: 'dynamo',
                         systemError: _err,
                         status: 'error',
                         statusType: 'failed',
                         message: 'error:save:failed:scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.pageScan.markedRequestAsFailed',
                         retryOptions: {
                              message: input.message,
                              requestId: input.requestId
                         }
                    }, input));
          }
     });
}
module.exports = markedRequestAsFailed;
