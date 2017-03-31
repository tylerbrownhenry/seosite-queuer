var sh = require('shorthash'),
     publisher = require('../../amqp-connections/publisher'),
     logError = require('../../actions/logError'),
     utils = require('../../utils'),
     q = require('q'),
     retryables = require('./retry/retryables'),
     preFlight = require('../../amqp-connections/helpers/preFlight');

/**
 * checks that if the original issue that made the message fail has been resolved
 * @param  {String} type string representing the root cause of the error
 * @return {Boolean}
 */
function originalIssueResolved(type) {
     if (type === 'database') {
          /* Check database connection? */
          return true;
     } else if (type === 'failsForTesting') {
          return false;
     }
     return true;
}

/**
 * promises a message to be retried
 * @param  {Object} input
 */
function publish(input) {
     var promise = q.defer();
     console.log('retry.js --> publish --> checkRequirements', input);
     if (typeof input === 'undefined' || utils.checkRequirements(input, ['i_id', 'retryCommand', 'retryOptions']) === true) {
          console.log('retry.js --> publish --> checkRequirements:failed');
          logError({
               where: 'retry.js:publish:checkRequirements',
               with: input,
               error: 'requirements not met.'
          });
          promise.reject(false);
          return promise.promise;
     }
     var msg = {
          uid: input.uid || null,
          i_id: input.i_id,
          url: input.url || null,
          page: input.page || null,
          status: input.status || null,
          statusType: input.statusType || null,
          isRetry: true
     };
     console.log('retry.js --> publish -->', input);
    //  console.log('publisher', publisher);
     msg.retryCommand = input.retryCommand;
     if (input.retryOptions.promise) {
          delete input.retryOptions.promise;
     }
     msg.retryOptions = input.retryOptions;
     console.log('publisher', msg);
     publisher.publish("", "retry", new Buffer(JSON.stringify(msg))).then(function (res) {
          console.log('retry -> success', res);
          promise.resolve(res);
     }).catch(function (e) {
          promise.reject({retry:true});
     });
     return promise.promise;
}

/**
 * check the requirements of a message if passes consume it
 * @param  {Object} input message from RabbitMQ
 */
function init(msg, ch) {
     console.log('requests/retry.js -->',msg);
     var promise = q.defer();
     var input = preFlight(promise, msg, function (promise, err) {
          console.log('requests/retry.js --> preFlight:failed',err);
          logError({
               where: 'retry.js:preFlight',
               with: msg,
               error: err
          });
          promise.resolve();
          return promise.promise;
     });
     console.log('request/retry.js --> parsed input:', input);
     if (utils.checkRequirements(input, ['i_id', 'retryCommand', 'retryOptions']) === true) {
          console.log('requests/retry.js --> checkRequirements:failed');
          logError({
               where: 'retry.js:checkRequirements',
               with: msg,
               error: 'requirements not met.'
          });
          promise.resolve();
          return promise.promise;
     }

     if (originalIssueResolved(input.statusType) === false) {
          console.log('requests/retry.js --> originalIssueResolved');
          logError({
               where: 'retry.js:originProblemResolved',
               with: msg,
               error: 'original failed issue is still present, issue: ' + input.statusType
          });
          promise.reject(input);
          return promise.promise;
     }

     if (typeof retryables[input.retryCommand] === 'undefined') {
          console.log('requests/retry.js --> does not exist');
          logError({
               where: 'retry.js:check if command exists',
               with: msg,
               error: 'attempt to retry a command not list as retryable,command : ' + input.retryCommand
          });
          promise.resolve();
          return promise.promise;
     } else {
          console.log('requests/retry.js --> do it!');
          retryables[input.retryCommand](promise, input.retryOptions).then(function (res) {
               console.log('requests/retry --> retryables --> success', res)
               promise.resolve(res);
          }).catch(function (err) {
               console.log('requests/retry --> retryables --> error', err);
               promise.reject(err);
          })
     }
     return promise.promise;
}

module.exports.init = init;
module.exports.publish = publish;
module.exports.originalIssueResolved = originalIssueResolved;
