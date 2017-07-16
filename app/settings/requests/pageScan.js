var dynamoose = require('dynamoose'),
     requestSchema = require("../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     Scan = require("../../models/scan"),
     preFlight = require("../../amqp-connections/helpers/preFlight"),
     utils = require("../../utils"),
     processResources = require("./resources/process").processResources,
     processMetaData = require("./meta/process"),
     processLinks = require("./links/process").init,
     publishCaptures = require("./capture/publish"),
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
     //console.log('requests/pageScan.js --> notify!');
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
     console.log('request/pageScan.js -> failed -> reject', input, 'promise', promise);
     if (typeof input === 'undefined') {
          input = {}
     }
     var msg = {
          uid: input.uid || null,
          requestId: input.requestId || null,
          i_id: input.i_id || input.requestId || null,
          url: input.url || null,
          page: input.page || null,
          type: input.type || '',
          status: 'error',
          statusType: input.statusType || null,
          system: input.system || null,
          systemError:input.systemError || null
     };
     if (input.retry === true) {
          msg.retry = true;
          if (input.softRetry === true) {
               msg.softRetry = true;
          } else if (input.retryCommand && input.retryOptions) {
               msg.retryCommand = input.retryCommand;
               input.retryOptions.isRetry = true;
               if(input.isRetry === true){
                 msg.isRetry = true;
               }
               msg.retryOptions = input.retryOptions;
               if(typeof msg.retryOptions.promise !== 'undefined'){
                  msg.retryOptions.promise = null;
                  // console.log('msg',msg.retryOptions.promise);
               }
          }
     } else {
          msg.completedTime = utils.getNowUTC();
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
          type: input.type || '',
          status: input.status || null,
          statusType: input.statusType || null,
          completedTime: utils.getNowUTC(),
          message: input.message || null
     }
     if (input.notify === true) {
          msg.notify = true;
     }
     console.log('requests/pageScan.js --> resolve!');
     promise.resolve(msg);
}

/**
 * save request status as failed
 * @param  {Object} input
 */
function markedRequstAsFailed(input) {
    //  console.log('request/pageScan.js --> markedRequstAsFailed ->');
     utils.updateBy(Request, {
          requestId: input.requestId
     }, {
          $PUT: {
               status: 'failed',
               failedReason: input.message
          }
     }, function (_err) {
          if (_err === null) {
               //console.log('request/pageScan.js --> markedRequstAsFailed:passed');
               return reject(input.promise,
                    _.extend({
                         statusType: 'failed',
                         message: input.message,
                         notify: true
                    }, input))
          } else {
               //console.log('request/pageScan.js --> markedRequstAsFailed:failed');
               return reject(input.promise,
                    _.extend({
                         system: 'dynamo',
                         systemError:_err,
                         status: 'error',
                         statusType: 'failed',
                         message: 'error:save:failed:scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.pageScan.markedRequstAsFailed',
                         retryOptions: {
                           message:input.message,
                           requestId: input.requestId
                         }
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
     //console.log('request/pageScan.js init -> _saveAsActive -> !!', opts);
     var promise = q.defer();
     utils.updateBy(Request, {
          requestId: opts.requestId
     }, {
          $PUT: {
               status: 'active'
          }
     }, function (err) {
          if (err !== null) {
               //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:failed');
               promise.reject({opts:opts,err:err});
          } else {
               //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed', opts);
               //  resolve(opts);
               //  notify(response);
               //
               //
               notify(_.extend({
                    type: '',
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
     console.log('request/pageScan.js init -> saveAsActive ->');
     _saveAsActive(opts).then(function (res) {
          console.log('request/pageScan.js init -> saveAsActive:passed', res);
          processUrl(res);
     }).catch(function (err) {
          //console.log('request/pageScan.js init -> saveAsActive:failed', err);
          savingAsActiveError({opts:e.opts,err:e.err});
     });
}

/**
 * if there is an error saving the request, this sets to queue to retry until the save is performed
 * @param  {Object} opts request options
 */
function savingAsActiveError(e) {
     //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:failed -> savingAsActiveError', opts);
     var promise = e.opts.promise;
     opts.promise = undefined;
     return reject(promise,
          _.extend({
               system: 'dynamo',
               systemError:e.err,
               status: 'error',
               statusType: 'failed',
               notify: true,
               message: 'error:save:scan:active',
               retry: true,
               retryCommand: 'request.pageScan.saveAsActive',
               retryOptions: e.opts
          }, opts));
}

/**
 * after scanning the page, parse the html for information
 * @param  {Object} input request info and options
 * @param  {Object} res   information returned from page scan
 */
function processHar(input, res) {
     console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar',res,'input',input);
     var url = input.url,
          options = input.options,
          promise = input.promise,
          requestId = input.requestId,
          uid = input.uid,
          page = input.page,
          url = input.url,
          isRetry = input.isRetry;
    console.log('processHar',options,input);
     //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> publishCaptures');
    //  publishCaptures(input, res);
     var newScan = new Scan(res);
     //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> processHtml');

     newScan.requestId = requestId;
     resources = processResources(input, res);

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
     delete newScan.emails;
     delete newScan.resources;
     /* CHECK */
     /* CHECK */
     /* CHECK */
     /* CHECK */

     newScan.completedTime = utils.getNowUTC();
     /* SERVER TIME */
     /* SERVER TIME */
     /* SERVER TIME */
     /* SERVER TIME */

     delete newScan.log;
     newScan.uid = input.uid;

     //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save ->');
     utils.saveScan(newScan, function (err) {
          //console.log('huh?');
          if (err !== null) {
               console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:failed');
               /*
               Here we should send the unsaved scan to rabbitMQ, and suggest restarting from here
               */
               return reject(promise, _.extend({
                    system: 'dynamo',
                    systemError:err,
                    statusType: 'database',
                    message: 'error:save:scan',
                    notify: true,
                    retry: true,
                    retryCommand: 'request.pageScan.processHar',
                    retryOptions: {
                         res: res,
                         input: input
                    }
               }, input));

          } else {
               console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed');
               if (options && options.save && options.save.links === true && typeof res.links !== 'undefined' && res.links.length !== 0) {
                    console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks');
                    res.linkCount = res.links.length;
                    processLinks(input, res, requestId, newScan).then(function (_res) {
                         console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:passed',page);

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
                              statusType: _res.statusType,
                              type: '',
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
                         //console.log('ERROR', err);
                         //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:failed');

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
                    console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed --> No Links Found');
                    utils.updateBy(Request, {
                         requestId: requestId
                    }, {
                         $PUT: {
                              status: 'complete'
                         }
                    }, function (err) {
                         //console.log('error?', err);
                         if (err) {
                              return reject(promise, _.extend({
                                   system: 'dynamo',
                                   systemError:err,
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
                              //console.log('resolve ack?');
                              resolve(input.promise,
                                   _.extend({
                                        status: 'success',
                                        statusType: 'complete',
                                        message: 'success:scan:complete',
                                        notify: true
                                   }, input));
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
     console.log('shouldRetry ** should have better logic eventually',input,input.isRetry === true);
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
     console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har',input);
     sniff.har({
          url: input.url,
          uid: input.uid,
          options: input.options,
          requestId: input.requestId
     }).then(function (res) {
          console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed',input);
          processHar(input, res);
          return promise.resolve();
     }).catch(function (err) {
          console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed', err,input);
          if (shouldRetry(input, err)) {
            console.log('trying again?')
               return reject(input.promise,
                    _.extend({
                         message: 'error:scan:retry',
                         statusType: 'scan',
                         notify: true,
                         retry: true,
                         retryCommand: 'request.pageScan.processUrl',
                         retryOptions: input
                    }, input));
          }
          console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:failed -> is a retry');
          markedRequstAsFailed(_.extend({
               message: 'error:unable:to:scan',
          }, input));
          return promise.reject({});
     });
     return promise.promise;
}

/**
 * process pageScan request message from rabbitMQ
 * @param  {Buffer} msg buffered message from rabbitMQ
 * @return {Promise} promise function
 */
function init(msg) {
     console.log('request/pageScan.js init', msg);
     var promise = q.defer();
     var input = preFlight(promise, msg, reject);
     if (input === false) {
          return promise.promise;
     }
     console.log('input',input);
     var page = input.page;
     if (utils.checkRequirements(input, ['url', 'requestId', 'uid', 'options']) === true) {
          //console.log('request/pageScan.js init -> checkRequirements : failed');
          reject(promise,
               _.extend({
                    message: 'error:missing:required:fields',
                    status: 'error',
                    statusType: 'failed',
                    notify: true
               }, input));
     } else {
          //console.log('request/pageScan.js init -> checkRequirements : passed ->');
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
