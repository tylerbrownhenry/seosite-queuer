var chai = require('chai'),
     expect = chai.expect,
     publisher = require('../../../../app/amqp-connections/publisher'),
     retry = require('../../../../app/settings/requests/retry'),
    //  notify = require('../../../../app/actions/notify').notify,
     dynamoose = require('dynamoose'),
     linkSchema = require('../../../../app/models/link'),
     Link = dynamoose.model('Link', linkSchema),
     sinon = require('sinon'),
     /* Files that call retry */
     _notify = require('../../../../app/actions/notify').notify,
     _retry = require('../../../../app/amqp-connections/consumers/retry'),
     /* Also calls notify */
     _summary = require('../../../../app/amqp-connections/consumers/summary'),
     /* Also calls notify */
     /* Files that call notify (And subsequently calls retry) */
     _linksRequest = require('../../../../app/settings/requests/link').init,
     _retryables = require('../../../../app/settings/requests/retry/retryables'),
     _summaryRequest = require('../../../../app/settings/requests/summary'),
     utils = require('../../../../app/utils'),
     _consumeLink = require('../../../../app/amqp-connections/consumers/link');

describe('retry init should fail if', function (done) {

     it('no message is provided', function (done) {
          retry.init().then(function (e) {
            //console.log('test');
               expect(e === undefined).to.equal(true);
               done();
          });

     });
});

describe('calledRetry linkRequest with failed publisher', function (done) {
     var stubPublish;
     beforeEach(function () {
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                         // resBuffer = {
                         //  content: c
                         // };
                         // fn(c);
                         return {
                              catch: function (fn) {
                                   return fn(true);
                              }
                         }
                    }
               }
          });
     });

     afterEach(function () {
          stubPublish.restore();
     });

     it('should retry', function (done) {
          expect(retry.originalIssueResolved()).to.equal(true);
          expect(retry.originalIssueResolved('failsForTesting')).to.equal(false);
          retry.publish().catch(function (res) {
               expect(res === false).to.equal(true);
          });
          retry.publish({
               promise: true,
               i_id: true,
               retryCommand: true,
               retryOptions: {
                    promise: true
               }
          }).catch(function (res) {
               expect(res.retry).to.equal(true);
               done();
          });
     });
});

describe('calledRetry linkRequest', function (done) {
     /**
      * This attempts to replicate the complex structure of a failing message,
      * broadcasting to queue, and then retrying the message that failed,
      * and it failing again, only to be sent back to the queue
      */
     var stubUpdateBy, stubFindBy, stubNotify, stubPublish, channel, buffer, resBuffer, stubRetry;
     beforeEach(function () {
          channel = {
               ack: function () {},
               nack: function () {}
          };
          sinon.spy(channel, 'ack');
          sinon.spy(channel, 'nack');
          stubUpdateBy = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });
          stubFindBy = sinon.stub(utils, 'findBy', function (a, b, cb) {
               cb(null);
          });

          stubRetry = sinon.stub(retry, 'init', function (msg, ch) {
               return {
                    then: function (fn, a) {
                         // resBuffer = c;
                         fn(a);
                         return {
                              catch: function (fn) {

                              }
                         }
                    }
               }
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                         resBuffer = {
                              content: c
                         };
                         fn(c);
                         return {
                              catch: function (fn) {

                              }
                         }
                    }
               }
          });
          buffer = new Buffer(JSON.stringify({
               url: 'http://myurl.com/index.js',
               requestId: 'fakeHash',
               linkId: 'fakeHash',
               uid: 'fakeHash',
               baseUrl: 'http://myurl.com',
               _link: {
                    html: {
                         base: null
                    },
                    base: {
                         original: null
                    },
                    url: {
                         original: 'http:www.mysite.com'
                    }
               }
          }));
     });

     afterEach(function () {
          channel.ack.restore();
          channel.nack.restore();

          stubUpdateBy.restore();
          stubFindBy.restore();
          stubRetry.restore();
          stubPublish.restore();
     });

     it('check promise returns true with all requirements', function (done) {
          retry.publish({
               promise: true,
               i_id: true,
               retryCommand: true,
               retryOptions: {
                    promise: true
               }
          }).then(function (res) {
               expect(res !== undefined).to.equal(true);
               done();
          });
     });

     it('retry to be correctly formatted', function (done) {
          // retry.publish().catch(function (res) {
          //      expect(res === false).to.equal(true);
          // });
          // retry.publish().catch(function (res) {
          //      expect(res === false).to.equal(true);
          // });
          _linksRequest({
               content: buffer
          }).catch(function (e) {
               //console.log('22--> made it :()', e);
               expect(e.retry === true);

               done();
          });
     });

     it('_consumeLink should response with retry', function (done) {
          // expect(retry.originalIssueResolved()).to.equal(true);
          _consumeLink({
               content: buffer
          }, channel).catch(function (e) {
               //  //console.log('--!!> made it :()', e);
               //  //console.log('resBuffer', resBuffer);
               //  _retry -->amqp-connections/consumers/retry
               //  requests/retry.js --> init
               //  -->amqp-connections/helpers/preFlight
               _retry(resBuffer, {
                    ack: function (res) {
                         //console.log('HERE', res);
                         expect(res.retry = true).to.equal(true);
                         done();
                    }
               });
               expect(e.retry === true).to.equal(true);
               expect(channel.ack.calledOnce).to.equal(true);
               expect(typeof e.i_id !== 'undefined').to.equal(true);
               expect(typeof e.retryCommand !== 'undefined').to.equal(true);
               expect(typeof e.retryOptions !== 'undefined').to.equal(true);
          });
     });

});
