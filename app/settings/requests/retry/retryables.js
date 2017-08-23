function requiresDatabase() {
     /**
      * Check if connected to database?
      */
}

function saveAsActive(promise, opts) {
     var _saveAsActive = require('../settings/requests/pageScan/process').saveAsActive;
     opts.promise = promise;
     opts.requestId = opts.i_id;
     opts.isRetry = true;
     _saveAsActive(opts);
     return opts.promise.promise;
}

function processHar(promise, opts) {
     var _processHar = require('../pageScan/process').processHar;
     opts.input.promise = promise;
     opts.input.isRetry = true;
     opts.input.requestId = opts.i_id;
     _processHar(opts.input, opts.res);
     return opts.promise.promise;
}

function notify(promise, msg) {
     ////console.log('here');
     var _notify = require('../../../actions/notify').notify;
     promise.resolve();
     _notify(msg);
     return promise.promise;
}

function markedRequestAsFailed(promise, opts) {
     // console.log('test');
     var markedRequestAsFailed = require('../pageScan/process').markedRequestAsFailed;
     markedRequestAsFailed({
          isRetry: true,
          promise: promise,
          requestId: opts.requestId,
          message: opts.message
     });
     //  console.log('test');

     return promise.promise;
}

function processUrl(promise, opts) {
     ////console.log('retrables.js --> processUrl', opts);
     var _processUrl = require('../pageScan/process').processUrl;
     var promise = q.defer();
     opts.promise = promise;
     opts.isRetry = true;
     _processUrl(opts).then(function (msg) {
          console.log('processUrl passed', msg);
          //  promise.resolve(msg);
     }).catch(function (e) {
          //  promise.reject(e);
          console.log('processUrl failed', e);
     });
     return opts.promise.promise;
}

function completeRequest(promise, opts) {
     var _completeRequest = require('../../../utils').completeRequest;
     _completeRequest(promise, opts.input, opts.data);
     return promise.promise;
}

function completeResource(promise, opts) {
     var _completeResource = require('../resource').completeResource;
     _completeResource(promise, opts.resource, opts.data, opts.robots);
     return promise.promise;
}

function retryUpdateRequest(promise, opts) {
     var _retryUpdateRequest = require('../../../utils').retryUpdateRequest;
     _retryUpdateRequest(opts.input, promise);
     return promise.promise;
}

function updateBy(promise, opts) {
     ////console.log('retrables.js --> updateBy ->', opts);
     var dynamoose = require('dynamoose');
     var updateBy = require('../../../utils').updateBy;
     if (opts.model === 'Request') {
          var requestSchema = require("../../../models/request"),
               Request = dynamoose.model('Request', requestSchema);
          updateBy(Request, opts.input, opts.update, function (err) {
               if (err) {
                    promise.reject(err);
               } else {
                    promise.resolve();
               }
          });
     } else if (opts.model === 'W3Cvalidation') {
          var W3Cvalidation = require("../../../models/W3Cvalidation");
          updateBy(W3Cvalidation, opts.input, opts.update, function (err) {
               if (err) {
                    promise.reject(err);
               } else {
                    promise.resolve();
               }
          });
     } else if (opts.model === 'Scan') {
          var Scan = require("../../../models/scan");
          updateBy(Scan, opts.input, opts.update, function (err) {
               if (err) {
                    promise.reject(err);
               } else {
                    promise.resolve();
               }
          });
     } else if (opts.model === 'SoftwareSummary') {
          var SoftwareSummary = require("../../../models/softwareSummary");
          updateBy(SoftwareSummary, opts.input, opts.update, function (err) {
               if (err) {
                    promise.reject(err);
               } else {
                    promise.resolve();
               }
          });
     } else {
          ////console.log('retrayables.js updateBy --> Not a supported model', opts.model)
          promise.reject();
     }
     return promise.promise;
}

function processLinks(promise, opts) {
     ////console.log('retrables.js --> processUrl', opts);
     var _updateCount = require('../links/process').saveUpdatedCount,
          requestId = opts.requestId,
          newScan = opts.newScan,
          input = opts.input,
          res = opts.res;
     _updateCount(input, res, requestId, newScan).then(function (res) {
          ////console.log('not sure if this works');
          _notify(res);
          promise.resolve(res);
     }).catch(function (err) {
          ////console.log('not sure if this works');
          _notify(err);
          promise.reject(err);
     })
     return promise.promise;
}

function processLinksInit(promise, opts) {
     // console.log('retrables.js --> processUrl', opts);
     var _updateCount = require('../links/process').saveUpdatedCount,
          requestId = opts.requestId,
          newScan = opts.newScan,
          input = opts.input,
          res = opts.res;
     _updateCount(input, res, requestId, newScan).then(function (res) {
          ////console.log('not sure if this works');
          _notify(res);
          promise.resolve(res);
     }).catch(function (err) {
          ////console.log('not sure if this works');
          _notify(err);
          promise.reject(err);
     })
     return promise.promise;
}

function completeRequest(promise, opts) {
     var _completeRequest = require('../../../utils').completeRequest;
     _completeRequest(promise, opts.input, opts.data);
     return promise.promise;
}

function completeLink(promise, opts) {
     ////console.log('retrables.js --> completeLink', opts);
     var _completeLink = require('../link').completeLink,
          link = opts.link,
          resp = opts.resp;
     _completeLink(promise, link, resp);
     return promise.promise;
}

function publishLink(promise, opts) {
     publisher.publish("", "links", opts.buffer, {
          type: opts.type,
          messageId: opts.messageId,
          uid: opts.uid
     }).then(function () {
          promise.resolve();
     }).catch(function (err) {
          promise.reject(err);
     });
     return promise.promise;
}

function updatePageCount(promise, opts) {
     // console.log('retrables.js --> updatePageCount', opts);
     var _updatePageCount = require('../page/updateCount');
     _updatePageCount(opts.requestId, opts.updatedCount, opts.putObject).then(function () {
          promise.resolve();
     }).catch(function (err) {
          promise.reject(err);
     });
     return promise.promise;
}

function updateCount(promise, opts) {
     ////console.log('retrables.js --> processUrl', opts);
     var _saveUpdatedCount = require('../links/process').saveUpdatedCount,
          updatedCount = opts.updatedCount,
          requestId = opts.requestId,
          newScan = opts.newScan,
          commands = opts.commands,
          linkObj = opts.linkObj,
          input = opts.input;
     _saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input);
     return promise.promise;
}

function processSoftwareSummary(promise, opts) {
     var _processSoftwareSummary = require('../softwareSummary/process').process;
     _processSoftwareSummary(promise, opts.input);
     return promise.promise;
}

function processPingIp(promise, opts) {
     var _processPingIp = require('../pingIP/process').process;
     _processPingIp(promise, opts.input);
     return promise.promise;
}

function processCheckSSL(promise, opts) {
     var _processCheckSSL = require('../checkSSL/process').process;
     _processCheckSSL(promise, opts.input);
     return promise.promise;
}

function processWhois(promise, opts) {
     var _processWhois = require('../whois/process').process;
     _processWhois(promise, opts.input);
     return promise.promise;
}

function processValidateW3C(promise, opts) {
     var _validateW3C = require('../w3cValidate/process').process;
     _validateW3C(promise, opts.input);
     return promise.promise;
}

function processTapTargetCheck(promise, opts) {
     var _tapTargetCheck = require('../tapTargetCheck/process').process;
     _tapTargetCheck(promise, opts.input);
     return promise.promise;
}

function processCheckSocial(promise, opts) {
     var _processCheckSocial = require('../checkSocial/process').process;
     _processCheckSocial(promise, opts.input);
     return promise.promise;
}

function processServerInfo(promise, opts) {
     var _processServerInfo = require('../serverInfo/process').process;
     _processServerInfo(promise, opts.input);
     return promise.promise;
}

/**
 * white list of retryable commands
 * @type {Object}
 */
var commands = {
     'request:page:update:count': updatePageCount,
     'settings.request.links.updateCount': updateCount,
     'request.pageScan.markedRequestAsFailed': markedRequestAsFailed,
     /* Sends isretry */
     'request.pageScan.processUrl': processUrl,
     /* Sends isretry */
     'request.pageScan.saveAsActive': saveAsActive,
     /* Sends isretry */
     'request.pageScan.processHar': processHar,
     /* Sends isretry */
     'request.link.completeLink': completeLink,
     'request.request.completeResource': completeResource,
     'request.softwareSummary.process': processSoftwareSummary,
     'request.pingIP.process': processPingIp,
     'request.checkSSL.process': processCheckSSL,
     'request.serverInfo.process': processServerInfo,
     'request.whois.process': processWhois,
     'request.validateW3C.process': processValidateW3C,
     'request.tapTargetCheck.process': processTapTargetCheck,
     'request.checkSocial.process': processCheckSocial,
     'processLinks': processLinks,
     'settings.request.links.process.init': processLinksInit,
     'publish:link': publishLink,
     'utils.updateBy': updateBy,
     'utils.completeRequest': completeRequest,
     'utils.retryUpdateRequest': retryUpdateRequest,
     //  'link.request.completeRequest': completeRequest,
     'notify': notify,
}

module.exports = commands;
