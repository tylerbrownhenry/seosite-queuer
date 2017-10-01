require('./config/start-mq-connect-aws')('checkLinks'),
     arr = require('./config/website-list').slice(0, 1),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     sh = require('shorthash'),
     q = require('q'),
     callsObj = {},
     utils = require('../../app/utils'),
     dynamoose = require('dynamoose'),
     linkSchema = require('../../app/models/link'),
     Link = dynamoose.model('Link', linkSchema),
     wrap = require('./config/wrapCall');

utils.setSmoke(function (id) {
    //  console.log('setSmoke', id, callsObj);
     wrap.after(callsObj[id].passed, id, function (res, passed) {
          // console.log('checkLinks request test', res, passed);
          return res.processes === 0 && passed;
     }, function (res, passed) {
          // console.log('checkLinks scan test', res, passed);
          return typeof res !== 'undefined' && passed;
     }).then((passed) => {
          // console.log('checkLinks resolved', passed);
          checkLinkExists(callsObj[id].deferred, callsObj[id].LinkId, passed, id);
     }).catch((msg) => {
          _deferred.reject(msg);
     });
});

function run(e, i) {
     let _deferred = q.defer(),
          passed = true;
     _.each(arr, (e, i) => {
               let data = {
                    command: 'publish',
                    action: 'checkLinks',
                    retry: false,
                    requestId: 'checkLinks' + [0],
                    newScan: {
                         url: {
                              url: e
                         }
                    },
                    input: {
                         requestId: 'checkLinks' + [0],
                         command: 'publish',
                         action: 'checkLinks'
                    },
                    res: {
                         url: {
                              url: e
                         },
                         links: [{
                                   base: {

                                   },
                                   html: {
                                        attrs: {
                                             'alt': 'hi',
                                             'href': 'link'
                                        }
                                   },
                                   url: {
                                        original: e
                                   }
                              }

                         ]
                    }
               };
               var LinkId = sh.unique(data.res.links[0].url.original + data.requestId);
               Link.delete({
                    _id: LinkId,
                    requestId: data.requestId
               }, function (err) {
                    wrap.before(data.requestId).then(() => {
                         let msg = new Buffer(JSON.stringify(data));
                         init({
                              content: msg
                         }, {
                              ack: function () {}
                         }).then((res) => {
                              // console.log('checkLinks before res',res);
                              passed = (res.processes === 1 && passed);
                              callsObj[data.requestId] = {
                                   passed: passed,
                                   deferred: _deferred,
                                   url: data.res.url.url,
                                   LinkId:LinkId,
                                   expectedResult: e.response
                              };
                         }).catch((res) => {
                              _deferred.reject('checkLinks failed');
                         })
                    }).catch((e) => {
                         _deferred.reject('checkLinks problems creating scan/request');
                    });
               });
     });
return _deferred.promise;
}

let urls = [{
     url: 'mariojacome.com',
     response: {

     }
     // }, {
     //      url: 'https://www.suncoastcreditunion.com/',
     //      response: {
     //      }
     // }, {
     //      url: 'nickelfreesolutions.com',
     //      response: {
     //      }
     // }, {
     //      url: 'scheepvaarttelefoongids.nl',
     //      response: {
     //      }
     // }, {
     //      url: '3243432@@#@#2.......garbageDROPTABLE',
     //      response: {
     //      }
}];

function process() {
     let deferred = q.defer(),
          calls = [],
          passed = true;
     _.each(urls, (e, i) => {
          calls.push(run(e, i));
     });
     q.all(calls).then((res) => {
          deferred.resolve(res);
     }).catch((e) => {
          deferred.reject(e);
     });
     return deferred.promise;
}

function checkLinkExists(deferred, linkId, passed, requestId) {
     utils.findBy(Link, {
          _id: linkId,
          requestId: requestId
     }, function (err, res) {
      //  console.log('checkLinkExists test',res,err,'-',linkId,'-',requestId);
          deferred.resolve(res && res.attrs.alt === 'hi' && passed);
     });
}

process().then((res) => {
     console.log('checkLinks success results:', res)
}).catch(() => {
     console.log('checkLinks failure results:', res)
});
module.exports = process;
