require('./config/start-mq-connect-aws')('checkCapture'),
     arr = require('./config/website-list').slice(0, 1),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     sh = require('shorthash'),
     q = require('q'),
     utils = require('../../app/utils'),
     dynamoose = require('dynamoose'),
     Capture = require('../../app/models/capture'),
     callsObj = {},
     wrap = require('./config/wrapCall');

utils.setSmoke(function (id) {
      console.log('setSmoke', id, callsObj);
      // id = id;
     wrap.after(callsObj[id].passed, id, function (res, passed) {
          // console.log('checkCapture request test',res,passed);
          return res.processes === 0 && passed;
     }, function (res, passed) {
          // console.log('checkCapture scan test', res, passed, callsObj[id].url);
          return typeof res !== 'undefined' && passed;
     }).then((passed) => {
          // console.log('checkCapture resolved',passed);
          checkCaptureExists(callsObj[id].deferred, '', passed, id);
     }).catch((msg) => {
          callsObj[id].deferred.reject(msg);
     });
});


function checkCaptureExists(deferred, captureId, passed, requestId) {
     utils.findBy(Capture, {
          requestId:requestId
     }, function (err, res) {
      //  console.log('checkCaptureExists res',res);
          deferred.resolve(res && res.status === true && passed);
     });
}

function run(e,i) {
     let _deferred = q.defer(),
          passed = true;
     _.each(arr, (e, i) => {
         let data = {
              command: 'publish',
              action: 'capture',
              retry: false,
              requestId: sh.unique('checkCapture'+e),
              input:{
                requestId: sh.unique('checkCapture'+e),
              },
              res: {
                   url: {
                     url: e
                   }
              }
         };
          try {
               Capture.delete({
                    requestId: data.requestId
               }, function (err) {
                    wrap.before(data.requestId).then(() => {
                         let msg = new Buffer(JSON.stringify(data));
                         init({
                              content: msg
                         }, {
                              ack: function () {}
                         }).then((res) => {
                              // console.log('checkCapture before res',res);
                              passed = (res.processes === 1 && passed);
                              callsObj[data.requestId] = {
                                   passed: passed,
                                   deferred: _deferred,
                                   url: data.res.url.url,
                                   expectedResult: e.response
                              };
                         }).catch((res) => {
                              _deferred.reject('checkCapture failed');
                         })
                    }).catch((e) => {
                         _deferred.reject('checkCapture problems creating scan/request');
                    });
               })
          } catch (e) {
               console.log('e', e);
          }
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
// }, {
//      url: 'https://www.suncoastcreditunion.com/',
//      response: {
//        serverInfo: {
//          ip: '199.83.135.191'
//        }
//      }
// }, {
//      url: 'nickelfreesolutions.com',
//      response: {
//        serverInfo: {
//          ip: '184.168.221.3'
//        }
//      }
// }, {
//      url: 'scheepvaarttelefoongids.nl',
//      response: {
//        serverInfo: {
//          ip: '94.126.71.64'
//        }
//      }
// }, {
//      url: '3243432@@#@#2.......garbageDROPTABLE',
//      response: {
//        serverInfo:'failed:serverInfo'
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

process().then((res) => {
     console.log('checkCapture success results:', res)
}).catch(() => {
     console.log('checkCapture failure results:', res)
});
module.exports = process;
