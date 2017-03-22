var sh = require('shorthash'),
     publisher = require('../amqp-connections/publisher'),
     retry = require('../settings/requests/retry').publish,
     retry = require('../amqp-connections/publisher'),
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
     console.log('actions/notify', msg);
     var msg = {
          id: sh.unique(msg.status + msg.uid + msg.i_id),
          uid: msg.uid,
          i_id: msg.i_id,
          objectType: msg.objectType, // 'request' || 'link'
          status: msg.status, // 'success' || 'error'
          statusType: msg.statusType, //(success) 'pending' || 'complete' (error) 'database' || 'system' || 'invalidInput'
          type: msg.type,
          message: msg.message,
          page: msg.page
     };

     var update = new Update(msg);

     update.save(function (err) {
          if (err) {
               console.log('send to retry...');
               retry({
                    statusType: msg.type,
                    status: msg.status,
                    message: msg.message,
                    objectType: msg.objectType,
                    i_id: msg.i_id,
                    uid: msg.uid,
                    url: msg.url,
                    page: msg.page,
                    retry: true,
                    retryCommand: 'notify',
                    retryOptions: msg
               });
          } else {
               /*
               Let user know there is an update
               */
               publisher.publish("", "update", new Buffer(JSON.stringify({
                    uid: msg.uid
               })));
          }
     });
}

module.exports = notify;
