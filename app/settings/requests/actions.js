const dynamoose = require('dynamoose'),
     settings = require("../requests"),
     notify = require('../../actions/notify').notify,
     q = require('q'),
     utils = require('../../utils'),
     preFlight = require("../../amqp-connections/helpers/preFlight"),
     retry = require('./retry').publish;

var actions = {
     pageScan: {
          commands: require('./pageScan/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:process' /* ADD TO RETRYABLES */
          }
     },
     softwareSummary: {
          commands: require('./serverInfo/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:softwareSummary'
          }
     },
     checkSSL: {
          commands: require('./checkSSL/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:checkSSL'
          }
     },
     validateW3C: {
          commands: require('./w3cValidate/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:validateW3C'
          }
     },
     tapTargetCheck: {
          commands: require('./tapTargetCheck/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:tapTargetCheck'
          }
     },
     checkSocial: {
          commands: require('./checkSocial/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:checkSocial'
          }
     },
     serverInfo: {
          commands: require('./serverInfo/process'),
          retry: {
               can: true,
               failedmessage: 'error:scan:page:serverInfo'
          }
     }
}

function processAction(input, key) {
     console.log('input.action', input.action, 'key', key);
     var promise = q.defer();
     actions[input.action].commands[key]({
          promise: promise,
          input: input
     });
     return promise.promise;
};

module.exports = {
     actions: actions,
     process: (msg, ch) => {
          let promise = q.defer(),
               input = preFlight(promise, msg, promise.reject);
          if (input === false) {
               return promise.promise;
          }
          processAction(input, 'process').then((response) => {
               console.log('actions response', response);

               // uid
               // i_id
               // requestId
               // status
               // statusType
               // type
               // message
               // requestType
               // source
               if (response.notify === true) {
                    notify(response);
               }
               utils.retryUpdateRequest({
                    requestId: input.requestId
               }, q.defer());
               ch.ack(msg);
          }).catch((err) => {
               console.log('actions err', err);
               const _action = actions[input.action];
               if (err.notify === true) {
                    notify(err);
               }
               if (err.softRetry === true) {
                    return ch.nack(msg);
               }
               if (input.isRetry !== true) {
                    if (_action.retry.can === true) {
                         retry(err);
                    }
               } else {
                    utils.retryUpdateRequest({
                         requestId: input.requestId
                    }, q.defer());
               }
               ch.ack(msg);
               promise.reject();
          });
          return promise.promise;
     },
     publish: (input) => {
          processAction(input, 'publish').then((response) => {
               //  console.log('response',response);

          });
     }
}
