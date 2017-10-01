// var chai = require('chai'),
//      expect = chai.expect,
//      updateCount = require('../../../../../app/settings/requests/page/updateCount'),
//      utils = require('../../../../../app/utils'),
//      sinon = require('sinon');
//
// describe('app/settings/requests/page/updateCount.js:fails:', function () {
//      var stubUtils;
//      beforeEach(function () {
//           stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
//                cb(true);
//           });
//      });
//      afterEach(function(){
//        stubUtils.restore();
//      })
//      it('returns retry if update', function (done) {
//           updateCount(null, null, null).catch(function (e) {
//             //console.log('test',e);
//                expect(e.retry).to.equal(true);
//                done();
//           });
//      });
// });
//
// describe('app/settings/requests/page/updateCount.js:passes:', function () {
//      var stubUtils;
//      beforeEach(function () {
//           stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
//                cb(null);
//           });
//      });
//      afterEach(function(){
//        stubUtils.restore();
//      })
//      it('returns requestId if update succeeds', function (done) {
//           updateCount(null, null, null).then(function (r) {
//                expect(typeof r.requestId !== 'undefined').to.equal(true);
//                done();
//           });
//      });
// });
