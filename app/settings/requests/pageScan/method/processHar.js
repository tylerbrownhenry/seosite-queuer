let processResources = require("../../resources/process").processResources,
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
          isRetry = input.isRetry;

          res.tapTargetCheck = res.checkElements;
          let newScan = new Scan(res);
          console.log('checkElements',res.checkElements);

     /* Will begin running, sending / saving about the Request */
     let resp = processResources(input, res),
          resources = resp.resources,
          waitCount = resp.waitCount;

     newScan.requestId = requestId;
     waitCount++
    //  publishCaptures(input, res);

     const arrActions = [/*'softwareSummary',*/ 'checkSSL', /*'tapTargetCheck',*/ 'checkSocial', 'serverInfo'];
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

     newScan.completedTime = utils.getNowUTC();

     delete newScan.log;
     newScan.uid = input.uid;

     utils.saveScan(newScan, (err) => {
          if (err !== null) {
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
               if (options && options.save && options.save.links === true && typeof res.links !== 'undefined' && res.links.length !== 0) {
                    res.linkCount = res.links.length;
                    processLinks(input, res, requestId, newScan, waitCount).then(function (_res) {
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
                    }).catch(function (err) {
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
               }
          }
     });
     return promise.promise;
}

module.exports = processHar;
