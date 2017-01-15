// A worker that acks messages only if processed succesfully
var errorHandler = require('./errorHandler'); 
// var Link   =  require('./linkSchema'); // get our mongoose model
var _   = require('underscore'); // get our mongoose model
var publisher = require('./publisher'); 
var sh = require("shorthash");
var User = require("./user");
 

        var mongoose = require('mongoose');

        var linkSchema = new mongoose.Schema({
            url: {type: String },
            site: {type:String},
            queueId: {type: String},
            // details: Object,
            found: {type: Date},
            uid: {type:String},
            requestId: {type:String},
            scanned: {type: Date},
            status: {type:String,default:'pending'},
            __link: {type: Object},
            __scan: {type: Object}
        });


        var requestSchema = new mongoose.Schema({
            retries: {type:Number,default:0}, /* Todo !!!!! */
            uid: {type:String},
            url: {type:String},
            requestId: {type:String},
            requestDate: {type: Date, default:Date.now()},
            options: {type: Object},
            processes: { type:Number, default:0},
            status:{type:String,default: 'init'}
        });

        var Link = mongoose.model('Link', linkSchema, 'links ');
        var Request = mongoose.model('Request', requestSchema, 'requestss');

module.exports.start = function (amqpConn) {
    // console.log('tertre23213t')

  // amqpConn.createConfirmChannel(function(err, ch) {
  amqpConn.createChannel(function(err, ch) {
    // console.log('tertret6666',err);

    if (errorHandler(amqpConn,err)){
        return;
    } 

    // amqpConn.createConfirmChannel(function(err, ch) {
    //     if (errorHandler(amqpConn,err)){
    //         return;
    //     } 
    ch.on("drain", function(err) {
      console.error("[AMQP] channel drgain", err);
    });
    
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err);
    });

    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });
    ch.prefetch(10);

    ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
      if (errorHandler(amqpConn,err)){
        console.log('amqpConn',amqpConn,'err',err);
          return;
      } 
      ch.consume("jobs", processMsg);
      // console.log("Worker is started1");
    });

    ch.assertQueue("links", { durable: true }, function(err, _ok) {
      if (errorHandler(amqpConn,err)){
        console.log('amqpConn',amqpConn,'err',err);
          return;
      } 
      ch.consume("links", processLink);
      // console.log("Worker is started2");
    });




    function processLink(msg) {
      linkWork(msg, function(ok) {
        try {
          if (ok){
            ch.ack(msg); /* DOING THIS TOO LATE? */
          }else{ 
            ch.reject(msg, true);
            }
        } catch (e) {
          errorHandler(amqpConn,e);
        }
      });
    }

    function processMsg(msg) {
        start = process.hrtime();
        work(msg, function(ok) {
            try {
              if (ok){
                ch.ack(msg);
              }else{ 
                ch.reject(msg, true);
                }
            } catch (e) {
              errorHandler(amqpConn,e);
            }
      });
    }
  });
}




var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    if(start){
     // console.log('start--',start);   
        var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
        console.log(process.hrtime(start)[0] + " s " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
     // console.log('--start',start);   
    }
    start = process.hrtime(); // reset the timer
}



var start = process.hrtime();
function linkWork(msg, cb) {

var link = JSON.parse(msg.content);
    // console.log('linkWork!',msg);
         /* Goes through a few checks then gets sent to checkUrl.js */
     /* Pass options in */
     /* Save page url to database */


    var linkScanner = require("./actions/scanPage/linkScanner");
    // console.log('I am trash!',msg.content.toString());
    // myTimer += Number(console.timeEnd('page-scan'));
    // elapsed_time('now?');
    linkScanner.init({url:link.url,baseUrl:link.baseUrl},function(e){
    

        Link.collection.updateOne({
                _id: link.linkId,
                requestId: link.requestId
            }, 
            {
                $set: {
                    status: "complete", 
                    __scan: e
                }
            }, 
        function(e,r,s) {
            if(e){
                console.log('err');
                cb(false);
            } else {
                // console.log('success');
                cb(true);
            }
           // console.log('---sfound?');
           // return;

                // console.log('!link.requestId',link.requestId);
            Request.collection.findOneAndUpdate({requestId: link.requestId}, {$inc: {processes: -1 }}, function (err, data) {
                // console.log('!- requestUpdated',data.value.processes);
                /* Error checking... */
                /* Error checking... */
                /* Error checking... */
                /* Error checking... */
                if(data.value.processes === 0){
                    console.log('done!');
                    elapsed_time('Elasped');
                    Request.collection.findOneAndUpdate({requestId: link.requestId}, {$set: {status: 'completed'}}, function (err, data) {
                    
                    });
                }
            });


        // Link.collection.findOne({requestId: link.requestId, status: 'pending'}, function(e,r,s) {
        //         var foundId = 'none!'
        //        console.log('found?',foundId);
        //         if(typeof r !== 'undefined' && r !== null){
        //             foundId = r._id;
        //         }
        //        console.log('found?',foundId);
        //     });
        });

    });
    // console.time('page-scan');
    // console.log('Elasped:',myTimer);

}



function work(msg, cb) {
    start = process.hrtime();

    // sh.unique(link.url.original)
console.log('work');
    elapsed_time('now?');
    var input = JSON.parse(msg.content);

    var pageScanner = require("./actions/scanPage/index");
// console.log('tertretwww34343',msg);

    var parentLink = input.url;
    var requestId = sh.unique(JSON.stringify(input));

    // User.collection.findOne({uid:input.user},function(e,r,s){
    //     console.log('user (check the account limits',r);
    // });

    var _request = new Request({ 
        url: input.url,
        uid: input.user,
        options:input.options,
        requestId: requestId,
        requestDate: Date.now(),
        processes: 0,
        status: 'active'
    });

    _request.save();


    console.log('requestId',requestId);

    pageScanner.init({url:parentLink,scanLinks:false},function(res,message){
        // console.timeEnd('page-scan');
  
            // console.log('test');
            // console.log('test',Link.collection);
        var counter = 0;
        var commands = [];

        // _.each(message.foundLinks,function(link){
        //     commands.push(sh.unique('link.url.original)'));
        // });

        // Link.find({
        //     'url': { $in: commands}
        // }, function(err, docs){
        //     console.log(docs);
        // });
        //  var commands = [];
        // _.each(message.foundLinks,function(link){
        //     commands.push(sh.unique('link.url.original)'));

        //     var _link = new Link({ 
        //                     url: link.url.original,
        //                     site: parentLink,
        //                     queue: 'hash',
        //                     details: link
        //                 });
        // });

        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
        /*Add current page to the link list??? */
            Link.collection.drop();

            var linkObj = {};
            _.each(message.foundLinks,function(link){
            var linkId = sh.unique(link.url.original);
                // var count = id.length;
                // for (var i = (24 - count) - 1; i >= 0; i--) {
                    // id += '_';
                // }
                // console.log('id',id,'id.leng',id.length);
                commands.push({ 
                    updateOne : {
                        // "filter" : { "url" : link.url, "uid": userdata._id, "sid": sitedata._id },
                        "filter" : { "_id" : linkId, "requestId" : requestId },
                        // "_id": new mongoose.Types.ObjectId(sh.unique(link.url.original)),
                        "replacement" : { 
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
                        "upsert" : true
                    }
                });
                link._id = linkId;
                linkObj[linkId] = link;
                // console.log('1sh.unique(link.url)',sh.unique(link.url.original))
                // console.log('2sh.unique(link.url)',sh.unique(link.url.original))
            });
                var updatedCount = 0;


            Link.collection.bulkWrite(commands).then(function(e){
                updatedCount = _.keys(e.upsertedIds).length;

                updateCount(requestId,updatedCount,function(requestId,updatedCount){


                    _.each(_.keys(e.upsertedIds),function(_id){
                        /* Things to add to queue */
                            var id = e.upsertedIds[_id];
                            // console.log('linkOBj[id',linkObj[id].url)
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*We can do this as a bulk */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            /*DO THIS AFTER UPDATING MONGO WITH REQUEST CHANGE */
                            publisher.publish("", "links", new Buffer(JSON.stringify({
                                url:linkObj[id].url.original,
                                requestId: requestId,
                                linkId:linkObj[id]._id,
                                baseUrl:parentLink
                            })),
                            {
                                type: parentLink,
                                messageId: linkObj[id]._id
                            });
                        });
                });
            });

            // Request.collection.update({requestId:requestId}, {$inc: {processes:+1 }}, function (err, data) {
            //     console.log('requestUpdated',data);
            // });

            function updateCount(requestId,updatedCount,callback){
                /* Need to update this count correctly */
                 Request.collection.findOneAndUpdate({requestId:requestId}, {$inc:{processes: updatedCount - 1 }}, {returnNewDocument: true}, function (err, data) {
                    console.log('-! requestUpdated',data.value.processes,updatedCount);
                    callback(requestId,updatedCount);
                });
            }
            return;
            // Link.collection.drop();

        // _.each(  // _link.save(function(err) {
            //     if (err) throw err;
            //     console.log('Link saved successfully');
            // });
// )


            // var _link = new Link({ 
            //     url: link.url.original,
            //     site: parentLink,
            //     queue: 'hash',
            //     details: link
            // });

            // _link.save(function(err) {
            //     if (err) throw err;
            //     console.log('Link saved successfully');
            // });


            // _.each(response.links,function(link){
                    // commands.push({ 
                    //     find : {
                    //         "filter" : { "url" : link.url, "uid": userdata._id, "sid": sitedata._id },
                    //         "replacement" : { 
                    //             "url" : link.url, 
                    //             "uid": userdata._id,
                    //             "sid": sitedata._id,
                    //             "scanned": Date.now,
                    //             "link": link
                    //         },
                    //         "upsert" : true
                    //     }
                    // });
                // });
                
                // Link.collection.bulkWrite(commands).then(function(e,r,s){
                //       console.log('Links updated');
                // });

    

            // Link.collection.find({"url": { "$eq": link.url }}).forEach(function(doc){ 
                // console.log('doc',doc);
                // counter++
                // var options = doc.options; 
                // for (var optionIndex = 0; optionIndex < options.length; optionIndex++){ 
                //     var stores = options[optionIndex].stores
                //     for (var storeIndex = 0; storeIndex < stores.length; storeIndex++){ 
                //         var updateOperatorDocument = {};
                //         updateOperatorDocument["options."+optionIndex+".stores."+storeIndex+".inventory"] = 0
                //         bulkUpdateOps.find({ "_id": doc._id }).update({ "$set": updateOperatorDocument })
                //     }        
                // }     
                // counter++;  // increment counter for batch limit
                // if (counter % 500 == 0) { 
                //     // execute the bulk update operation in batches of 500
                //     bulkUpdateOps.execute(); 
                //     // Re-initialize the bulk update operations object
                //     bulkUpdateOps = db.inventory.initializeUnOrderedBulkOp();
                // } 
            // });
            // console.log('counter',counter);

// Clean up remaining operation in the queue
// if (counter % 500 != 0) { bulkUpdateOps.execute(); }





            // var publisher = require('./publisher'); 
            // publisher.publish("", "links", new Buffer(link.url.original));
        // });
    });
  console.log("Got msg");
  cb(true);
}