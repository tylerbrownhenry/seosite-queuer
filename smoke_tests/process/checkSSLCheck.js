require('./config/start-mq-connect-aws')('checkSSL'),
    //  arr = require('./config/website-list').slice(0, 1),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     q = require('q'),
     callsObj = {},
     utils = require('../../app/utils'),
     wrap = require('./config/wrapCall');

utils.setSmoke(function (id) {
     wrap.after(callsObj[id].passed, id, function (res, passed) {
          // console.log('sslEnabled request test', res, passed);
          return res.processes === 0 && passed;
     }, function (res, passed) {
          // console.log('sslEnabled scan test', res, passed);
          return res.sslEnabled === callsObj[id].expectedResult && passed;
     }).then((passed) => {
          // console.log('sslEnabled resolved', passed);
          callsObj[id].deferred.resolve(passed)
     }).catch((msg) => {
          callsObj[id].deferred.reject(msg);
     });
});

function run(e, i, expectedResult) {
     let _deferred = q.defer(),
          passed = true,
          data = {
               command: 'publish',
               action: 'checkSSL',
               retry: false,
               requestId: 'checkSSL' + i,
               input: {
                    requestId: '1234',
                    command: 'publish',
                    action: 'checkSSL'
               },
               res: {
                    url: {
                         url: e
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
                    expectedResult: expectedResult
               };
          }).catch((res) => {
               _deferred.reject('sslEnabled failed');
          })
     }).catch((e) => {
          _deferred.reject('sslEnabled problems creating scan/request');
     });
     return _deferred.promise;
}

let badssls = [
     'https://untrusted-root.badssl.com/',
     'https://sha1-intermediate.badssl.com/',
     'http://http-credit-card.badssl.com/',
     'https://superfish.badssl.com/'
];

let goodssls = [
     'https://dashboard.stripe.com/login?redirect=%2Ftest%2Fsubscriptions',
     'https://dev.twitter.com/rest/reference/get/users/lookup',
     'https://httpbin.org/user-agent',
     'https://httpbin.org/hidden-basic-auth/user/passwd',
     'https://httpbin.org/deny',
     'https://www.kennethreitz.org/essays/httpbin'
]

function process() {
     let deferred = q.defer(),
          calls = [],
          passed = true;
     _.each([1, 2], (e, i) => {
          let expectedResult = 'failed:checkSSL';
          e = badssls[i];
          if (i % 2) {
               e = goodssls[i];
               expectedResult = 'ssl:enabled';
          }
          calls.push(run(e, i, expectedResult));
     });
     q.all(calls).then((res) => {
          deferred.resolve(res);
     }).catch((e) => {
          deferred.reject(e);
     });
     return deferred.promise;
}

process().then((res) => {
     console.log('sslEnabled success results:', res)
}).catch(() => {
     console.log('sslEnabled failture results:', res)
});

module.exports = process;
