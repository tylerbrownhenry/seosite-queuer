var errorHandler = require('../settings/errorHandler'),
     dynamoose = require('dynamoose'),
     settings = require("../settings/requests"),
     requestSchema = require("../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     Scan = require("../models/scan"),
     User = require("../models/user");

/*
Consumer Actions
*/
var consumeSummary = require("./consumers/summary"),
     consumeLink = require("./consumers/link"),
     consumeCapture = require("./consumers/capture"),
     consumeRetry = require("./consumers/retry");

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
               //console.error("[AMQP] channel drgain", err);
          });

          ch.on("error", function (err) {
               //console.error("[AMQP] channel error", err); /* Restart or something? */
          });

          ch.on("close", function () {
               //console.log("[AMQP] channel closed");
          });

          ch.prefetch(10);

          init('links', consumeLink, 'links', true, ch);
          init('summary', consumeSummary, 'summary', true, ch);
          init('capture', consumeCapture, 'capture', true, ch);
          init('retry', consumeRetry, 'retry', true, ch);
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
               //console.log('ch init');
               ch.assertQueue(queueName, {
                    durable: true
               }, function (err, _ok) {
                    if (errorHandler(amqpConn, err)) {
                         //console.log('amqpConn', amqpConn, 'err', err);
                         /* Restart or something? */
                         return;
                    }
                    ch.consume(assertName, function (e) {
                         queueFunc(e, ch);
                    }, {
                         noAck: false
                    });
               });
          }
     });
};
