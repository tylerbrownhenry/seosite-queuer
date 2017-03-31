var utils = require("../../../utils"),
     requestSchema = require("../../../models/request"),
     dynamoose = require('dynamoose'),
     Request = dynamoose.model('Request', requestSchema),
     q = require('q');
/**
 * common error message for updated count
 * @param  {promise} promise
 * @param  {error} err            error that happened
 * @param  {string} requestId     unique id of current request
 * @param  {number} updatedCount  value of count that was attempting to save
 * @return {promise}              the rejected promise
 */
function handleError(promise, err, requestId, updatedCount, putObject) {
     return promise.reject({
          system: 'database',
          requestId: requestId,
          status: 'warning',
          statusType: 'failed',
          notify: true,
          message: 'error:update:link:count',
          requestId: requestId,
          updatedCount: updatedCount,
          retry: true,
          retryCommand: 'request:page:update:count',
          retryOptions: {
               putObject: putObject,
               requestId: requestId,
               updatedCount: updatedCount
          }
     });
}

/**
 * updates the number of links remaining for a page scan
 * @param  {string} requestId    id of current request
 * @param  {number} updatedCount number of links to count
 * @param  {object} response     details of the page response
 * @return {promise}
 */
function updateCount(requestId, updatedCount, putObject) {
     console.log('app/settings/requests/page/updateCount.js:init');
     var promise = q.defer();
     utils.updateBy(Request, {
          requestId: requestId
     }, {
          $PUT: putObject
     }, function (err) {
          if (err) {
               console.log('app/settings/requests/page/updateCount.js:failed');
               return handleError(promise, err, requestId, updatedCount, putObject)
          } else {
               console.log('app/settings/requests/page/updateCount.js:passed');
               promise.resolve({
                    requestId: requestId,
                    updatedCount: updatedCount
               });
          }
     });
     return promise.promise;
}

module.exports = updateCount;
