require('./config/start-mq-connect-aws')('serverInfo'),
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
          // console.log('serverInfo request test',res,passed);
          return res.processes === 0 && passed;
     }, function (res, passed) {
          // console.log('serverInfo scan test', res, passed, callsObj[id].url);
          if(typeof callsObj[id].expectedResult.serverInfo === 'object'){
            return callsObj[id].expectedResult.serverInfo.ip === res.serverInfo.ip && passed;
          } else {
            return callsObj[id].expectedResult.serverInfo === res.serverInfo && passed;
          }
     }).then((passed) => {
          // console.log('serverInfo resolved',passed);
          callsObj[id].deferred.resolve(passed)
     }).catch((msg) => {
          callsObj[id].deferred.reject(msg);
     });
});

function run(e, i) {
     let _deferred = q.defer(),
          passed = true,
          data = {
               requestId: 'serverInfo' + i,
               command: 'publish',
               action: 'serverInfo',
               input: {
                    url: e
               },
               res: {
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
               _deferred.reject('serverInfo failed');
          })
     }).catch((e) => {
          _deferred.reject('serverInfo problems creating scan/request');
     });
     return _deferred.promise;
}

let urls = [{
     url: 'mariojacome.com',
     response: {
       serverInfo: {
         ip: '143.95.38.213'
       }
     }
}, {
     url: 'https://www.suncoastcreditunion.com/',
     response: {
       serverInfo: {
         ip: '199.83.135.191'
       }
     }
}, {
     url: 'nickelfreesolutions.com',
     response: {
       serverInfo: {
         ip: '184.168.221.3'
       }
     }
}, {
     url: 'scheepvaarttelefoongids.nl',
     response: {
       serverInfo: {
         ip: '94.126.71.64'
       }
     }
}, {
     url: '3243432@@#@#2.......garbageDROPTABLE',
     response: {
       serverInfo:'failed:serverInfo'
     }
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

process().then((res) => {
     console.log('serverInfo success results:', res)
}).catch(() => {
     console.log('serverInfo failture results:', res)
});
module.exports = process;
