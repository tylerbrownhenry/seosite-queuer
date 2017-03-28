var  dynamoose = require('dynamoose'),
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
     console.log('request/links/process.js');
     var promise = q.defer();
     var links = res.links;
     res.links = undefined;
     res.linkCount = links.length;

     var parentLink = newScan.url.resolvedUrl;
     var commands = [];
     var linkObj = {};

     console.log('request/links/process.js --> build commands');
     _.each(links, function (link) {
          if (link.url) {
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
          }
     });
     console.log('request/links/process.js --> build commands:passed --> batchPut');
     var updatedCount = 0;
     utils.batchPut(Link, commands, function (err, e) {
          if (err !== null) {
               console.log('request/links/process.js --> build commands:passed --> batchPut:failed');
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               // FIRST FIX HERE
               return promise.reject(promise, 'database', 'Trouble saving request links.', true, input, page, true, 'links.process.batchPut', {
                    requestId: requestId,
                    updatedCount: updatedCount,
                    newScan: newScan,
                    commands: commands,
                    parentLink: parentLink,
                    requestId: requestId
               });
          }
          console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount');
          /*
          checkcheck if e is undeinfed...
          */
          updatedCount = commands.length;
          updateCount(requestId, updatedCount, newScan).then(function (resp) {
               console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount:passed');
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
                    }).catch(function (err) {
                      console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount:passed --> publish link to queue:failed');
                      console.error('summary.js error publishing to queue');
                      /*
                      3 Send to retry (Rarely should happen)
                      3 does publish send back a promise?
                      3 does publish send back a promise?
                      3 does publish send back a promise?
                      3 does publish send back a promise?
                       */
                      // promise.reject(err);
                    });
                 });
                 console.log('summary.js successfully published to queue');
                 var add = '';
                 if (commands.length > 1) {
                   add = 's';
                 }
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 // 4 check if this is even listended to
                 promise.resolve({
                      statusType: 'update',
                      status: 'success',
                      message: 'Found ' + commands.length + ' link' + add
                 });
              //  });
          }).catch(function (err) {
              console.log('request/links/process.js --> build commands:passed --> batchPut:passed --> updateCount:failed');
               /*
               Update count is only thing to fail here
               */

                //2 Check that this works...
                //2 Check that this works...
                //2 Check that this works...
                //2 Check that this works...
                //2 Check that this works...
                //2 Check that this works...
               promise.reject({
                    statusType: 'failed',
                    status: 'error',
                    message: 'Trouble updating link count for request.',
                    notify:true,
                    retry: true,
                    type:'page:request',
                    retryCommand: 'settings.request.links.updateCount',
                    retryOptions: {
                      input:input,
                      res:res,
                      requestId: requestId,
                      newScan: newScan
                    }
               });

          });
     });
     return promise.promise;
}
module.exports = processLinks;
