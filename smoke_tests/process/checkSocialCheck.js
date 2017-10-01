require('./config/start-mq-connect-aws')('checkSocial'),
    //  arr = require('./config/website-list').slice(0, 1),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     q = require('q'),
     callsObj = {},
     utils = require('../../app/utils'),
     wrap = require('./config/wrapCall');

utils.setSmoke(function (id) {
    //  console.log('setSmoke', id, callsObj);
     wrap.after(callsObj[id].passed, id, function (res, passed) {
          return res.processes === 0 && passed;
     }, function (res, passed) {
          if (callsObj[id].expectedResult.hasResults === true) {
              //  console.log('checkSocial scan test', res.social.results, passed, callsObj[id].url);
               passed = (res.social && res.social.results && res.social.results[0] && passed);
          }
          if (callsObj[id].expectedResult.followers === true) {
              //  console.log('checkSocial scan test false', typeof res.social.results[1]);
               passed = (res.social && res.social.results && typeof res.social.results[1]['twitter-followers'] === "number" && passed);
          }
          return typeof res.social !== 'undefined' && passed;
     }).then((passed) => {
          // console.log('checkSocial resolved', passed);
          callsObj[id].deferred.resolve(passed)
     }).catch((msg) => {
          callsObj[id].deferred.reject(msg);
     });
});

function run(e, i) {
     let _deferred = q.defer(),
          passed = true,
          data = {
               requestId: 'checkSocial' + i,
               command: 'publish',
               action: 'checkSocial',
               res: {
                    socialInfo: {
                         twitterUsername: e.twitterUsername
                    },
                    url: {
                         url: e.url
                    }
               }
          };
     wrap.before(data.requestId).then(() => {
          let msg = new Buffer(JSON.stringify(data));
          init({
               content: msg
          }, {
               ack: function () {}
          }).then((res) => {
               passed = (res.processes === 1 && passed);
               callsObj[data.requestId] = {
                    passed: passed,
                    deferred: _deferred,
                    url: data.res.url.url,
                    expectedResult: e.response
               };
          }).catch((res) => {
               _deferred.reject('checkSocial failed');
          })
     }).catch((e) => {
          _deferred.reject('checkSocial problems creating scan/request');
     });
     return _deferred.promise;
}

let urls = [{
          url: 'mariojacome.com',
          twitterUsername: 'mariojacome',
          response: {
               followers: true,
               hasResults: true
          }
     },
     {
          url: 'https://www.suncoastcreditunion.com/',
          twitterUsername: 'SuncoastCU',
          response: {
               followers: true,
               hasResults: true
          }
     },
     {
          url: 'nickelfreesolutions.com',
          twitterUsername: null,
          response: {
               followers: false,
               hasResults: true
          }
     },
     {
          url: 'scheepvaarttelefoongids.nl',
          response: {
               followers: false,
               hasResults: true
          }
     },
     {
          url: '3243432@@#@#2.......garbageDROPTABLE',
          response: {
               followers: false,
               hasResults: true
          }
     }
];

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

process().then((res) => {
     console.log('checkSocial success results:', res)
}).catch(() => {
     console.log('checkSocial failture results:', res)
});
module.exports = process;
