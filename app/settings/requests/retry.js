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
  console.log('publish!');
try{


     var promise = q.defer();
     if (typeof input === 'undefined' || utils.checkRequirements(input, ['i_id', 'retryCommand', 'retryOptions']) === true) {
          logError({
               where: 'retry.js:publish:checkRequirements',
               with: input,
               error: 'requirements not met.'
          });
          promise.reject(false);
          return promise.promise;
     }
     console.log('publish!');

     var msg = {
          uid: input.uid || null,
          i_id: input.i_id,
          url: input.url || null,
          source: input.source || null,
          status: input.status || null,
          statusType: input.statusType || null,
          isRetry: true
     };
     msg.retryCommand = input.retryCommand;
     if (input.retryOptions.promise) {
          delete input.retryOptions.promise;
     }
     msg.retryOptions = input.retryOptions;
     console.log('publish!');
     publisher.publish("", "retry", new Buffer(JSON.stringify(msg))).then(function (res) {
       console.log('publish!');

          promise.resolve(res);
     }).catch(function (e) {
       console.log('publish!');

          promise.reject({retry: true});
     });
     return promise.promise;
   }catch(e){
    console.log('e',e);
   }
}

/**
 * check the requirements of a message if passes consume it
 * @param  {Object} input message from RabbitMQ
 */
function init(msg, ch) {
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

     if (utils.checkRequirements(input, ['i_id', 'retryCommand', 'retryOptions']) === true) {
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
          promise.reject(input);
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
          retryables[input.retryCommand](promise, input.retryOptions).then(function (res) {
               promise.resolve(res);
          }).catch(function (err) {
               promise.reject(err);
          })
     }
     return promise.promise;
}

module.exports.init = init;
module.exports.publish = publish;
module.exports.originalIssueResolved = originalIssueResolved;
