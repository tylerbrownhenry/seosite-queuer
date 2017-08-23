var _ = require('underscore'),
     //  metaData = require('../../../models/metaData'),
     publisher = require('../../../amqp-connections/publisher'),
    //  sh = require("shorthash"),
     utils = require('../../../utils');
     Whois = require('../../../models/whois'),
     whois = require('../../../actions/whois/index');

function publish(input, res, newScan) {

     console.log('processWhois', input, res.url.url);
     var data = {
          url: res.url.url,
          requestId: input.requestId,
          action: 'whois'
     };
     var buffer = new Buffer(JSON.stringify(data));

     var _whois = new Whois(data);

     _whois.save(function () {
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

function processWhois(promise,input) {
     var requestId = input.requestId;
     whois(input.url).then(function (results) {
          utils.updateBy(Whois, {
               requestId: requestId
          }, {
               data: results,
               status: true
          }, function (err) {
            console.log('TEST');
            if(err === null){
               promise.resolve({
                     requestId: requestId,
                    status: 'success',
                    data: 'Action completed'
               });
             }else {
               promise.reject({
                    system: 'dynamo',
                    systemError: err,
                    statusType: 'failed',
                    status: 'error',
                    source: '--',
                    message: 'error:save:whois',
                    notify: true,
                    retry: true,
                    i_id: input.requestId,
                    retryCommand: 'request.whois.process',
                    retryOptions: {
                         input: input
                    }
               });
             }
          });
     }).catch(function (err) {
          utils.updateBy(Whois, {
               requestId: requestId
          }, {
               data: {err:'failed:whois'},
               status: false
          }, function (err) {
            if(err === null){
               promise.resolve({
                     requestId: requestId,
                    status: 'success',
                    data: 'Action completed'
               });
             }else {
               promise.reject({
                    system: 'dynamo',
                    systemError: err,
                    statusType: 'failed',
                    status: 'error',
                    source: '--',
                    message: 'error:save:whois',
                    notify: true,
                    retry: true,
                    i_id: input.requestId,
                    retryCommand: 'request.whois.process',
                    retryOptions: {
                         input: input
                    }
               });
             }
          });
     })
}

module.exports = {
     publish: publish,
     process: processWhois
};
