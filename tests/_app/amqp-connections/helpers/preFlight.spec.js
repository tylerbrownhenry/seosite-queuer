var chai = require('chai'),
     expect = chai.expect,
     preFlight = require('../../../../app/amqp-connections/helpers/preFlight'),
     sinon = require('sinon');

describe('app/amqp-connections/helpers/preFlight', function () {
     it('fails when given nothing', function (done) {
          var pass = preFlight('promise', null, function (promise, m) {
               expect(promise === 'promise').to.equal(true);
               expect(m.message === 'error:no:content').to.equal(true);
               done();
          });
          expect(pass === false).to.equal(true);
     });
     it('fails when cant parse data', function (done) {
          var pass = preFlight('promise', {
               content: '{fakeobject}'
          }, function (promise, m) {
               expect(promise === 'promise').to.equal(true);
               expect(m.message === 'error:unparsable').to.equal(true);
               done();
          });
          expect(pass === false).to.equal(true);
     });
     it('return parsed input if passed a parasable string', function (done) {
          var pass = preFlight('promise', {
               "content": new Buffer('{"t":"fakeobject"}')
          });
          expect(pass.t === 'fakeobject').to.equal(true);
          done();
     });
});
