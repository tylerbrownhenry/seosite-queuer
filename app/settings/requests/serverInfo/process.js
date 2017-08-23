var _ = require('underscore'),
     //  metaData = require('../../../models/metaData'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils');
Scan = require('../../../models/scan'),
     serverInfo = require('../../../actions/serverInfo/index');

function publish(data) {
     let input = data.input;
     console.log('input res', input.res.url);
     let _data = {
          url: input.res.url.url,
          requestId: input.input.requestId,
          action: 'serverInfo'
     };
     var buffer = new Buffer(JSON.stringify(_data));

     publisher.publish("", "actions", buffer).then(function (err) {});
}

function process(_input) {
     let promise = _input.promise;
     let input = _input.input;
     var requestId = input.requestId;
     serverInfo(input.url).then(function (results) {
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               serverInfo: results
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
                         message: 'error:save:serverInfo',
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
                                   serverInfo: results
                              }
                         }
                    });
               }
          });
     }).catch(function (err) {
          utils.updateBy(Scan, {
               requestId: requestId
          }, {
               serverInfo: 'failed:serverInfo'
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
                         message: 'error:save:serverInfo',
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
                                   serverInfo: 'failed:serverInfo'
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
