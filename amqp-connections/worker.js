var errorHandler = require('../settings/errorHandler');
var dynamoose = require('dynamoose');
var settings = require("../settings/requests");
var requestSchema = require("../schemas/requestSchema");
var Request = dynamoose.model('Request', requestSchema);
var Scan = require("../schemas/scanSchema");
var User = require("../schemas/userSchema");

/*
Consumer Actions
*/
var consumeSummary = require("./consumers/summary");
var consumeLink = require("./consumers/link");
var consumePage = require("./consumers/page");
var consumeCapture = require("./consumers/capture");

/**
 * initilizes rabbitMQ consumer
 * @param  {object} amqpConn rabbitMq connection object
 */
module.exports.start = function (amqpConn) {
     amqpConn.createChannel(function (err, ch) {

          if (errorHandler(amqpConn, err)) {
               return; /* Restart or something? */
          }
          ch.on("drain", function (err) {
               console.error("[AMQP] channel drgain", err);
          });

          ch.on("error", function (err) {
               console.error("[AMQP] channel error", err); /* Restart or something? */
          });

          ch.on("close", function () {
               console.log("[AMQP] channel closed");
          });

          ch.prefetch(10);

          // init('summary', consumeSummary, 'freeSummary', false, ch);
          init('links', consumeLink, 'links', true, ch);
          init('pages', consumePage, 'pages', true, ch);
          init('summary', consumeSummary, 'summary', true, ch);
          init('capture', consumeCapture, 'capture', true, ch);
          /**
           * wrapper to adding the channel to the consumer function
           * @param {Function} func function to consume the message
           * @param {Object} ch   rabbitMQ channel
           */
          function PreConsumer(func,ch){
              return {
                func: function(msg){
                  func(msg,ch);
                }
              }
          }
          /**
           * initalize consumer
           * @param  {String} assertName
           * @param  {Function} queueFunc  function to run on message
           * @param  {String} queueName  name of queue message belongs to
           * @param  {Object} ack       object with ack function on it
           * @param  {Object} ch         rabbitMQ channel
           * @return {[type]}            [description]
           */
          function init(assertName, queueFunc, queueName, ack, ch) {
               console.log('ch init');
               //  console.log('ch init', ch);
               ch.assertQueue(queueName, {
                    durable: true
               }, function (err, _ok) {
                    if (errorHandler(amqpConn, err)) {
                         console.log('amqpConn', amqpConn, 'err', err); /* Restart or something? */
                         return;
                    }
                    console.log('init queue: ' + assertName);
                    var _queueFunc = new PreConsumer(queueFunc,ch);
                    if (ack) {
                         ch.consume(assertName, _queueFunc.func, {
                              noAck: false
                         });
                    } else {
                         ch.consume(assertName, _queueFunc.func);
                    }
               });
          }
     });
};
