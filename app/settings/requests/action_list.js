const checkLinks = require('./links/process'),
     checkSSL = require('./checkSSL/process'),
     notify = require('./checkPage/method/notify'),
     checkSocial = require('./checkSocial/process'),
     checkPage = require('./checkPage/process'),
     checkResources = require('./resources/process'),
     capture = require('./capture/process'),
     serverInfo = require('./serverInfo/process'),
     w3cValidate = require('./w3cValidate/process'),
     meta = require('./meta/process'),
     utils = require('../../utils'),
     q = require('q'),
     _ = require('underscore'),
     Scan = require('../../models/scan'),
     RequestSchema = require('../../models/request'),
     dynamoose = require('dynamoose'),
     Request = dynamoose.model('Request', RequestSchema),
     Issue = require('../../models/issues'),
     linkSchema = require("../..//models/link"),
     Link = dynamoose.model('Link', linkSchema),
     Capture = require('../../models/capture'),
     Resource = require('../../models/resource'),
     metaData = require('../../models/metaData'),
     _publish = require('./publish/process'),
     publisher = require('../../amqp-connections/publisher');

function ___publish(buffer, deferred, processes = 0, key, reject) {
     publisher.publish("", "actions", buffer).then(function (err, data) {
          deferred.resolve({
               processes: processes,
               key: key
          });
     }).catch(function (err) {
          deferred.resolve({
               processes: processes,
               key: key
          });
     });
}

function __publish(data, transform, command) {
     let input = data.params.input,
          res = data.params.res,
          processes = data.params.processes,
          deferred = data.promise,
          buffer = transform(input, res);
     ___publish(buffer, deferred, processes, command);
}

function publish(data, command, transform, custom) {
     if (typeof custom == 'function') {
          custom(data, function (res) {
               __publish(data, transform, command);
          });
     } else {
          __publish(data, transform, command);
     }
}

const models = {
     'Scan': Scan,
     'Link': Link,
     'metaData': metaData,
     'Resource': Resource,
     'Issue': Issue,
     'Capture': Capture
};

const updateAttrs = {
     'Link': function (attrs, data) {
          attrs._id = data._id
          return attrs;
     },
     'Resource': function (attrs, data) {
          attrs._id = data._id;
          return attrs;
     },
     'Issue': function (attrs, data) {
          attrs.requestId = data.requestId;
          return attrs;
     },
}

function updateScan(data, results) {
     publish({
          params: {
               processes: data.params.processes
          },
          promise: data.promise
     }, 'utils', function () {
          return new Buffer(JSON.stringify({
               requestId: data.params.requestId,
               action: 'utils',
               command: 'updateBy',
               model: 'Scan',
               updates: results,
               processes: data.params.processes
          }));
     });
}

function publishAction(action, command, data, processes, adding, isRetry, robots) {
     data.params.processes = processes;
     publish(data, action, function (input, res) {
          let _data = {
               requestId: data.params.requestId,
               action: action,
               command: command,
               processes: processes,
               isRetry: (isRetry === true) ? true : false
          }
          _.each(adding, (obj, key) => {
               _data[key] = obj;
          });
          return new Buffer(JSON.stringify(_data));
     });
}

function publishUpdateRequestProcess(data) {
     try {

          publish({
               params: {
                    processes: data.params.processes
               },
               promise: data.promise
          }, 'utils', function () {
               return new Buffer(JSON.stringify({
                    requestId: data.params.requestId,
                    action: 'utils',
                    command: 'updateRequestProcesses',
                    processes: data.params.processes
               }));
          });
     } catch (e) {
          console.log('e', e);
     }
}

const actions = {
     'utils': {
          commands: {
               cancelScan: {
                    source: 'dynamo',
                    command: function (data) {
                         publishAction('utils', 'updateBy', data, 0, {
                              updates: {
                                   '$PUT': {
                                        status: 'complete',
                                        message: 'scan:cancelled:error'
                                   }
                              },
                              model: 'Scan',
                              cancelScan: true
                         });
                         return data.promise.promise;
                    }
               },
               batchPut: {
                    source: 'dynamo',
                    command: function (data) {
                         _.each(data.params.commands, (command) => {
                         });
                         utils.batchPut(models[data.params.model], data.params.commands, function (err) {
                              if (err === null) {
                                   if (data.params.processes) {
                                        publishUpdateRequestProcess(data);
                                   } else {
                                        data.promise.resolve();
                                   }
                              } else {
                                   console.log('data', err);
                                   data.promise.reject();
                              }
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               updateBy: {
                    source: 'dynamo',
                    command: function (data) {
                         let attrs = {
                              requestId: data.params.requestId
                         };
                         if (typeof updateAttrs[data.params.model] == 'function') {
                              attrs = updateAttrs[data.params.model](attrs, data.params);
                         }
                         utils.updateBy(models[data.params.model], attrs, data.params.updates, function (err) {
                              if (err === null) {
                                   if (data.params.cancelScan) {
                                        publishAction('utils', 'cancelRequest', data, 0, {
                                             status: data.params.status || 'complete',
                                             message: data.params.message || 'scan:cancelled:error'
                                        });
                                   } else if (data.params.processes) {
                                        publishUpdateRequestProcess(data);
                                   } else {
                                        data.promise.resolve();
                                   }
                              } else {
                                   console.log('utils updateBy err', err);
                                   data.promise.reject();
                              }
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               cancelRequest: {
                    source: 'dynamo',
                    retry: true,
                    command: function (data) {
                         utils.completeRequest(data.promise, data.params, data.params.message, data.params.status);
                         return data.promise.promise;
                    }
               },
               updateRequestProcesses: {
                    source: 'dynamo',
                    retry: true,
                    command: function (data) {
                         utils.updateRequestProcesses(data.params, q.defer()).then((res) => {
                              publishAction('utils', 'checkIfScanComplete', data);
                              data.promise.resolve();
                         }).catch((err) => {
                              data.promise.reject();
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               markScanComplete: {
                    source: 'dynamo',
                    command: function (data) {
                         utils.updateBy(Request, {
                              requestId: data.params.requestId
                         }, {
                              $PUT: {
                                   status: 'complete'
                              }
                         }, (err, res) => {
                              if (err) {
                                   // dynamo error
                                   data.promise.reject();
                              } else {
                                   data.promise.resolve();
                              }
                         });
                         return data.promise.promise;
                    }
               },
               checkIfScanComplete: {
                    source: 'dynamo',
                    command: function (data) {
                         utils.findBy(Request, {
                              requestId: data.params.requestId
                         }, (err, res) => {
                              if (err) {
                                   //make sure dynamo error
                                   data.promise.reject();
                              } else {
                                   if (res.processes <= 0 && res.status === 'ready') {
                                        publishAction('utils', 'markScanComplete', data);
                                   } else {
                                        data.promise.resolve()
                                   }
                              }
                         })
                         return data.promise.promise;
                    }
               },
               notify: {
                    source: 'app',
                    command: function (data) {
                         notify(data.params);
                    }
               }
          }
     },
     'checkSSL': {
          commands: {
               process: {
                    source: 'app',
                    /* api */
                    command: function (data) {
                         checkSSL.process(data).then((results) => {
                              updateScan(data, results);
                         }).catch((results) => {
                              if (data.params.isRetry === true) {
                                   updateScan(data, results);
                              } else {
                                   publishAction('checkSSL', 'process', data, 1, {
                                        url: data.params.url,
                                   }, true);
                              }
                         });
                         /* One Retry */
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         publishAction('checkSSL', 'process', data, 1, {
                              url: utils.convertUrl(data.params.res.url.url),
                              requestId: data.params.input.requestId
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'checkSocial': {
          commands: {
               process: {
                    source: 'app',
                    /* api */
                    command: function (data) {
                         checkSocial.process(data).then((results) => {
                              updateScan(data, results);
                         }).catch((results) => {
                              if (data.params.isRetry === true) {
                                   /* Failed, done trying */
                                   updateScan(data, results);
                              } else {
                                   /* Retry Once */
                                   publishAction('checkSocial', 'process', data, 1, {
                                        socialInfo: data.params.socialInfo,
                                        url: data.params.url,
                                   }, true);
                              }
                         });
                         /* One Retry */
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         publishAction('checkSocial', 'process', data, 1, {
                              socialInfo: data.params.res.socialInfo,
                              url: utils.convertUrl(data.params.res.url.url),
                              requestId: data.params.input.requestId
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'serverInfo': {
          commands: {
               process: {
                    source: 'app',
                    /* api */
                    command: function (data) {
                         serverInfo.process(data).then((results) => {
                              updateScan(data, results);
                         }).catch((results) => {
                              if (data.params.isRetry === true) {
                                   /* Failed, done trying */
                                   updateScan(data, results);
                              } else {
                                   /* Retry once */
                                   publishAction('serverInfo', 'process', data, 1, {
                                        url: data.params.url,
                                   }, true);
                              }
                         });
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         publishAction('serverInfo', 'process', data, 1, {
                              url: utils.convertUrl(data.params.res.url.url),
                              requestId: data.params.input.requestId
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'meta': {
          commands: {
               process: {
                    source: 'app',
                    command: function (data) {
                         meta.process(data).then((results) => {
                              publishUpdateRequestProcess(data);
                         }).catch((results) => {
                              if (results.commands) {
                                   publishAction('utils', 'batchPut', data, 1, {
                                        commands: results.commands,
                                        model: 'metaData',
                                   });
                              } else {
                                   publishUpdateRequestProcess(data);
                              }
                         });
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         publishAction('meta', 'process', data, 1, {
                              requestId: data.params.input.requestId,
                              links: data.params.res.links,
                              keywords: data.params.res.htmlResults.keywords
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'w3cValidate': {
          /* Has timeout? */
          commands: {
               process: {
                    source: 'api',
                    command: function (data) {
                         if (!data || !data.params || !data.params.html) {
                              updateScan(data, {
                                   message: 'failed:validateW3C'
                              });
                         } else {
                              // console.log('w3cValidate process',data);
                              w3cValidate.process(data.params.html).then((results) => {
                                   updateScan(data, results);
                              }).catch((results) => {
                                   if (data.isRetry) {
                                        /* Failed, done trying */
                                        updateScan(data, results);
                                   } else {
                                        /* Retry once */
                                        publishAction('w3cValidate', 'process', data, 1, {
                                             html: data.params.html,
                                             parse: data.params.parse,
                                        }, true);
                                   }
                              });
                         }
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         let html = (data.params.input) ? data.params.input.html : data.params.html,
                              parse = data.params.parse;
                         if (parse === true && html && html.documentElement && html.documentElement.innerHTML) {
                              html = html.documentElement.innerHTML;
                         }
                         publishAction('w3cValidate', 'process', data, 1, {
                              html: html,
                              parse: parse,
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'capture': {
          /* Has timeout */
          commands: {
               process: {
                    source: 'app',
                    /* api */
                    command: function (data) {
                         capture.process(data).then((results) => {
                              publishAction('utils', 'updateBy', data, 1, {
                                   updates: results,
                                   model: 'Capture',
                              });
                         }).catch((results) => {
                              publishAction('utils', 'updateBy', data, 1, {
                                   updates: results,
                                   model: 'Capture',
                              });
                         });
                         /* No Retry */
                         /* TODO One Retry ? */
                         return data.promise.promise;
                    }
               },
               init: {
                    source: 'dynamo',
                    command: function (data) {
                         capture.init(data).then((results) => {
                              publishAction('capture', 'process', data, 1, {
                                   url: data.params.url,
                                   sizes: ['iPhone 6', 'iPad landscape', '1920x1080']
                              });
                         }).catch((results) => {
                              /* Check if failure is dynamo */
                              data.promise.reject();
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         publishAction('capture', 'init', data, 1, {
                              url: utils.convertUrl(data.params.res.url.url),
                              requestId: data.params.input.requestId
                         });
                         return data.promise.promise;
                    }
               }
          }
     },
     'checkLinks': {
          /* Has timeout */
          commands: {
               process: {
                    source: 'app',
                    /* api */
                    command: function (data) {
                         checkLinks.process(data).then((results) => {
                              /*
                              Has Timeout
                              Failures have empty updates.resp && status = 'failed'
                              Success have updates.resp && status = 'passed'
                              */
                              publishAction('utils', 'updateBy', data, 1, {
                                   updates: results.updates,
                                   _id: results.linkId,
                                   model: 'Link',
                              });
                         }).catch((results) => {
                              publishAction('utils', 'updateBy', data, 1, {
                                   updates: results.updates,
                                   _id: results.linkId,
                                   model: 'Link',
                              });
                         })
                         /* No Catch / No Reject */
                         /* TODO One Retry */
                         return data.promise.promise; /* Ack! */
                    }
               },
               init: {
                    source: 'dynamo',
                    command: function (data) {
                         checkLinks.init(data).then((results) => {
                              data.promise.resolve();
                         }).catch((results) => {
                              /* Check if failure is dynamo */
                              data.promise.reject();
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         checkLinks.publish(data).then((results) => {
                              publishAction('checkLinks', 'init', data, results.commands.length, {
                                   commands: results.commands,
                                   siteUrl: data.params.newScan.url.url,
                                   linkObj: results.linkObj,
                                   requestId: data.params.input.requestId
                              });
                         }).catch((results) => {
                              data.promise.reject({
                                   processes: 0
                              });
                         });
                         /* No Retry */
                         return data.promise.promise;
                    }
               }
          }
     },
     'checkResources': {
          commands: {
               process: {
                    source: 'app',
                    command: function (data) {
                         checkResources.process(data).then((results) => {
                              publishAction('utils', 'updateBy', data, 1, {
                                   updates: results.updates,
                                   _id: results._id,
                                   model: 'Resource',
                              });
                              if (typeof results.robots !== 'undefined') {
                                   publishAction('utils', 'updateBy', data, 0, {
                                        updates: robots,
                                        model: 'Issue',
                                   });
                              }
                         });
                         /* No Api Calls */
                         /* No Catch / Never Rejects */
                         /* No Retry */
                         return data.promise.promise;
                    }
               },
               init: {
                    source: 'dynamo',
                    command: function (data) {
                         checkResources.init(data).then((results) => {
                              data.promise.resolve();
                         }).catch((results) => {
                              /* Check err is dynamo */
                              data.promise.reject();
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'app',
                    command: function (data) {
                         checkResources.publish(data).then((results) => {
                              publishAction('checkResources', 'init', data, 0, {
                                   commands: results.commands,
                              });
                              data.promise.resolve({
                                   commands: results.commands.length,
                                   processes: results.processes,
                                   key: 'checkResources'
                              });
                         }).catch((results) => {
                              data.promise.reject({
                                   processes: 0,
                                   key: 'checkResources'
                              });
                         });
                         /* No Retry */
                         return data.promise.promise;
                    }
               }
          }
     },
     'notify': {
          commands: {
               publish: {
                    source: 'dynamo',
                    command: function (data) {
                         notify(data.params, q.defer())
                              .then((results) => {
                                   publisher.publish("", "update", new Buffer(JSON.stringify({
                                        uid: results.uid,
                                        requestType: results.requestType,
                                        i_id: results.i_id,
                                        type: results.type,
                                        status: results.status
                                   })));
                                   data.promise.resolve({
                                        processes: 0
                                   });
                              }).catch((results) => {
                                   data.promise.reject({
                                        processes: 0
                                   });
                              });
                         return data.promise.promise;
                    }
               }
          }
     },
     'pageScan': {
          commands: {
               init: {
                    source: 'app',
                    command: function (data) {
                         publishUpdateRequestProcess(data);
                         publishAction('pageScan', 'saveAsWorking', data);
                         /* TODO If this is done out of sync... */
                         return data.promise.promise;
                    }
               },
               processHar: {
                    source: 'dynamo',
                    command: function (data) {
                         checkPage.processHar(data.params, actions).then((results) => {
                              publishAction('pageScan', 'init', data, 1, {
                                   processes: results.processes * -1, /* By default decrements so inverting */
                              });
                              data.promise.resolve();
                         }).catch((results) => {
                              data.promise.reject();
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               processUrl: {
                    source: 'dynamo',
                    command: function (data) {
                         checkPage.processUrl(data.params, actions).then((results) => {
                              publishAction('pageScan', 'processHar', data, 1, {
                                   res: results,
                                   input: data.params,
                              });
                              data.promise.resolve();
                         }).catch((results) => {
                              /* Check err is dynamo */
                              if (typeof results === 'string' && !data.params.isRetry) {
                                   publishAction('pageScan', 'processUrl', data, 1, {
                                        url: data.params.url,
                                        options: data.params.options,
                                        requestId: data.params.requestId
                                   }, true);
                              } else if (data.params.isRetry && typeof results === 'string') {
                                   publishAction('utils', 'cancelScan', data, 1, {
                                        url: data.params.url,
                                        options: data.params.options,
                                        requestId: data.params.requestId
                                   });
                              } else {
                                   data.promise.reject();
                              }
                         });
                         /* Endless Retry */
                         return data.promise.promise;
                    }
               },
               saveAsWorking: {
                    source: 'dynamo',
                    command: function (data) {
                         checkPage.saveAsActive(data.params, 'ready').then((results) => {
                              data.promise.resolve();
                         }).catch((results) => {
                              data.promise.reject();
                         });
                         return data.promise.promise;
                    }
               },
               publish: {
                    source: 'dynamo',
                    command: function (data) {
                         checkPage.saveAsActive(data.params, 'ready').then((results) => {
                              /* TODO Test Notify */
                              publishAction('notify', 'publish', data, 0, {
                                   type: 'page:scan',
                                   status: 'success',
                                   statusType: 'update',
                                   message: 'success:scan:init'
                              });
                              publishAction('pageScan', 'processUrl', data, 1, {
                                   url: utils.convertUrl(data.params.url),
                                   options: data.params.options,
                                   requestId: data.params.requestId
                              });
                         }).catch((results) => {
                              data.promise.reject();
                         });
                         return data.promise.promise;
                    }
               }
          }
     }
};

module.exports = actions;
