var dynamoose = require('dynamoose'),
     linkScanner = require("../../actions/scanPage/linkScanner"),
     linkSchema = require("../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
     requestSchema = require("../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     notify = require('../../actions/notify'),
     utils = require('../../utils'),
     q = require('q');

function completeRequest(promise,link,data){
  console.log('settings/requests/link.js --> completeRequest',data,'(Check if data has page property)');
  // data should have the page id in it.
  // check if page is marked on the link? in the request data?
  utils.updateBy(Request, {
       requestId: link.requestId
  }, {
       $PUT: {
            status: 'complete'
       }
  }, function (err) {
       if (err) {
            /* Convert to rretry... */
            /* Convert to rretry... */
            /* Convert to rretry... */
            promise.reject({
                 system: 'dynamo',
                 requestId: link.requestId,
                 status: 'error',
                 message: 'Request has been completed, encountered an error closing it. Error: ' + err,
                 requestId: link.requestId,
                 retry:true,
                 retryCommand: 'link.request.completeRequest',
                 retryOptions: {
                   link:link,
                   data:data
                 }
                 // make the retryCommand actually work (test if it works)
            });

            /*
            To be marked completed
            */
            /*
            Add to a garbage queue or something
            */
       } else {
            /* un hard code type and page */
            /* check if notify is formatted correctly */
            promise.resolve(true);
            console.log('Scan complete', link, 'data',data);
            notify({
                 message: 'Scan complete!',
                 uid: link.uid,
                 page: data.page,
                 type: 'page:request',
                 status: 'success',
                 statusType: 'complete',
                 i_id: link.requestId
            });
       }
  });
}

/**
 * wrapper for linkScanner, parses message from RabbitMQ and passes it to LinkScanner
 * @param  {Object} msg message from RabbitMQ
 */
function linkRequest(msg) {
     console.log('request/link.js init -->');
     var promise = q.defer();
     var link = JSON.parse(msg.content);
     linkScanner.init({
          _link: link._link,
          url: link.url,
          baseUrl: link.baseUrl
     }).then(function (response) {
          console.log('request/link.js init --> linkScanner:passed',response);
          var input = {
               selector: link._link.html.selector,
               tag: link._link.html.tag,
               tagName: link._link.html.tagName,
               internal: response.internal,
               samePage: response.samePage,
               linkId: link.linkId,
               uid: link.uid,
               requestId: link.requestId
               // html : link.html,
               // found: link.found,
               // filename: null
               // "content-type": null,
               // "content-length": null,
               // statusCode : null,
               // statusMessage : null,
               // response: response
          };

          if (response) {
              console.log('request/link.js init --> linkScanner:passed -->');
               if (response.broken === true) {
                    input.broken = response.broken;
                    input.brokenReason = response.brokenReason;
                    input._brokenReason = response._brokenReason;
                    input.excluded = response.excluded;
                    input.excludedReason = response.excludedReason;
               }

               if (response.url && response.url.parsed && response.url.parsed.extra) {
                    input.filename = response.url.parsed.extra.filename
               }

               if (response.http && response.http.response && response.http.response.headers) {
                    input["content-type"] = response.http.response.headers["content-type"];
                    input["content-length"] = response.http.response.headers["content-length"];
                    input.statusCode = response.http.response.statusCode;
                    input.statusMessage = response.http.response.statusMessage;
               }
          }
          console.log('request/link.js init --> linkScanner:passed --> updateBy');

          utils.updateBy(Link, {
                    linkId: link.linkId
               }, {
                    $PUT: {
                         status: "complete",
                         results: input,
                         _dev_use_only_input: input,
                         _dev_use_only_link: link,
                         __link: ''
                    }
               },
               function (e) {
                   console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):response');
                    if (e) {
                        console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):error');
                         console.log('save link update error', e);
                         /*
                         If it errors here we need to make send it back to the queue?
                         We could mark it with a retry so the secod time it gets a new
                         idenity?
                         */
                         promise.reject(true); /* Restart or something */
                    } else {
                      console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed');
                        //  console.log('save link updated!', link.linkId, 'link.requestId', link.requestId);
                         // _.each(scan.links,function(link){
                         //     if(link.broken === true){
                         //       linkIssueCount++
                         //     }
                         // });

                         utils.updateBy(Request, {
                                   //  Request.collection.findOneAndUpdate({
                                   requestId: link.requestId
                              }, {
                                   $ADD: {
                                        processes: -1
                                   }
                              },
                              function (err, data) {
                                   if (err) {
                                     console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed --> updateBy(request):error');
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
                                        /* retry  */
                                        /* retry  */
                                        /* retry  */
                                        /* retry  */
                                        promise.reject({
                                             system: 'dynamo',
                                             requestId: link.requestId,
                                             status: 'error',
                                             statusType: 'failed',
                                             type: 'page:request',
                                             message: 'error:after:save:update:count',
                                             requestId: link.requestId,
                                             func: 'Request.collection.findOneAndUpdate'
                                        });
                                        /* Maybe push to queue to update it later? */
                                   } else {
                                       console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed --> updateBy(request):passed');
                                       utils.findBy(Request, {
                                             requestId: link.requestId
                                        }, function (err, data) {
                                             console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed --> updateBy(request):passed --> findBy:response');
                                             console.log('test', data);
                                             if (data && (data.processes === 0 || data.processes < 0)) {
                                                  console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed --> updateBy(request):passed --> findBy:response --> request complete');
                                                  completeRequest(promise,link,data);
                                             } else {
                                                  console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):passed --> updateBy(request):passed --> findBy:response --> request not complete');
                                                  promise.resolve(true);
                                             }
                                        });
                                   }
                              });
                    }
               });
     }).catch(function (err) {
          console.log('request/link.js init --> linkScanner:failed', err);
          promise.reject(err);
          //Check the response here??
          //Check the response here??
          //Check the response here??
          //Check the response here??
          //Check the response here??
          //Check the response here??
     })
     return promise.promise;
}
module.exports = linkRequest;
