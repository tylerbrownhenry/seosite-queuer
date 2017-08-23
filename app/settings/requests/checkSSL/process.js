var _ = require('underscore'),
     //  metaData = require('../../../models/metaData'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils');
Scan = require('../../../models/scan'),
     checkSSL = require('../../../actions/checkSSL/index');

function publish(data) {
     let input = data.input,
          res = data.res,
          newScan = data.newScan;
     let _data = {
          url: input.res.url.url,
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
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               sslEnabled: results
          }, function (err) {
               console.log('TEST', err);
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
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               sslEnabled: 'failed:checkSSL'
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
