var _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     Scan = require('../../../models/scan'),
     checkSSL = require('../../../actions/checkSSL/index');

function publish(data) {
     let input = data.input,
          res = data.res,
          newScan = data.newScan;
     let _data = {
          test: (data && data.test) ? data.test : null,
          url: utils.convertUrl(input.res.url.url),
          requestId: input.input.requestId,
          action: 'checkSSL'
     };
     var buffer = new Buffer(JSON.stringify(_data));

     publisher.publish("", "actions", buffer).then(function (err) {});
     return newScan;
}

function process(_input) {
     let promise = _input.promise;
     let input = _input.input;
     var requestId = input.requestId;
     console.log('TEST3', input);;
     checkSSL(input.url).then(function (results) {
          console.log('TEST', results);;
          let updates = {
               sslEnabled: results
          }
          utils.updateBy(Scan, {
               requestId: requestId
          }, updates, function (err) {
               console.log('TEST', err);
               if (err === null) {
                    promise.resolve({
                         requestId: requestId,
                         status: 'success',
                         message: 'success:checkSSL',
                         data: updates
                    });
               } else {

                    promise.reject({
                         data: {
                            saving: err
                         },
                         system: 'dynamo',
                         systemError: err,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         message: 'error:save:checkSSL',
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
                                   sslEnabled: results
                              }
                         }
                    });
               }
          });
     }).catch(function (err) {
          let updates = {
               sslEnabled: 'failed:checkSSL'
          };
          utils.updateBy(Scan, {
               requestId: requestId
          }, updates, function (e) {
               if (e === null) {
                    promise.resolve({
                         requestId: requestId,
                         status: 'error',
                         message: 'error:save:checkSSL',
                         data: updates
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
                         message: 'error:save:checkSSL',
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
                                   sslEnabled: 'failed:checkSSL'
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
