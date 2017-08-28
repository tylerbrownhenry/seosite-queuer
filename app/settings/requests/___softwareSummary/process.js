var _ = require('underscore'),
     publisher = require('../../../amqp-connections/publisher'),
     sh = require("shorthash"),
     utils = require('../../../utils');
    //  SoftwareSummary = require('../../../models/softwareSummary'),
    //  softwareSummary = require('../../../actions/softwareSummary/index');

function publish(data) {
     let input = data.input,
          newScan = data.newScan;
     let _data = {
          test: (data && data.test) ? data.test : null,
          url: utils.convertUrl(input.res.url.url),
          requestId: input.input.requestId,
          action: 'softwareSummary'
     };
     var buffer = new Buffer(JSON.stringify(_data));
    //  var softwareSummary = new SoftwareSummary(_data);

    //  softwareSummary.save(function () {
          publisher.publish("", "actions", buffer).then(function (err) {
               /* Mark for retry */
          });
    //  })
     return newScan;
}

function process(_input) {
     let promise = _input.promise,
          input = _input.input,
          requestId = input.requestId;
          console.log('requestId',requestId,'input',input);
          softwareSummary(input.url).then(function (results) {
            console.log('softwareSummary',results);
          });
}

module.exports = {
     publish: publish,
     process: process
};
