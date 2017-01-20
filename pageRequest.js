var mongoose = require('mongoose');
var linkSchema = require("./linkSchema");
var requestSchema = require("./requestSchema");
var pageScanner = require("./actions/scanPage/index");
var Link = mongoose.model('Link', linkSchema, 'links ');
var Request = mongoose.model('Request', requestSchema, 'requests');
var q = require('q');

function updateCount(requestId, updatedCount, callback) {
    var promise = q.defer();
    Request.collection.findOneAndUpdate({
        requestId: requestId
    }, {
        $inc: {
            processes: updatedCount - 1
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

function pageRequest(msg, cb) {
    var promise = q.defer();
    var input = JSON.parse(msg.content);
    var parentLink = input.url;
    var requestId = sh.unique(JSON.stringify(input));
    
    var _request = new Request({
        url: input.url,
        uid: input.user,
        options: input.options,
        requestId: requestId,
        requestDate: Date.now(),
        processes: 0,
        status: 'active'
    });

    _request.save(function (err, result) {
        if (err !== null){
            promise.reject({requestId:requestId,status:'error',message:'Trouble saving request. Error: '+ err,system: 'mongo'});
        } else {
            pageScanner.init({
                url: parentLink,
                scanLinks: false
            }).then(function(data) {
                var counter = 0;
                var commands = [];

                var linkObj = {};
                _.each(data.foundLinks, function(link) {
                    var linkId = sh.unique(link.url.original);
                    commands.push({
                        updateOne: {
                            "filter": {
                                "_id": linkId,
                                "requestId": requestId
                            },
                            "replacement": {
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

                var updatedCount = 0;

                if(commands.length === 0){
                    return promise.resolve({status:'success',data:'No links found to add to queue'});
                }

                Link.collection.bulkWrite(commands,{},function(err,e) {

                    if(typeof err === 'BulkWriteError'){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message: 'Trouble saving link information Error:' + err.message,commands: commands, func:'Link.collection.bulkWrite'});
                    } else if (typeof err === 'MongoError'){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message:'Trouble with the database connection. Error: '+ err.message, commands: commands, func:'Link.collection.bulkWrite'});
                    } else if (e === null){
                        return promise.reject({system: 'mongo',requestId: requestId, status:'error',message:'Trouble saving found links. Error: ' + e.message,commands: commands, func:'Link.collection.bulkWrite'});
                    }

                    updatedCount = _.keys(e.upsertedIds).length;

                    updateCount(requestId, updatedCount).then(function(resp){
                        if(_.keys(e.upsertedIds).length !== 0){
                            _.each(_.keys(e.upsertedIds), function(_id) {
                                var id = e.upsertedIds[_id];
                                var buffer = new Buffer(JSON.stringify({ 
                                    url:        linkObj[id].url.original,
                                    requestId:  requestId,
                                    linkId:     linkObj[id]._id,
                                    baseUrl:    parentLink,
                                    _link:      linkObj[id]
                                }));
                                publisher.publish("", "links", buffer, {
                                    type: parentLink,
                                    messageId: linkObj[id]._id
                                }).then(function(err,data){
                                    promise.resolve({status:'success',data:'New links added to queue'});  
                                }).catch(function(err){
                                    promise.reject(err);
                                })
                            });
                        } else {
                            promise.resolve({status:'success',data:'No new links found to add to queue'});
                        }
                    }).catch(function(err){
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