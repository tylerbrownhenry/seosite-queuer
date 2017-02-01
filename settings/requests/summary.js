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
var moment = require('moment');
var Capture = require('../../schemas/captureSchema');
var sniff = require('../../actions/sniff/index');












/*
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
###
*/
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
                resolvedUrl: response.url.resolvedUrl,
                statusMessage: 'Success',
                // 'content-type' : response.currentResponse.headers["content-type"],
                redirects: response.redirects,
                failedReason: null               
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

            var harOptions = {
               url: input.url
                // bodies:true
            };



            sniff.har(harOptions).then(function(res){
                console.log('test');

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
                console.log('test3');

                publisher.publish("", "capture", new Buffer(JSON.stringify({ 
                        url: res.url.resolvedUrl,
                        requestId:  requestId,
                        sizes: ['1920x1080']
                        // sizes: ['1920x1080','1600x1200','1400x900','1024x768','800x600','420x360']
                    })),
                    {
                    url: res.url.resolvedUrl,
                    requestId:requestId
                }).then(function(err,data){
                    console.log('Capture published'); 
                }).catch(function(err){
                    console.log('Error publishing capture');
                })
                /* 
                Handle Errors!!!
                Handle Errors!!!
                Handle Errors!!!
                Handle Errors!!!
                Handle Errors!!!
                Handle Errors!!!
                Handle Errors!!!
                */
                console.log('hardy har har!');


                var Scan = require('../../schemas/scanSchema');
                var links = res.links;
                res.links = undefined;
                res.linkCount = links.length;
                var newScan = new Scan(res);
                newScan.requestId = requestId;
                var interest = {
                    "Content-Type": {
                        "text/css": true,
                        "text/css; charset=utf-8": true,
                        "text/javascript": true,
                        "text/javascript; charset=UTF-8": true,
                        "application/x-javascript": true,
                        "application/x-javascript; charset=UTF-8": true,
                        "application/javascript": true,
                        "application/javascript; charset=UTF-8": true,
                    },
                    "Content-Encoding": {
                        "gzip": true
                    },
                    "Cache-Control": true
                }

                function Resource(e){
                    var acceptableGzip = null;
                    var gZippable = null;
                    var contentType = null;
                    var cached = false;
                    _.each(e.response.headers,function(header){
                        if(typeof interest[header.name] !== 'undefined'){
                            if(header.name === "Content-Type"){
                                gZippable = true;
                                contentType = header.value;
                            } else if(header.name === "Content-Encoding"){
                                acceptableGzip =  (interest[header.name][header.value] === true) ? true : false;
                            } else if(header.name === 'Cache-Control'){
                                cached = true;
                            }
                        }
                    });

                    return {
                        duration: e.time,
                        start: e.startedDateTime,
                        timings: e.timings,
                        url: e.request.url,
                        // request: {
                            // url: e.request.url,
                            // method: e.request.method,
                            // bodySize: e.request.bodySize
                        // },
                        // pageref: e.pageref,
                        status: e.response.status,
                        // response: {
                            // content: e.response.content,
                            // status: e.response.status,
                            // statusText: e.response.statusText
                        // },
                        // headers: {
                        gzip: (gZippable) ? acceptableGzip : null,
                        type: contentType,
                        cached: cached,
                        minified: null
                        // }
                    }
                }



       console.log('hardy har har!2');

                function postProcess(scan){
                    var response = [];
                    if(scan && scan.log && scan.log.entries){
                        _.each(scan.log.entries,function(entry){
                            response.push(new Resource(entry))
                        });
                    }
                    return response;
                }
console.log('here1342341');
                var resources = postProcess(res);
                newScan.resources = resources;
                newScan.emails = res.emails;
                newScan.meta = {
                    title: {
                        message: 'No title found',
                        text: '',
                        found:false
                    },
                    description:{
                        message: 'No meta description found.',
                        element: null,
                        text: '',
                        found: false
                    },
                    h1:{
                        message: 'No h1 found.',
                        element: null,
                        text: '',
                        found: false
                    },
                    h2:{
                        message: 'No h2 found.',
                        element: null,
                        text: '',
                        found: false
                    }
                }

                var links = _.filter(links,function(link){
                    if(typeof link.specialCase !== 'undefined'){
                        if(link.specialCase === 'title'){
                            newScan.meta.title.found = true;
                            newScan.meta.title.text = link.html.text;
                            newScan.meta.title.message = 'Found'
                        } else if(link.specialCase === 'description'){
                            newScan.meta.description.found = true;
                            newScan.meta.description.element = link.html.tag;
                            newScan.meta.description.text = link.html.attrs.content;
                            newScan.meta.description.message = 'Found'
                        }  else if(link.specialCase === 'h1'){
                            newScan.meta.h1.found = true;
                            newScan.meta.h1.element = link.html.tag;
                            newScan.meta.h1.text = link.html.attrs.content;
                            newScan.meta.h1.message = 'Found'
                        }  else if(link.specialCase === 'h2'){
                            newScan.meta.h2.found = true;
                            newScan.meta.h2.element = link.html.tag;
                            newScan.meta.h2.text = link.html.attrs.content;
                            newScan.meta.h2.message = 'Found'
                        }
                        return false;
                    }
                    return true;
                });


console.log('here112312');

                var metaIssueCount = 0;

                  if(newScan.meta.title.found !== true){
                    metaIssueCount++
                  }
                  if(newScan.meta.description.found !== true){
                    metaIssueCount++
                  }
                  if(newScan.meta.h1.found !== true){
                    metaIssueCount++
                  }
                  if(newScan.meta.h2.found !== true){
                    metaIssueCount++
                  }

console.log('here112312566565');
                var resourceIssueCount = 0;
console.log('here112312566565');
                _.each(newScan.resources,function(resource){
console.log('here1123125665651',resource,resourceIssueCount);
                    if(resource.gzip === null){
                      resourceIssueCount += 1;
                    }
console.log('here1123125665651',resource,resourceIssueCount);
                    if(resource.cached === null){
                      resourceIssueCount += 1; 
                    }
                    if(resource.minified === null){
                      resourceIssueCount += 1;  
                    }
                    if(resource.status !== 200 && resource.status !== 301){
                      resourceIssueCount += 1;  
                    }
                });
console.log('here11231256656522312');

console.log('here1123122312');
                var linkIssueCount = 0;
      
                var tooManyLinks = (links >= 100) ? true: false;
                if(tooManyLinks){
                  linkIssueCount++
                }

console.log('here1123121111',newScan.emails);

                if(tooManyLinks === false 
                  && linkIssueCount === 0 
                  && resourceIssueCount === 0 
                  && metaIssueCount === 0 
                  && (newScan.emails && newScan.emails.length === 0)){
                   newScan.issues = {noIssues : true};
                } else {
                 newScan.issues = {
                    tooManyLinks: tooManyLinks,
                    links: linkIssueCount,
                    resources: resourceIssueCount,
                    security: (newScan.emails) ? newScan.emails.length : 0,
                    meta: metaIssueCount
                  }  
                }
console.log('here1123');


                newScan.grade = {
                    letter:'B',
                    message:'Could be better'
                };

                newScan.completedTime = moment().format('MMMM Do - h:mm a');
                delete newScan.log;
                newScan.uid = input.user;
                newScan.save(function (err, result) {
                    /*
                    Handle an error
                    */

                    var parentLink = newScan.url.resolvedUrl;
                    for (var i = 0; i < 100; i++) {
                        console.log('newScan saved...',parentLink);
                    }



                    var counter = 0;
                    var commands = [];

                    var linkObj = {};
                    if(typeof links === 'undefined'){
                        return promise.resolve({status:'success',data:'No links found to add to queue'});
                    }
                    _.each(links, function(link) {
                        var linkId = sh.unique(link.url.original+requestId);
                        commands.push({
                            updateOne: {
                                "filter": {
                                    "_id": linkId,
                                    "requestId": requestId
                                },
                                "replacement": {
                                    "resolvedUrl": parentLink, /* REsolved url? */
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

                        updateCount(requestId, updatedCount, newScan).then(function(resp){
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
                }).then(function(){
                    console.log('test here');

                }).catch(function(){
                    /*Handle an error here... */
                    console.log('test error :( ');
                });
            });
        }
    });
    return promise.promise;
}

module.exports = summaryRequest;