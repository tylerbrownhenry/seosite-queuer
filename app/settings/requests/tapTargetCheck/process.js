var _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     Scan = require('../../../models/scan'),
     tapTargetCheck = require('../../../actions/tapTargetCheck/index');

function publish(data) {
     let input = data.input,
     url = utils.convertUrl(input.res.url.url);
     let _data = {
          test: (data && data.test) ? data.test: null,
          url: url,
          requestId: input.input.requestId,
          action: 'tapTargetCheck'
     };
     var buffer = new Buffer(JSON.stringify(_data));

     publisher.publish("", "actions", buffer).then(function (err) {
          /* Mark for retry */
     });
}

function process(_input) {
     let promise = _input.promise;
     let input = _input.input;
     var requestId = input.requestId;
     tapTargetCheck(input.url).then(function (results) {
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               tapTargetCheck: results,
          }, function (err) {
               if (err === null) {
                    promise.resolve({
                         requestId: requestId,
                         status: 'success',
                         message: 'success:tap:target:check',
                         data: results
                    });
               } else {
                    promise.reject({
                         data: err,
                         system: 'dynamo',
                         systemError: err,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         message: 'error:save:tap:target:check',
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
                                   tapTargetCheck: results
                              }
                         }
                    });
               }
          });
     }).catch((err) =>{
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               tapTargetCheck: {
                    err: 'failed:tap:target:check'
               }
          }, (e) => {
               if (e === null) {
                    promise.resolve({
                         requestId: requestId,
                         status: 'error',
                         message: 'failed:tap:target:check',
                         data: err
                    });
               } else {
                    promise.reject({
                         data: {
                           saving:e,
                           processing: err
                         },
                         system: 'dynamo',
                         systemError: e,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         message: 'error:save:tap:target:check',
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
                                   tapTargetCheck: {
                                        err: 'failed:tap:target:check'
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
