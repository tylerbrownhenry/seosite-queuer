var _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     Scan = require('../../../models/scan'),
     serverInfo = require('../../../actions/serverInfo/index');

function publish(data) {
     let input = data.input;
     let _data = {
          test: (data && data.test) ? data.test : null,
          url: utils.convertUrl(input.res.url.url),
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
          let updates = {
               serverInfo: results
          };
          utils.updateBy(Scan, {
               requestId: requestId
          }, updates, function (err) {
               if (err === null) {
                    promise.resolve({
                         requestId: requestId,
                         status: 'success',
                         message: 'success:serverInfo',
                         data: updates
                    });
               } else {
                    console.log('serverInfo err1', err);

                    promise.reject({
                         data: err,
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
          console.log('serverInfo err1', err);
          let updates = {
               serverInfo: 'failed:serverInfo'
          }
          utils.updateBy(Scan, {
               requestId: requestId
          }, updates, function (e) {
               if (e === null) {
                    console.log('serverInfo err-->', serverInfo);
                    promise.resolve({
                         requestId: requestId,
                         status: 'error',
                         message: 'failed:serverInfo',
                         data: updates
                    });
               } else {
                    promise.reject({
                         data: {
                              saving: e,
                              processing: err
                         },
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
     });
}

module.exports = {
     publish: publish,
     process: process
};
