require('./config/start-mq-connect-aws')('w3cValidate'),
     count = 2,
     watchCount = count,
     arr = require('./config/website-list').slice(0, count),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     q = require('q'),
     utils = require('../../app/utils'),
     callsObj = {},
     wrap = require('./config/wrapCall');

utils.setSmoke(function(id){
  wrap.after(callsObj[id].passed, id, function (res, passed) {
       return res.processes === 0 && passed;
  }, function (res, passed) {
       return typeof res.w3cValidate !== 'undefined' && res.w3cValidate.data.errors === callsObj[id].errorCount && passed;
  }).then((passed) => {
       callsObj[id].deferred.resolve(passed)
  }).catch((msg) => {
       callsObj[id].deferred.reject(msg);
  });
});

function run(e, i, html, errorCount) {
  let _deferred = q.defer(),
  passed = true,
  data = {
          command: 'publish',
          action: 'w3cValidate',
          retry: false,
          requestId: 'w3cValidate' + i,
          input: {
               command: 'process',
               action: 'w3cValidate',
               html: html,
               parse: false
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
                 passed:passed,
                 deferred: _deferred,
                 errorCount: errorCount
               };
          }).catch((res) => {
               deferred.reject('checkW3CCheck failed');
          })
     }).catch((e) => {
          _deferred.reject('checkW3CCheck problems creating scan/request');
     });
     return _deferred.promise;
}

function process() {
     let deferred = q.defer(),
          calls = [];
     _.each(arr, (e, i) => {
          let html = '<div>invalid!</span>',
          errorCount = 6;
          if (i % 2) {
              errorCount = 2;
              html = '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
          }
          calls.push(run(e,i,html,errorCount));
     });
     q.all(calls).then((res)=>{
       deferred.resolve(res);
     }).catch((e)=>{
       deferred.reject(e);
     });
     return deferred.promise;
}
process().then((res) => {
     console.log('checkW3CCheck success results:', res);
}).catch((res) => {
     console.log('checkW3CCheck failture results:', res);
});
module.exports = process;
