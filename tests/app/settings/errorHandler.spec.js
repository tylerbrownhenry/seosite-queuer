var chai = require('chai'),
     sinon = require('sinon'),
     errorHandler = require('../../../app/settings/errorHandler'),
     expect = chai.expect;

 describe('app/settings/errorHandler', function () {
      it('errorHandler returns false if no error', function (done) {
           var res = errorHandler({close:function(){}},false)
           expect(res === false).to.equal(true);
           done();
      });

      it('errorHandler closes connection if is an error', function (done) {
        var res = errorHandler({close:function(){
          var called = true;
            expect(called === true).to.equal(true);
            done();
        }},true)
        expect(res === true).to.equal(true);
      });

 });
