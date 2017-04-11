var chai = require('chai'),
     expect = chai.expect,
     utils = require('../../../../app/utils'),
     sniff = require('../../../../app/actions/sniff/index'),
     Request = require('../../../../app/models/request'),
     phantom = require('node-phantom-simple'),
     publisher = require('../../../../app/amqp-connections/publisher'),
     dynamoose = require('dynamoose'),
     q = require('q'),
     _ = require('underscore'),
     summaryRequest = require('../../../../app/settings/requests/summary').init,
     processHar = require('../../../../app/settings/requests/summary').processHar,
     markedRequstAsFailed = require('../../../../app/settings/requests/summary').markedRequstAsFailed,
     resolve = require('../../../../app/settings/requests/summary').resolve,
     reject = require('../../../../app/settings/requests/summary').reject,
     sinon = require('sinon');


var harResponseData = {
          url:{
            resolvedUrl:'test'
          },
          log: {
               entries: [{
                         request: {
                              url: 'http://whatever.com'
                         },
                         response: {
                              headers: [{
                                        name: 'Content-Encoding',
                                        value: 'gzip'
                                   },
                                   {
                                        name: 'Content-Type',
                                        value: 'application/x-javascript'
                                   },
                                   {
                                        name: "Cache-Control",
                                        value: true
                                   }
                              ]
                         }
                    },
                    {
                         request: {
                              url: "http://www.uncached.unecoded.invalidcontenttype.com.index.js"
                         },
                         response: {
                              headers: [{
                                        name: 'Content-Encoding',
                                        value: 'fakenonesense'
                                   },
                                   {
                                        name: 'Content-Type',
                                        value: 'fakenonesense'
                                   },
                                   {
                                        name: "Cache-Control",
                                        value: false
                                   }
                              ]
                         }
                    },
                    {
                         nothing: 'useful'
                    }
               ]
          },
          links: [{
            url:{
              resolvedUrl:'someinthg'
            }
          }]
     }
var harResponse =  {
        then: function (fn) {
             //console.log()
             fn(_.clone(harResponseData));
             return {
               catch: function(){

               }
             }
        }
   };

describe('app/settings/requests/summary.js invalid because:', function () {
     it('no input', function (done) {
          summaryRequest().catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':empty object input', function (done) {
          summaryRequest({}).catch(function (response) {
              //console.log('response--?',response);
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':string input', function (done) {
          summaryRequest('notastringifiedobject').catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':unpasrsable string input', function (done) {
          summaryRequest({
               content: 'notastringifiedobject'
          }).catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':object missing required paramaters ', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({}))
          }).catch(function (response) {
            //console.log('response',response);
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':object missing url and uid paramater ', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    requestId: 'fakehash'
               }))
          }).catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':object missing url and requestId paramater ', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    uid: 'fakeUid'
               }))
          }).catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':object missing uid and requestId paramater ', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com'
               }))
          }).catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':object missing option paramater ', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakeUid',
                    uid: 'fakeHash'
               }))
          }).catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/summary.js with valid parameters', function () {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(dynamoose.models.Request, 'update');
          stub.yieldsTo(true);
     });
     afterEach(function () {
          stub.restore();
     });
     it('summaryRequest fail to save request sends back message to retry', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {}
               }))
          }).catch(function (response) {
               expect(response.retry === true).to.equal(true);
               expect(response.status === 'error').to.equal(true);
               expect(response.message === true).to.not.be.undefined;
               expect(response.page === true).to.not.be.undefined;
               expect(response.uid === true).to.not.be.undefined;
               expect(response.status === true).to.not.be.undefined;
               expect(response.statusType === true).to.not.be.undefined;
               expect(response.requestId === true).to.not.be.undefined;
               done();
          });
     });
});

describe('app/settings/requests/summary.js valid request setActive success', function () {
     var stubHar, stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
          stubHar = sinon.stub(sniff, 'har');
          stubHar.returns({
               then: function (fn) {
                    return {
                         catch: function (fn) {
                              fn({
                                   retry: true
                              });
                         }
                    }
               }
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubHar.restore();
     });
     it('failing har should return retry', function (done) {
       this.timeout(1000);

          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {}
               }))
          }).catch(function (response) {
               expect(response.retry).to.equal(true);
               expect(response.notify).to.equal(true);
               expect(response.message).to.not.be.undefined;
               expect(response.page).to.not.be.undefined;
               expect(response.uid).to.not.be.undefined;
               expect(response.status).to.not.be.undefined;
               expect(response.statusType).to.not.be.undefined;
               expect(response.requestId).to.not.be.undefined;
               done();
          });
     });
});

describe('app/settings/requests/summary.js markedRequstAsFailed', function () {
     var stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb({
                    error: true
               });
          });
     });
     afterEach(function () {
          stubUtils.restore();
     });
     it('failing should reject promise but mark to retry', function (done) {
          markedRequstAsFailed({
               requestId: 'fakehash',
               promise: {
                    reject: function (response) {
                      //console.log('test');
                         expect(response.retry).to.equal(true);
                         done();
                    }
               }
          });
     });
});

describe('app/settings/requests/summary.js reject / resolve', function () {
     var stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb({
                    error: true
               });
          });
     });
     afterEach(function () {
          stubUtils.restore();
     });
     it('reject with softTry should emit message with softRetry', function (done) {
          reject({
               reject: function (msg) {
                    expect(msg.softRetry === true).to.equal(true);
                    done();
               }
          }, {
               retry: true,
               softRetry: true
          });
     });
     it('reject without softTry should not emit message with softRetry', function (done) {
          reject({
               reject: function (msg) {
                    expect(msg.softRetry === true).to.equal(false);
                    done();
               }
          }, {
               retry: true,
               notify: true
          });
     });
     it('no input to reject should not retry', function (done) {
          reject({
               reject: function (msg) {
                    expect(msg.retry === true).to.equal(false);
                    done();
               }
          });
     });
     it('no input to resolve should not emit notify', function (done) {
          resolve({
               resolve: function (msg) {
                    expect(msg.notify === true).to.equal(false);
                    done();
               }
          });
     });
     it('resolve with input notify should emit notify', function (done) {
          resolve({
               resolve: function (msg) {
                    expect(msg.notify === true).to.equal(true);
                    done();
               }
          }, {
               notify: true
          });
     });
});

describe('app/settings/requests/summary.js markedRequstAsFailed', function () {
     var stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb({
                    error: true
               });
          });
     });
     afterEach(function () {
          stubUtils.restore();
     });
     it('failing should reject promise but mark to retry', function (done) {
         this.timeout(1000);
          markedRequstAsFailed({
               requestId: 'fakehash',
               promise: {
                    reject: function (response) {
                         expect(response.retry).to.equal(true);
                         done();
                    }
               }
          });
     });
});

describe('app/settings/requests/summary.js retrying a valid request setActive success', function () {
     var stubHar, stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
          stubHar = sinon.stub(sniff, 'har');
          stubHar.returns({
               then: function (fn) {
                    return {
                         catch: function (fn) {
                              fn({
                                   retry: true
                              });
                         }
                    }
               }
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubHar.restore();
     });
     it('with failing har should not return retry', function (done) {
       this.timeout(1000);
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    isRetry: true,
                    options: {}
               }))
          }).catch(function (response) {
               expect(response.message).to.not.be.undefined;
               expect(response.retry).to.be.undefined;
               expect(response.page).to.not.be.undefined;
               expect(response.uid).to.not.be.undefined;
               expect(response.status).to.not.be.undefined;
               expect(response.statusType).to.not.be.undefined;
               expect(response.requestId).to.not.be.undefined;
               expect(response.notify).to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/summary.js retrying a valid request setActive success', function () {
     var stubHar3, stubScan3, stubUtils3;
     beforeEach(function () {
          stubUtils3 = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               return cb(null);
          });

          stubScan3 = sinon.stub(utils, 'saveScan', function (a, cb) {
               return cb(true);
          });

          stubHar3 = sinon.stub(sniff, 'har', function () {
               return {
                    then: function (fn) {
                         fn(_.clone(harResponseData));
                         return {
                              catch: function () {
                                   //console.log('failed');
                              }
                         }
                    }
               }
          });
     });
     afterEach(function () {
          stubUtils3.restore();
          stubHar3.restore();
          stubScan3.restore();
     });

     it('with successful har.....', function (done) {
       this.timeout(1000);
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {}
               }))
          }).catch(function (response) {
            //console.log('TEST',response);
               expect(response.retry).to.equal(true);
               expect(response.notify).to.equal(true);
               expect(response.message).to.not.be.undefined;
               expect(response.retryOptions).to.not.be.undefined;
               expect(response.retryCommand).to.not.be.undefined;
               expect(response.page).to.not.be.undefined;
               expect(response.uid).to.not.be.undefined;
               expect(response.status).to.not.be.undefined;
               expect(response.statusType).to.not.be.undefined;
               expect(response.requestId).to.not.be.undefined;
               done();
          });
     });
});

describe('app/settings/requests/summary.js retrying a valid request with save resources and save security set', function () {
     var stubHar, stubScan, stubUtils, stubBatchPut,stubPublish;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });

          stubScan = sinon.stub(utils, 'saveScan', function (a, cb) {
               cb(null);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                         fn(true);
                    }
               }
          });

          stubBatchPut = sinon.stub(utils, 'batchPut', function (a, e, cb) {
               //console.log('batchPut');
               cb(null, []);
          });

          stubHar = sinon.stub(sniff, 'har', function () {
              return harResponse;
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubHar.restore();
          stubScan.restore();
          stubPublish.restore();
          stubBatchPut.restore();
     });
     it('with successful har but failed publish', function (done) {
       this.timeout(1000);
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {
                         save: {
                              resources: true,
                              security: true,
                              links: true
                         }
                    }
               }))
          }).catch(function (response) {
               expect(response.retry).to.equal(true);
               expect(response.retryOptions).to.not.be.undefined;
               expect(response.retryCommand).to.not.be.undefined;
               expect(response.page).to.not.be.undefined;
               expect(response.uid).to.not.be.undefined;
               expect(response.status).to.not.be.undefined;
               expect(response.statusType).to.not.be.undefined;
               expect(response.requestId).to.not.be.undefined;
               done();
          });
     });
});



describe('app/settings/requests/summary.js process har with save resources and save security', function () {
     var stubHar, stubScan, stubUtils, stubBatchPut,stubPublish;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });

          stubScan = sinon.stub(utils, 'saveScan', function (a, cb) {
               cb(null);
          });

          stubBatchPut = sinon.stub(utils, 'batchPut', function (a, e, cb) {
               cb(null, []);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                      fn(null);
                    }
               }
          });
          stubHar = sinon.stub(sniff, 'har', function () {
              return {
                      then: function (fn) {
                           //console.log('har har har');
                           fn(_.clone(harResponseData));
                           return {
                             catch:function(fun){
                               return(fn);
                             }
                           }
                      }
                 };
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubPublish.restore();
          stubHar.restore();
          stubScan.restore();
          stubBatchPut.restore();
     });

     it('with successful har...', function (done) {
       this.timeout(1000);

          var promise = q.defer();
          processHar({
                    promise:  promise,
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {
                         save: {
                              resources: true,
                              security: true,
                              links: true
                         }
                    }
               },_.clone(harResponseData))
               .then(function(r){
                 expect(r.status === 'success').to.equal(true);
                 done();
               });
     });

});




describe('app/settings/requests/summary.js process har with not saving links', function () {
     var stubHar, stubScan, stubUtils, stubBatchPut,stubPublish;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });

          stubScan = sinon.stub(utils, 'saveScan', function (a, cb) {
               cb(null);
          });

          stubBatchPut = sinon.stub(utils, 'batchPut', function (a, e, cb) {
               //console.log('batchPut');
               cb(null, []);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                        //  resBuffer = {
                        //       content: c
                        //  };
                        //  fn(c);
                         return {
                              catch: function (fn) {
                                fn(c)
                              }
                         }
                    }
               }
          });
          stubHar = sinon.stub(sniff, 'har', function () {
              return {
                      then: function (fn) {
                           //console.log('har har har');
                           fn(_.clone(harResponseData));
                           return {
                             catch:function(fun){
                               return(fn);
                             }
                           }
                      }
                 };
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubPublish.restore();
          stubHar.restore();
          stubScan.restore();
          stubBatchPut.restore();
     });

     it('not saving links completing scan', function (done) {
          var promise = q.defer();
          processHar({
                    promise:  promise,
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {
                         save: {
                              resources: false,
                              security: false,
                              links: false
                         }
                    }
               },_.clone(harResponseData));
              //  .then(function(){
                //  //console.log('2',promise.promise.then);
              //  })
               promise.promise.then(function(e){
                 //console.log('e',e,e.statusType === 'complete',e.notify);
                expect(e.statusType === 'complete').to.equal(true);
                expect(e.notify).to.equal(true);
                // expect(e.retryCommand).to.be.defined;
                // expect(e.retryOptions).to.be.defined;
                done();
              });
     });

});




describe('app/settings/requests/summary.js process har with not saving links', function () {
     var stubHar, stubScan, stubUtils, stubBatchPut,stubPublish;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
            //console.log('a',a,'b',b,'c',c,'cb',cb);
            if(c.$PUT.status === 'complete'){
              cb(true);
            } else {
              cb(null);
            }
          });

          stubScan = sinon.stub(utils, 'saveScan', function (a, cb) {
               cb(null);
          });

          stubBatchPut = sinon.stub(utils, 'batchPut', function (a, e, cb) {
               //console.log('batchPut');
               cb(null, []);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                        //  resBuffer = {
                        //       content: c
                        //  };
                        //  fn(c);
                         return {
                              catch: function (fn) {
                                fn(c)
                              }
                         }
                    }
               }
          });
          stubHar = sinon.stub(sniff, 'har', function () {
              return {
                      then: function (fn) {
                           //console.log('har har har');
                           fn(_.clone(harResponseData));
                           return {
                             catch:function(fun){
                               return(fn);
                             }
                           }
                      }
                 };
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubPublish.restore();
          stubHar.restore();
          stubScan.restore();
          stubBatchPut.restore();
     });

     it('not saving links completing scan', function (done) {
          var promise = q.defer();
          processHar({
                    promise:  promise,
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {
                         save: {
                              resources: false,
                              security: false,
                              links: false
                         }
                    }
               },_.clone(harResponseData));
              //  .then(function(){
                //  //console.log('2',promise.promise.then);
              //  })
               promise.promise.catch(function(e){
                 //console.log('e!!',e);
                expect(e.statusType === 'complete').to.equal(true);
                expect(e.notify).to.equal(true);
                done();
              });
     });

});


describe('app/settings/requests/summary.js process har', function () {
     var stubHar, stubScan, stubUtils, stubBatchPut,stubPublish;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
              cb(null);
          });

          stubScan = sinon.stub(utils, 'saveScan', function (a, cb) {
               cb(null);
          });

          stubBatchPut = sinon.stub(utils, 'batchPut', function (a, e, cb) {
               cb(null, []);
          });

          stubPublish = sinon.stub(publisher, 'publish', function (a, b, c) {
               return {
                    then: function (fn, a) {
                      //console.log('fn',fn,'a',a);
                         fn(null);
                         return {
                              catch: function (fn) {}
                         }
                    }
               }
          });
          stubHar = sinon.stub(sniff, 'har', function () {
              return {
                      then: function (fn) {
                           fn(_.clone(harResponseData));
                      }
                 };
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubPublish.restore();
          stubHar.restore();
          stubScan.restore();
          stubBatchPut.restore();
     });

     it('saving links after completing scan', function (done) {
          var promise = q.defer();
          processHar({
                    promise:  promise,
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options: {
                         save: {
                              resources: false,
                              security: false,
                              links: true
                         }
                    }
               },_.clone(harResponseData));
               promise.promise.then(function(e){
                 //console.log('!-e-!',e);
                expect(e.statusType === 'update').to.equal(true);
                expect(e.notify).to.equal(true);
                done();
              });
     });

});
// summaryRequest(new Buffer(JSON.stringify({}))).catch(function(response){
// //console.log('test');
// //  expect(response.status === 'error').to.equal(true);
// // });
// var buffer = new Buffer(JSON.stringify({
//      content: {}
// }));
// summaryRequest(buffer).catch(function (response) {
//      //console.log('tesssst', response.typeof);
//      expect(false).to.equal(true);
//      done();
//  expect(response.status === 'error').to.equal(true);
//  expect(response.typeof === 'Buffer').to.equal(true);
//  expect(response.typeof === 'Error').to.equal(true);
// });
// summaryRequest(new Buffer(JSON.stringify({content:{requestId:'somethinge'}}))).catch(function(response){
//  expect(response.status === 'error').to.equal(true);
// });
// summaryRequest(new Buffer(JSON.stringify({content:{url:'something else'}}))).catch(function(response){
//  expect(response.status === 'error').to.equal(true);
// });
//  expect(typeof utils).to.notEqual(undefined);
//            expect(err._debug).to.notEqual('checkOptions');
//       })
// });

//  it('pageScanRequest() should pass with enough options', function () {
//       //console.log('three');
//       pageScanRequest({
//            uid: '1234',
//            token: '1234',
//            url: 'this.url',
//            options: {}
//       }).catch(err => {
//            //console.log('pageScanRequest');
//            expect(err.status).to.equal('error');
//            expect(err._debug).to.equal('checkRequirements');
//            expect(err._debug).to.notEqual('checkOptions');
//       })
//  });

//  var exampleSchema = new dynamoose.Schema({
//       id: {
//            type: String,
//            hashKey: true
//       }
//  }, {
//       throughput: {
//            read: 15,
//            write: 5
//       },
//       timestamps: {
//            createdAt: 'createdTs',
//            updatedAt: 'updatedTs'
//       }
//  });

// it('should update the count', function (done) {
//     //  app.put('Example2', exampleSchema, function (done) {
//           expect(1).to.equal(1);
//      });
//      done();
// });

/*
Failing when starting to test mongoose*/
//  it('pageScanRequest() should fail when options passed but user is invalid', function () {
//
//       var test = pageScanRequest({
//            options: {},
//            uid: 'test',
//            url: 'www.test.com',
//            token: 'fakeToken'
//       }).catch(err => {
//            //console.log('err', err);
//            expect(err.status).to.equal('error');
//            expect(err._debug).to.equal('checkRequirements');
//            expect(err._debug).to.notEqual('checkOptions');
//            expect(err.message.length).to.notEqual(3);
//       }).finally(err => {
//            //console.log('eee', err);
//       })
//       //console.log('test', test);
//
//  });

//  it('getSubtotal() should return the sum of the price * quantity for all items', function () {
//       var cartSummary = new CartSummary([{
//                 id: 1,
//                 quantity: 4,
//                 price: 50
//            },
//            {
//                 id: 2,
//                 quantity: 2,
//                 price: 30
//            },
//            {
//                 id: 3,
//                 quantity: 1,
//                 price: 40
//            }
//       ]);
//       expect(cartSummary.getSubtotal()).to.equal(300);
//  });
//
//  it('getTax() should execute the callback function with the tax amount', function (done) {
//       var cartSummary = new CartSummary([{
//                 id: 1,
//                 quantity: 4,
//                 price: 50
//            },
//            {
//                 id: 2,
//                 quantity: 2,
//                 price: 30
//            },
//            {
//                 id: 3,
//                 quantity: 1,
//                 price: 40
//            }
//       ]);
//
//       cartSummary.getTax('NY', function (taxAmount) {
//            expect(taxAmount).to.equal(30);
//            expect(tax.calculate.getCall(0).args[0]).to.equal(300);
//            expect(tax.calculate.getCall(0).args[1]).to.equal('NY');
//            done();
//       });
//  });
// });

// describe('App', function() {

// });
