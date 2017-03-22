function log(msg) {
    console.log('Error in: ',msg.where,'input: ', msg.with, ' error: ',msg.error);
}
module.exports = log;
