var _ = require('underscore'),
     //  metaData = require('../../../models/metaData'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils');
SoftwareSummary = require('../../../models/softwareSummary'),
     softwareSummary = require('../../../actions/softwareSummary/index');

function publish(data) {
     let input = data.input,
          newScan = data.newScan;
     let _data = {
          url: input.res.url.url,
          requestId: input.requestId,
          action: 'softwareSummary'
     };
     var buffer = new Buffer(JSON.stringify(_data));
     var softwareSummary = new SoftwareSummary(_data);

     softwareSummary.save(function () {
          //      type: input.cleanType,
          //      hostname: input.hostname,
          //      _id: input._id
          // }));
          publisher.publish("", "actions", buffer).then(function (err) {
               /* Mark for retry */
          });
     })
     return newScan;
}

function process(_input) {
     let promise = _input.promise;
     let input = _input.input;
     var requestId = input.requestId;
     softwareSummary(input.url).then(function (results) {
          utils.updateBy(SoftwareSummary, {
               requestId: requestId
          }, {
               summary: results,
               status: true
          }, function (err) {
               console.log('TEST');
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
                         message: 'error:save:software:summary',
                         notify: false,
                         retry: true,
                         i_id: input.requestId,
                         retryCommand: 'utils.updateBy',
                         retryOptions: {
                              model: 'SoftwareSummary',
                              input: {
                                   requestId: requestId
                              },
                              update: {
                                   summary: results,
                                   status: true
                              }
                         }
                    });
               }
          });
     }).catch(function (err) {
          utils.updateBy(SoftwareSummary, {
               requestId: requestId
          }, {
               summary: {
                    err: 'failed:software:summary'
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
                         message: 'error:save:software:summary',
                         notify: false,
                         retry: true,
                         i_id: input.requestId,
                         retryCommand: 'utils.updateBy',
                         retryOptions: {
                              model: 'SoftwareSummary',
                              input: {
                                   requestId: requestId
                              },
                              update: {
                                   summary: {
                                        err: 'failed:software:summary'
                                   },
                                   status: false
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
