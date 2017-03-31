var chai = require('chai'),
     expect = chai.expect,
     processLinkData = require('../../../../../app/settings/requests/links/process'),
     utils = require('../../../../../app/utils'),
     publisher = require('../../../../../app/amqp-connections/publisher'),
     q = require('q'),
     sh = require('shorthash'),
     _ = require('underscore'),
     sinon = require('sinon');

     var res = {
          links: [{
               html: {
                    tagName: 'a'
               },
               url: {
                    original: "test"
               }
          }]
     };


var parentLink = 'http://www.whatever.com';
var linkObj = {};
var requestId = 'fakeRequestHash';
var commands = [];
var links = [{
          url: {
               original: 'test'
          }
     },
     {
          nourl: 'test'
     }
];
var input = {
     page:'/dashboard',
     uid: 'fakeUserHash'
};

_.each(links, function (link) {
     if (link.url) {
          var linkId = sh.unique(link.url.original + requestId);
          if (typeof linkObj[linkId] === 'undefined') {
               commands.push({
                    "_id": linkId,
                    "__scan": {},
                    "__link": link,
                    "found": Date(),
                    "linkId": linkId,
                    "resolvedUrl": parentLink,
                    "requestId": requestId,
                    "scanned": null,
                    "status": 'pending',
                    "site": parentLink,
                    "uid": input.uid,
                    "url": link.url.original,
               });
               link._id = linkId;
               linkObj[linkId] = link;
          }
     }
});

var _newScan = {
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
};

describe('app/settings/requests/link/saveUpdatedCount.js:passes:', function () {
     var stubUtils,
          stub,
          requestId = 'fakeHash',
          updatedCount = 1,
          newScan = _newScan;

     // stubUpdateBy = sinon.stub(utils, 'batchPut', function (a, b, c, cb) {
     //      cb(true);
     // });
     // stubFindBy = sinon.stub(utils, 'findBy', function (a, b, cb) {
     //      cb(null);
     // });
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
          stub = sinon.stub(publisher, 'publish', function (msg) {
               return {
                    then: function (fn) {
                         fn(msg);
                         return {
                              catch: function () {

                              }
                         }
                    }
               }
          });
     });

     afterEach(function () {
          stubUtils.restore();
          stub.restore();
     })
     it('returns success status if succeeds', function (done) {
          var promise = q.defer();

          processLinkData.saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input)
          promise.promise.then(function (r) {
            console.log('RRRRR',r);
            /*
            Is missing parameters okay?
            Is missing parameters okay?
            Is missing parameters okay?
            Is missing parameters okay?
            Is missing parameters okay?
             */
               expect(r.status === 'success').to.equal(true);
               done();
          });
     });
});

describe('app/settings/requests/link/saveUpdatedCount.js:fails:', function () {
     var stubUtils,
          stub,
          requestId = 'fakeHash',
          updatedCount = 1,
          newScan = _newScan;

     // stubUpdateBy = sinon.stub(utils, 'batchPut', function (a, b, c, cb) {
     //      cb(true);
     // });
     // stubFindBy = sinon.stub(utils, 'findBy', function (a, b, cb) {
     //      cb(null);
     // });
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });
          stub = sinon.stub(publisher, 'publish', function (msg) {
               return {
                    then: function (fn) {
                         fn(msg);
                         return {
                              catch: function () {

                              }
                         }
                    }
               }
          });
     });

     afterEach(function () {
          stubUtils.restore();
          stub.restore();
     })
     it('returns a retry if updateBy fails', function (done) {
          var promise = q.defer();

          processLinkData.saveUpdatedCount(promise, requestId, updatedCount, newScan, commands, linkObj, input)
          promise.promise.catch(function (r) {
            console.log('RRR',r);
               expect(r.status === 'error').to.equal(true);
               expect(typeof r.uid !== 'undefined').to.equal(true);
               expect(typeof r.requestId !== 'undefined').to.equal(true);
               expect(typeof r.statusType !== 'undefined').to.equal(true);
               expect(r.retry).to.equal(true);
               done();
          });
     });
});


describe('app/settings/requests/link/saveUpdatedCount.js:fails:', function () {
     var stubUtils,
          stub,
          stubBatchPut,
          requestId = 'fakeHash',
          updatedCount = 1,
          newScan = _newScan;

     stubBatchPut = sinon.stub(utils, 'batchPut', function (a, b, c, cb){
    //  console.log('a,b,c,d',a,'b',b,'c',c,'cb',cb);
          c(true);
     });
     // stubFindBy = sinon.stub(utils, 'findBy', function (a, b, cb) {
     //      cb(null);
     // });
     beforeEach(function () {
          stubUtils = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(true);
          });
          stub = sinon.stub(publisher, 'publish', function (msg) {
               return {
                    then: function (fn) {
                         fn(msg);
                         return {
                              catch: function () {

                              }
                         }
                    }
               }
          });
     });

     afterEach(function () {
          stubUtils.restore();
          stub.restore();
          stubBatchPut.restore();
     })
     it('returns fail if batchput fails', function (done) {
          var promise = q.defer();
          processLinkData.init(input, res, requestId, newScan).catch(function (r) {
               expect(r.retryCommand === 'settings.request.links.process.init').to.equal(true);
               done();
          });
     });
});
