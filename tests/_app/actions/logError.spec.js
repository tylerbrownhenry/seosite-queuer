let chai = require('chai'),
     expect = chai.expect,
     logError = require('../../../app/actions/logError');

describe('app/actions/logError', () => {
     describe('log', () => {
          it('exists', () => {
               expect(typeof logError === 'function').to.equal(true);
          });
          it('to not return anything', () => {
               expect(typeof logError() === 'undefined').to.equal(true);
          });
     });
});
