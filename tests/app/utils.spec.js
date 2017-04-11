var chai = require('chai'),
     sinon = require('sinon'),
     dynamoose = require('dynamoose'),
     utils = require('../../app/utils'),
     activitySchema = require('../../app/models/activity'),
     Activity = dynamoose.model('Activity', activitySchema),
     _ = require('underscore'),
     expect = chai.expect,
     utils = require('../../app/utils');

describe('app/utils', function () {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(dynamoose.models.Activity, 'update', function (e) {
               return null;
          });
     });
     afterEach(function () {
          stub.restore();
     });

     it('updateActivity should return null if there was no error', function () {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res === null).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(dynamoose.models.Activity, 'update', function (e) {
               return true;
          });
     });
     afterEach(function () {
          stub.restore();
     });

     it('updateActivity should return error if update fails', function () {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res !== null).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
     it('checkRequirements should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, 'page', res => {
               expect(res === false).to.equal(true);
               done();
          })
     });

     it('checkRequirements should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, 'noExisting', res => {
               expect(res === true).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'update');
       stub.yieldsTo(null);
  });
  afterEach(function () {
       stub.restore();
  });

   it('updateActivity should return null if passed', function (done) {
        utils.updateActivity(123, 'page', res => {
             expect(res.message).to.be.defined;
             done();
        })
   });

   it('updateActivity should return null if passed (no callback)', function () {
        utils.updateActivity(123, 'page');
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'update');
       stub.yieldsTo(true);
  });
  afterEach(function () {
       stub.restore();
  });

   it('updateActivity should return true if failed', function (done) {
        utils.updateActivity(123, 'page', res => {
             expect(res.message).to.be.defined;
             done();
        })
   });

   it('updateActivity should return true if failed  (no callback)', function () {
        utils.updateActivity(123, 'page');
   });

});
