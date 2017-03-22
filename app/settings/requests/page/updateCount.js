var utils = require("../../../utils"),
     requestSchema = require("../../../models/request"),
     dynamoose = require('dynamoose'),
     Request = dynamoose.model('Request', requestSchema);

q = require('q');
/**
 * common error message for updated count
 * @param  {promise} promise
 * @param  {error} err            error that happened
 * @param  {string} requestId     unique id of current request
 * @param  {number} updatedCount  value of count that was attempting to save
 * @return {promise}              the rejected promise
 */
function handleError(promise, err, requestId, updatedCount) {
     return promise.reject(err, {
          system: 'AWS',
          requestId: requestId,
          status: 'warning',
          message: 'Error occured while updating request count. Error: ' + err.message,
          requestId: requestId,
          updatedCount: updatedCount,
          func: 'updateCount'
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
     console.log('updateCount', putObject);
     var promise = q.defer();
     try {
          utils.updateBy(Request, {
               requestId: requestId
          }, {
               $PUT: putObject
          }, function (err) {
               if (err) {
                    handleError(promise, err, requestId, updatedCount)
               } else {
                    promise.resolve({
                         requestId: requestId,
                         updatedCount: updatedCount
                    });
               }
          });
     } catch (err) {
       console.log('err',err);
          handleError(promise, err, requestId, updatedCount)
     }
     return promise.promise;
}

module.exports = updateCount;
