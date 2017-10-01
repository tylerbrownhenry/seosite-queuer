var pubChannel = null;
var offlinePubQueue = [];
var errorHandler = require('./helpers/errorHandler');
var q = require('q');
var sh = require("shorthash");
/**
 * initilizes rabbitMQ publisher
 * @param  {object} amqpConn rabbitMq connection object
 */
module.exports.start = function (amqpConn) {
     amqpConn.createConfirmChannel(function (err, ch) {
          if (errorHandler(amqpConn, err)) {
               return;
          }
          ch.on("error", function (err) {
               //console.error("[AMQP] channel error", err.message);
          });
          ch.on("close", function () {
               //console.log("[AMQP] channel closed");
          });

          pubChannel = ch;
          while (true) {
               var m = offlinePubQueue.shift();
               if (!m) {
                    break;
               }
               publish(m[0], m[1], m[2]);
          }
     });
}

/**
 * method to publish a message, will queue messages internally if the connection is down and resend later
 * @param  {String} exchange   name of rabbitMQ exchange to publish to
 * @param  {String} routingKey
 * @param  {Object|String} content    content of message to be published
 * @param  {Object} options    rabbitMQ options for the message
 * @return {promise}           promise object
 */
function publish(exchange, routingKey, content, options) {
     //console.log('publish');
     var promise = q.defer();
     var opts = (typeof options !== 'undefined') ? options : {};
     opts.persistent = true;
     try {
          //console.log('publisher.js -> publish');
          pubChannel.publish(exchange, routingKey, content, opts, function (err, ok) {
               if (err) {
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                    promise.reject('error:offline:queue');
               } else {
                    promise.resolve();
               }
          });
     } catch (e) {
          offlinePubQueue.push([exchange, routingKey, content]);
          promise.reject('error:offline:queue');
     }
     return promise.promise;
}

module.exports.publish = publish;
