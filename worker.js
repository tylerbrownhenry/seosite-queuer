var errorHandler = require('./errorHandler');
var _ = require('underscore');
var publisher = require('./publisher');
var sh = require("shorthash");
var q = require('q');
var mongoose = require('mongoose');
var linkSchema = require("./schemas/linkSchema");
var requestSchema = require("./schemas/requestSchema");
var pageRequest = require("./requests/pageRequest");
var linkRequest = require("./requests/linkRequest");

var User = require("./schemas/userSchema");
var Link = mongoose.model('Link', linkSchema, 'links ');
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
            linkRequest(msg).then(function(ok) {
                console.log('ackking message');
                ch.ack(msg);
            }).catch(function(err){
                console.log('failed message');
                ch.ack(msg);
                errorHandler(amqpConn, e);
            });
        }

        function processPage(msg) {
            pageRequest(msg).then(function(response,message,requestId) {
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