var dynamoose = require('dynamoose');
var utils = require('../../utils');
var _ = require('underscore');
var q = require('q');
var settings = require("../../settings/requests");
var Capture = require('../../models/capture');
// var requestSchema = require("../../models/request");
/**
 * consumer of a capture request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processCapture(msg, ch) {
     var type = 'capture';
     var promise = q.defer();
     settings.types[type](msg).then((response) => {
          var updates = {
               status: true
          };
          console.log('response.captures',response.captures);
          _.each(response.captures, (capture) => {
               const name = capture.device.replace(' ','').toLowerCase();
               updates[name] = capture.url
          });
          utils.updateBy(Capture, {
               requestId: response.requestId,
          }, updates, (err, res) => {
               utils.retryUpdateRequest({
                    requestId: response.requestId
               }, promise);
               promise.promise.then(() => {
                    ch.ack(msg);
               }).catch(() => {
                    ch.ack(msg);
               });
          });
     }).catch((err) => {
          ch.ack(msg);
     })
}

module.exports = processCapture;
