var chai = require('chai'),
     expect = chai.expect,
     publisher = require('../../../../app/amqp-connections/publisher'),
     retry = require('../../../../app/settings/requests/retry'),
     dynamoose = require('dynamoose'),
     linkSchema = require('../../../../app/models/link'),
    //  linkSchema = require("../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
    //  retry = require('../../../../app/settings/requests/retry'),
     sinon = require('sinon'),
     /* Files that call retry */
     _notify = require('../../../../app/actions/notify'),
     _retry = require('../../../../app/amqp-connections/consumers/retry'),
     /* Also calls notify */
     _summary = require('../../../../app/amqp-connections/consumers/summary'),
     /* Also calls notify */
     /* Files that call notify (And subsequently calls retry) */
     _linksRequest = require('../../../../app/settings/requests/link'),
     _retryables = require('../../../../app/settings/requests/retry/retryables'),
     _summaryRequest = require('../../../../app/settings/requests/summary');
//  utils = require('../../../../app/utils'),

describe.only('calledRetry linkRequest', function (done) {
     var stubUpdateBy,stubFindBy;
     beforeEach(function () {
          var utils = require('../../../../app/utils'),
          stubUpdateBy = sinon.stub(utils, 'updateBy', function (a, b, c, cb) {
               cb(null);
          });
          stubFindBy = sinon.stub(utils, 'findBy', function (a, b, cb) {
               cb(null);
          });
          // console.log('')
              //  stub = sinon.stub(dynamoose.models.Link, 'update',function(){
                //  return null;
              //  });
              //  stub.yieldsTo(true);
     });

     afterEach(function () {
          // stubUtils.restore();
          // stub.restore();
     });
     //  var input = {
     //       // basic rescan type data..
     //       uid: 'fakeUserHash',
     //       page: '/dashboard'
     //       // etc
     //  }
     //
     //  var res = {
     //       links: [{
     //            url: {
     //                 original: 'http:www.mysite.com'
     //            }
     //       }]
     //  };
     //  var requestId = 'fakeHash';
     //  var newScan = {
     //       url: {
     //            resolvedUrl: 'http:www.mysite.com'
     //       },
     //       currentResponse: {
     //
     //       },
     //       redirects: {
     //
     //       }
     //  }

     var buffer = new Buffer(JSON.stringify({
          url: 'http://myurl.com/index.js',
          requestId: 'fakeHash',
          linkId: 'fakeHash',
          uid: 'fakeHash',
          baseUrl: 'http://myurl.com',
          _link: {
               html: {
                    base: null
               },
               base: {
                    original: null
               },
               url: {
                    original: 'http:www.mysite.com'
               }
          }
     }));

     it('nothing is always true', function (done) {
          expect(retry.originalIssueResolved()).to.equal(true);
          _linksRequest({
               content: buffer
          }).then(function (e) {
               done();
               console.log('made it?');
          }).catch(function (e) {
               done();
               console.log('made it :()');

          });
          // done();/
     });
     // _linksRequest(input, res, requestId, newScan)

     // need to be defined: 'i_id', 'retryCommand', 'retryOptions'
     // should be defined (for everything at the moment): 'page'
     // retryCommand:
     //  needs to equal one of:
     //      ['request.summary.markedRequstAsFailed',
     //  'request.summary.processUrl',
     //  'request.summary.saveAsActive',
     //  'request.summary.processHar',
     //  'processLinks',
     //  'utils.updateBy',
     //  'notify' ]
     //
     // The required above, and any of these are processed, everything else is ignored
     // uid
     // i_id
     // url
     // page
     // status
     // statusType

     //FILE DESCRIPS
     //
     // _summaryRequest
     // retry only happens when rejected,

     // _linksRequest
     // retry needs implemented

     //_retryables
     // called with 'retryCommand' is set to 'notify'
     // need to see where this happens

     //_summary
     // consumes summary requests from rabbitMQ

     //_retry
     // consumes retry requests from rabbitMQ

     //_notify
     // consumes notify requests from rabbitMQ

     // so we need to go through each of these files, and isolate where the notify happens,
     // and then read that what ends up being sent to 'retry' is what was expected

     // start with link because I think that is the one that currently works the worse/is not set up

     //  it('database always true', function (done) {
     //       expect(retry.originalIssueResolved('database')).to.equal(true);
     //       done();
     //  });
     //  it('nothing is always true', function (done) {
     //       expect(retry.originalIssueResolved()).to.equal(true);
     //       done();
     //  });
});
