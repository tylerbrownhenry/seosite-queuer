return
let chai = require('chai'),
     expect = chai.expect,
     sinon = require('sinon'),
     q = require('q'),
     rewire = require('rewire'),
     //  dynamoose = rewire('dynamoose'),
     page = rewire('../../../../app/amqp-connections/consumers/pageScan');
//  User = {},
//  Scan = {},
//  Activity = rewire('../../../app/models/activity'),
//  _ = require('underscore'),

describe('app/amqp-connections/consumers/pageScan', () => {
     let buffer, ch;
     beforeEach(function () {
          page.__set__('processAction', (a, b, c, d) => {
               console.log('test--->');
               let deferred = q.defer();
               deferred.resolve();
               return deferred.promise;
          });
          page.__set__('retry', (a, b, c, d) => {

          });
          let input = {
               requestId: 123,
               uid: 123,
               source: 'dashboard',
               type: 'page:scan'
          };
          buffer = {
                    content: new Buffer(JSON.stringify(input))
               },
               ch = {
                    ack: function () {

                    },
                    nack: function () {

                    }
               };
     });

     describe('successful equals 0', () => {
          beforeEach(function () {
               page.__set__('utils', {
                    completeRequest: (a, b, c) => {
                         a.reject({});
                    },
                    findBy: (a, b, c) => {
                         c(null, {
                              processes: 0
                         })
                    }
               });
          });
          it('should ack message', (done) => {
               page(buffer, {
                    ack: function (res) {
                         expect(res).to.equal(true);
                         done();
                    }
               }, 0)
          });
     });

     describe('success less than 0', () => {
       beforeEach(function () {

          page.__set__('utils', {
               completeRequest: (a, b, c) => {
                    a.reject({});
               },
               findBy: (a, b, c) => {
                    c(null, {
                         processes: -1
                    })
               }
          });
          });
          it('should ack message', (done) => {
               page(buffer, {
                    ack: function (res) {
                         expect(res).to.equal(true);
                         done();
                    }
               }, 0)
          });
     });

     describe('success more than 0', () => {
       beforeEach(function () {
            page.__set__('utils', {
             completeRequest: (a, b, c) => {
                  a.reject({});
             },
             findBy: (a, b, c) => {
                  c(null, {
                       processes: 1
                  })
             }
        });
          });
          it('should not ack message', (done) => {
               var ack = false;
               page(buffer, {
                    ack: function (res) {
                         ack = true;
                    }
               }, 0)
               expect(ack).to.equal(false);
               done();
          });
     });

});

// var processAction = require("../../settings/requests").types.pageScan,
//      notify = require('../../actions/notify').notify,
//      retry = require('../../settings/requests/retry').publish,
//      actions = require('../../settings/requests/actions'),
//      utils = require('../../utils'),
//      requestSchema = require('../../models/request'),
//      Request = dynamoose.model('Request', requestSchema),
//      q = require('q');
//
//
// function pollRequest(input,ch,timeOut){
//   let deferred =  q.defer();
//   utils.findBy(Request, {
//        requestId: input.requestId
//   }, function (err, data) {
//        if (data && (data.processes === 0 || data.processes < 0)) {
//             utils.completeRequest(deferred, input, data);
//             ch.ack(true);
//             clearTimeout(timeOut);
//        } else {
//             deferred.resolve(true);
//        }
//   });
//   deferred.promise.catch(retry);
// }
//
//
//
// /**
//  * consumer of a page sumamry request from rabbitMQ
//  * @param  {object} msg content of rabbitMQ message
//  * @param  {object} cj  rabbitMQ channel
//  */
// function processSummary(msg, ch) {
//      var type = 'page:scan';
//      var input = JSON.parse(msg.content);
//
//
//      let timeOut = setTimeout(function () {
//          pollRequest(input,ch, timeOut);
//      }, 20000);
//
//
//      processAction(msg, 'process').then((response) => {
//           actions.checkTest(input, response);
//           // give back some data about the gathered results...
//           // if (response.notify === true) {
//           //      notify(response);
//           // }
//      }).catch((err) => {
//           /* Kill all related processes before restarting */
//           /* Kill all related processes before restarting */
//           /* Kill all related processes before restarting */
//           /* Kill all related processes before restarting */
//           clearTimeout(timeOut);
//
//           const _action = actions.actions.pageScan;
//
//           try {
//                //  if (err.softRetry === true) {
//                //       return ch.nack(msg);
//                //  }
//                if (input.isRetry !== true) {
//                     console.log('processSummary err _action --> retry', _action.retry);
//                     retry(err).catch((e) => {
//                          if (e.retry === true) {
//                               /* Retry Publish // Publish Local Queue */
//                               /* Retry Publish // Publish Local Queue */
//                               /* Retry Publish // Publish Local Queue */
//                               /* Retry Publish // Publish Local Queue */
//                               /* Retry Publish // Publish Local Queue */
//                          } else {
//                               /* Data error */
//                               notify({
//                                    uid: input.uid,
//                                    requestId: input.requestId,
//                                    status: 'error',
//                                    statusType: opts.statusType,
//                                    message: 'error',
//                                    source: input.source,
//                                    type: input.type
//                               });
//                          }
//                     });
//                } else {
//                     notify({
//                          uid: input.uid,
//                          requestId: input.requestId,
//                          status: 'error',
//                          statusType: opts.statusType,
//                          message: err.message,
//                          source: input.source,
//                          type: input.type
//                     });
//                }
//                ch.ack(msg);
//           } catch (e) {
//                ch.ack(msg);
//           }
//
//      });
// }
// module.exports = processSummary;
