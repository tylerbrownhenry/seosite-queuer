var dynamoose = require('dynamoose'),
     linkSchema = require("../../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
     _updateCount = require("../page/updateCount"),
     publisher = require('../../../amqp-connections/publisher'),
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
          processes: updatedCount,
          dev_use_only_request: response.currentResponse,
          response: {
               url: response.url.url,
               statusMessage: 'Success',
               redirects: response.redirects,
               failedReason: null
          }
     }
     return _updateCount(requestId, updatedCount, putObject);
}

function saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input) {
     console.log('saveUpdatedCount', requestId, updatedCount, newScan, commands, linkObj, input);
     updateCount(requestId, updatedCount, newScan).then(function (resp) {
          console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount:passed');
          //console.log('commands',commands);
          _.each(commands, function (command) {
               var id = command._id;

               var buffer = new Buffer(JSON.stringify({
                    url: linkObj[id].resolvedUrl,
                    requestId: requestId,
                    linkId: linkObj[id]._id,
                    uid: input.uid,
                    baseUrl: newScan.url.url,
                    _link: linkObj[id]
               }));
               publisher.publish("", "links", buffer).then(function (err) {
                    //  if(err){
                    //    console.log('request/links/process.js updatedCount--> build commands:passed --> batchPut:passed --> updateCount:passed --> publish link to queue:failed',err);
                    //    promise.reject({
                    //      system: 'rabbitMQ',
                    //      systemError:err,
                    //      source: input.source,
                    //      requestId: requestId,
                    //      uid: input.uid,
                    //      status: 'error',
                    //      statusType: 'failed',
                    //      message: 'error:publish:link',
                    //      type: 'page:scan',
                    //      retry: true,
                    //      retryCommand: 'publish:link',
                    //      retryOptions: {
                    //        buffer: buffer,
                    //        type: newScan.url.url,
                    //        messageId: linkObj[id]._id,
                    //        uid: input.uid
                    //      }
                    //    });
               });
          });
          // } else {
          // console.log('pageScan.js successfully published to queue');
          promise.resolve({
               source: input.source,
               requestId: requestId,
               uid: input.uid,
               status: 'success',
               statusType: 'update',
               notify: true,
               param: commands.length,
               message: 'success:found:links'
          });
          // }
          //  });
          // });
     }).catch(function (err) {
          //console.log('request/links/process.js --> saveUpdatedCount:failed',err);
          promise.reject({
               system: err.system,
               systemError: err.systemError,
               source: input.source,
               requestId: requestId,
               uid: input.uid,
               statusType: 'failed',
               status: 'error',
               message: 'error:update:link:count',
               notify: true,
               retry: true,
               type: 'page:scan',
               retryCommand: 'settings.request.links.updateCount',
               retryOptions: {
                    commands: commands,
                    updatedCount: updatedCount,
                    requestId: requestId,
                    newScan: newScan,
                    linkObj: linkObj,
                    input: {
                         source: input.source,
                         uid: input.uid
                    }
               }
          });
     });
}

/**
 * saves any link found during scan in database, and marks it on the scan object
 * @param  {Object} input message from rabbitMQ
 * @param  {Object} res   scan response object
 * @return {Promise}
 */
function init(input, res, requestId, newScan, waitCount) {
     //console.log('request/links/process.js', newScan);
     var promise = q.defer();
     var links = res.links;
     res.links = undefined;
     res.linkCount = links.length;

     var parentLink = newScan.url.url;
     var commands = [];
     var linkObj = {};

     console.log('request/links/process.js --> build commands');
     _.each(links, function (link) {
          if (link.url) {
               var linkId = sh.unique(link.url.original + requestId);
               if (typeof linkObj[linkId] === 'undefined') {
                    //  console.log('link.html.attrs',link.html.attrs);
                    //  console.log('link.##',link);
                    commands.push({
                         "_id": linkId,
                         "__scan": {},
                         "__link": link,
                         "found": Date(),
                         "linkId": linkId,
                         "attrs": link.html.attrs,
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
          }
     });
     //  console.log('request/links/process.js --> build commands:passed --> batchPut');
     var updatedCount = waitCount;
     utils.batchPut(Link, commands, function (err, e) {
          console.log('err', e);
          if (err !== null) {
               promise.reject({
                    system: 'dynamo',
                    systemError: err,
                    source: input.source,
                    requestId: requestId,
                    uid: input.uid,
                    statusType: 'failed',
                    status: 'error',
                    message: 'error:update:link:count',
                    notify: true,
                    retry: true,
                    type: 'page:scan',
                    retryCommand: 'settings.request.links.process.init',
                    /* Add to retryables */
                    retryOptions: {
                         res: res,
                         requestId: requestId,
                         newScan: newScan,
                         input: {
                              source: input.source,
                              uid: input.uid
                         }
                    }
               });
               //console.log('request/links/process.js --> build commands:passed --> batchPut:failed',err);
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               //  return promise.reject(promise, 'database', 'Trouble saving request links.', true, input, page, true, 'links.process.batchPut', {
               //       requestId: requestId,
               //       updatedCount: updatedCount,
               //       newScan: newScan,
               //       commands: commands,
               //       parentLink: parentLink,
               //       requestId: requestId
               //  });
          }
          //console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount');
          /*
          checkcheck if e is undeinfed...
          */
          updatedCount = commands.length;
          saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input);
     });
     return promise.promise;
};

module.exports.init = init;
module.exports.saveUpdatedCount = saveUpdatedCount;
