let _ = require('underscore'),
     q = require('q'),
     utils = require('../../../utils'),
     preFlight = require("../../../amqp-connections/helpers/preFlight"),
     saveAsActive = require('./method/saveAsActive');
/**
 * process pageScan request message from rabbitMQ
 * @param  {Buffer} msg buffered message from rabbitMQ
 * @return {Promise} promise function
 */
function process(msg) {
     console.log('request/pageScan.js init', msg);
     var promise = q.defer();
     var input = preFlight(promise, msg, reject);
     if (input === false) {
          return promise.promise;
     }
     var source = input.source;
     if (utils.checkRequirements(input, ['url', 'requestId', 'uid', 'options']) === true) {
          reject(promise,
               _.extend({
                    message: 'error:missing:required:fields',
                    status: 'error',
                    statusType: 'failed',
                    notify: true
               }, input));
     } else {
          input.source = source;
          input.promise = promise;
          saveAsActive(input);
     }
     return promise.promise;
}

module.exports = {
     process: process,
     markedRequestAsFailed: require('./method/markedRequestAsFailed'),
     saveAsActive: saveAsActive,
     resolve: require('./method/resolve'),
     notify: require('./method/notify'),
     reject: require('./method/reject'),
     processsHar: require('./method/processHar'),
     processsUrl: require('./method/processUrl')
};
