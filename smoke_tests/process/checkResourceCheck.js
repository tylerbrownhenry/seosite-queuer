require('./config/start-mq-connect-aws')('checkResources');
//  arr = require('./config/website-list').slice(0, 1),
let init = require('../../app/settings/requests/clean_actions.js').init,
     _ = require('underscore'),
     q = require('q'),
     sh = require('shorthash'),
     callsObj = {},
     utils = require('../../app/utils'),
     Resource = require('../../app/models/resource'),
     wrap = require('./config/wrapCall');

utils.setSmoke(function (id) {
     console.log('setSmoke', id, callsObj);
    //  if (callsObj[id]) {

          wrap.after(callsObj[id].passed, id, function (res, passed) {
               console.log('checkResources request test', res, passed);
               return res.processes === 0 && passed;
          }, function (res, passed) {
               console.log('checkResources scan test', res, passed, callsObj[id].url);
               return typeof res !== 'undefined' && passed;
          }).then((passed) => {
               if(passed == true){
                 checkResourceExists(callsObj[id].deferred, callsObj[id].ResourceID, passed, id, callsObj[id].expect);
               }
          }).catch((msg) => {
               callsObj[id].deferred.reject(msg);
          });
    //  }
});

function run(e, i) {
     let _deferred = q.defer(),
          passed = true,
          data = {
               command: 'publish',
               action: 'checkResources',
               retry: false,
               requestId: 'checkResources' + i,
               input: {
                    requestId: 'checkResources' + i,
                    command: 'publish',
                    action: 'checkResources',
                    url: 'http://www.validurl.com'
               },
               res: {
                    log: {
                         entries: [{
                          //  gzip: (headers.gZippable) ? headers.acceptableGzip : null,
                          //  type: headers.contentType,
                          //  cached: headers.cached,
                          //  server: headers.server,
                          //  timings: e.timings,
                              time: 1000,
                              startedDateTime: new Date(),
                              timings: 123,
                              request: {
                                   url: e.url,
                              },
                              response: {
                                   bodySize: 325,
                                   status: e.status,
                                   headers:{
                                     "content-type":e.type,
                                     "content-encoding":e.encoding,
                                     "cache-control":e.cached,
                                     "server":e.server
                                   }
                              }
                         }]
                    }
               }
          };

     try {
          let ResourceID = sh.unique(data.res.log.entries[0].request.url + data.requestId);
          Resource.delete({
               _id: ResourceID,
               requestId: data.requestId
          }, function (err) {
               console.log('resource delete', err,data.res.log.entries.length)
               // Plus one (+1) is for robots / sitemap
               wrap.before(data.requestId,data.res.log.entries.length + 1).then(() => {
                    let msg = new Buffer(JSON.stringify(data));
                    init({
                         content: msg
                    }, {
                         ack: function () {}
                    }).then((res) => {
                         passed = (res.processes === 2 && passed);
                         console.log('hi?', res);
                         try {

                              callsObj[data.requestId] = {
                                   passed: passed,
                                   deferred: _deferred,
                                   url: data.input.url,
                                   ResourceID: ResourceID,
                                   expectedResult: e.response,
                                   expect: e.expect
                              };
                         } catch (e) {
                              console.log('bye', e);
                         }
                    }).catch((res) => {
                         console.log('checkResources', err);
                         _deferred.reject('checkResources failed');
                    })
               }).catch((e) => {
                    _deferred.reject('checkResources problems creating scan/request');
               });
          })
     } catch (e) {
          console.log('e', e);
     }

     return _deferred.promise;
}

let urls = [{
     //minified javacsript
     url: 'http://www.myseodr.com/wp-includes/js/jquery/jquery-migrate.min.js?ver=1.4.1',
     gzip: true,
     type: 'application/javascript',
     status: '200',
     canMinify: true,
     encoding: 'gzip',
     cached: true,
     server: 'apache',
     expect:{
       minified: true
     }
},
{
    //unminified jpg
     url: 'http://www.myseodr.com/wp-content/uploads/2017/04/home-1.jpg',
     gzip: false,
     type: 'image/jpeg',
     status: '200',
     canMinify: true,
    //  encoding: 'gzip',
     cached: false,
     server: 'apache',
     expect:{
       minified: true
     }
},
{
     url: 'http://www.myseodr.com/wp-content/themes/velux/style.css?ver=1.1.0',
     gzip: false,
     type: 'text/css',
     status: '200',
     canMinify: true,
     encoding: 'gzip',
     cached: false,
     server: 'apache',
     expect:{
       minified: false
     }
},
{
     url: 'http://www.myseodr.com/',
     gzip: true,
     type: 'text/html; charset=UTF-8',
     status: '200',
     canMinify: true,
     encoding: 'gzip',
     cached: true,
     server: 'myseodr',
     expect:{
       minified: true
     }
}];

function checkResourceExists(deferred, ResourceID, passed, requestId, obj) {
     utils.findBy(Resource, {
          _id: ResourceID,
          requestId: requestId
     }, function (err, res) {
          console.log('checkResourceExists res', res, passed, obj);
          if(obj.minified){
            passed = (obj.minified === res.minified && passed);
          }
          deferred.resolve(passed);
     });
}

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
     console.log('checkResources success results:', res)
}).catch(() => {
     console.log('checkResources failture results:', res)
});
module.exports = process;
