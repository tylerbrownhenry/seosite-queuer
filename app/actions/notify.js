var sh = require('shorthash'),
     publisher = require('../amqp-connections/publisher'),
     //  email = require('./email/send-email'),
     q = require('q'),
    //  retry = require('../settings/requests/retry').publish,
     Update = require('../models/update');
/**
 * [notify description]
 * @param  {String} type       pageScan || site || link
 * @param  {String} uid        user id
 * @param  {String} i_id       item's unique id
 * @param  {String} status     status to give this message
 * @param  {String} page       page the update relates to
 * @param  {String} message    message for this update
 * @param  {String} statusType label, to instruct how to handle this update
 */
module.exports.notify = function (msg,deferred) {
     let update = {
          id: sh.unique(msg.status + msg.uid + (msg.i_id || msg.requestId)),
          uid: msg.uid,
          i_id: msg.i_id || msg.requestId,
          status: msg.status, // 'success' || 'error'
          statusType: msg.statusType, // 'update' || 'complete' || 'failed'
          type: msg.type, //'page:scan'
          message: msg.message,
          source: msg.source
     };
     update = new Update(update);
     update.save(function (err) {
          if (err) {
            if(deferred && deferred.resolve){
              deferred.reject();
            }
              //  retry({
              //       statusType: update.type,
              //       status: update.status,
              //       message: update.message,
              //       type: update.type,
              //       i_id: update.i_id,
              //       uid: update.uid,
              //       msg: update.requestType,
              //       source: update.source,
              //       retry: true,
              //       retryCommand: 'notify',
              //       retryOptions: msg
              //  });
          } else {
               publisher.publish("", "update", new Buffer(JSON.stringify({
                    uid: update.uid,
                    requestType: update.requestType,
                    i_id: update.i_id,
                    type: update.type,
                    status: update.status
               })));
               if(deferred && deferred.resolve){
                 deferred.resolve(update);
               }
          }
     });
     if(deferred && deferred.promise){
       return deferred.promise
     }
}
