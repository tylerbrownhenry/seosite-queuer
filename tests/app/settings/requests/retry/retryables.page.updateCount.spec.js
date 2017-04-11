var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     dynamoose = require('dynamoose'),
     q = require('q'),
     retryables = require('../../../../../app/settings/requests/retry/retryables'),
     updateCount = require('../../../../../app/settings/requests/page/updateCount'),
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

describe('app/settings/requests/page/updateCount.js', function () {
     var stubUtils, stubRetry, stubPublish, promise = q.defer();
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, d) {
               d(true);
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         //console.log('publisher-', c);
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

     it('retries when fails', function (done) {
          var requestId = 'fakeHash';
          var updatedCount = 10;
          var newScan = {
               completedTime: "Sun Apr 09 2017 19:51:24 GMT-0400 (EDT)",
               redirects: 1,
               requestId: "1SsDhB",
               thumb: "this.jpg",
               uid: "17PmsI",
               resources: [],
               cached: false,
               duration: 1351,
               gzip: null,
               minified: null,
               start: "2017-04-09T23:51:15.394Z",
               status: 200,
               timings: {
                    blocked: 0,
                    connect: -1,
                    dns: -1,
                    receive: 393,
                    send: 0,
                    ssl: -1,
                    wait: 958
               },
               meta: {
                    description: {

                         element: '<meta name="description" content="The Work of Mario Jacome">',
                         found: true,
                         message: "Found",
                         text: "The Work of Mario Jacome"
                    },
                    h1: {
                         element: null,
                         found: false,
                         message: "error:meta:no:h1",
                         text: ""
                    },
                    h2: {
                         element: null,
                         found: false,
                         message: "error:meta:no:h2",
                         text: ""
                    },
                    title: {
                         found: true,
                         message: "Found",
                         text: "Mario Jacome | Designer & Illustrator"
                    }
               },
               links: [],
               grade: {
                    letter: "B",
                    message: "grade:b:message"
               },
               emails: [],
               type: "text/html; charset=UTF-8",
               url: {
                    resolvedUrl: "http://mariojacome.com/",
                    url: "http://www.mariojacome.com"
               }
          };
          updateCount(requestId, updatedCount, newScan).catch(function(msg){
            expect(msg.retryCommand === 'request:page:update:count').to.equal(true);
            expect(msg.retryOptions.putObject).to.be.defined;
            expect(msg.retryOptions.requestId).to.be.defined;
            expect(msg.retryOptions.updatedCount).to.be.defined;
            expect(msg.requestId).to.be.defined;
            expect(msg.message).to.be.defined;
            expect(msg.status).to.be.defined;
            expect(msg.statusType).to.be.defined;
            expect(msg.retry).to.equal(true);
            expect(msg.notify).to.equal(true);
                 retryConsumer({content:new Buffer(JSON.stringify(msg))}, {
                      ack: function (e) {
                           var content = JSON.parse(e.content);
                           expect(content.retryCommand === 'request:page:update:count').to.equal(true);
                           expect(content.requestId).to.be.defined;
                           expect(content.message).to.be.defined;
                           expect(content.status).to.be.defined;
                           expect(content.statusType).to.be.defined;
                           expect(content.retry).to.equal(true);
                           expect(content.notify).to.equal(true);
                           done();
                      }
                 });
          });
     });
});
