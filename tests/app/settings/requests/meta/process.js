var chai = require('chai'),
     expect = chai.expect,
     processMetaData = require('../../../../../app/settings/requests/meta/process'),
     utils = require('../../../../../app/utils'),
     sinon = require('sinon');

var harResponseData = {
     url: {
          resolvedUrl: 'test'
     },
     log: {
          entries: [{
                    request: {
                         url: 'http://whatever.com'
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'gzip'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'application/x-javascript'
                              },
                              {
                                   name: "Cache-Control",
                                   value: true
                              }
                         ]
                    }
               },
               {
                    request: {
                         url: "http://www.uncached.unecoded.invalidcontenttype.com.index.js"
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: "Cache-Control",
                                   value: false
                              }
                         ]
                    }
               },
               {
                    nothing: 'useful'
               }
          ]
     },
     links: [{
          url: {
               resolvedUrl: 'someinthg'
          }
     }]
}

describe('app/settings/requests/page/updateCount.js:fails:', function () {
     //  var stubUtils;
     //  beforeEach(function () {
     //       stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
     //            cb(true);
     //       });
     //  });
     //  afterEach(function(){
     //    stubUtils.restore();
     //  })
     //  it('returns retry if update', function (done) {

     var input = {
          options: {
               save: {
                    metaData: true
               }
          }
     };

     var res = {
          links: [{
               html: {
                    tagName: 'a'
               }
               url: {
                    original: "test"
               }
          }]
     }

     var result = processMetaData(harResponseData, input, res);
     //console.log('test', result);

     done();

});

describe('app/settings/requests/page/updateCount.js:passes:', function () {
     var stubUtils;
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
     });
     afterEach(function () {
          stubUtils.restore();
     })
     it('returns requestId if update succeeds', function (done) {
          updateCount(null, null, null).then(function (r) {
               expect(typeof r.requestId !== 'undefined').to.equal(true);
               done();
          });
     });
});
