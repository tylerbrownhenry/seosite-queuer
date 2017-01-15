require('dotenv').config()
var worker = require('./worker'); 
var publisher = require('./publisher'); 

var amqp = require('amqplib/callback_api');
// if the connection is closed or fails to be established at all, we will reconnect

var amqpConn = null;

function start(publish) {
    if(publish === true){

     return  whenConnected(amqpConn,publish);
    }
  amqp.connect(process.env.CLOUDAMQP_URL + "?heartbeat=60", function(err, conn) {

    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }

    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });

    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected(amqpConn,publish);
  });

    function whenConnected(amqpConn,publish) {
        console.log('pusblish',publish)
        if(publish === true){
            publisher.publish("", "jobs", new Buffer("work work work"));
        } else {
            publisher.start(amqpConn);
            worker.start(amqpConn);
        }
    }

    // setInterval(function() {

    // }, 10000);

}

module.exports = start;