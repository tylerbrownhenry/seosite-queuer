var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     dynamoose = require('dynamoose'),
     q = require('q'),
     retryables = require('../../../../../app/settings/requests/retry/retryables'),
     processLink = require('../../../../../app/settings/requests/links/process'),
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

describe('app/settings/requests/links/process.js', function () {
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

     it('process links saveUpdatedCount retries when fails', function (done) {
          var requestId = 'fakeHash';
          var updatedCount = 10;
          var commands = [];
          var linkObj = {};
          var input = {
               page: "/dashboard",
               promise: promise,
               requestDate: 1491781842439,
               requestId: "1SsDhB",
               uid: "17PmsI",
               url: "http://www.mariojacome.com"
          };
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
          processLink.saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input);

          promise.promise.catch(function (msg) {
               expect(msg.retryCommand === 'settings.request.links.updateCount').to.equal(true);
               expect(msg.uid).to.be.defined;
               expect(msg.requestId).to.be.defined;
               expect(msg.message).to.be.defined;
               expect(msg.status).to.be.defined;
               expect(msg.statusType).to.be.defined;
               expect(msg.retry).to.equal(true);
               expect(msg.notify).to.equal(true);
               retryConsumer({content:new Buffer(JSON.stringify(msg))}, {
                    ack: function (e) {
                         var content = JSON.parse(e.content);
                         expect(content.retryCommand === 'settings.request.links.updateCount').to.equal(true);
                         expect(content.uid).to.be.defined;
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


describe('app/settings/requests/links/process.js', function () {
     var stubUtils, stubRetry, stubPublish, promise = q.defer();

     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, d) {
               d(null);
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         fn(true);
                         return {
                              catch: function (fn) {

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

     it('process links saveUpdatedCount retries when link commands fails', function (done) {
          var requestId = 'fakeHash';
          var updatedCount = 10;
          var commands = [{
            _id:'fakeHash'
          }];
          var linkObj = {
            'fakeHash':{
              resolvedUrl:'http:www.test.com',
              _id:'fakeHash',
              resolvedUrl:'http:www.test.com'
            }
          };
          var input = {
               page: "/dashboard",
               promise: promise,
               requestDate: 1491781842439,
               requestId: "1SsDhB",
               uid: "17PmsI",
               url: "http://www.mariojacome.com"
          };
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
          processLink.saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input);

          promise.promise.catch(function (content) {
            //console.log('test');
                // var content = JSON.parse(msg.content);
                //console.log('content',content);

               expect(content.retryCommand === 'publish:link').to.equal(true);
               expect(content.uid).to.be.defined;
               expect(content.requestId).to.be.defined;
               expect(content.message).to.be.defined;
               expect(content.status).to.be.defined;
               expect(content.statusType).to.be.defined;
               expect(content.retry).to.equal(true);
               expect(content.retryOptions.buffer).to.be.defined;
               expect(content.retryOptions.messageId).to.be.defined;
               expect(content.retryOptions.type).to.be.defined;
               expect(content.retryOptions.uid).to.be.defined;
               retryConsumer({content:new Buffer(JSON.stringify(content))}, {
                    ack: function (e) {
                         var content = JSON.parse(e.content);
                         expect(content.retryCommand === 'publish:link').to.equal(true);
                         expect(content.uid).to.be.defined;
                         expect(content.requestId).to.be.defined;
                         expect(content.message).to.be.defined;
                         expect(content.status).to.be.defined;
                         expect(content.statusType).to.be.defined;
                         expect(content.retry).to.equal(true);
                         done();
                    }
               });
          });
     });
});





describe('app/settings/requests/links/process.js', function () {
     var stubUtils, stubRetry, stubPublish, promise = q.defer();

     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'batchPut', function (a, b, c) {
               c(true);
          });
          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, d) {
                         fn(true);
                         return {
                              catch: function (fn) {

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

     it('init retries when batchPut fails', function (done) {
          var requestId = 'fakeHash';
          var updatedCount = 10;
          var commands = [{
            _id:'fakeHash'
          }];
          var linkObj = {
            'fakeHash':{
              resolvedUrl:'http:www.test.com',
              _id:'fakeHash',
              resolvedUrl:'http:www.test.com'
            }
          };
          var input = {
               page: "/dashboard",
               promise: promise,
               requestDate: 1491781842439,
               requestId: "1SsDhB",
               uid: "17PmsI",
               url: "http://www.mariojacome.com"
          };
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
          var res = {
               links: [{
                    html: {
                         tagName: 'a'
                    },
                    url: {
                         original: "test"
                    }
               }]
          }
          processLink.init(input,res,'fakeHash',newScan).catch(function(content){


          // promise.promise.catch(function (content) {
            //console.log('test');
                // var content = JSON.parse(msg.content);
                //console.log('content',content);

               expect(content.retryCommand === 'settings.request.links.process.init').to.equal(true);
               expect(content.uid).to.be.defined;
               expect(content.requestId).to.be.defined;
               expect(content.message).to.be.defined;
               expect(content.status).to.be.defined;
               expect(content.statusType).to.be.defined;
               expect(content.retry).to.equal(true);
               expect(content.retryOptions.res).to.be.defined;
               expect(content.retryOptions.requestId).to.be.defined;
               expect(content.retryOptions.newScan).to.be.defined;
               expect(content.retryOptions.input).to.be.defined;
               retryConsumer({content:new Buffer(JSON.stringify(content))}, {
                    ack: function (e) {
                      // console.log('e',e);
                         var content = JSON.parse(e.content);
                        //  console.log('content',content);
                         expect(content.retryCommand === 'settings.request.links.process.init').to.equal(true);
                         done();
                    }
               });
          // });
          //         done();
          });
     });
});
