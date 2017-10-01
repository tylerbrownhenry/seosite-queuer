let errorHandler = require('./helpers/errorHandler'),
     dynamoose = require('dynamoose'),
     requestSchema = require("../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     Scan = require("../models/scan"),
     User = require("../models/user"),
     consumeActions = require("./consumers/actions");

/**
 * initilizes rabbitMQ consumer
 * @param  {object} amqpConn rabbitMq connection object
 */
module.exports.start = (amqpConn) => {
     amqpConn.createChannel((err, ch) => {

          if (errorHandler(amqpConn, err)) {
               return; /* Restart or something? */
          }
          ch.on("drain", (err) => {
               console.error("[AMQP] channel drgain", err);
          });

          ch.on("error", (err) => {
               console.error("[AMQP] channel error", err); /* Restart or something? */
          });

          ch.on("close", () => {
               console.log("[AMQP] channel closed");
          });

          ch.prefetch(10);

          init('actions', consumeActions, 'actions', true, ch);
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
               console.log('ch init',assertName,queueName);
               ch.assertQueue(queueName, {
                    durable: true
               }, (err, _ok) => {
                    if (errorHandler(amqpConn, err)) {
                         /* Restart or something? */
                         return;
                    }
                    ch.consume(assertName, (e) => {
                         queueFunc(e, ch);
                    }, {
                         noAck: false
                    });
               });
          }
     });
};
