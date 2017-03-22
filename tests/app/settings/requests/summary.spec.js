var chai = require('chai');
expect = chai.expect,
     utils = require('../../../../app/utils'),
     sniff = require('../../../../app/actions/sniff/index'),
     Request = require('../../../../app/models/request'),
     phantom = require('node-phantom-simple'),
     dynamoose = require('dynamoose'),
     summaryRequest = require('../../../../app/settings/requests/summary').init,
     sinon = require('sinon');

describe('app/settings/requests/summary.js invalid because:', function () {
return
     it('no input', function (done) {
          summaryRequest().catch(function (response) {
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
     it(':empty object input', function (done) {
          summaryRequest({}).catch(function (response) {
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
  return
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
                    options:{}
               }))
          }).catch(function (response) {
               expect(response.retry === true).to.equal(true);
               expect(response.status === 'error').to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/summary.js valid request setActive success', function () {
     var stubHar,stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils,'updateBy',function(a,b,c,cb){
              cb(null);
          });
          stubHar = sinon.stub(sniff, 'har');
          stubHar.returns({
            then:function(fn){
              return {
                catch:function(fn){
                  fn({retry:true});
              }}
            }
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubHar.restore();
     });
     it('failing har should return retry', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    options:{}
               }))
          }).catch(function (response) {
               expect(response.retry === true).to.equal(true);
               expect(response.notify === true).to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/summary.js retrying a valid request setActive success', function () {
     var stubHar,stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils,'updateBy',function(a,b,c,cb){
              cb(null);
          });
          stubHar = sinon.stub(sniff, 'har');
          stubHar.returns({
            then:function(fn){
              return {
                catch:function(fn){
                  fn({retry:true});
              }}
            }
          });
     });
     afterEach(function () {
          stubUtils.restore();
          stubHar.restore();
     });
     it('failing har should not return retry', function (done) {
          summaryRequest({
               content: new Buffer(JSON.stringify({
                    url: 'http://www.myurl.com',
                    requestId: 'fakehash',
                    uid: 'fakeUid',
                    isRetry:true,
                    options:{}
               }))
          }).catch(function (response) {
               expect(response.retry !== true).to.equal(true);
               expect(response.notify === true).to.equal(true);
               done();
          });
     });
});



// summaryRequest(new Buffer(JSON.stringify({}))).catch(function(response){
// console.log('test');
// //  expect(response.status === 'error').to.equal(true);
// // });
// var buffer = new Buffer(JSON.stringify({
//      content: {}
// }));
// summaryRequest(buffer).catch(function (response) {
//      console.log('tesssst', response.typeof);
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
//       console.log('three');
//       pageScanRequest({
//            uid: '1234',
//            token: '1234',
//            url: 'this.url',
//            options: {}
//       }).catch(err => {
//            console.log('pageScanRequest');
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
//            console.log('err', err);
//            expect(err.status).to.equal('error');
//            expect(err._debug).to.equal('checkRequirements');
//            expect(err._debug).to.notEqual('checkOptions');
//            expect(err.message.length).to.notEqual(3);
//       }).finally(err => {
//            console.log('eee', err);
//       })
//       console.log('test', test);
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
