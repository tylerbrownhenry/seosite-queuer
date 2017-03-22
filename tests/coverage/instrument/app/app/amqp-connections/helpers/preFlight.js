/**
 * validates the a message received from queue was valid and returns the parsed info
 * @param  {Promise}  promise  promise object
 * @param  {String}   msg      flatten object
 * @param  {Function} callback callback function
 * @return {Object}            parsed msg
 */
function preFlight(promise, msg, callback) {
     console.log('_preFlight ->');
     var input = {};
     if (!msg || !msg.content) {
          callback(promise, {
               statusType: 'invalidInput',
               message: 'No content provided'
          });
          return false;
     }
     try {
          input = JSON.parse(msg.content);
     } catch (e) {
          console.log('_preFlight:failed');
          callback(promise, {
               statusType: 'invalidInput',
               message: 'Content cannot be parsed to JSON'
          });
          return false;
     }
     console.log('_preFlight:passed');
     return input;
}

module.exports = preFlight;
