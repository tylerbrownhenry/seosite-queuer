var dynamoose = require('dynamoose'),
     requestSchema = require("../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     Scan = require("../../models/scan"),
     pageScanner = require("../../actions/scanPage/index"),
     preFlight = require("../../amqp-connections/helpers/preFlight"),
     utils = require("../../utils"),
     processResources = require("./resources/process").processResources,
     processMetaData = require("./meta/process"),
     processLinks = require("./links/process").init,
     publishCaptures = require("./capture/publish"),
     //  notify = require('../../actions/callback'),
     publisher = require("../../amqp-connections/publisher"),
     q = require('q'),
     _ = require('underscore'),
     sh = require("shorthash"),
     moment = require('moment'),
     _notify = require('../../actions/notify'),
     Capture = require('../../models/capture'),
     sniff = require('../../actions/sniff/index');

/**
 * broadcast status message back to dashboard
 * @param  {Object} opts information about scan and current status
 */
function notify(opts) {
     console.log('requests/summary.js --> notify!');
     var msg = {
          uid: opts.uid,
          requestId: opts.requestId,
          status: opts.status,
          statusType: opts.statusType,
          message: opts.message,
          page: opts.page,
          type: opts.type
     };
     _notify(msg);
}

/**
 * format response then reject promise
 * @param  {Object} promise promise object
 * @param  {Object} input   request data
 */
function reject(promise, input) {
     console.log('request/summary.js -> failed -> reject', input, 'promise', promise);
     if (typeof input === 'undefined') {
          input = {}
     }
     var msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          url: input.url || null,
          page: input.page || null,
          type: input.type || 'page:request',
          status: 'error',
          statusType: input.statusType || null
     };
     if (input.retry === true) {
          msg.retry = true;
          if (input.softRetry === true) {
               msg.softRetry = true;
          } else if (input.retryCommand && input.retryOptions) {
               msg.retryCommand = input.retryCommand;
               input.retryOptions.isRetry = true;
               msg.retryOptions = input.retryOptions;
          }
     } else {
          msg.completedTime = Date.now();
     }
     if (input.notify === true) {
          msg.notify = true;
          msg.message = 'Request updated';
          if (input.message) {
               msg.message = input.message;
          }
     }
     return promise.reject(msg)
}

/**
 * format response then resolve promise
 * @param  {Object} promise promise object
 * @param  {Object} input   request data
 */
function resolve(promise, input) {
     if (typeof input === 'undefined') {
          input = {}
     }
     var msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          page: input.page || null,
          type: input.type || 'page:request',
          status: input.status || null,
          completedTime: Date.now(),
          statusType: input.statusType || null,
          message: input.message || null
     }
     if (input.notify === true) {
          msg.notify = true;
     }
     console.log('requests/summary.js --> resolve!');
     promise.resolve(msg);
}

/**
 * save request status as failed
 * @param  {Object} input
 */
function markedRequstAsFailed(input) {
     console.log('request/summary.js --> markedRequstAsFailed ->', input);
     utils.updateBy(Request, {
          requestId: input.requestId
     }, {
          $PUT: {
               status: 'failed',
               failedReason: input.message
          }
     }, function (_err) {
          if (_err === null) {
               console.log('request/summary.js --> markedRequstAsFailed:passed');
               return reject(input.promise,
                    _.extend({
                         statusType: 'failed',
                         message: input.message,
                         notify: true
                    }, input))
          } else {
               console.log('request/summary.js --> markedRequstAsFailed:failed');
               return reject(input.promise,
                    _.extend({
                         statusType: 'failed',
                         message: 'error:save:failed:scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.summary.markedRequstAsFailed',
                         retryOptions: input
                    }, input));
          }
     });
}

/**
 * save request as active
 * @param  {Object} opts request Option
 * @return {Promise}     promise
 */
function _saveAsActive(opts) {
     console.log('request/summary.js init -> _saveAsActive -> !!', opts);
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
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed', opts);
               //  resolve(opts);
               //  notify(response);
               //
               //
               notify(_.extend({
                    type: 'page:request',
                    status: 'success',
                    statusType: 'update',
                    message: 'success:scan:init'
               }, opts));
               promise.resolve(opts);
          }
     });
     return promise.promise;
}

/**
 * wrapper for _saveAsActive
 * @param  {Object} opts request Options
 */
function saveAsActive(opts) {
     console.log('request/summary.js init -> saveAsActive ->');
     _saveAsActive(opts).then(function (res) {
          console.log('request/summary.js init -> saveAsActive:passed', res);
          processUrl(res);
     }).catch(function (err) {
          console.log('request/summary.js init -> saveAsActive:failed', err);
          savingAsActiveError(opts);
     });
}

/**
 * if there is an error saving the request, this sets to queue to retry until the save is performed
 * @param  {Object} opts request options
 */
function savingAsActiveError(opts) {
     console.log('request/summary.js init -> _saveAsActive -> updateBy:failed -> savingAsActiveError', opts);
     var promise = opts.promise;
     opts.promise = undefined;
     return reject(promise,
          _.extend({
               status: 'error',
               statusType: 'database',
               notify: true,
               message: 'error:save:scan:active',
               retry: true,
               retryCommand: 'request.summary.saveAsActive',
               retryOptions: opts
          }, opts));
}

/**
 * after scanning the page, parse the html for information
 * @param  {Object} input request info and options
 * @param  {Object} res   information returned from page scan
 */
function processHar(input, res) {
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar',res);
     var url = input.url,
          options = input.options,
          promise = input.promise,
          requestId = input.requestId,
          uid = input.uid,
          page = input.page,
          url = input.url,
          isRetry = input.isRetry;
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
     var newScan = new Scan(res);

     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> processHtml');

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
     newScan.uid = input.uid;

     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save ->');
     utils.saveScan(newScan, function (err) {
          console.log('huh?');
          if (err !== null) {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:failed');
               /*
               Here we should send the unsaved scan to rabbitMQ, and suggest restarting from here
               */
               return reject(promise, _.extend({
                    statusType: 'database',
                    message: 'error:save:scan',
                    notify: true,
                    retry: true,
                    retryCommand: 'request.summary.processHar',
                    retryOptions: {
                         res: res,
                         input: input
                    }
               }, input));

          } else {
               console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed');
               if (options && options.save && options.save.links === true && typeof res.links !== 'undefined' && res.links.length !== 0) {
                    console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks');
                    res.linkCount = res.links.length;
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
                              type: 'page:request',
                              statusType: 'update',
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
                         console.log('ERROR', err);
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
                              statusType: err.statusType,
                              status: err.status,
                              message: err.message,
                              requestId: requestId,
                              uid: input.uid,
                              url: input.url,
                              page: input.page,
                              retry: err.retry,
                              notify: err.notify,
                              retryCommand: err.retryCommand,
                              retryOptions: err.retryOptions
                         });
                    });

               } else {
                    console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed --> No Links Found');
                    utils.updateBy(Request, {
                         requestId: requestId
                    }, {
                         $PUT: {
                              status: 'complete'
                         }
                    }, function (err) {
                         console.log('error?', err);
                         if (err) {
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              // return reject(promise, 'database', 'Trouble saving scan.', true, input, page, true, 'settings.request.summary.utils.update.by', {
                              //      input: input
                              // });
                              //
                              return reject(promise, _.extend({
                                   status: 'error',
                                   statusType: 'complete',
                                   message: 'error:save:scan',
                                   notify: true,
                                   retry: true,
                                   retryCommand: 'utils.updateBy',
                                   retryOptions: {
                                        model: 'Request',
                                        input: {
                                             requestId: requestId
                                        },
                                        update: {
                                             $set: {
                                                  status: 'complete'
                                             }
                                        }
                                   }
                              }, input));
                         } else {
                              console.log('resolve ack?');
                              resolve(input.promise,
                                   _.extend({
                                        status: 'success',
                                        statusType: 'complete',
                                        message: 'success:scan:complete',
                                        notify: true
                                   }, input));
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */
                              /* Check */

                         }
                    });
               }
          }
     });
     return promise.promise;
}

/**
 * checks if a failed page scan should be marked for a retry
 * @param  {Object} input request object
 * @param  {Object} err   error response from page scan
 * @return {Boolean}
 */
function shouldRetry(input, err) {
     console.log('shouldRetry ** should have better logic eventually');
     if (input.isRetry === true) {
          return false;
     }
     return true;
}

/**
 * wrapper function for url sniff
 * @param  {Object} input request Object
 */
function processUrl(input) {
     var promise = q.defer();
     console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har');
     sniff.har({
          url: input.url,
          uid: input.uid,
          options: input.options,
          requestId: input.requestId
     }).then(function (res) {
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed');
          processHar(input, res);
          return promise.resolve();
     }).catch(function (err) {
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed', err);
          if (shouldRetry(input, err)) {
               return reject(input.promise,
                    _.extend({
                         message: 'error:scan:retry',
                         statusType: 'scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.summary.processUrl',
                         retryOptions: input
                    }, input));
          }
          console.log('request/summary.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed -> is a retry');
          markedRequstAsFailed(_.extend({
               message: 'error:unable:to:scan',
          }, input));
          promise.reject();
     });
     return promise.promise;
}

/**
 * process summary request message from rabbitMQ
 * @param  {Buffer} msg buffered message from rabbitMQ
 * @return {Promise} promise function
 */
function init(msg) {
     console.log('request/summary.js init', msg);
     var promise = q.defer();
     var input = preFlight(promise, msg, reject);
     if (input === false) {
          return promise.promise;
     }
     var page = '/dashboard';
     if (utils.checkRequirements(input, ['url', 'requestId', 'uid', 'options']) === true) {
          console.log('request/summary.js init -> checkRequirements : failed');
          reject(promise,
               _.extend({
                    message: 'error:missing:required:fields',
                    statusType: 'failed',
                    status: 'error',
                    notify: true
               }, input));
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
module.exports.resolve = resolve;
module.exports.reject = reject;
module.exports.markedRequstAsFailed = markedRequstAsFailed;
