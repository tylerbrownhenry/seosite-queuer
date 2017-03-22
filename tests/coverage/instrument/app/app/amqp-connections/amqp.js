require('dotenv').config()
var worker = require('./worker'),
     publisher = require('./publisher'),
     amqp = require('amqplib/callback_api'), // if the connection is closed or fails to be established at all, we will reconnect
     amqpConn = null;

 /**
  * action to take after establishing a connection to rabbitMQ
  * @param  {object} amqpConn RabbitMQ connection object
  */
 function whenConnected(amqpConn,done) {
      console.log('connected to queue');
       publisher.start(amqpConn);
       worker.start(amqpConn);
       if(done && typeof done === 'function'){
         done();
       }
 }

/**
 * initilizes rabbitmq
 */
function start(done) {
     /* Local queue I thought? In case not connected?*/
     amqp.connect(process.env.CLOUDAMQP_URL + "?heartbeat=60", function (err, conn) {
          if (err) {
               console.error("[AMQP]", err.message);
               return setTimeout(start, 1000);
          }
          conn.on("error", function (err) {
               if (err.message !== "Connection closing") {
                    console.error("[AMQP] conn error", err.message);
               }
          });
          conn.on("close", function () {
               console.error("[AMQP] reconnecting");
               return setTimeout(start, 1000);
          });
          console.log("[AMQP] connected");
          amqpConn = conn;

          whenConnected(amqpConn,done);
     });
}

module.exports = start;
