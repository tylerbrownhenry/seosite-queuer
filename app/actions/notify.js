var sh = require('shorthash'),
     publisher = require('../amqp-connections/publisher'),
     utils = require('../utils'),
     q = require('q'),
     retry = require('../settings/requests/retry').publish,
     Update = require('../models/update');
/**
 * [notify description]
 * @param  {String} type       page || summary || link
 * @param  {String} uid        user id
 * @param  {String} i_id       item's unique id
 * @param  {String} status     status to give this message
 * @param  {String} page       page the update relates to
 * @param  {String} message    message for this update
 * @param  {String} statusType label, to instruct how to handle this update
 */
function notify(msg) {
     //console.log('app/actions/notify.js', msg);
     var msg = {
          id: sh.unique(msg.status + msg.uid + (msg.i_id || msg.requestId)),
          uid: msg.uid,
          i_id: msg.i_id || msg.requestId,
          status: msg.status, // 'success' || 'error'
          statusType: msg.statusType, // 'update' || 'complete' || 'failed'
          //(success) 'pending' || 'complete' (error) 'database' || 'system' || 'invalidInput'
          type: msg.type, //'page:request'
          message: msg.message,
          page: msg.page
     };
     //console.log('app/actions/notify.js -> new Update');
     var update = new Update(msg);
     utils.saveModel(update, function (err) {
          if (err) {
               //console.log('actions/notify.js -> update save:failed');
               //console.log('err2', err);
               retry({
                    statusType: msg.type,
                    status: msg.status,
                    message: msg.message,
                    type: msg.type,
                    i_id: msg.i_id,
                    uid: msg.uid,
                    page: msg.page,
                    retry: true,
                    retryCommand: 'notify',
                    retryOptions: msg
               });
          } else {
               //console.log('actions/notify.js -> update save:passed', err);
               /*
               Let user know there is an update
               */
              publisher.publish("", "update", new Buffer(JSON.stringify({
                   uid: msg.uid
              }))).then(function (res) {
                   //console.log('res', res);
              }).catch(function (err) {
                   //console.log('err2', err);
              });
          }
     });
}

module.exports = notify;
