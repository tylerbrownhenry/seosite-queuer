var pubChannel = null;
var offlinePubQueue = [];
var errorHandler = require('./errorHandler'); 

module.exports.start = function (amqpConn) {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (errorHandler(amqpConn,err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
        // console.log('test');
      var m = offlinePubQueue.shift();
      if (!m) break;
        console.log('test -- ',m);
      publish(m[0], m[1], m[2]);
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content,options) {
    var opts = typeof options !== 'undefined' ? options : {};
    opts.persistent = true;
  try {
    pubChannel.publish(exchange, routingKey, content, opts,
       function(err, ok) {
         if (err) {
           console.error("[AMQP] publish", err);
           offlinePubQueue.push([exchange, routingKey, content]);
           pubChannel.connection.close();
         }
       });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

module.exports.publish = publish;