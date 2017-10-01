const publisher = require("../../../amqp-connections/publisher"),
     Capture = require('../../../models/capture'),
     capture = require("../../../actions/mobileCaptures/index").doit,
     q = require("q");

/**
 * perform screen capture
 * @param  {Object} data msg from queue
 */
function process(_input) {
     let deferred = q.defer(),
          input = _input.params,
          requestId = input.requestId,
          url = input.url,
          sizes = input.sizes;
     capture(url, requestId, sizes).then(function (res) {
          var updates = {
               status: true
          };
          _.each(res.captures, (capture) => {
               const name = capture.device.replace(' ', '').toLowerCase();
               updates[name] = capture.url
          });
          deferred.resolve(updates);
     }).catch(function (err) {
          deferred.resolve(err);
     });
     return deferred.promise;
}

function init(data) {
     let deferred = q.defer(),
          input = data.params,
          capture = new Capture({
               requestId: input.requestId
          });
     capture.save(function (err) {
          if (err) {
               deferred.reject();
          } else {
               deferred.resolve();
          }
     });
     return deferred.promise;
}

module.exports = {
     init: init,
     process: process
}
