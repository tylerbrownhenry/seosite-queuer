var chai = require('chai'),
     sinon = require('sinon'),
     dynamoose = require('dynamoose'),
     utils = require('../../app/utils'),
     activitySchema = require('../../app/models/activity'),
     Activity = dynamoose.model('Activity', activitySchema),

     _ = require('underscore'),
     expect = chai.expect;
utils = require('../../app/utils');
//  Request = require('./../../../../app/models/index').request,
//  User = require('./../../../../app/models/user'),
//  dynamoose = require('dynamoose');

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
