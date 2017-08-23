let utils = require('../../../../utils');

/**
 * format response then resolve promise
 * @param  {Object} promise promise object
 * @param  {Object} input   request data
 */
function resolve(promise, input) {
     if (typeof input === 'undefined') {
          input = {}
     }
     let msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          source: input.source || null,
          type: input.type || 'page:scan',
          status: input.status || null,
          statusType: input.statusType || null,
          completedTime: utils.getNowUTC(),
          message: input.message || null
     }
     if (input.notify === true) {
          msg.notify = true;
     }
     promise.resolve(msg);
}

module.exports = resolve;
