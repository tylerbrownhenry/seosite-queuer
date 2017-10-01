var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     utils = require('../../../../app/actions/sniff/utils');

describe('app/actions/sniff/utils.js:', function () {
     it('promisify a function should have then as a property', function (done) {
          var testFunc = function (a, b, c) {
               return a(null);
          };
          utils.promisify(testFunc)().then(function (res) {
               expect(true).to.be.defined;
          });
          testFunc = function (a, b, c) {
               return a(true);
          };
          utils.promisify(testFunc)().catch(function (res) {
               expect(true).to.be.defined;
               done();
          });
          testFunc = {
               then: function () {

               }
          };
          utils.promisify(testFunc);
     });
});

describe('app/actions/sniff/utils.js:', function () {
     it('getErrorString should rewrite an error code', function (done) {
          for (var i = 0; i < 8; i++) {
            expect(utils.getErrorString({errorCode:i})).to.be.defined;
          }
          done();
     });
});

describe('app/actions/sniff/utils.js:', function () {
     it('getType should return the type', function (done) {
          expect(utils.getType('text/css') === 'css').to.equal(true);
          expect(utils.getType('javascript') === 'js').to.equal(true);
          expect(utils.getType('/json') === 'json').to.equal(true);
          expect(utils.getType('flash') === 'flash').to.equal(true);
          expect(utils.getType('image/') === 'cssimage').to.equal(true);
          expect(utils.getType('audio/') === 'audio').to.equal(true);
          expect(utils.getType('video/') === 'video').to.equal(true);
          expect(utils.getType('/font') === 'font').to.equal(true);
          expect(utils.getType('what','paris\.jpg') === 'cssimage').to.equal(true);
          expect(utils.getType('what',".wav") === 'audio').to.equal(true);
          expect(utils.getType('what','.mp4') === 'video').to.equal(true);
          expect(utils.getType('text/html') === 'doc').to.equal(true);
          expect(utils.getType('text/plain') === 'doc').to.equal(true);
          expect(utils.getType('null') === null).to.equal(true);
          done();
     });
});
