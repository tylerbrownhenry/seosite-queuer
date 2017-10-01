var chai = require('chai'),
     expect = chai.expect,
     checkError = require('../../../../../app/actions/sniff/linkChecker/checkErrors'),
     _ = require('underscore'),
     sinon = require('sinon');

describe('app/actions/sniff/linkChecker/checkError', function () {
     it('returns errors', function () {
          var noEntryResponse = checkError();
          expect(typeof noEntryResponse.code === 'undefined').to.equal(true);

          var normalResponse = checkError({
               statusCode: 200,
               headers: {
                    'content-type': 'text/html'
               }
          });
          expect(typeof normalResponse === 'undefined').to.equal(true);

          var errorResponse = checkError({
               statusCode: 400,
               headers: {
                    'content-type': 'text/html'
               }
          });
          expect(errorResponse.code === 400).to.equal(true);

          var errorResponseNotHtml = checkError({
               statusCode: 200,
               headers: {
                    'content-type': 'fake'
               }
          });
          expect(errorResponseNotHtml.code === 200).to.equal(true);


          var errorResponseNullHtml = checkError({
               statusCode: 200,
               headers: {
                    'content-type': null
               }
          });
          expect(errorResponseNullHtml.code === 200).to.equal(true);


     });
});
