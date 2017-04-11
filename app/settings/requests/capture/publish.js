var publisher = require("../../../amqp-connections/publisher");
/**
 * publishes the message to get the screen captures for this request
 * @param  {Object} input page request object
 * @param  {Object} res   parsed information from url
 */
function publishCaptures(input, res) {
     if (input.options && input.options.save && input.options.save.captures === true) {
          publisher.publish("", "capture", new Buffer(JSON.stringify({
               url: res.url.resolvedUrl,
               requestId: requestId,
               uid: input.uid,
               sizes: ['1920x1080']
               // sizes: ['1920x1080','1600x1200','1400x900','1024x768','800x600','420x360']
          })), {
               url: res.url.resolvedUrl,
               requestId: requestId
          }).then(function (err, data) {
               //console.log('Capture published');
          }).catch(function (err) {
               //console.log('Error publishing capture');
          });
     }
     return;
}

module.exports = publishCaptures;
