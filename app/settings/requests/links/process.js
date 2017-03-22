var notify = require('../../../actions/callback'),
     dynamoose = require('dynamoose'),
     linkSchema = require("../../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
     _updateCount = require("../page/updateCount"),
     _ = require('underscore'),
     sh = require('shorthash'),
     utils = require('../../../utils'),
     q = require('q');

/**
* wrapper for updateCount function creates put object
* @param  {string} requestId unqiue id of page request
* @param  {number} updatedCount number of new links found
* @param  {object} response  content but the page request
* @return {promise}
*/
function updateCount(requestId, updatedCount, response) {
      var putObject = {
           processes: updatedCount - 1,
           dev_use_only_request: response.currentResponse,
           response: {
                resolvedUrl: response.url.resolvedUrl,
                statusMessage: 'Success',
                redirects: response.redirects,
                failedReason: null
           }
      }
      return _updateCount(requestId, updatedCount, putObject);
 }

/**
 * saves any link found during scan in database, and marks it on the scan object
 * @param  {Object} input message from rabbitMQ
 * @param  {Object} res   scan response object
 * @return {Promise}
 */
function processLinks(input, res, requestId, newScan) {
     var promise = q.defer();
     var links = res.links;
     res.links = undefined;
     res.linkCount = links.length;

     var parentLink = newScan.url.resolvedUrl;
     var commands = [];
     var linkObj = {};

     _.each(links, function (link) {
          var linkId = sh.unique(link.url.original + requestId);
          if (typeof linkObj[linkId] === 'undefined') {
               commands.push({
                    "_id": linkId,
                    "__scan": {},
                    "__link": link,
                    "found": Date(),
                    "linkId": linkId,
                    "resolvedUrl": parentLink,
                    "requestId": requestId,
                    "scanned": null,
                    "status": 'pending',
                    "site": parentLink,
                    "uid": input.uid,
                    "url": link.url.original,
               });
               link._id = linkId;
               linkObj[linkId] = link;
          }
     });

     var updatedCount = 0;

     Link.batchPut(commands, function (err, e) {
          console.log('summary.js line ~350');
          if (err !== null) {
            return promise.reject(promise, 'database', 'Trouble saving request links.', true, input, page,true,'links.process.batchPut',{requestId:requestId, updatedCount:updatedCount, newScan:newScan,commands:commands,parentLink:parentLink,requestId:requestId});
          }
          /*
          checkcheck if e is undeinfed...
          */
          updatedCount = commands.length;
          console.log('summary.js updatedCount');

          updateCount(requestId, updatedCount, newScan).then(function (resp) {
               console.log('summary.js updatedCount response',commands);
               _.each(commands, function (command) {
                    var id = command._id;
                    var buffer = new Buffer(JSON.stringify({
                         url: linkObj[id].resolvedUrl,
                         requestId: requestId,
                         linkId: linkObj[id]._id,
                         uid: input.uid,
                         baseUrl: parentLink,
                         _link: linkObj[id]
                    }));
                    publisher.publish("", "links", buffer, {
                         type: parentLink,
                         messageId: linkObj[id]._id,
                         uid: input.uid
                    }).then(function (err, data) {
                         console.log('summary.js successfully published to queue');
                         var add = '';
                         if(commands.length > 1){
                           add = 's';
                         }
                         promise.resolve({
                              status: 'working',
                              message: 'Found '+commands.length+' link'+ add
                         });
                    }).catch(function (err) {
                         console.error('summary.js error publishing to queue');
                         promise.reject(err);
                    })
               });
          }).catch(function (err) {
               console.warn('summary.js error updating count for scan');
               console.log('Error/Success pageScanner...8', err);
               /*
               Update count is only thing to fail here
               */
               promise.reject(promise, 'database', 'Trouble updating link count for request.', true, input, page,true,'settings.request.summary.newScan.save',{requestId:requestId, updatedCount:updatedCount, newScan:newScan,commands:commands,parentLink:parentLink,requestId:requestId});

          });
     });
     return promise.promise;
}
module.exports = processLinks;
