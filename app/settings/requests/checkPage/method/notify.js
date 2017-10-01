_notify = require('../../../../actions/notify').notify,

/**
 * broadcast status message back to dashboard
 * @param  {Object} opts information about scan and current status
 */
module.exports = (opts,deferred) => {
     let msg = {
          uid: opts.uid,
          requestId: opts.requestId,
          status: opts.status,
          statusType: opts.statusType,
          message: opts.message,
          source: opts.source,
          type: opts.type
     };
     return _notify(msg,deferred);
}
