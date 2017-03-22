var dynamoose = require('dynamoose');
var requestSchema = require("../../models/request");
var Scan = require("../../models/scan");
var pageScanner = require("../../actions/scanPage/index");
var preFlight = require("../../amqp-connections/helpers/preFlight");
var utils = require("../../utils");
var processResources = require("./resources/process").processResources;
var processMetaData = require("./meta/process");
var processLinks = require("./links/process");
var publishCaptures = require("./capture/publish");

var notify = require('../../actions/callback');
var publisher = require("../../amqp-connections/publisher");
var Request = dynamoose.model('Request', requestSchema);
var q = require('q');
var _ = require('underscore');
var sh = require("shorthash");
var moment = require('moment');
var Capture = require('../../models/capture');
var sniff = require('../../actions/sniff/index');

// /**
//  * takes input and returns a Request object
//  * @param  {Object} input  parsed message from rabbitMQ
//  * @return {Object}        new Request object
//  */
// function mergeInput(input) {
//      return new Request({
//           url: input.url,
//           uid: input.uid,
//           options: input.options,
//           requestId: input.requestId,
//           requestDate: Date(),
//           processes: 0,
//           status: 'active'
//      });
// }

// function reject(promise, statusType, message, notify, input, retry, retryCommand, retryOptions) {
function reject(promise, input) {
     console.log('request/summary.js init -> failed -> reject');
     if (typeof input === 'undefined') {
          input = {}
     }
     var msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          url: input.url || null,
          page: input.page || null,
          status: 'error',
          statusType: input.statusType || null
     };
     if (input.retry === true) {
          msg.retry = true;
          if (input.softRetry === true) {
               msg.softRetry = true;
          } else if (input.retryCommand && input.retryOptions) {
               msg.retryCommand = input.retryCommand;
               msg.retryOptions = input.retryOptions;
          }
     }
     if (input.notify === true) {
          msg.notify = true;
          msg.message = 'Request updated';
          if (input.message) {
               msg.message = input.message;
          }
     }
     promise.reject(msg)
}

function resolve(promise, input) {
     var msg = {
          uid: input.uid,
          requestId: input.requestId,
          page: input.page,
          status: input.status,
          statusType: input.statusType,
          message: input.message
     }
     if (input.notify === true) {
          msg.notify = true;
     }
     promise.resolve(msg);
}

function retryInput(input, funcName) {
     var promise = q.defer();
     if (typeof [funcName] !== 'undefined') {
          input.promise = promise;
          [funcName](input);
          // .then(function (res) {
          //  promise.resolve(res);
          // }).catch(function (err) {
          //  promise.reject(err);
          // });
     }
     return promise.promise;
}

function _saveAsActive(opts) {
     console.log('request/summary.js init -> _saveAsActive ->');
     var promise = q.defer();
     utils.updateBy(Request, {
          requestId: opts.requestId
     }, {
          $PUT: {
               status: 'active'
          }
     }, function (err) {
          if (err !== null) {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:failed');
               promise.reject(opts);
          } else {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed');
               promise.resolve(opts);
          }
     });
     return promise.promise;
}

function saveAsActive(opts) {
     console.log('request/summary.js init -> saveAsActive ->');
     _saveAsActive(opts).then(processUrl).catch(savingAsActiveError);
}

function savingAsActiveError(opts) {
     console.log('request/summary.js init -> _saveAsActive -> updateBy:failed -> savingAsActiveError');
     var promise = opts.promise;
     opts.promise = undefined;
     return reject(promise, {
          statusType: 'database',
          notify: true,
          message: 'Trouble saving request.  We\'re checking connections then trying again.',
          requestId: opts.requestId,
          uid: opts.uid,
          url: opts.url,
          page: opts.page,
          retry: true,
          retryCommand: 'request.summary.saveAsActive',
          retryOptions: opts
     });
}

function processHar(input, res) {
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar');

     var url = input.url;
     var options = input.options;
     var promise = input.promise;
     var requestId = input.requestId;
     var uid = input.uid;
     var page = input.page;
     var url = input.url;
     var isRetry = input.isRetry;
     console.log('summary.js sniff.har responded');
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> publishCaptures');
     publishCaptures(input, res);
     /* CHECK */
     /* CHECK */
     /* CHECK */
     /* CHECK */
     /* CHECK */

     /*
     Handle Errors!!!
     */
     try {
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> processHtml');

          var newScan = new Scan(res);
          newScan.requestId = requestId;
          resources = processResources(input, res);
          /* CHECK *?
          /* CHECK *?
          /* CHECK *?
          /* CHECK *?
          /* CHECK */

          if (options && options.save && options.save.resources === true) {
               newScan.resources = resources;
          }

          if (options && options.save && options.save.security === true) {
               newScan.emails = res.emails;
          }
          newScan.thumb = res.thumb;
          /* FIX */
          /* FIX */
          /* FIX */
          /* FIX */
          /* FIX */

          newScan = processMetaData(newScan, input, res);
          /* CHECK */
          /* CHECK */
          /* CHECK */
          /* CHECK */

          newScan.completedTime = Date();
          /* SERVER TIME */
          /* SERVER TIME */
          /* SERVER TIME */
          /* SERVER TIME */

          delete newScan.log;
          newScan.uid = uid;

     } catch (err) {
          /** Handle this error??? */
          console.log('err', err);
          return reject(promise, {
               statusType: 'system',
               notify: true,
               message: 'An error occured while processing the html of your page.',
               retry: false,
               requestId: requestId,
               uid: uid,
               url: url,
               page: page
          });
     }
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save ->');

     newScan.save(function (err) {
          if (err) {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:failed');
               /*
               Here we should send the unsaved scan to rabbitMQ, and suggest restarting from here
               */
               return reject(promise, {
                    statusType: 'database',
                    message: 'Trouble saving scan. We\'re checking our connections then trying again.',
                    notify: true,
                    requestId: requestId,
                    uid: uid,
                    url: url,
                    page: page,
                    retry: true,
                    retryCommand: 'request.summary.processHar',
                    retryOptions: {
                         res: res,
                         input: input
                    }
               });
          } else {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed');
               if (options && options.save && options.save.links === true && typeof res.links !== 'undefined' && res.links.length !== 0) {
                    console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks');

                    processLinks(input, res, requestId, newScan).then(function (_res) {
                         console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:passed');

                         /* Check */
                         /* Check */
                         /* Check */
                         /* Check */
                         /* Check */
                         //  promise.resolve(_res);
                         //  resolve(promise, uid, input.requestId, input.page, _res.status, 'processing', )
                         resolve(promise, {
                              requestId: requestId,
                              uid: uid,
                              page: page,
                              status: _res.status,
                              statusType: 'pending',
                              message: _res.message,
                              notify: true
                         });
                         /* Check */
                         /* Check */
                         /* Check */
                         /* Check */
                         /* Check */
                         /* Check */
                    }).catch(function (err) {
                         console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:failed');

                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         /* Check how this err is sent back ... */
                         // reject(promise, uid, input.requestId, input.page, 'error', statusType, message, notify);
                         return reject(promise, {
                              //  statusType: 'database',
                              //  message: 'Trouble saving scan. We\'re checking our connections, then we will retry.',
                              //  message: 'Trouble saving links...'
                              retry: true,
                              notify: true,
                              //  requestId: requestId,
                              uid: uid,
                              url: url,
                              page: page,
                              //  retryCommand: 'request.summary.processHar',
                              //  retryOptions:{
                              //  res:res,
                              //  input:input
                              //  }
                         });
                    });

               } else {

                    utils.updateBy(Request, {
                         requestId: requestId
                    }, {
                         $set: {
                              status: 'complete'
                         }
                    }, function (err) {
                         if (err) {
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              // return reject(promise, 'database', 'Trouble saving scan.', true, input, page, true, 'settings.request.summary.utils.update.by', {
                              //      input: input
                              // });
                         } else {
                              resolve(promise, {
                                   requestId: requestId,
                                   uid: uid,
                                   page: page,
                                   status: 'success',
                                   statusType: 'complete',
                                   message: 'Scan Complete',
                                   notify: true
                              });
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */

                         }
                    });

                    console.log('request/summary.js success!');
               }
          }

     }).then(function () {
          console.log('test here');
     }).catch(function () {
          /*Handle an error here... */
          console.log('test error :( ');
     });
}

function markedRequstAsFailed(input) {
     console.log('markedRequstAsFailed ->');
     utils.updateBy(Request, {
          requestId: input.requestId
     }, {
          $PUT: {
               status: 'failed'
          }
     }, function (_err) {
          if (_err === null) {
              console.log('markedRequstAsFailed:passed');
               return reject(input.promise, {
                    requestId: input.requestId,
                    uid: input.uid,
                    page: input.page,
                    statusType: 'input',
                    message: 'Unable to scan link provided',
                    notify: true
               });
          } else {
                console.log('markedRequstAsFailed:failed');
               return reject(input.promise, {
                    statusType: input.statusType || 'scan',
                    notify: true,
                    message: 'Unable to save failed scan',
                    requestId: input.requestId,
                    uid: input.uid,
                    url: input.url,
                    page: input.page,
                    retry: true,
                    retryCommand: 'request.summary.markedRequstAsFailed',
                    retryOptions: input
               });
          }
     });
}

function shouldRetry(err) {
     console.log('shouldRetry should have some logic eventually');
     return true;
}

function processUrl(input) {
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl');

     var harOptions = {
          url: input.url,
          uid: input.uid,
          options: input.options,
          requestId: input.requestId
     };
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har');
     sniff.har(harOptions).then(function (res) {
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed');
          processHar(input, res);
     }).catch(function (err) {
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed');
          if (input.isRetry !== true) {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed -> not a retry');
               if (shouldRetry(err)) {
                    /*
                    Check error description
                    */
                    return reject(input.promise, {
                         statusType: input.statusType || 'scan',
                         notify: true,
                         message: 'First scan failed. Retrying.',
                         requestId: input.requestId,
                         uid: input.uid,
                         url: input.url,
                         page: input.page,
                         retry: true,
                         retryCommand:'request.summary.processUrl',
                         retryOptions:{
                           input:input
                         }
                    });
               }
          }
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed -> is a retry');
          return markedRequstAsFailed(input, err);

          /*
          Dont retry
          */

          /*
          Handle an error here...
           */

          // console.log('test');
          /*
            Check if this was a retry, or was retryable... then save as failed.
           */
          // var newScan = new Scan({
          //      completedTime: Date(),
          //      uid: input.uid,
          //      requestId: input.requestId,
          //      message: 'Error: ' + err.name + " : " + err.message,
          //      status: 'failed',
          //      url: {
          //           url: input.url
          //      }
          // });
          // console.log('test');
          // newScan.save(function (e, r) {
          //      console.log('e', e, 'r', r);
          //      notify({
          //           message: err.name + " : " + err.message,
          //           uid: input.uid,
          //           page: '/dashboard',
          //           /* hardcoding page is bad */
          //           type: 'request',
          //           status: 'failed',
          //           i_id: input.requestId
          //      });
          // });
          // return reject(promise, 'scan', err.name + " : " + err.message, true, input, input.page, true, 'settings.request.summary.sniff.har', {
          //      harOptions: harOptions
          // });
     });
}

/**
 * process summary request message from rabbitMQ
 * @param  {Buffer} msg buffered message from rabbitMQ
 * @return {Promise} promise function
 */
function init(msg) {
     console.log('request/summary.js init');
     var promise = q.defer();
     var input = preFlight(promise, msg, reject);
     if (input === false) {
          return promise.promise;
     }
     var page = '/dashboard';
     // var _request = mergeInput(input);      // Not sure if was assuming this was getting updated but it's not?
     if (utils.checkRequirements(input, ['url', 'requestId', 'uid', 'options']) === true) {
          console.log('request/summary.js init -> checkRequirements : failed');
          reject(promise, 'input', 'Missing required fields', true, input, page, false)
     } else {
          console.log('request/summary.js init -> checkRequirements : passed ->');
          input.page = page;
          input.promise = promise;
          saveAsActive(input);
     }
     return promise.promise;
}

module.exports.init = init;
module.exports.saveAsActive = saveAsActive;
module.exports.processHar = processHar;
module.exports.processUrl = processUrl;
module.exports.markedRequstAsFailed = markedRequstAsFailed;
