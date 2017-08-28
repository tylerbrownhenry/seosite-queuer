let _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     W3Cvalidate = require('../../../models/W3Cvalidation'),
     validateW3C = require('../../../actions/validateW3C/index');

function publish(data) {
     let html = data.html,
          parse = data.parse,
          requestId = data.requestId;
     if (parse === true && html && html.documentElement && html.documentElement.innerHTML) {
          html = html.documentElement.innerHTML;
     }
     const _data = {
          test: (data && data.test) ? data.test : null,
          html: html,
          requestId: requestId,
          action: 'validateW3C'
     };

     const buffer = new Buffer(JSON.stringify(_data));
     const w3cvalidate = new W3Cvalidate(_data);

     w3cvalidate.save(() => {
          /** Handle Save Error **/
          publisher.publish("", "actions", buffer).then(function (err) {
               /** Handle Error **/
          });
     });
}

/**
 * runs a w3c validation test and saves the results
 * @param  {Object} promise
 * @param  {Object} input
 */
function process(_input) {
     let promise = _input.promise,
          input = _input.input,
          requestId = input.requestId;
     try {

          validateW3C(input.html, input.parse).then(function (results) {
               utils.updateBy(W3Cvalidate, {
                    requestId: requestId
               }, {
                    data: results,
                    status: true
               }, function (err) {
                    if (err === null) {
                         promise.resolve({
                              requestId: requestId,
                              status: 'success',
                              data: 'Action completed'
                         });
                    } else {
                         promise.reject({
                              system: 'dynamo',
                              systemError: err,
                              statusType: 'failed',
                              status: 'error',
                              source: '--',
                              message: 'error:save:validateW3C',
                              notify: false,
                              retry: true,
                              i_id: input.requestId,
                              retryCommand: 'utils.updateBy',
                              retryOptions: {
                                   model: 'W3Cvalidation',
                                   input: {
                                        requestId: requestId
                                   },
                                   update: {
                                        data: results,
                                        status: true
                                   }
                              }
                         });
                    }
               });
          }).catch(function (err) {
               utils.updateBy(W3Cvalidate, {
                    requestId: requestId
               }, {
                    data: {
                         err: 'failed:validateW3C'
                    },
                    status: false
               }, function (err) {
                    if (err === null) {
                         promise.resolve({
                              requestId: requestId,
                              status: 'success',
                              data: 'Action completed'
                         });
                    } else {
                         promise.reject({
                              system: 'dynamo',
                              systemError: err,
                              statusType: 'failed',
                              status: 'error',
                              source: '--',
                              message: 'error:save:validateW3C',
                              notify: false,
                              retry: true,
                              i_id: input.requestId,
                              retryCommand: 'utils.updateBy',
                              retryOptions: {
                                   model: 'W3Cvalidation',
                                   input: {
                                        requestId: requestId
                                   },
                                   update: {
                                        data: {
                                             err: 'failed:validateW3C'
                                        },
                                        status: false
                                   }
                              }
                         });
                    }
               });
          })
     } catch (e) {
          console.log('error', e);
     }
}

module.exports = {
     publish: publish,
     process: process
};
