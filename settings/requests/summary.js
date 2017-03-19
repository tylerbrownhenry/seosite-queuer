var dynamoose = require('dynamoose');
var linkSchema = require("../../schemas/linkSchema");
var requestSchema = require("../../schemas/requestSchema");
var Scan = require("../../schemas/scanSchema");
var pageScanner = require("../../actions/scanPage/index");
var utils = require("../../app/utils");
var _updateCount = require("./page/updateCount");
var Resource = require("./page/processResource");

var notify = require('../../actions/callback');
var publisher = require("../../amqp-connections/publisher");
var Link = dynamoose.model('Link', linkSchema);
var Request = dynamoose.model('Request', requestSchema);
var q = require('q');
var _ = require('underscore');
var sh = require("shorthash");
var moment = require('moment');
var Capture = require('../../schemas/captureSchema');
var sniff = require('../../actions/sniff/index');

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
 * process summary request message from rabbitMQ
 * @param  {Buffer} msg buffered message from rabbitMQ
 * @return {Promise} promise function
 */
function summaryRequest(msg) {
     var promise = q.defer();
     var input = JSON.parse(msg.content);
     var parentLink = input.url;
     var requestId = input.requestId;

     var _request = new Request({
          url: input.url,
          uid: input.user,
          options: input.options,
          requestId: input.requestId,
          requestDate: Date(),
          processes: 0,
          status: 'active'
     });

     console.log('summary.js begin save request');
     utils.updateBy(Request, {requestId:input.requestId}, {
               $PUT: {
                    status: 'active'
               }
          },
          function (err, result) {
               if (err !== null) {
                    console.error('summary.js error saving request');
                    promise.reject({
                         requestId: requestId,
                         status: 'error',
                         message: 'Trouble saving request. Error: ' + err,
                         system: 'mongo'
                    });
               } else {
                    console.log('summary.js request saved no errors');
                    var harOptions = {
                         url: input.url,
                         requestId: requestId
                    };
                    sniff.har(harOptions).then(function (res) {
                         console.log('summary.js sniff.har responded');

                         // var captureSchema = new mongoose.Schema({
                         //     requestId:{
                         //         type: String
                         //     },
                         //     url: {
                         //         type: Object
                         //     },
                         //     captures: {
                         //         type: Object
                         //     },
                         //     status: {
                         //         type: String,
                         //         default: 'init'
                         //     }
                         // });
                         // console.log('test2');
                         // capture = new Capture({
                         //     url:res.url.resolvedUrl,
                         //     requestId: requestId
                         // });
                         // capture.save(function(e){
                         //     console.log('capture saved',e);
                         // });
                         console.log('test3', input);
                         if (input.options && input.options.save && input.options.save.captures === true) {
                              publisher.publish("", "capture", new Buffer(JSON.stringify({
                                   url: res.url.resolvedUrl,
                                   requestId: requestId,
                                   uid: input.user,
                                   sizes: ['1920x1080']
                                   // sizes: ['1920x1080','1600x1200','1400x900','1024x768','800x600','420x360']
                              })), {
                                   url: res.url.resolvedUrl,
                                   requestId: requestId
                              }).then(function (err, data) {
                                   console.log('Capture published');
                              }).catch(function (err) {
                                   console.log('Error publishing capture');
                              });
                         }
                         /*
                         Handle Errors!!!
                         */
                         console.log('hardy har har!');

                         try {

                              var newScan = new Scan(res);
                              newScan.requestId = requestId;

                              if (input.options && input.options.save && input.options.save.resources === true || input.options && input.options.save.links === true) {

                                   var links = res.links;
                                   res.links = undefined;
                                   res.linkCount = links.length;



                                   console.log('hardy har har!2');

                                   function postProcess(scan) {
                                        var response = [];
                                        if (scan && scan.log && scan.log.entries) {
                                             _.each(scan.log.entries, function (entry) {
                                                  response.push(new Resource(entry))
                                             });
                                        }
                                        return response;
                                   }
                                   console.log('here1342341');
                                   var resources = postProcess(res);
                              }

                              if (input.options && input.options.save && input.options.save.resources === true) {
                                   newScan.resources = resources;
                              }

                              if (input.options && input.options.save && input.options.save.security === true) {
                                   newScan.emails = res.emails;
                              }
                              console.log('typeof', typeof newScan);
                              newScan.thumb = res.thumb

                              if (input.options && input.options.save && input.options.save.metaData === true) {
                                   newScan.meta = {
                                        title: {
                                             message: 'No title found',
                                             text: '',
                                             found: false
                                        },
                                        description: {
                                             message: 'No meta description found.',
                                             element: null,
                                             text: '',
                                             found: false
                                        },
                                        h1: {
                                             message: 'No h1 found.',
                                             element: null,
                                             text: '',
                                             found: false
                                        },
                                        h2: {
                                             message: 'No h2 found.',
                                             element: null,
                                             text: '',
                                             found: false
                                        }
                                   }

                                   var links = _.filter(links, function (link) {
                                        if (typeof link.specialCase !== 'undefined') {
                                             if (link.specialCase === 'title') {
                                                  newScan.meta.title.found = true;
                                                  newScan.meta.title.text = link.html.text;
                                                  newScan.meta.title.message = 'Found'
                                             } else if (link.specialCase === 'description') {
                                                  newScan.meta.description.found = true;
                                                  newScan.meta.description.element = link.html.tag;
                                                  newScan.meta.description.text = link.html.attrs.content;
                                                  newScan.meta.description.message = 'Found'
                                             } else if (link.specialCase === 'h1') {
                                                  newScan.meta.h1.found = true;
                                                  newScan.meta.h1.element = link.html.tag;
                                                  newScan.meta.h1.text = link.html.attrs.content;
                                                  newScan.meta.h1.message = 'Found'
                                             } else if (link.specialCase === 'h2') {
                                                  newScan.meta.h2.found = true;
                                                  newScan.meta.h2.element = link.html.tag;
                                                  newScan.meta.h2.text = link.html.attrs.content;
                                                  newScan.meta.h2.message = 'Found'
                                             }
                                             return false;
                                        } else if (link.html.tagName === 'meta') {
                                             return false;
                                        } else if (link.url.original.toLowerCase().indexOf("mailto:") >= 0) {
                                             return false;
                                        } else if (link.url.original.toLowerCase().indexOf("tel:") >= 0) {
                                             return false;
                                        }
                                        return true;
                                   });

                                   var metaIssueCount = 0;

                                   if (newScan.meta.title.found !== true) {
                                        metaIssueCount++
                                   }
                                   if (newScan.meta.description.found !== true) {
                                        metaIssueCount++
                                   }
                                   if (newScan.meta.h1.found !== true) {
                                        metaIssueCount++
                                   }
                                   if (newScan.meta.h2.found !== true) {
                                        metaIssueCount++
                                   }

                                   var resourceIssueCount = 0;
                                   _.each(newScan.resources, function (resource) {
                                        if (resource.gzip === null) {
                                             resourceIssueCount += 1;
                                        }
                                        if (resource.cached === null) {
                                             resourceIssueCount += 1;
                                        }
                                        if (resource.minified === null) {
                                             resourceIssueCount += 1;
                                        }
                                        if (resource.status !== 200 && resource.status !== 301) {
                                             resourceIssueCount += 1;
                                        }
                                   });

                                   var linkIssueCount = 0;

                                   var tooManyLinks = (links >= 100) ? true : false;
                                   if (tooManyLinks) {
                                        linkIssueCount++
                                   }
                                   if (tooManyLinks === false &&
                                        linkIssueCount === 0 &&
                                        resourceIssueCount === 0 &&
                                        metaIssueCount === 0 &&
                                        (newScan.emails && newScan.emails.length === 0)) {
                                        newScan.issues = {
                                             noIssues: true
                                        };
                                   } else {
                                        newScan.issues = {
                                             tooManyLinks: tooManyLinks,
                                             links: linkIssueCount,
                                             resources: resourceIssueCount,
                                             security: (newScan.emails) ? newScan.emails.length : 0,
                                             meta: metaIssueCount
                                        }
                                   }
                                   newScan.grade = {
                                        letter: 'B',
                                        message: 'Could be better'
                                   };
                              }

                              // newScan.completedTime = moment().format('MMMM Do - h:mm a');
                              newScan.completedTime = Date();
                              delete newScan.log;
                              newScan.uid = input.user;

                         } catch (err) {
                              console.log('err', err);
                              return
                         }

                         newScan.save(function (err) {
                              if (err) {
                                   console.log('scan wasnt saved?');
                                   /*
                                   Handle an error
                                   */
                              }
                              if (input.options && input.options.save && input.options.save.links === true) {
                                   var parentLink = newScan.url.resolvedUrl;
                                   var commands = [];
                                   var linkObj = {};

                                   if (typeof links === 'undefined' || links.length === 0) {
                                        utils.updateBy(Request, {
                                             requestId: input.requestId
                                        }, {
                                             $PUT: {
                                                  status: 'complete'
                                             }
                                        });
                                        notify({
                                             message: 'Scan complete!',
                                             uid: input.user,
                                             page: '/dashboard',
                                             /* hardcoding page is bad */
                                             type: 'request',
                                             status: 'complete',
                                             i_id: input.requestId
                                        });
                                        return promise.resolve({
                                             status: 'success',
                                             data: 'No links found to add to queue'
                                        });
                                   }

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
                                                  "uid": input.user,
                                                  "url": link.url.original,
                                             });
                                             link._id = linkId;
                                             linkObj[linkId] = link;
                                        }
                                   });

                                   console.log('Error/Success pageScanner...3');
                                   var updatedCount = 0;

                                   Link.batchPut(commands, function (err, e) {
                                        console.log('summart.js', err);
                                        if (e === null) {
                                             return promise.reject({
                                                  system: 'mongo',
                                                  requestId: requestId,
                                                  status: 'error',
                                                  message: 'Trouble saving found links. Error: ' + e.message,
                                                  commands: commands,
                                                  func: 'Link.collection.bulkWrite'
                                             });
                                        }
                                        /*
                                        checkcheck if e is undeinfed...
                                        */
                                        updatedCount = commands.length;
                                        console.log('summary.js updatedCount', updatedCount);

                                        updateCount(requestId, updatedCount, newScan).then(function (resp) {
                                             console.log('summary.js updatedCount response');
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
                                                            messageId: linkObj[id]._id,
                                                            uid: input.user
                                                       }).then(function (err, data) {
                                                            console.log('summary.js successfully published to queue');
                                                            promise.resolve({
                                                                 status: 'success',
                                                                 data: 'New links added to queue'
                                                            });
                                                       }).catch(function (err) {
                                                            console.error('summary.js error publishing to queue');
                                                            promise.reject(err);
                                                       })
                                                  });
                                             } else {
                                                  console.warn('summary.js no links found on page');
                                                  promise.resolve({
                                                       status: 'success',
                                                       data: 'No new links found to add to queue'
                                                  });
                                             }
                                        }).catch(function (err) {
                                            console.warn('summary.js error updating count for scan');
                                             console.log('Error/Success pageScanner...8', err);
                                             /*
                                             Update count is only thing to fail here
                                             */
                                             promise.reject(err);
                                        });
                                   })
                              } else {

                                   utils.updateItem(Request, {
                                        requestId: input.requestId
                                   }, {
                                        $set: {
                                             status: 'complete'
                                        }
                                   });

                                   console.log('success!');
                                   promise.resolve({
                                        status: 'success',
                                        data: 'Scan complete'
                                   });

                                   notify({
                                        message: 'Scan complete!',
                                        uid: input.user,
                                        page: '/dashboard',
                                        /* hardcoding page is bad */
                                        type: 'request',
                                        status: 'complete',
                                        i_id: input.requestId
                                   });
                              }

                         }).then(function () {
                              console.log('test here');
                         }).catch(function () {
                              /*Handle an error here... */
                              console.log('test error :( ');
                         });
                    }).catch(function (err) {
                         /*Handle an error here... */
                         console.log('requests/summary.js error', err);
                         utils.updateItem(Request, {
                              requestId: input.requestId
                         }, {
                              $PUT: {
                                   status: 'failed'
                              }
                         });

                         var newScan = new Scan({
                              completedTime: Date(),
                              uid: input.user,
                              requestId: input.requestId,
                              message: 'Error: ' + err.name + " : " + err.message,
                              status: 'failed',
                              url: {
                                   url: input.url
                              }
                         });

                         newScan.save(function (e, r) {
                              console.log('e', e, 'r', r);
                              notify({
                                   message: err.name + " : " + err.message,
                                   uid: input.user,
                                   page: '/dashboard',
                                   /* hardcoding page is bad */
                                   type: 'request',
                                   status: 'failed',
                                   i_id: input.requestId
                              });
                         });
                         promise.reject(err)
                    });
               }
          });
     return promise.promise;
}

module.exports = summaryRequest;
