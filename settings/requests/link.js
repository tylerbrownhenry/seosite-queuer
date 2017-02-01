var mongoose = require('mongoose');
var linkScanner = require("../../actions/scanPage/linkScanner");
var linkSchema = require("../../schemas/linkSchema");
var requestSchema = require("../../schemas/requestSchema");
var Link = mongoose.model('Link', linkSchema, 'links ');
var Request = mongoose.model('Request', requestSchema, 'requests');
var notify = require('../../actions/callback');
var q = require('q');

function linkRequest(msg) {
    var promise = q.defer();
    var link = JSON.parse(msg.content);
    linkScanner.init({
        _link: link._link,
        url: link.url,
        baseUrl: link.baseUrl
    }).then(function(response) {
        
        var input = {
            broken: response.broken,
            internal: response.internal,
            samePage: response.samePage,
            excluded: response.excluded,
            excludedReason: response.excludedReason,
            html : link.html,
            _id: link.linkId,
            requestId: link.requestId,
            uid: link.uid,
            found: link.found,
            filename: null,
            "content-type": null,
            "content-length": null,
            statusCode : null
        };

        if(response && response.url && response.url.parsed && response.url.parsed.extra){
            input.filename = response.url.parsed.extra.filename
        };
        if(response && response.http && response.http.response && response.http.response.headers){
           input["content-type"] = response.http.response.headers["content-type"];
           input["content-length"] = response.http.response.headers["content-length"];
           input.statusCode = response.http.response.headers.statusCode;
        }

        Link.collection.updateOne({
            _id: link.linkId,
            requestId: link.requestId
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
        function(e) {
            if (e) {
                /* 
                If it errors here we need to make send it back to the queue?
                We could mark it with a retry so the secod time it gets a new
                idenity?
                */
                promise.reject(true); /* Restart or something */
            } else {
          // _.each(scan.links,function(link){
                //     if(link.broken === true){
                //       linkIssueCount++
                //     }
                // });



                Request.collection.findOneAndUpdate({
                    requestId: link.requestId
                }, {
                    $inc: {
                        processes: -1
                    }
                },{
                    new: true
                }, function(err, data) {
      
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
                            requestId:link.requestId,
                            status:'error',
                            message:'Error updating count after finishing a link from a request. Error: '+ err,
                            requestId:requestId,
                            func:'Request.collection.findOneAndUpdate'
                        });
                        /* Maybe push to queue to update it later? */
                    } else if (data && data.value && (data.value.processes === 0 || data.value.processes < 0)) {
                        Request.collection.findOneAndUpdate({
                            requestId: link.requestId
                        }, {
                            $set: {
                                status: 'completed'
                            }
                        }, function(err, data) {
                            if (err) {
                                promise.reject({
                                    system: 'mongo',
                                    requestId:link.requestId,
                                    status:'error',
                                    message:'Request has been completed, encountered an error closing it. Error: '+ err,
                                    requestId:requestId,func:'Request.collection.findOneAndUpdate'
                                });

                                /*
                                To be marked completed
                                */
                                /*
                                Add to a garbage queue or something
                                */
                            } else {
                                promise.resolve(true);
                                console.log('thanks',link);

                                notify({
                                    message:'Scan complete!',
                                    uid: link.uid,
                                    page: 'summary',
                                    eventType: 'requestUpdate',
                                    preClass: 'pending',
                                    postClass: 'complete',
                                    item: link.requestId
                                });
                            }
                        });
                    } else {
                        promise.resolve(true);
                    }
                });
            }
        });
    });
    return promise.promise;
}
module.exports = linkRequest;