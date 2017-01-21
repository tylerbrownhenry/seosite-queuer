var mongoose = require('mongoose');
var linkSchema = require("../../schemas/linkSchema");
var requestSchema = require("../../schemas/requestSchema");
var pageScanner = require("../../actions/scanPage/index");
var publisher = require("../../amqp-connections/publisher");
var Link = mongoose.model('Link', linkSchema, 'links ');
var Request = mongoose.model('Request', requestSchema, 'requests');
var q = require('q');
var _ = require('underscore');
var sh = require("shorthash");

function updateCount(requestId, updatedCount, response) {
    console.log('response',response);
    var promise = q.defer();
    Request.collection.findOneAndUpdate({
        requestId: requestId
    }, {
        $inc: {
            processes: updatedCount - 1
        },
        $set: {
            dev_use_only_request: response.currentResponse,
            response: {
                resolvedUrl: response.baseUrl,
                statusMessage: response.currentResponse.statusMessage,
                'content-type' : response.currentResponse.headers["content-type"],
                redirects: response.currentResponse.redirects.length,
                failedReason: response.currentResponse.failedReason                
            }
        }
    }, {
        returnNewDocument: true
    }, function(err, data) {
        if(err){
            promise.reject(err,{system: 'mongo',requestId:requestId,status:'warning',message:'Error occured while updating request count. Error: '+ err.message,requestId:requestId, updatedCount:updatedCount,func:'updateCount'});
        } else {
            promise.resolve({requestId:requestId, updatedCount:updatedCount});
        }
    });
    return promise.promise;
}

function pageRequest(msg) {
    var promise = q.defer();
    var input = JSON.parse(msg.content);
    var parentLink = input.url;
    var requestId = input.requestId;
    
    var _request = new Request({
        url: input.url,
        uid: input.user,
        options: input.options,
        requestId: input.requestId,
        requestDate: Date.now(),
        processes: 0,
        status: 'active'
    });
    console.log('Saving request...');
    _request.save(function (err, result) {
        console.log('Request saved...');
        if (err !== null){
            promise.reject({
                requestId:requestId,
                status:'error',
                message:'Trouble saving request. Error: '+ err,system: 'mongo'
            });
        } else {
            console.log('Init pageScanner...');
            pageScanner.init({
                url: parentLink,
                scanLinks: false
            }).then(function(data) {
                console.log('Error/Success settings...');
                var counter = 0;
                var commands = [];

                var linkObj = {};
                if(typeof data.foundLinks === 'undefined'){
                    return promise.resolve({status:'success',data:'No links found to add to queue'});
                }
                console.log('Error/Success pageScanner...2',data);
                console.log('Error/Success pageScanner...2');
                console.log('Error/Success pageScanner...2',parentLink);
                console.log('Error/Success pageScanner...2',input);
                console.log('Error/Success pageScanner...2',input.user);
                console.log('Error/Success pageScanner...2',requestId);
                _.each(data.foundLinks, function(link) {
                    var linkId = sh.unique(link.url.original+requestId);
                console.log('Error/Success pageScanner...2',requestId);
                    commands.push({
                        updateOne: {
                            "filter": {
                                "_id": linkId,
                                "requestId": requestId
                            },
                            "replacement": {
                                "resolvedUrl": data.baseUrl,
                                "url": link.url.original,
                                "_id": linkId,
                                "site": parentLink,
                                "requestId": requestId,
                                "status": 'pending',
                                "__scan": {},
                                "uid": input.user,
                                "found": Date.now(),
                                "scanned": null,
                                "__link": link
                            },
                            "upsert": true
                        }
                    });
                    link._id = linkId;
                    linkObj[linkId] = link;
                });

                console.log('Error/Success pageScanner...3');
                var updatedCount = 0;

                Link.collection.bulkWrite(commands,{},function(err,e) {

                    if(typeof err === 'BulkWriteError'){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message: 'Trouble saving link information Error:' + err.message,commands: commands, func:'Link.collection.bulkWrite'});
                    } else if (typeof err === 'MongoError'){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message:'Trouble with the database connection. Error: '+ err.message, commands: commands, func:'Link.collection.bulkWrite'});
                    } else if (e === null){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message:'Trouble saving found links. Error: ' + e.message,commands: commands, func:'Link.collection.bulkWrite'});
                    }

                    updatedCount = _.keys(e.upsertedIds).length;
                    console.log('Error/Success pageScanner...4',updatedCount,e);

                    updateCount(requestId, updatedCount, data).then(function(resp){

                        if(_.keys(e.upsertedIds).length !== 0){
                            _.each(_.keys(e.upsertedIds), function(_id) {
                                var id = e.upsertedIds[_id];
                                var buffer = new Buffer(JSON.stringify({ 
                                    url:        linkObj[id].resolvedUrl,
                                    requestId:  requestId,
                                    linkId:     linkObj[id]._id,
                                    uid:        input.user,
                                    baseUrl:    parentLink,
                                    _link:      linkObj[id]
                                }));
                                publisher.publish("", "links", buffer, {
                                    type: parentLink,
                                    messageId: linkObj[id]._id
                                }).then(function(err,data){
                                    console.log('Error/Success pageScanner...7');
                                    promise.resolve({
                                        status:'success',
                                        data:'New links added to queue'});  
                                }).catch(function(err){
                                    console.log('Error/Success pageScanner...6');
                                    promise.reject(err);
                                })
                            });
                        } else {
                            console.log('Error/Success pageScanner...5');
                            promise.resolve({status:'success',data:'No new links found to add to queue'});
                        }
                    }).catch(function(err){
                        console.log('Error/Success pageScanner...8',err);
                        /* 
                        Update count is only thing to fail here 
                        */
                        promise.reject(err);
                    });
                })
            }); 
        }
    });
    return promise.promise;
}

module.exports = pageRequest;