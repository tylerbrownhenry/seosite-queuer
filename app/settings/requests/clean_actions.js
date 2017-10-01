const dynamoose = require('dynamoose'),
     notify = require('../../actions/notify').notify,
     fs = require('fs'),
     q = require('q'),
     _ = require('underscore'),
     utils = require('../../utils'),
     preFlight = require("../../amqp-connections/helpers/preFlight"),
     actions = require('./action_list');

function completeSuccess(input,response,msg,ch,processes,processesHandler){
    if(ch){
      return ch.ack(msg);
    }
}

function completeFailure(input,response,msg,ch,processes,processesHandler,canRetry,persistent){
    if(input.isRetry !== true || persistent === true){
      if(ch){
        ch.nack(msg);
      }
      return
    }
}

function getProcesses(processes,input,response){
  if(typeof processes !== 'undefined'){
    if(typeof processes == 'function'){
      return processes(response,input);
    } else {
      return processes;
    }
  }
}

function completeAction(input,ch,msg,response,callback){
  let command = actions[input.action].commands[input.command],
  processesHandler = command.processesHandler,
  source = sources[command.source],
  canRetry = source.retry,
  processes = getProcesses(command.processes,input,response),
  persistent = sources[source];
  callback(input,response,msg,ch,processes,processesHandler,canRetry,persistent);
}


function processAction(input) {
     var deferred = q.defer();
     try {
          actions[input.action].commands[input.command].command({
               promise: deferred,
               params: input
          });
     } catch (e) {
          deferred.resolve({
               error: e
          });
     }
     return deferred.promise;
};

let sources = {
     dynamo: {
          retry: true,
          persistent: true,
          retryCheck: function () {
               //look for dynamo connection
          }
     },
     api: {
          retry: true,
          persistent: false
     },
     app: {
          retry: false,
          persistent: false
     }
}

module.exports = {
     init: (msg, ch) => {
          let deferred = q.defer();
          input = preFlight(deferred, msg, deferred.reject);
          if (input === false) {
               /* notify */
               /* here or above here */
               return deferred.promise;
          }
          processAction(input).then((response) => {
               completeAction(input,ch,msg,response,completeSuccess);
               return deferred.resolve(response);
          }).catch((e) => {
               completeAction(input,ch,msg,response,completeFailure);
               return deferred.reject(e);
          })
          return deferred.promise;
     }
}
