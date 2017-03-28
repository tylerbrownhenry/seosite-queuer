function requiresDatabase() {
     /**
      * Check if connected to database?
      */
}

function saveAsActive(promise, opts) {
     var _saveAsActive = require('../settings/requests/summary').saveAsActive;
     opts.promise = promise;
     opts.requestId = opts.i_id;
     opts.isRetry = true;
     _saveAsActive(opts);
     return opts.promise.promise;
}

function processHar(promise, opts) {
     var _processHar = require('../summary').processHar;
     opts.input.promise = promise;
     opts.input.isRetry = true;
     opts.input.requestId = opts.i_id;
     _processHar(opts.input, opts.res);
     return opts.promise.promise;
}

function notify(promise, msg) {
     var _notify = require('../../../actions/notify');
     promise.resolve();
     _notify(msg);
     return promise.promise;
}

function markedRequstAsFailed(promise, msg) {
     var _markedRequstAsFailed = require('../summary').markedRequstAsFailed;
     opts.promise = promise;
     opts.isRetry = true;
     opts.requestId = opts.i_id;
     _markedRequstAsFailed(opts);
     return opts.promise.promise;
}

function processUrl(promise, opts) {
     console.log('retrables.js --> processUrl', opts);
     var _processUrl = require('../summary').processUrl;
     opts.promise = promise;
     opts.isRetry = true;
     _processUrl(opts);
     return opts.promise.promise;
}

function completeRequest(promise,opts){
  var _completeRequest = require('../link').completeRequest;
  _completeRequest(promise,opts.link,opts.data);
  return promise.promise;
}

function updateBy(promise, opts) {
     console.log('retrables.js --> updateBy ->', opts);
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
     } else {
          console.log('retrayables.js updateBy --> Not a supported model', opts.model)
          promise.reject();
     }
     return promise.promise;
}


function processLinks(promise, opts){
  console.log('retrables.js --> processUrl', opts);
  var _updateCount = require('../links/process'),
  requestId = opts.requestId,
  newScan = opts.newScan,
  input = opts.input,
  res = opts.res;
  _updateCount(input,res,requestId,newScan).then(function(res){
    console.log('not sure if this works');
     _notify(res);
     promise.resolve(res);
  }).catch(function(err){
    console.log('not sure if this works');
    _notify(err);
    promise.reject(err);
  })
}

/**
 * white list of retryable commands
 * @type {Object}
 */
var commands = {
     'request.summary.markedRequstAsFailed': markedRequstAsFailed,
     'request.summary.processUrl': processUrl,
     'request.summary.saveAsActive': saveAsActive,
     'request.summary.processHar': processHar,
     'processLinks': processLinks,
     'utils.updateBy': updateBy,
     'link.request.completeRequest': completeRequest,
     'notify': notify,
}

module.exports = commands;
