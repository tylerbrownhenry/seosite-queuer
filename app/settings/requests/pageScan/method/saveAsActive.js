let utils = require('../../../../utils'),
reject = require('./reject'),
notify = require('./notify'),
_ = require('underscore'),
q = require('q'),
processUrl = require('./processUrl'),
dynamoose = require('dynamoose'),
requestSchema = require("../../../../models/request"),
Request = dynamoose.model('Request', requestSchema);


/**
 * if there is an error saving the request, this sets to queue to retry until the save is performed
 * @param  {Object} opts request options
 */
function savingAsActiveError(e) {
     let promise = e.opts.promise;
     opts.promise = undefined;
     return reject(promise,
          _.extend({
               system: 'dynamo',
               systemError: e.err,
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
 * save request as active
 * @param  {Object} opts request Option
 * @return {Promise}     promise
 */
function _saveAsActive(opts) {
     let promise = q.defer();
     utils.updateBy(Request, {
          requestId: opts.requestId
     }, {
          $PUT: {
               status: 'active'
          }
     }, (err) => {
          if (err !== null) {
               promise.reject({
                    opts: opts,
                    err: err
               });
          } else {
               notify(_.extend({
                    type: 'page:scan',
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
  console.log('saveAsActive',opts);
     _saveAsActive(opts).then(function (res) {
       console.log('processUrl',res);
          processUrl(res);
     }).catch(function (err) {
          savingAsActiveError({
               opts: e.opts,
               err: e.err
          });
     });
}

module.exports = saveAsActive;
