  /**
 * validates the a message received from queue was valid and returns the parsed info
 * @param  {Promise}  promise  promise object
 * @param  {String}   msg      flatten object
 * @param  {Function} callback callback function
 * @return {Object}            parsed msg
 */
function preFlight(promise, msg, callback) {
     var input = {};
     if (!msg || !msg.content) {
          callback(promise, {
               notify: true,
               statusType: 'invalidInput',
               message: 'error:no:content'
          });
          return false;
     }
     try {
          input = JSON.parse(msg.content);
     } catch (e) {
          callback(promise, {
               notify: true,
               statusType: 'invalidInput',
               message: 'error:unparsable'
          });
          return false;
     }
     return input;
}

module.exports = preFlight;
