const dynamoose = require('dynamoose'),
     settings = require("../requests"),
     notify = require('../../actions/notify').notify,
     fs = require('fs'),
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
    //  softwareSummary: {
    //       commands: require('./softwareSummary/process'),
    //       retry: {
    //            can: true,
    //            failedmessage: 'error:scan:page:softwareSummary'
    //       }
    //  },
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
    //  tapTargetCheck: {
    //       commands: require('./tapTargetCheck/process'),
    //       retry: {
    //            can: true,
    //            failedmessage: 'error:scan:page:tapTargetCheck'
    //       }
    //  },
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
     console.log('input.action', input, 'key', key);
     var promise = q.defer();
     try {
          actions[input.action].commands[key]({
               promise: promise,
               input: input
          });
     } catch (e) {
          console.log('e', e);
     }
     return promise.promise;
};


function replaceErrors(key, value) {
    if (value instanceof Error) {
        var error = {};

        Object.getOwnPropertyNames(value).forEach(function (key) {
            error[key] = value[key];
        });

        return error;
    }

    return value;
}

function checkTest(input, response) {

     try {
          let hasAll = (typeof input !== 'undefined' && typeof response !== 'undefined' && typeof input.requestId !== 'undefined' && typeof input.action !== 'undefined' && typeof response.status !== 'undefined' && typeof response.message !== 'undefined' && typeof response.data !== 'undefined')
          let line = '{ "ok":"'+hasAll+'" , "requestId": "' + input.requestId + '", "action": "' + input.action + '", "status": "' + response.status + '", "message": "' + response.message + '",';
          line += '"data":"\\' + JSON.stringify(response.data,replaceErrors)+'"},';
          if (input.test) {
               fs.appendFile('./smoke_tests/' + input.test.filename + '.txt', line + '\r\n', function (err) {
                    if (err) throw err;
                    console.log('Saved!');
               });
          }
     } catch (e) {}
}

module.exports = {
     checkTest: checkTest,
     actions: actions,
     process: (msg, ch) => {
          let promise = q.defer(),
               input = preFlight(promise, msg, promise.reject);
          if (input === false) {
               return promise.promise;
          }
          let myVar = setTimeout(function () {
               console.log('timed out resource', JSON.parse(msg.content));
          }, 30000);
          processAction(input, 'process').then((response) => {
               console.log('actions response', response, 'input', input);
               ch.checkQueue('actions', (e, res) => {
                    console.log('checkQueue', res, e);
                    if (res && res.messageCount === 0) {
                         console.log('Finish consuming', Date());
                    }
               });
               clearTimeout(myVar);
               // uid
               // i_id
               // requestId
               // status
               // statusType
               // type
               // message
               // requestType
               // source
               try {
                    if (response.notify === true) {
                         notify(response);
                    }
                    utils.retryUpdateRequest({
                         requestId: input.requestId
                    }, q.defer());
                    ch.ack(msg);
               } catch (e) {
                    console.log('eeee', e);
               }
               checkTest(input, response);
          }).catch((err) => {
               clearTimeout(myVar);

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
               checkTest(input, err);
          });
          return promise.promise;
     },
     publish: (input) => {
          processAction(input, 'publish').then((response) => {
               //  console.log('response',response);

          });
     }
}
