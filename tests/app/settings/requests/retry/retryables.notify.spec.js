var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     dynamoose = require('dynamoose'),
     q = require('q'),
     retryables = require('../../../../../app/settings/requests/retry/retryables'),
     notify = require('../../../../../app/actions/notify'),
     publisher = require('../../../../../app/amqp-connections/publisher'),
     retryConsumer = require('../../../../../app/amqp-connections/consumers/retry'),
     utils = require('../../../../../app/utils'),
     sinon = require('sinon');

var input = {
     uid: 'fakeHash',
     status: 'success',
     i_id: 'fakeHash',
     statusType: 'complete',
     type: 'page',
     message: 'Scan is complete',
     page: '/dashboard'
}

describe('app/settings/requests/retry/retryables.js', function () {
     var stubUtils, stubRetry, stubPublish, promise = q.defer();
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'saveModel', function (a, cb) {
               cb(true);
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         //console.log('publisher-', c);
                         promise.resolve({content:c});
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
          stubUtils.restore();
          stubPublish.restore();
     });

     it('notify retries when fails to save model', function (done) {
          promise = q.defer();
          notify(input);
          promise.promise.then(function (msg) {
               var input = JSON.parse(msg.content);
               expect(input.retryCommand === 'notify').to.equal(true);
               expect(input.uid).to.be.defined;
               retryConsumer(msg, {
                    ack: function (e) {
                      var content = JSON.parse(e.content);
                      expect(content.retryCommand === 'notify').to.equal(true);
                      done();
                    }
               });
          });
     });
});



// describe('app/settings/requests/meta/process.js: without meta data', function () {
// it('will show 4 meta data errors', function (done) {
//     _.each(_.keys(retryables),function(key){
//       var promise = q.defer();
//       retryables[key](promise,{
//           input:{},
//           i_id:{},
//           res:{},
//           link:{},
//           data:{},
//           update:{},
//           type:{},
//           messageId:{},
//           updatedCount:{},
//           commands:{}
//       }).then(function(){
//
//       })
//     });
//
//      done();
// });
// });
