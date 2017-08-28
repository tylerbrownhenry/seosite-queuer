var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     dynamoose = require('dynamoose'),
     q = require('q'),
    //  summmary = require('../../../../../app/settings/requests/summary'),
    //  linkRequest = require('../../../../../app/settings/requests/link'),
     notify = require('../../../../../app/actions/notify').notify,
     publisher = require('../../../../../app/amqp-connections/publisher'),
     retryConsumer = require('../../../../../app/amqp-connections/consumers/retry'),
     utils = require('../../../../../app/utils'),
     sinon = require('sinon');

var input = {
     message: 'complete',
     url: "http://mariojacome.com/",
     linkId: "Z2pghrW",
     requestId: "Ze1hV0",
     uid: "17PmsI"
};

describe('app/settings/summary.js markedRequstAsFailed', function () {
     var stubUtils2, stubPublish2, prom = q.defer();
     beforeEach(function () {
          stubUtils2 = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });

          stubPublish2 = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         prom.resolve({
                              content: c
                         });
                         fn();
                         return {
                              catch: function () {

                              }
                         }
                    }
               }
          });
     });

     afterEach(function () {
          stubUtils2.restore();
          stubPublish2.restore();
     });

    //  it('retries when fails', function (done) {
          // this.timeout(1000);
          // input.promise = q.defer();
          // summmary.markedRequstAsFailed(input)
          // input.promise.promise.catch(function (msg) {
          //      expect(msg.retry === true).to.be.true;
          //      expect(msg.retryCommand === 'request.pageScan.markedRequstAsFailed').to.be.true;
          //      expect(msg.uid).to.be.defined;
          //      expect(msg.i_id).to.be.defined;
          //      expect(msg.message).to.be.defined;
          //      retryConsumer({
          //           content: new Buffer(JSON.stringify(msg))
          //      }, {
          //           ack: function (e) {
          //                     var content = JSON.parse(e.content);
          //                     expect(content.i_id !== null).to.equal(true);
          //                     expect(content.retryCommand === 'request.pageScan.markedRequstAsFailed').to.equal(true);
          //                     expect(content.retryOptions).to.be.defined;
          //                     expect(content.status).to.be.defined;
          //                     prom.promise.then(function(e){
          //                         var content = JSON.parse(e.content);
          //                         expect(content.isRetry).to.equal(true);
          //                         done();
          //                     });
          //           }
          //      });
          // });
    //  });
});
