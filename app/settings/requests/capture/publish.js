var publisher = require("../../../amqp-connections/publisher");
var Capture = require('../../../models/capture');
/**
 * publishes the message to get the screen captures for this request
 * @param  {Object} input page request object
 * @param  {Object} res   parsed information from url
 */
function publishCaptures(input, res) {
     if (input.options && input.options.save && input.options.save.captures === true) {
          console.log('publishCaptures', input, 'res', res);
          // var MobileCapture = new Capture({
          //      size: '420x360',
          //      requestId: input.requestId
          // });
          // var TabletCapture = new Capture({
          //      size: '1024x768',
          //      requestId: input.requestId
          // });
          var DesktopCapture = new Capture({
              //  size: '1024x768',
               requestId: input.requestId
          });

          // MobileCapture.save(function () {
              //  TabletCapture.save(function () {
                    DesktopCapture.save(function () {
                         publisher.publish("", "capture", new Buffer(JSON.stringify({
                              requestId: input.requestId,
                              uid: input.uid,
                              url: res.url.url, /* Url to capture */
                              sizes: ['iPhone 6','iPad landscape']
                         })), {
                              url: res.url.url, /* Url to capture */
                              requestId: input.requestId
                         }).then(function (err, data) {
                              console.log('Capture published');
                         }).catch(function (err) {
                              console.log('Error publishing capture');
                         });
                    })
              //  })
          // })
     }
     return;
}

module.exports = publishCaptures;
