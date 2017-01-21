var errorHandler = require('../settings/errorHandler');
var mongoose = require('mongoose');
var settings = require("../settings/requests");
var requestSchema = require("../schemas/requestSchema");
var Request = mongoose.model('Request', requestSchema, 'requests');

module.exports.start = function(amqpConn) {
    amqpConn.createChannel(function(err, ch) {

        if (errorHandler(amqpConn, err)) {
            /*
            Restart or something? 
            */
            return;
        }

        ch.on("drain", function(err) {
            console.error("[AMQP] channel drgain", err);
        });

        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err);
            /*
            Restart or something? 
            */
        });

        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });

        ch.prefetch(10);

        ch.assertQueue("pages", {
            durable: true
        }, function(err, _ok) {
            if (errorHandler(amqpConn, err)) {
                /* Restart or something? */
                console.log('amqpConn', amqpConn, 'err', err);
                return;
            }
            ch.consume("pages", processPage,{noAck:false});
        });

        ch.assertQueue("links", {
            durable: true
        }, function(err, _ok) {
            if (errorHandler(amqpConn, err)) {
                /* Restart or something? */
                console.log('amqpConn', amqpConn, 'err', err);
                return;
            }
            ch.consume("links", processLink,{noAck:false});
        });

        function processLink(msg) {
            console.log('processLink');
            var type = 'link';
            settings.types[type](msg).then(function(ok) {
                console.log('ackking message');
                ch.ack(msg);
            }).catch(function(err){
                console.log('failed message');
                ch.ack(msg);
                errorHandler(amqpConn, e);
            });
        }

        function processPage(msg) {
            console.log('processPage');
            var type = 'page';
            settings.types[type](msg).then(function(response,message,requestId) {
                console.log('ackking message');
                ch.ack(msg);                  
            }).catch(function(err){
                console.log('request failed');
                ch.ack(msg);
                Request.collection.findOneAndUpdate({
                    requestId: err.requestId
                }, {
                    $set: {
                        failedReason: err.message,
                        status: err.status
                    }
                },
                function(e, r, s) {
                    console.log('request failed');
                });
            })
        }
    });
};