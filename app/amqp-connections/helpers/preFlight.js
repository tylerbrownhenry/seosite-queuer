/**
 * validates the a message received from queue was valid and returns the parsed info
 * @param  {Promise}  promise  promise object
 * @param  {String}   msg      flatten object
 * @param  {Function} callback callback function
 * @return {Object}            parsed msg
 */
function preFlight(promise, msg, callback) {
     //console.log('amqp-connections/helpers/preFlight.js ->');
     var input = {};
     if (!msg || !msg.content) {
          callback(promise, {
               statusType: 'invalidInput',
               message: 'error:no:content'
          });
          return false;
     }
     try {
          input = JSON.parse(msg.content);
     } catch (e) {
          //console.log('amqp-connections/helpers/preFlight.js:failed');
          callback(promise, {
               statusType: 'invalidInput',
               message: 'error:unparsable'
          });
          return false;
     }
     //console.log('amqp-connections/helpers/preFlight.js:passed');
     return input;
}

module.exports = preFlight;
