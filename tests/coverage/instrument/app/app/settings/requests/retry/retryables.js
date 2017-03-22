

function requiresDatabase(){
  /**
   * Check if connected to database?
   */
}

function saveAsActive(promise,opts){
  var _saveAsActive = requre('../settings/requests/summary').saveAsActive;
  opts.promise = promise;
  opts.requestId = opts.i_id;
  opts.isRetry = true;
  _saveAsActive(opts);
  return opts.promise.promise;
}

function processHar(promise,opts){
  var _processHar = requre('../settings/requests/summary').processHar;
  opts.input.promise = promise;
  opts.input.isRetry = true;
  opts.input.requestId = opts.i_id;
  _processHar(opts.input, opts.res);
  return opts.promise.promise;
}

function notify(promise,msg){
  var _notify = requre('../actions/notify');
  promise.resolve();
  _notify(msg);
  return promise.promise;
}
function markedRequstAsFailed(promise,msg){
  var _markedRequstAsFailed = requre('../settings/requests/summary').markedRequstAsFailed;
  opts.promise = promise;
  opts.isRetry = true;
  opts.requestId = opts.i_id;
  _markedRequstAsFailed(opts);
  return opts.promise.promise;
}

function processUrl(promise,msg){
  var _processUrl = requre('../settings/requests/summary').processUrl;
  opts.promise = promise;
  opts.isRetry = true;
  opts.requestId = opts.i_id;
  _processUrl(opts);
  return opts.promise.promise;
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
  'notify': notify,
}

module.exports = commands;
