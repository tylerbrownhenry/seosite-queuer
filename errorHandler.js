module.exports = function closeOnErr(amqpConn,err) {
    // console.log('amqpConn',amqpConn,'err',err);
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}