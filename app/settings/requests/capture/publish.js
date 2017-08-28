const publisher = require("../../../amqp-connections/publisher"),
     Capture = require('../../../models/capture');

/**
 * publishes the message to get the screen captures for this request
 * @param  {Object} input page request object
 * @param  {Object} res   parsed information from url
 */
function publishCaptures(input, res) {
     if (input.options && input.options.save && input.options.save.captures === true) {

          var capture = new Capture({
               requestId: input.requestId
          });

          capture.save(function () {
               publisher.publish("", "capture", new Buffer(JSON.stringify({
                    requestId: input.requestId,
                    uid: input.uid,
                    url: res.url.url,
                    sizes: ['iPhone 6', 'iPad landscape', '1920x1080']
               })), {
                    url: res.url.url,
                    requestId: input.requestId
               }).then(function (err, data) {
                    console.log('Capture published');
               }).catch(function (err) {
                    console.log('Error publishing capture');
               });
          })
     }
}

module.exports = publishCaptures;
