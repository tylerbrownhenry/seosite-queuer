let utils = require('../../../../utils');
/**
 * format response then reject promise
 * @param  {Object} promise promise object
 * @param  {Object} input   request data
 */
function reject(promise, input) {
     if (typeof input === 'undefined') {
          input = {}
     }
     let msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          i_id: input.i_id || input.requestId || null,
          url: input.url || null,
          source: input.source || null,
          type: input.type || 'page:scan',
          status: 'error',
          statusType: input.statusType || null,
          system: input.system || null,
          systemError: input.systemError || null
     };
     if (input.retry === true) {
          msg.retry = true;
          if (input.softRetry === true) {
               msg.softRetry = true;
          } else if (input.retryCommand && input.retryOptions) {
               msg.retryCommand = input.retryCommand;
               input.retryOptions.isRetry = true;
               if (input.isRetry === true) {
                    msg.isRetry = true;
               }
               msg.retryOptions = input.retryOptions;
               if (typeof msg.retryOptions.promise !== 'undefined') {
                    msg.retryOptions.promise = null;
               }
          }
     } else {
          msg.completedTime = utils.getNowUTC();
     }
     if (input.notify === true) {
          msg.notify = true;
          msg.message = 'Request updated';
          if (input.message) {
               msg.message = input.message;
          }
     }
     return promise.reject(msg)
}

module.exports = reject;
