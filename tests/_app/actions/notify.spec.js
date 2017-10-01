let chai = require('chai'),
     sinon = require('sinon'),
     q = require('q'),
     rewire = require('rewire'),
     //  dynamoose = rewire('dynamoose'),
     notify = rewire('../../../app/actions/notify'),
     //  Update = rewire('../../../app/models/update'),
    //  publisher = rewire('../../../app/amqp-connections/publisher'),
     _ = require('underscore'),
     expect = chai.expect;

describe('app/actions/notify', () => {
     describe('notify - success', () => {
          var input,
          storage ={},
          callback = function(e,assertion){

          };

          beforeEach(function () {
               input = {
                    requestId: '',
                    statusType: '',
                    uid: '',
                    i_id: '',
                    message: '',
                    source: '',
                    type: '',
                    status: ''
               };
               notify.__set__('Update', function (r) {
                    return {
                         save: function (f) {
                              f(null)
                         }
                    };
               });
          });

          it('if saved successfully should publish a message', () => {
               notify.notify(input);
          });

     });

     describe('notify - failure', () => {
          var input,
          storage ={},
          callback = function(e,assertion){

          };

          beforeEach(function () {
               input = {
                    requestId: '',
                    statusType: '',
                    uid: '',
                    i_id: '',
                    message: '',
                    source: '',
                    type: '',
                    status: ''
               };
               notify.__set__('Update', function (r) {
                    return {
                         save: function (f) {
                              f(new Error())
                         }
                    };
               });

               notify.__set__('retry', function (r) {
                    return {
                         publish: function () {

                         }
                    };
               });
          });

          it('should send to retry on error', () => {
               notify.notify(input);
          });

     });
});
