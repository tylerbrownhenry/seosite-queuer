var sh = require('shorthash'),
     publisher = require('../../amqp-connections/publisher'),
     logError = require('../../actions/logError'),
     utils = require('../../utils'),
     q = require('q'),
     retryables = require('./retry/retryables'),
     preFlight = require('../../amqp-connections/helpers/preFlight');

function originalIssueResolved(type) {
     if (type === 'database') {
          /**
           * Check database connection
           */
          return true;
     }
}

function publish(input) {
     var msg = {
          uid: input.uid || null,
          i_id: input.i_id || null,
          url: input.url || null,
          page: input.page || null,
          status: input.status || null,
          statusType: input.statusType || null,
          isRetry: true
     };
     if (utils.checkRequirements(input, ['requestId','retryCommand', 'retryOptions']) === true) {
          logError({
               where: 'retry.js:publish:checkRequirements',
               with: msg,
               error: 'requirements not met.'
          });
          promise.resolve();
          return promise.promise;
     }
     msg.retryCommand = input.retryCommand
     msg.retryOptions = input.retryOptions
     var buffer = new Buffer(JSON.stringify(msg));
     publisher.publish("", "retries", buffer);
}

function start(msg){

}

function init(msg) {
     var promise = q.defer();

     var input = preFlight(promise, msg, function (promise, err) {
          logError({
               where: 'retry.js:preFlight',
               with: msg,
               error: err
          });
          promise.resolve();
          return promise.promise;
     });

     if (utils.checkRequirements(input, ['i_id','retryCommand', 'retryOptions']) === true) {
          logError({
               where: 'retry.js:checkRequirements',
               with: msg,
               error: 'requirements not met.'
          });
          promise.resolve();
          return promise.promise;
     }

     if (originalIssueResolved(input.statusType) === false) {
          logError({
               where: 'retry.js:originProblemResolved',
               with: msg,
               error: 'original failed issue is still present, issue: ' + input.statusType
          });
          promise.reject();
          return promise.promise;
     }

     if (typeof retryables[input.retryCommand] === 'undefined') {
          logError({
               where: 'retry.js:check if command exists',
               with: msg,
               error: 'attempt to retry a command not list as retryable,command : ' + input.retryCommand
          });
          promise.resolve();
          return promise.promise;
     } else {
          retryables[input.retryCommand](promise, input.retryOptions);
     }
     return promise.promise;
}

module.exports.init = init;
module.exports.originalIssueResolved = originalIssueResolved;
