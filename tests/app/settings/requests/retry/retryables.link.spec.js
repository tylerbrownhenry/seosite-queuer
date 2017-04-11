var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     dynamoose = require('dynamoose'),
     q = require('q'),
     retryables = require('../../../../../app/settings/requests/retry/retryables'),
     linkRequest = require('../../../../../app/settings/requests/link'),
     notify = require('../../../../../app/actions/notify'),
     publisher = require('../../../../../app/amqp-connections/publisher'),
     retryConsumer = require('../../../../../app/amqp-connections/consumers/retry'),
     utils = require('../../../../../app/utils'),
     sinon = require('sinon');

var link = {
     broken: null,
     brokenReason: null,
     broken_link_checker: true,
     excluded: null,
     excludedReason: null,
     html: {
          attrName: "href",
          attrs: {
               href: "http://twitter.com/intent/tweet?text=Home http://mariojacome.com/",
               target: "_blank"
          },
          base: null,
          index: 38,
          location: {
               col: 10,
               endOffset: 38420,
               line: 345,
               startOffset: 38348
          },
          offsetIndex: null,
          selector: "html > body > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > a:nth-child(1)",
          tag: '<a href="http://twitter.com/intent/tweet?text=Home http://mariojacome.com/" target="_blank">',
          tagName: "a",
          text: ""
     },
     http: {
          cached: null,
          response: null
     },
     internal: null,
     resolved: false,
     samePage: null,
     base: {

     },
     url: {
          original: "http://twitter.com/intent/tweet?text=Home http://mariojacome.com/",
          parsed: {
               extra: {
                    protocolTruncated: false
               }
          },
          redirected: null,
          resolved: null,
     }
};

var input = {
     _link: link,
     baseUrl: "http://mariojacome.com/",
     linkId: "Z2pghrW",
     requestId: "Ze1hV0",
     uid: "17PmsI"
};
var data = {
     page: '/dashboard'
};

describe('app/settings/requests/link.js 2', function () {
     var stubUtils2, stubPublish2, prom = q.defer();
     beforeEach(function () {
          stubUtils2 = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });

          stubPublish2 = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         console.log('publisher-', c);
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

     it('retry completeLink when fails 0', function (done) {

          this.timeout(1000);
          linkRequest.init({
               content: new Buffer(JSON.stringify(input))
          }).catch(function (msg) {
               expect(msg.retry === true).to.be.true;
               expect(msg.retryCommand === 'request.link.completeLink').to.be.true;
               expect(msg.uid).to.be.defined;
               expect(msg.i_id).to.be.defined;
               expect(msg.message).to.be.defined;
               retryConsumer({
                    content: new Buffer(JSON.stringify(msg))
               }, {
                    ack: function (e) {
                         console.log('e', e, 'promise--');
                         console.log('---dfdfds');

                         prom.promise.then(function (msg) {
                              var content = JSON.parse(msg.content);
                              console.log('content--', content);
                              expect(content.page !== null).to.equal(true);
                              expect(content.i_id !== null).to.equal(true);
                              expect(content.isRetry === true).to.equal(true);
                              expect(content.retryCommand === 'request.link.completeLink').to.equal(true);
                              expect(content.retryOptions).to.be.defined;
                              expect(content.status).to.be.defined;
                              done();
                         }).catch(function (e) {
                              console.log('test', e)
                         });
                    }
               });
          });
     });
});

describe('app/settings/requests/link.js 2', function () {
     var stubUtils, stubPublish, promise;
     beforeEach(function () {
          promise = q.defer();
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         console.log('publisher-', c);
                         promise.resolve({
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
          stubUtils.restore();
          stubPublish.restore();
     });

     it('retry completeRequest when fails 1', function (done) {
          linkRequest.completeRequest(promise, input, data);
          promise.promise.catch(function (msg) {
               expect(msg.requestId !== null).to.equal(true);
               expect(msg.status !== null).to.equal(true);
               expect(msg.retry).to.equal(true);
               expect(msg.retryCommand).to.be.defined;
               expect(msg.retryOptions).to.be.defined;
               retryConsumer({
                    content: new Buffer(JSON.stringify(msg))
               }, {
                    ack: function (e) {
                         var e = JSON.parse(e.content);
                         expect(e.requestId !== null).to.equal(true);
                         expect(e.status !== null).to.equal(true);
                         expect(e.retry).to.equal(true);
                         expect(e.retryCommand).to.be.defined;
                         expect(e.retryOptions).to.be.defined;
                         done();
                    }
               });
          });
     });
});

describe('app/settings/requests/link.js update request fail 2', function () {
     var stubUtils, wentOnce = false,stubPublish, promise = q.defer();
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               if (typeof b.requestId !== 'undefined' && wentOnce === false) {
                    cb(true);
                    wentOnce = true;
               } else {
                    cb(null);
               }
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         promise.resolve({
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
          stubUtils.restore();
          stubPublish.restore();
     });

     it('retry completeLink when fails 3', function (done) {
          linkRequest.completeLink(promise, input, {});
          promise.promise.catch(function (e) {
               expect(e.requestId !== null).to.equal(true);
               expect(e.i_id !== null).to.equal(true);
               expect(e.status !== null).to.equal(true);
               expect(e.message !== null).to.equal(true);
               expect(e.retry).to.equal(true);
               expect(e.retryCommand).to.be.defined;
               expect(e.retryOptions).to.be.defined;
               retryConsumer({
                    content: new Buffer(JSON.stringify(e))
               }, {
                    ack: function (e) {
                         var e = JSON.parse(e.content);
                         expect(e.requestId !== null).to.equal(true);
                         expect(e.status !== null).to.equal(true);
                         expect(e.retry).to.equal(true);
                         expect(e.retryCommand).to.be.defined;
                         expect(e.retryOptions).to.be.defined;
                         done();
                    }
               });
          });
     });
});
