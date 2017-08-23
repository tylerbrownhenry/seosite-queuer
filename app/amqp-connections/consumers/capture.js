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
     console.log('consumers/capture.js msg', msg);
     settings.types[type](msg).then(function (response) {
          var updates = {
               status: true
          };
          _.each(response.captures, function (capture) {
               updates[capture.device] = capture.url
          })
          utils.updateBy(Capture, {
               requestId: response.requestId,
          }, updates, function (err, res) {
               utils.retryUpdateRequest({
                    requestId: response.requestId
               }, promise);
               promise.promise.then(function () {
                    ch.ack(msg);
               }).catch(() => {
                    ch.ack(msg);
               });
          });
     }).catch(function (err) {
          console.log('consumers/capture.js error happened making capture', err);
          ch.ack(msg);
     })
}

module.exports = processCapture;
