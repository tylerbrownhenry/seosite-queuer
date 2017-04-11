var chai = require('chai'),
     expect = chai.expect,
     publisher = require('../../../../app/amqp-connections/publisher'),
     retry = require('../../../../app/settings/requests/retry'),
     utils = require('../../../../app/utils'),
     sinon = require('sinon');

describe('app/settings/requests/retry.js originalIssueResolved:', function (done) {
     it('database always true', function () {
          expect(retry.originalIssueResolved('database')).to.equal(true);
     });
     it('nothing is always true', function () {
          expect(retry.originalIssueResolved()).to.equal(true);
     });
});

describe('app/settings/requests/retry.js publish:', function (done) {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(publisher, 'publish', function (msg) {
               return {
                    then: function (fn) {
                         fn(msg);
                         return {
                              catch: function () {

                              }
                         }
                    }
               }
          });
     });
     afterEach(function () {
          stub.restore();
     });
     it('fails with missing requirements', function (done) {
          retry.publish().catch(function (e) {
               expect(e).to.equal(false);
               done();
          })
     });
     it('passes with requirements', function (done) {
          retry.publish({
               'i_id': 'fakeHash',
               'retryCommand': 'fake:name',
               'retryOptions': {}
          }).then(function () {
               done();
          });
     });
     it('passes with requirements and deletes promise', function (done) {
          retry.publish({
               'i_id': 'fakeHash',
               'retryCommand': 'fake:name',
               'retryOptions': {
                    'promise': true
               }
          }).then(function (res) {
               done();
          });
     });
});

describe('app/settings/requests/retry.js publish:failed:', function (done) {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(publisher, 'publish', function (msg) {
               //console.log('retry msg', msg);
               return {
                    then: function (fn) {
                         return {
                              catch: function (_fn) {
                                   return _fn();
                              }
                         }
                    }
               }
          });
     });
     afterEach(function () {
          stub.restore();
     });
     it('fails for some reason', function (done) {
          retry.publish({
               'i_id': 'fakeHash',
               'retryCommand': 'fake:name',
               'retryOptions': {
                    'promise': true
               }
          }).catch(function (res) {
               //console.log('FAILED',res);
               expect(res.retry === true).to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/retry.js init 2', function (done) {
     var stub2, stubUtils2;
     beforeEach(function () {
          stub2 = sinon.stub(publisher, 'publish', function (msg) {
               //console.log('retry msg', msg);
               return {
                    then: function (fn) {
                         return {
                              catch: function (_fn) {
                                   return _fn();
                              }
                         }
                    }
               }
          });

          stubUtils2 = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
     });
     afterEach(function () {
          stub2.restore();
          stubUtils2.restore();
     });
     it('succeeds if input is empty (will not retry)', function (done) {
          retry.init().then(function (res) {
               expect(typeof res === 'undefined').to.equal(true);
               done();
          });
     });

     it('succeeds if input is not parsable', function (done) {
          retry.init({
               isNotAString: true
          }).then(function (res) {
               expect(typeof res === 'undefined').to.equal(true);
               done();
          });
     });

     it('succeeds if input is parsable but missing requirements', function (done) {
          retry.init({
               content: new Buffer(JSON.stringify({
                    nothingWeNeed: true
               }))
          }).then(function (res) {
               expect(typeof res === 'undefined').to.equal(true);
               done();
          });
     });

     it('succeeds if input has all requirements but type fails  (will retry)', function (done) {
          retry.init({
               content: new Buffer(JSON.stringify({
                    'i_id': 'fakeHash',
                    'statusType': 'failsForTesting',
                    'retryCommand': 'fake:name',
                    'retryOptions': {
                         'promise': true
                    }
               }))
          }).catch(function (res) {
               expect(typeof res !== 'undefined').to.equal(true);
               done();
          });
     });
     it('succeeds if input has all requirements but is not a retryable command (will not retry)', function (done) {
          retry.init({
               content: new Buffer(JSON.stringify({
                    'i_id': 'fakeHash',
                    'retryCommand': 'fake:name',
                    'retryOptions': {
                         'promise': true
                    }
               }))
          }).then(function (res) {
               expect(typeof res === 'undefined').to.equal(true);
               done();
          });
     });

     it('passes all requirements and succeeds at retry', function (done) {
          retry.init({
               content: new Buffer(JSON.stringify({
                    'i_id': 'fakeHash',
                    'retryCommand': 'utils.updateBy',
                    'retryOptions': {
                         'promise': true,
                         'model': 'Request',
                         'input': {
                              'requestId': 'fakeHash'
                         },
                         'update': {
                              '$PUT': {
                                   'key': 'value'
                              }
                         }
                    }
               }))
          }).then(function (res) {
               expect(typeof res === 'undefined').to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/retry.js passes and attempts retry but fails', function (done) {
     var stub, stubUtils;
     beforeEach(function () {
          stub = sinon.stub(publisher, 'publish', function (msg) {
               //console.log('retry msg', msg);
               return {
                    then: function (fn) {
                         return {
                              catch: function (_fn) {
                                   return _fn();
                              }
                         }
                    }
               }
          });

          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });
     });
     afterEach(function () {
          stub.restore();
          stubUtils.restore();
     });
     it('passes all requirements and fails at retry', function (done) {
          retry.init({
               content: new Buffer(JSON.stringify({
                    'i_id': 'fakeHash',
                    'retryCommand': 'utils.updateBy',
                    'retryOptions': {
                         'promise': true,
                         'model': 'Request',
                         'input': {
                              'requestId': 'fakeHash'
                         },
                         'update': {
                              '$PUT': {
                                   'key': 'value'
                              }
                         }
                    }
               }))
          }).catch(function (res) {
            //console.log('res',res);
               expect(typeof res !== 'undefined').to.equal(true);
               done();
          });
     });
});
