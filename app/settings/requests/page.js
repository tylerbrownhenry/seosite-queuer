var dynamoose = require('dynamoose');
var linkSchema = require("../../models/link");
var requestSchema = require("../../models/request");
var pageScanner = require("../../actions/scanPage/index");
var updateCount = require("./page/updateCount");
var createBulkUpdateCommands = require("./page/batchUpsert");
var publisher = require("../../amqp-connections/publisher");
var Link = dynamoose.model('Link', linkSchema);
var Request = dynamoose.model('Request', requestSchema);
var q = require('q');
var _ = require('underscore');
var sh = require("shorthash");

/**
 * wrapper function for processing a page request
 * @param  {object} msg information received from queue about the page request
 * @return {promise}
 */
function pageRequest(msg) {
     var promise = q.defer();
     var input = JSON.parse(msg.content);
     var parentLink = input.url,
          requestId = input.requestId;

     var _request = new Request({
          url: input.url,
          uid: input.user,
          options: input.options,
          id: input.requestId,
          requestDate: Date.now(),
          processes: 0,
          status: 'active'
     });
     console.log('page.js saving request...');
     _request.save(function (err, result) {
          if (err !== null) {
               console.log('page.js err saving request');
               promise.reject({
                    requestId: requestId,
                    status: 'error',
                    message: 'Trouble saving request. Error: ' + err,
                    system: 'mongo'
               });
          } else {
               console.log('page.js request saved');
               console.log('page.js begin page scan');
               pageScanner.init({
                    url: parentLink,
                    scanLinks: false
               }).then(function (data) {
                    console.log('page.js page scan responded');
                    var linkObj = {};
                    if (typeof data.foundLinks === 'undefined') {
                         console.warn('page.js no links found during page scan');
                         return promise.resolve({
                              status: 'success',
                              data: 'No links found to add to queue'
                         });
                    }

                    var commands = createBulkUpdateCommands(linkObj, requestId, parentLink, data.foundLinks, data.baseUrl)
                    var updatedCount = 0;

                    Link.batchPut(commands, function (err, e) {
                         if (err !== null) {
                              console.error('page.js error encourter while doing batchPut');
                              promise.reject({
                                   system: 'mongo',
                                   requestId: requestId,
                                   status: 'error',
                                   message: 'Trouble saving found links. Error: ' + e.message,
                                   commands: commands,
                                   func: 'Link.collection.bulkWrite'
                              });
                              return promise.promise;
                         } else {
                              updatedCount = commands.length;
                              console.error('page.js batchPut success', comm);
                              var put = {
                                   processes: updatedCount - 1,
                                   'dev_use_only_request': data.currentResponse,
                                   response: {
                                        resolvedUrl: data.baseUrl,
                                        statusMessage: data.currentResponse.statusMessage,
                                        'content-type': data.currentResponse.headers["content-type"],
                                        redirects: data.currentResponse.redirects.length,
                                        failedReason: data.currentResponse.failedReason
                                   }
                              };
                              updateCount(requestId, updatedCount, put).then(function (resp) {
                                   if (commands.length !== 0) {
                                        _.each(commands, function (command) {
                                             var id = command._id;
                                             var buffer = new Buffer(JSON.stringify({
                                                  url: linkObj[id].resolvedUrl,
                                                  requestId: requestId,
                                                  linkId: linkObj[id]._id,
                                                  uid: input.user,
                                                  baseUrl: parentLink,
                                                  _link: linkObj[id]
                                             }));
                                             publisher.publish("", "links", buffer, {
                                                  type: parentLink,
                                                  messageId: linkObj[id]._id
                                             }).then(function (err, data) {
                                                  console.log('page.js links successfully published to queue');
                                                  promise.resolve({
                                                       status: 'success',
                                                       data: 'New links added to queue'
                                                  });
                                             }).catch(function (err) {
                                                  console.error('page.js trouble publishing links to queue pageScanner');
                                                  promise.reject(err);
                                             })
                                        });
                                   } else {
                                        console.warn('page.js no links found');
                                        promise.resolve({
                                             status: 'success',
                                             data: 'No new links found to add to queue'
                                        });
                                   }
                              }).catch(function (err) {
                                   console.error('page.js updateCount error');
                                   /* Update count is only thing to fail here*/
                                   promise.reject(err);
                              });
                         }
                    })
               });
          }
     });
     return promise.promise;
}

module.exports = pageRequest;
