require('./config/start-mq-connect-aws')('checkPage'),
     arr = require('./config/website-list').slice(1, 2),
     init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     sh = require('shorthash'),
     q = require('q'),
     callsObj = {},
     utils = require('../../app/utils'),
     Scan = require('../../app/models/scan'),
     wrap = require('./config/wrapCall');

function run(e, i) {
     let _deferred = q.defer(),
          passed = true;
     let data = {
          command: 'publish',
          action: 'pageScan',
          requestId: 'pageScan' + e,
          requestDate: 1503701497848,
          oid: 'ZzxprO',
          uid: 'tvUxg',
          url: e.url,
          source: 'test',
          requestType: 'embed:scan',
          scanGroup: 'default',
          options: {
               captures: undefined,
               links: undefined,
               security: undefined,
               type: 'page:scan',
               save: {
                    "resources": true,
                    "links": true,
                    "security": true,
                    "metaData": true,
                    "captures": true
               }
          },
          processes: 1,
          requestId: sh.unique(e.url)
     };

     wrap.before(data.requestId, 0).then(() => {
          let msg = new Buffer(JSON.stringify(data));
          init({
               content: msg
          }, {
               ack: function () {}
          }).then((res) => {
               console.log('======================== checkPage before res', res);
               passed = (res.processes === 0 && passed);
               try {

                    callsObj[data.requestId] = {
                         passed: passed,
                         deferred: _deferred,
                         url: data.url,
                         expectedResult: e.response
                    };
               } catch (e) {
                    console.log('======================== callsObj', e)
               }
          }).catch((res) => {
               _deferred.reject('======================== checkPage failed');
          })
     }).catch((e) => {
          _deferred.reject('======================== checkPage problems creating scan/request');
     });
     return _deferred.promise;
}

let urls = [{
          url: 'https: //superfish.badssl.com/',
          response: {
               message: 'scan:cancelled:error'
          }
     },
     {
          url: 'http://www.mariojacome.com',
          response: {
            message:'complete'
          }
     },
       {
         url:'mariojacome.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'webmagnat.ro',
         response:{
           message:'complete'
         }
       },
       {
         url:'nickelfreesolutions.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'scheepvaarttelefoongids.nl',
         response:{
           message:'complete'
         }
       },
       {
         url:'tursan.net',
         response:{
           message:'complete'
         }
       },
       {
         url:'plannersanonymous.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'doing.fr',
         response:{
           message:'complete'
         }
       },
       {
         url:'saltstack.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'deconsquad.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'migom.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'tjprc.org',
         response:{
           message:'complete'
         }
       },
       {
         url:'worklife.dk',
         response:{
           message:'complete'
         }
       },
       {
         url:'inno-make.com',
         response:{
           message:'complete'
         }
       },
       {
         url:'food-hub.org',
         response:{
           message:'complete'
         }
       },
       {
         url:'bikemastertool.com',
         response:{
           message:'complete'
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

utils.setSmoke(function (id) {
     console.log('======================== setSmoke', id, callsObj);
     if(!id || !callsObj[id]){
       return;
     }
     wrap.after(callsObj[id].passed, id, function (res, passed) {
          console.log('======================== checkPage request test', res, passed);
          return res.processes === 0 && passed;
     }, function (res, passed) {
          console.log('======================== checkPage scan test', res, passed);
          return typeof res !== 'undefined' && passed;
     }).then((passed) => {
          console.log('======================== checkPage resolved', passed);
          checkScanExists(callsObj[id].deferred, '', passed, id, callsObj[id].expectedResult);
          // checkPageExists(deferred, '', passed, data.requestId);
     }).catch((msg) => {
          _deferred.reject(msg);
     });
});

let count = 0
  utils.countProcesses(function(input){
  count++;
  console.log('COUNT IS NOW: ',count,' : ',input);
  console.log('after count');
})

function checkScanExists(deferred, scanId, passed, requestId,expectedResult) {
     utils.findBy(Scan, {
          requestId: requestId
     }, function (err, res) {
          console.log('checkScanExists res', res, 'expectedResult',expectedResult);
          deferred.resolve(res && res.message === expectedResult.message && passed);
     });
}

process().then((res) => {
     console.log('======================== checkPage success results:', res)
}).catch(() => {
     console.log('======================== checkPage failure results:', res)
});
module.exports = process;
