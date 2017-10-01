let chai = require('chai'),
     sinon = require('sinon'),
     q = require('q'),
     rewire = require('rewire'),
     dynamoose = rewire('dynamoose'),
     utils = rewire('../../../app/utils'),
     User = {},
     Scan = {},
     Activity = rewire('../../../app/models/activity'),
     _ = require('underscore'),
     expect = chai.expect;

describe('app/utils', () => {
     beforeEach(function () {
          utils.__set__('updateBy', (a, b, c, d) => {
               d(null);
          });
     });

     it('sendEmail should exist', (done) => {
          expect(typeof utils.sendEmail !== 'undefined').to.equal(true);
          expect(typeof utils.sendEmail === 'function').to.equal(true);
          expect(typeof utils.sendEmail() === 'undefined').to.equal(true);
          done();
     });

     it('updateActivity should return null if there was no error', (done) => {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res === null).to.equal(true);
               done();
          })
     });

     it('getNowUTC should return a date string', (done) => {
          var resp = utils.getNowUTC();
          expect(typeof resp === 'number').to.equal(true);
          done();
     });
});

describe('app/utils', function () {

     beforeEach(function () {
          utils.__set__('updateBy', (a, b, c, d) => {
               d(true);
          });
     });

     it('updateActivity should return error if update fails', function (done) {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res !== null).to.equal(true);
               done();
          })
     });

});

describe('app/utils checkRequirements', function () {
     it('should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['page'], res => {
               expect(res === false).to.equal(true);
               done();
          })
     });

     it('should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['noExisting'], res => {
               expect(res === true).to.equal(true);
               done();
          })
     });

     it('should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['page'], res => {
               expect(res === true).to.equal(true);
               done();
          })
     });

});

describe('app/utils - updateActivity - pass', function () {

     beforeEach(function () {
          utils.__set__('updateBy', (a, b, c, d) => {
               d(null);
          });
     });

     it('should return null if passed', function (done) {
          utils.updateActivity(123, 'page', res => {
               expect(res === null).to.equal(true);
               done();
          })
     });

     it('should not throw error if given no callback', function () {
          utils.updateActivity(123, 'page');
     });

});

describe('app/utils - updateActivity - fails', function () {
     beforeEach(function () {
          utils.__set__('updateBy', (a, b, c, d) => {
               d(true);
          });
     });

     it('should return true if failed', function (done) {
          utils.updateActivity(123, 'page', res => {
               expect(res.message).to.be.defined;
               done();
          })
     });

     it('should return true if failed (no callback)', function () {
          utils.updateActivity(123, 'page');
     });

});

describe('app/utils - checkActivity', () => {
     beforeEach(() => {
          utils.__set__('Activity', {
               get: function (a, b) {
                    b(true);
               }
          });
     });

     it('should return true if failed', (done) => {
          utils.checkActivity(123, res => {
               expect(res).to.equal(true);
               done();
          })
     });

     it('should return true if failed (no callback)', (done) => {
          utils.checkActivity(123);
          done();
     });
});

describe('app/utils - checkActivity', function () {
     beforeEach(() => {
          utils.__set__('Activity', {
               get: function (a, b) {
                    b(null);
               }
          });
     });
     it('checkActivity should return null if passed (no callback)', (done) => {
          utils.checkActivity(123);
          done();
     });
     it('checkActivity should return null if passed', (done) => {
          utils.checkActivity(123, res => {
               expect(res).to.equal(null);
               done();
          })
     });

});

describe('app/utils - checkPermissions - success', () => {
     beforeEach(() => {
          utils.__set__('Permission', {
               get: function (a, b) {
                    if (typeof b == 'function') {
                         b(null, {
                              'plan': true
                         });
                    }
               }
          });
     });

     it('should return null if passed (no callback)', (done) => {
          utils.checkPermissions(123);
          done();
     });

     it('should return null if passed', (done) => {
          utils.checkPermissions('free', res => {
               expect(res).to.equal(null);
               done();
          })
     });

});

describe('app/utils - checkPermissions - failures', () => {
     beforeEach(() => {
          utils.__set__('Permission', {
               get: function (a, b) {
                    if (typeof b == 'function') {
                         b(true);
                    }
               }
          });
     });

     it('should return true if failed (no callback)', (done) => {
          utils.checkPermissions(123);
          done();
     });

     it('should return true if failed', (done) => {
          utils.checkPermissions('free', res => {
               expect(res).to.equal(true);
               done();
          })
     });
});

describe('app/utils - checkAvailActivity', () => {
     describe('success - daily limits', () => {
          beforeEach(() => {
               utils.__set__('Activity', {
                    get: function (a, b) {
                         b(null, {
                              'page-day-count': 2,
                              'page-month-count': 0
                         });
                    }
               });
               utils.__set__('Permission', {
                    get: (a, b) => {
                         b(null, {
                              limits: {
                                   daily: {
                                        page: 1
                                   },
                                   monthly: {
                                        page: 1
                                   }
                              }
                         });
                    }
               });
          });
          it('should return null if passed (over daily limit)', (done) => {
               utils.checkAvailActivity(123, 'free', 'page', res => {
                    expect(res).to.equal(null);
                    done();
               })
          });
     });
     describe('success', function () {
          beforeEach(() => {
               utils.__set__('Activity', {
                    get: function (a, b) {
                         b(null, {
                              'page-day-count': 1,
                              'page-month-count': 1
                         });
                    }
               });
               utils.__set__('Permission', {
                    get: function (a, b) {
                         b(null, {
                              limits: {
                                   daily: 2,
                                   monthly: 2
                              }
                         });
                    }
               });
          });

          it('should return null if passed', function (done) {
               utils.checkAvailActivity(123, 'free', 'page', res => {
                    expect(res).to.equal(null);
                    done();
               })
          });
     });

     describe('success - monthly limits', () => {
          beforeEach(() => {
               utils.__set__('Activity', {
                    get: function (a, b) {
                         b(null, {
                              'page-day-count': 0,
                              'page-month-count': 3
                         });
                    }
               });
               utils.__set__('Permission', {
                    get: (a, b) => {
                         b(null, {
                              limits: {
                                   daily: {
                                        page: 1
                                   },
                                   monthly: {
                                        page: 1
                                   }
                              }
                         });
                    }
               });
          });
          it('should return null if passed (over monthly limit)', (done) => {
               utils.checkAvailActivity(123, 'free', 'page', res => {
                    expect(res).to.equal(null);
                    done();
               })
          });
     });
     describe('failure', () => {
          beforeEach(() => {
               utils.__set__('Activity', {
                    get: (a, b) => {
                         b(true);
                    }
               });
          });
          it('should return true if activity failed', (done) => {
               utils.checkAvailActivity(123, 'free', 'page', res => {
                    expect(res).to.equal(true);
                    done();
               })
          });
     });
     describe('permission failed', () => {
          beforeEach(() => {
               utils.__set__('Activity', {
                    get: (a, b) => {
                         b(null, {
                              'page-day-count': 2,
                              'page-month-count': 0
                         });
                    }
               });

               utils.__set__('Permission', {
                    get: (a, b) => {
                         b(new Error('failed'));
                    }
               });
          });

          it('should return true if permission failed, with a message', (done) => {
               utils.checkAvailActivity(123, 'free', 'page', res => {
                    expect(res).to.not.equal(null);
                    expect(res.message).to.be.defined;
                    done();
               })
          });
     });
});

describe('app/utils - findOneUser', () => {
     describe('success', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    get: (a, b) => {
                         b(null, {
                              id: 123
                         });
                    }
               });
          });

          it('doesnt throw error with no callback', (done) => {
               utils.findOneUser({
                    id: 123
               });
               done();
          });
          it('should return if success', (done) => {
               utils.findOneUser({
                    id: 123
               }, (res) => {
                    expect(res.id === 123).to.be.defined;
                    done();
               })
          });
          it('should return if success', (done) => {
               utils.findOneUser({
                    id: 123
               }, (res) => {
                    expect(res.id === 123).to.be.defined;
                    done();
               })
          });
     });

     describe('failures', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    get: (a, b) => {
                         b(new Error('failed'));
                    }
               });
          });

          it('doesnt throw error with no callback', (done) => {
               utils.findOneUser({
                    id: 123
               });
               done();
          });
          it('should return true if failed', (done) => {
               utils.findOneUser({
                    id: 123
               }, res => {
                    expect(res === 'failed').to.be.defined;
                    done();
               })
          });
     });

     describe('errors', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    get: (a, b) => {
                         a('Not a function');
                    }
               });
          });

          it('doesnt throw error with no callback', (done) => {
               utils.findOneUser({
                    id: 123
               });
               done();
          });
          it('doesnt throw error with callback', (done) => {
               utils.findOneUser({
                    id: 123
               }, res => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });
     });
});

describe('app/utils - updateBy', () => {

     describe('success', () => {
          beforeEach(() => {
               User.update = (a, b, c) => {
                    c(null);
               };
          });

          it('does not throw error if not given a callback', () => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               });
          });

          it('should return null if passed', (done) => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               }, (res) => {
                    expect(res).to.equal(null);
                    done();
               })
          });
     });
     describe('failure', () => {
          beforeEach(() => {
               User.update = (a, b, c) => {
                    c(new Error());
               };
          });

          it('does not throw error if not given a callback', () => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               });
          });

          it('updateUser should return Error if failed', (done) => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               }, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });
     });

     describe('error', () => {
          beforeEach(() => {
               User.update = (a, b, c) => {
                    a('Not a function!');
               };
          });

          it('does not throw error if not given a callback', () => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               });
          });

          it('updateUser should return Error if failed', (done) => {
               utils.updateBy(User, {
                    id: 123
               }, {
                    test: 123
               }, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });
     });

});

describe('app/utils - updateUser', () => {

     describe('success', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    update: (a, b, c) => {
                         c(null);
                    }
               });
          });

          it('does not throw error if not given a callback', () => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               });
          });

          it('updateUser should return null if passed', (done) => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               }, (res) => {
                    expect(res).to.equal(null);
                    done();
               })
          });
     });
     describe('failures', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    update: (a, b, c) => {
                         c(new Error('failed'));
                    }
               });
          });

          it('should not throw erorr if no callback is given', () => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               });

          });
          it('should return error if failed', (done) => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               }, err => {
                    expect(err.message === 'failed').to.be.defined;
                    done();
               })
          });

     });

     describe('error', () => {
          beforeEach(() => {
               utils.__set__('User', {
                    update: (a, b, c) => {
                         a('a is not a function!');
                    }
               });
          });

          it('should not throw an error if there is an error (no callback)', (done) => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               });
               done();
          });

          it('should not throw an error if there is an error', (done) => {
               utils.updateUser({
                    id: 123
               }, {
                    test: 123
               }, res => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });
     });
});

describe('app/utils - saveModel', () => {

     describe('success', () => {
          beforeEach(() => {
               User.save = (a, b) => {
                    b(null);
               };
          });

          it('does not throw error if not given a callback', (done) => {
               var err = false;
               try {
                    utils.saveModel(User, {
                         id: 123
                    });
               } catch (e) {
                    err = r;
               }
               expect(err).to.equal(false);
               done();
          });
          it('returns null if successful', (done) => {
               utils.saveModel(User, {
                    id: 123
               }, function (err, res) {
                    expect(err).to.equal(null);

               });
               done();
          });
     });

     describe('failure', () => {
          beforeEach(() => {
               User.save = (a, b) => {
                    b(new Error());
               };
          });

          it('does not throw error if not given a callback', (done) => {
               var err = false;
               try {
                    utils.saveModel(User, {
                         id: 123
                    });
               } catch (e) {
                    err = r;
               }
               expect(err).to.equal(false);
               done();
          });
          it('returns Error if fails', (done) => {
               utils.saveModel(User, {
                    id: 123
               }, function (err, res) {
                    expect(err).to.not.equal(null);
               });
               done();
          });
     });

     describe('error', () => {
          beforeEach(() => {
               User.save = (a, b) => {
                    b('not a function!');
               };
          });

          it('does not throw error if not given a callback', (done) => {
               var err = false;
               try {
                    utils.saveModel(User, {
                         id: 123
                    });
               } catch (e) {
                    err = r;
               }
               expect(err).to.equal(false);
               done();
          });

          it('returns Error if error', (done) => {
               var err = false;

               try {
                    utils.saveModel(User, function (error) {
                         expect(error.message).to.be.defined;
                         done();
                    });
               } catch (e) {
                    err = e;
               }
               expect(err).to.equal(false);
          });
     });

});

describe('app/utils - deleteUser', function () {
     describe('success', function () {

          beforeEach(() => {
               utils.__set__('User', {
                    delete: (a, b) => {
                         b(null);
                    }
               });
          });

          it('should return null if passed', function (done) {
               utils.deleteUser({
                    id: 123
               }, res => {
                    expect(res).to.equal(null);
                    done();
               })
          });

          it('should not throw error if passed no callback', function (done) {
               let err = false;
               try {
                    utils.deleteUser({
                         id: 123
                    });
               } catch (e) {
                    err = e;
                    /* If not true, throws error here */
               }
               expect(err).to.equal(false);
               done();
          });

     });

     describe('failures', function () {
          beforeEach(() => {
               utils.__set__('User', {
                    delete: (a, b) => {
                         b(new Error());
                    }
               });
          });

          it('should return true if failed', function (done) {
               utils.deleteUser({
                    id: 123
               }, res => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.deleteUser({
                         id: 123
                    });
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });

     describe('error', function () {
          beforeEach(() => {
               utils.__set__('User', {
                    delete: (a, b) => {
                         a('not a function!');
                    }
               });
          });

          it('should return Error if error', function (done) {
               utils.deleteUser({
                    id: 123
               }, res => {
                    expect(res.message).to.be.defined;
                    done();
               })
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.deleteUser({
                         id: 123
                    });
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });
});

describe('app/utils - saveScan', function () {
     describe('success', function () {

          beforeEach(() => {
               Scan.save = (a) => {
                    a(null);
               };
          });

          it('should return null if passed', function (done) {
               utils.saveScan(Scan, res => {
                    expect(res).to.equal(null);
                    done();
               })
          });

          it('should not throw error if passed no callback', function (done) {
               let err = false;
               try {
                    utils.saveScan(Scan);
               } catch (e) {
                    err = e;
                    /* If not true, throws error here */
               }
               expect(err).to.equal(false);
               done();
          });

     });

     describe('failures', function () {
          beforeEach(() => {
               Scan.save = (a) => {
                    a(new Error());
               };
          });

          it('should return error if failed', function (done) {
               utils.saveScan(Scan, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.saveScan(Scan);
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });

     describe('error', function () {
          beforeEach(() => {
               Scan.save = (a, b) => {
                    b('not a function');
               };
          });

          it('should return Error if error', function (done) {
               utils.saveScan(Scan, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.saveScan(Scan);
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });
});

describe('app/utils - findBy', function () {
     describe('success', function () {

          beforeEach(() => {
               Scan.get = (a, b) => {
                    b(null, a);
               };
          });

          it('should return null if passed', function (done) {
               utils.findBy(Scan, {
                    id: 123
               }, (err, res) => {
                    expect(err).to.equal(null);
                    expect(res.id).to.equal(123);
                    done();
               })
          });

          it('should not throw error if passed no callback', function (done) {
               let err = false;
               try {
                    utils.findBy(Scan, {
                         id: 123
                    }, );
               } catch (e) {
                    err = e;
                    /* If not true, throws error here */
               }
               expect(err).to.equal(false);
               done();
          });

     });

     describe('failures', function () {
          beforeEach(() => {
               Scan.get = (a, b) => {
                    b(new Error());
               };
          });

          it('should return error if failed', function (done) {
               utils.findBy(Scan, {
                    id: 123
               }, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.findBy(Scan, {
                         id: 123
                    });
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });

     describe('error', function () {
          beforeEach(() => {
               Scan.get = (a, b) => {
                    a('not a function!');
               };
          });

          it('should return Error if error', function (done) {
               utils.findBy(Scan, {
                    id: 123
               }, (res) => {
                    expect(res.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.findBy(Scan, {
                         id: 123
                    });
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });
});

describe('app/utils - batchPut', function () {
     describe('success', function () {

          beforeEach(() => {
               Scan.batchPut = (a, b) => {
                    b(null, a);
               };
          });

          it('should return null if passed', function (done) {
               utils.batchPut(Scan, [{
                    id: 123
               }], (err, res) => {
                    expect(err).to.equal(null);
                    expect(res[0].id).to.equal(123);
                    done();
               })
          });

          it('should not throw error if passed no callback', function (done) {
               let err = false;
               try {
                    utils.batchPut(Scan, [{
                         id: 123
                    }], );
               } catch (e) {
                    err = e;
                    /* If not true, throws error here */
               }
               expect(err).to.equal(false);
               done();
          });

     });

     describe('failures', function () {
          beforeEach(() => {
               Scan.batchPut = (a, b) => {
                    b(new Error());
               };
          });

          it('should return error if failed', function (done) {
               utils.batchPut(Scan, [{
                    id: 123
               }], (err, res) => {
                    expect(err.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.batchPut(Scan, {
                         id: 123
                    });
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });

     describe('error', function () {
          beforeEach(() => {
               Scan.batchPut = (a, b) => {
                    a('not a function!');
               };
          });

          it('should return Error if error', function (done) {
               utils.batchPut(Scan, [{
                    id: 123
               }], (res) => {
                    expect(res.message).to.be.defined;
                    done();
               });
          });

          it('should not throw error if no callback', function (done) {
               var err = false;
               try {
                    utils.batchPut(Scan, [{
                         id: 123
                    }]);
               } catch (e) {
                    /* If not true, throws error here */
                    err = e;
               }
               expect(err).to.equal(false);
               done();
          });
     });
});

describe('app/utils - completeRequest', function () {
     var promise, input, data;
     describe('success', function () {

          beforeEach(function () {
               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(null);
               });
               utils.__set__('notify', {
                    notify: function (a, b, c) {

                    }
               });
          });

          it('should return null if passed', function (done) {
               utils.completeRequest(promise, input, data);
               promise.promise.then((res) => {
                    expect(res).to.equal(true);
                    done();
               })
          });

     });

     describe('failures', function () {
          beforeEach(function () {

               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(new Error());
               });
               utils.__set__('notify', {
                    notify: function (a, b, c) {
                    }
               });
          });

          it('should return error if failed', function (done) {
               utils.completeRequest(promise, input, data);
               promise.promise.catch((res) => {
                    expect(res.reason).to.equal('dynamo');
                    done();
               })
          });

     });

     describe('error', function () {
          beforeEach(function () {

               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    a('not a function');
               });
               utils.__set__('notify', {
                    notify: function (a, b, c) {}
               });
          });

          it('should return error if failed', function (done) {
               utils.completeRequest(promise, input, data);
               promise.promise.catch((res) => {
                    expect(res.reason).to.equal('dynamo');
                    done();
               })
          });
     });
});

describe('app/utils - retryUpdateRequest', function () {
     var promise, input, data;
     describe('success - processes equal 0', function () {

          beforeEach(function () {
               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(null);
               });
               utils.__set__('findBy', function (a, b, c) {
                    c(null, {
                         processes: 0
                    })
               });
               utils.__set__('completeRequest', function (a, b, c) {
                    a.resolve(true);
               });
          });

          it('should return null if passed', function (done) {
               utils.retryUpdateRequest(input, promise);
               promise.promise.then((res) => {
                    expect(res).to.equal(true);
                    done();
               })
          });
     });

     describe('success - processes less than 0', function () {

          beforeEach(function () {
               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(null);
               });
               utils.__set__('findBy', function (a, b, c) {
                    c(null, {
                         processes: -1
                    })
               });
               utils.__set__('completeRequest', function (a, b, c) {
                    a.resolve(true);
               });
          });

          it('should return null if passed', function (done) {
               utils.retryUpdateRequest(input, promise);
               promise.promise.then((res) => {
                    expect(res).to.equal(true);
                    done();
               })
          });
     });

     describe('success - processes more than 0', function () {
          beforeEach(function () {
               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(null);
               });
               utils.__set__('findBy', function (a, b, c) {
                    c(null, {
                         processes: 1
                    })
               });
          });

          it('should return null if passed', function (done) {
               utils.retryUpdateRequest(input, promise);
               promise.promise.then((res) => {
                    expect(res).to.equal(true);
                    done();
               })
          });
     });

     describe('failed', function () {

          beforeEach(function () {
               promise = q.defer();
               input = {
                    requestId: ''
               };
               data = {
                    requestType: '',
                    source: ''
               }
               utils.__set__('updateBy', (a, b, c, d) => {
                    d(new Error());
               });
          });

          it('should return message if error', function (done) {
               utils.retryUpdateRequest(input, promise);
               promise.promise.catch((res) => {
                    expect(res.reason).to.equal('dynamo');
                    done();
               })
          });
     });
});

describe('app/utils - convertUrl', function () {
     var promise, input, data;
     describe('success - adds http to a string missing it', function () {
          it('should return string with http:// added to it', function (done) {
               var input = 'www.ign.com';
               var res = utils.convertUrl(input);
               expect('http://www.ign.com').to.equal(res);
               done();
          });
     });
     describe('success - should ignore objects', function () {
          it('should return string with http:// added to it', function (done) {
               var input = {url:'www.ign.com'};
               var res = utils.convertUrl(input);
               expect(input).to.equal(res);
               done();
          });
     });
});
