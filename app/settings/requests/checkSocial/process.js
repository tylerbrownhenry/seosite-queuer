let _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     Scan = require('../../../models/scan'),
     checkSocial = require('../../../actions/checkSocial/index');

function publish(data) {
     let input = data.input,
          _data = {
               url: input.res.url.url,
               socialInfo: input.res.socialInfo,
               requestId: input.input.requestId,
               action: 'checkSocial'
          };
     let buffer = new Buffer(JSON.stringify(_data));
     publisher.publish("", "actions", buffer).then((err) => {});
}

function process(_input) {
     let promise = _input.promise,
          input = _input.input,
          requestId = input.requestId;
     checkSocial(input.url, input.socialInfo.twitterUsername).then((results) => {
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               social: {
                    results: results,
                    onPage: input.socialInfo
               }
          }, (err) => {
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
                         message: 'error:save:checkSocial',
                         notify: false,
                         retry: true,
                         i_id: input.requestId,
                         retryCommand: 'utils.updateBy',
                         retryOptions: {
                              model: 'Scan',
                              input: {
                                   requestId: requestId
                              },
                              update: {
                                   social: {
                                        results: results,
                                        onPage: input.socialInfo
                                   }
                              }
                         }
                    });
               }
          });
     }).catch((err) => {
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               social: 'failed:checkSocial'
          }, (err) => {
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
                         message: 'error:save:checkSocial',
                         notify: false,
                         retry: true,
                         i_id: input.requestId,
                         retryCommand: 'utils.updateBy',
                         retryOptions: {
                              model: 'Scan',
                              input: {
                                   requestId: requestId
                              },
                              update: {
                                   social: {
                                        results: results,
                                        onPage: input.socialInfo
                                   }
                              }
                         }
                    });
               }
          });
     })
}

module.exports = {
     publish: publish,
     process: process
};
