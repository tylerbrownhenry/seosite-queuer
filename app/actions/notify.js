var sh = require('shorthash'),
     publisher = require('../amqp-connections/publisher'),
     email = require('./email/send-email'),
     q = require('q'),
     retry = require('../settings/requests/retry').publish,
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
module.exports.notify = function(msg) {
     var msg = {
          id: sh.unique(msg.status + msg.uid + (msg.i_id || msg.requestId)),
          uid: msg.uid,
          i_id: msg.i_id || msg.requestId,
          status: msg.status, // 'success' || 'error'
          statusType: msg.statusType, // 'update' || 'complete' || 'failed'
          type: msg.type, //'page:scan'
          message: msg.message,
          source: msg.source
     };
     var update = new Update(msg);
     update.save(function (err) {
          if (err) {
               retry({
                    statusType: msg.type,
                    status: msg.status,
                    message: msg.message,
                    type: msg.type,
                    i_id: msg.i_id,
                    uid: msg.uid,
                    msg: msg.requestType,
                    source: msg.source,
                    retry: true,
                    retryCommand: 'notify',
                    retryOptions: msg
               });
          } else {
               /*
               Let user know there is an update
               */
              publisher.publish("", "update", new Buffer(JSON.stringify({
                   uid: msg.uid,
                   requestType: msg.requestType,
                   i_id: msg.i_id,
                   type: msg.type,
                   status: msg.status
              }))).then(function (res) {
                  //  console.log('res', res);
              }).catch(function (err) {

              });

          }
     });
}
