var chai = require('chai');
    sinon = require('sinon'),
     _ = require('underscore'),
     expect = chai.expect;
     utils = require('./../../app/utils');
    //  Request = require('./../../../../app/models/index').request,
    //  User = require('./../../../../app/models/user'),
    //  dynamoose = require('dynamoose');

describe('app/utils', function () {
    //  var stub;
    //  beforeEach(function () {
          // console.log('_.keys(dynamoose)', _.keys(dynamoose.models.User));
          // dynamoose.defaults.waitForActive = false;
          // stub = sinon.stub(dynamoose.models.User, 'scan');
          // stub.yields(null, {
              //  uid: 'yes',
              //  toke: 'test'
          // })
          // .returns({
          //      scan: function (data, callback) {
          //           return callback('success');
          //      },
          //      query: function (data, callback) {
          //           return callback('success');
          //      }
          // });
    //  });

    //  afterEach(function () {
    //       stub.restore();
    //  })

     //  batchPut: function (data, callback) {
     //       return callback('success');
     //  },
     //  get: function (options, callback) {
    //  console.log('callback');
     // return callback();
     //  }
     // });

     // var User = require('../server/models/user');

    //  it('pageScanRequest() should fail when called with no options', function () {
    //       pageScanRequest().catch(err => {
    //            expect(err.status).to.equal('error');
    //            expect(err._debug).to.equal('checkOptions');
    //       })
    //  });
     //
     it('utils should be defined', function () {
    //       pageScanRequest({
    //            nothing: 'useful'
    //       }).catch(err => {
    //            console.log('pageScanRequest');
               expect(typeof utils.deleteUser).to.equal('function');
              //  expect(typeof utils).to.notEqual(undefined);
    //            expect(err._debug).to.notEqual('checkOptions');
    //       })
     });

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

     //  it('should update the count', function (done) {
     //       app.put('Example2', exampleSchema, function (done) {
     //            expect(1).to.equal(1);
     //       });
     //       done();
     //  });

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
});

// describe('App', function() {

// });
