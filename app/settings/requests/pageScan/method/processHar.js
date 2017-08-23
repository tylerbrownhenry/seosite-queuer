let processResources = require("../../resources/process").processResources;
publisher = require('../../../../amqp-connections/publisher'),
serverInfo = require('../../../../actions/serverInfo/index'),
processMetaData = require("../../meta/process"),
processLinks = require("../../links/process").init,
publishCaptures = require("../../capture/publish"),
moment = require('moment'),
Capture = require('../../../../models/capture'),
utils = require('../../../../utils'),
Scan = require('../../../../models/scan'),
actions = require("../../actions").publish,
resolve = require("./resolve"),
reject = require("./reject"),
sh = require("shorthash"),
_ = require("underscore");

/**
 * after scanning the page, parse the html for information
 * @param  {Object} input request info and options
 * @param  {Object} res   information returned from page scan
 */
function processHar(input, res) {
     let url = input.url,
          options = input.options,
          promise = input.promise,
          requestId = input.requestId,
          uid = input.uid,
          source = input.source,
          isRetry = input.isRetry,
          newScan = new Scan(res);

     /* Will begin running, sending / saving about the Request */
     let resp = processResources(input, res),
          resources = resp.resources,
          waitCount = resp.waitCount;

     newScan.requestId = requestId;
     waitCount++
     publishCaptures(input, res);

     const arrActions = ['softwareSummary', 'checkSSL', 'tapTargetCheck', 'checkSocial', 'serverInfo'];
     _.each(arrActions, function (key) {
          actions({
               action: key,
               input: input,
               res: res,
               newScan: newScan
          })
          waitCount++;
     })

     if (options && options.save && options.save.resources === true) {
          newScan.resources = resources;
     }

     if (options && options.save && options.save.security === true) {
          newScan.emails = res.emails;
     }
     newScan.thumb = res.thumb;

     /* No process involved */
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
     console.log('PROCESSHAR4');

     //console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save ->');
     utils.saveScan(newScan, (err) => {
          //console.log('huh?');
          if (err !== null) {
               console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:failed');
               /*
               Here we should send the unsaved scan to rabbitMQ, and suggest restarting from here
               */
               return reject(promise, _.extend({
                    system: 'dynamo',
                    systemError: err,
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

               //  resolve(promise, {
               //       requestId: requestId,
               //       uid: uid,
               //       source: source,
               //       status: 'success',
               //       statusType: 'success',
               //       type: 'page:scan',
               //       message: 'success',
               //       notify: true
               //  });
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               /* TEMP */
               //  return;

               console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed');
               if (options && options.save && options.save.links === true && typeof res.links !== 'undefined' && res.links.length !== 0) {
                    console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks');
                    res.linkCount = res.links.length;
                    processLinks(input, res, requestId, newScan, waitCount).then(function (_res) {
                         console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:passed');

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
                              source: source,
                              status: _res.status,
                              statusType: _res.statusType,
                              type: 'page:scan',
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
                         //  console.log('ERROR', err);
                         console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed -> processLinks:failed', err);

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
                              source: input.source,
                              retry: err.retry,
                              notify: err.notify,
                              retryCommand: err.retryCommand,
                              retryOptions: err.retryOptions
                         });
                    });

               } else {
                    console.log('request/pageScan.js init -> _saveAsActive -> updateBy:passed -> processUrl -> sniff.har:passed -> processHar -> newScan.save:passed --> No Links Found');

                    /** Don't complete it ! */
                    // utils.updateBy(Request, {
                    //      requestId: requestId
                    // }, {
                    //      $PUT: {
                    //           status: 'complete'
                    //      }
                    // }, function (err) {
                    //      //console.log('error?', err);
                    //      if (err) {
                    //           return reject(promise, _.extend({
                    //                system: 'dynamo',
                    //                systemError:err,
                    //                status: 'error',
                    //                statusType: 'complete',
                    //                message: 'error:save:scan',
                    //                notify: true,
                    //                retry: true,
                    //                retryCommand: 'utils.updateBy',
                    //                retryOptions: {
                    //                     model: 'Request',
                    //                     input: {
                    //                          requestId: requestId
                    //                     },
                    //                     update: {
                    //                          $set: {
                    //                               status: 'complete'
                    //                          }
                    //                     }
                    //                }
                    //           }, input));
                    //      } else {
                    //           //console.log('resolve ack?');
                    //           resolve(input.promise,
                    //                _.extend({
                    //                     status: 'success',
                    //                     statusType: 'complete',
                    //                     message: 'success:scan:complete',
                    //                     notify: true
                    //                }, input));
                    //      }
                    // });
               }
          }
     });
     return promise.promise;
}

module.exports = processHar;
