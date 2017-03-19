module.exports = function closeOnErr(amqpConn, err) {
     if (!err) {
          return false;
     }
     amqpConn.close();
     return true;
}
