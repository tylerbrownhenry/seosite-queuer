var dynamoose = require('dynamoose');
var linkScanner = require("../../actions/scanPage/linkScanner");
var linkSchema = require("../../schemas/linkSchema");
var requestSchema = require("../../schemas/requestSchema");
var Link = dynamoose.model('Link', linkSchema);
var Request = dynamoose.model('Request', requestSchema);
var notify = require('../../actions/callback');
var utils = require('../../app/utils');
var q = require('q');

function linkRequest(msg) {
     var promise = q.defer();
     var link = JSON.parse(msg.content);
     linkScanner.init({
          _link: link._link,
          url: link.url,
          baseUrl: link.baseUrl
     }).then(function (response) {
          // console.log('linkRequest responsee',link.linkId,'link.requestId',link.requestId);
          console.log('linkRequest responsee', link._link, 'msg', response);
          var input = {
               selector: link._link.html.selector,
               tag: link._link.html.tag,
               tagName: link._link.html.tagName,
               // html : link.html,
               // found: link.found,
               internal: response.internal,
               samePage: response.samePage,
               linkId: link.linkId,
               uid: link.uid,
               requestId: link.requestId
               // filename: null
               // "content-type": null,
               // "content-length": null,
               // statusCode : null,
               // statusMessage : null,
               // response: response
          };

          if (response.broken === true) {
               input.broken = response.broken;
               input.brokenReason = response.brokenReason;
               input._brokenReason = response._brokenReason;
               input.excluded = response.excluded;
               input.excludedReason = response.excludedReason;
          } else {

          }

          if (response && response.url && response.url.parsed && response.url.parsed.extra) {
               input.filename = response.url.parsed.extra.filename
          }

          if (response && response.http && response.http.response && response.http.response.headers) {
               input["content-type"] = response.http.response.headers["content-type"];
               input["content-length"] = response.http.response.headers["content-length"];
               input.statusCode = response.http.response.statusCode;
               input.statusMessage = response.http.response.statusMessage;
          }

          utils.updateItem(Link, {
                    linkId: link.linkId
               }, {
                    $set: {
                         status: "complete",
                         results: input,
                         _dev_use_only_input: input,
                         _dev_use_only_link: link
                    },
                    $unset: {
                         __link: '',
                    }
               },
               function (e) {
                    if (e) {
                         // console.log('save link update error',e);
                         /*
                         If it errors here we need to make send it back to the queue?
                         We could mark it with a retry so the secod time it gets a new
                         idenity?
                         */
                         promise.reject(true); /* Restart or something */
                    } else {
                         // console.log('save link updated!',link.linkId);
                         // _.each(scan.links,function(link){
                         //     if(link.broken === true){
                         //       linkIssueCount++
                         //     }
                         // });

                         utils.updateItem(Request, {
                                   //  Request.collection.findOneAndUpdate({
                                   requestId: link.requestId
                              }, {
                                   $ADD: {
                                        processes: -1
                                   }
                              },

                              function (err, data) {

                                   if (err) {
                                        /*
                                        Missed decrement


                                        Maybe can have a garbage collector queue that this
                                        will ping when this happens, acknowledging that this may have
                                        a missing queue.

                                        To revaluate
                                        1. Pause current processes.
                                        2. Wait for all scans to finish
                                        3. Check rabbitMQ
                                        - If has a count (5 left related to this request)
                                        4. Has a database count
                                        - If has a count of (5 unclosed)
                                        Mark 5 left
                                        If queue is greater than database
                                        Check which is unique and missing from database
                                        Create that entry
                                        - If fails mark it has having an database error in queue
                                        If queue is lower
                                        - Add item to queue

                                        start queue


                                        */
                                        /* Restart or something */
                                        promise.reject({
                                             system: 'mongo',
                                             requestId: link.requestId,
                                             status: 'error',
                                             message: 'Error updating count after finishing a link from a request. Error: ' + err,
                                             requestId: link.requestId,
                                             func: 'Request.collection.findOneAndUpdate'
                                        });
                                        /* Maybe push to queue to update it later? */
                                   } else {
                                        Request.get({
                                             requestId: link.requestId
                                        }, function (err, data) {
                                             if (data && (data.processes === 0 || data.processes < 0)) {
                                                  utils.updateItem({
                                                       requestId: link.requestId
                                                  }, {
                                                       $PUT: {
                                                            status: 'completed'
                                                       }
                                                  }, function (err) {
                                                       if (err) {
                                                            promise.reject({
                                                                 system: 'mongo',
                                                                 requestId: link.requestId,
                                                                 status: 'error',
                                                                 message: 'Request has been completed, encountered an error closing it. Error: ' + err,
                                                                 requestId: link.requestId,
                                                                 func: 'Request.collection.findOneAndUpdate'
                                                            });

                                                            /*
                                                            To be marked completed
                                                            */
                                                            /*
                                                            Add to a garbage queue or something
                                                            */
                                                       } else {
                                                            promise.resolve(true);
                                                            console.log('Scan complete');

                                                            notify({
                                                                 message: 'Scan complete!',
                                                                 uid: link.uid,
                                                                 page: '/dashboard',
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 /* hard coded page is bad */
                                                                 type: 'request',
                                                                 status: 'complete',
                                                                 i_id: link.requestId
                                                            });
                                                       }
                                                  });
                                             } else {
                                                  promise.resolve(true);
                                             }
                                        });
                                   }
                              });
                    }
               });
     }).catch(function (err) {
          console.error('link request err', err);
     })
     return promise.promise;
}
module.exports = linkRequest;
