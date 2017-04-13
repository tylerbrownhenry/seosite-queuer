var chai = require('chai'),
     expect = chai.expect,
     handleEntry = require('../../../../app/actions/sniff/handleEntry'),
     utils = require('../../../../app/utils'),
     request = require('request'),
     sinon = require('sinon');

describe('app/actions/sniff/handleEntry.js', function () {
     var stubUtils;
     var options = {
          "url": "http://www.mariojacome.com",
          "uid": "17PmsI",
          "options": {
               "save": {
                    "captures": false,
                    "scan": true,
                    "resources": true,
                    "metaData": true,
                    "links": true
               },
               "check": {
                    "links": true,
                    "resources": true,
                    "security": true,
                    "meta": true
               },
               "type": "page",
               "filterLimit": 10,
               "digDepthLimit": 1,
               "excludeExternalLinks": false,
               "honorRobotExclusions": true,
               "excludedSchemes": false,
               "saveSelectors": false,
               "linkInformation": {
                    "selector": false,
                    "element": false,
                    "location": false,
                    "redirects": false,
                    "status": false,
                    "url": false,
                    "href": false,
                    "parent": false
               },
               "acceptedSchemes": [
                    "http"
               ]
          },
          "requestId": "2tBzJz",
          "delay": 0
     };

     var entry = {
          "cache": {

          },
          "pageref": "http://www.mariojacome.com",
          "request": {
               "bodySize": 4233,
               "cookies": [

               ],
               "headers": [{
                         "name": "Accept",
                         "value": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                    },
                    {
                         "name": "User-Agent",
                         "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1"
                    }
               ],
               "headersSize": 0,
               "httpVersion": "HTTP/1.1",
               "method": "GET",
               "queryString": [

               ],
               "url": "http://mariojacome.com/"
          },
          "response": {
               "cookies": [

               ],
               "headers": [{
                         "name": "Date",
                         "value": "Wed, 12 Apr 2017 02:50:46 GMT"
                    },
                    {
                         "name": "Server",
                         "value": "Apache"
                    },
                    {
                         "name": "Link",
                         "value": "<http://mariojacome.com/?rest_route=/>; rel=\"https://api.w.org/\", <http://mariojacome.com/>; rel=shortlink"
                    },
                    {
                         "name": "Keep-Alive",
                         "value": "timeout=15, max=512"
                    },
                    {
                         "name": "Connection",
                         "value": "Keep-Alive"
                    },
                    {
                         "name": "Transfer-Encoding",
                         "value": "chunked"
                    },
                    {
                         "name": "Content-Type",
                         "value": "text/html; charset=UTF-8"
                    }
               ],
               "headersSize": -1,
               "httpVersion": "HTTP/1.1",
               "redirectURL": "",
               "status": 200,
               "statusText": "OK",
               "content": {
                    "_type": "doc",
                    "mimeType": "text/html; charset=UTF-8",
                    "text": null
               }
          },
          "startedDateTime": "2017-04-12T02:58:53.795Z",
          "time": 1211,
          "timings": {
               "blocked": 0,
               "dns": -1,
               "connect": -1,
               "send": 0,
               "wait": 761,
               "receive": 450,
               "ssl": -1
          }
     };

     var res = {
         on:function(type,fn){
           return {
             on: function(type,fn){
               fn();
             }
           }
         },
          "statusCode": 200,
          "headers": {
               "date": "Wed, 12 Apr 2017 03:05:30 GMT",
               "server": "Apache",
               "last-modified": "Wed, 11 Jan 2017 18:04:43 GMT",
               "accept-ranges": "bytes",
               "content-length": "49770",
               "connection": "close",
               "content-type": "application/x-font-woff"
          },
          "request": {
               "uri": {
                    "protocol": "http:",
                    "slashes": true,
                    "auth": null,
                    "host": "mariojacome.com",
                    "port": 80,
                    "hostname": "mariojacome.com",
                    "hash": null,
                    "search": null,
                    "query": null,
                    "pathname": "/webfonts/32D00E_1_0.woff",
                    "path": "/webfonts/32D00E_1_0.woff",
                    "href": "http://mariojacome.com/webfonts/32D00E_1_0.woff"
               },
               "method": "GET",
               "headers": {
                    "Referer": "http://mariojacome.com/",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1",
                    "Accept": "*/*"
               }
          }
     };
     var idx = 0;

     var headers = handleEntry.createHeaders(entry);
     var rawReqHeaders = handleEntry.handleHeaders('HTTP/1.1 GET ' + entry.request.url + '\r\n', headers);
     rawReqHeaders += '\r\n';

     beforeEach(function () {
          stubUtils = sinon.stub(request, 'get', function (a, b, c, cb) {
            console.log('TEST--!!');
               cb(true);
          });
     });
     afterEach(function () {
          stubUtils.restore();
     })

     it('entryHandler', function () {
          handleEntry.entryHandler(entry, idx,options).then(function (e) {
               console.log('test', e);
               expect(e.retry).to.equal(true);
               done();
          });
     });

     it('processRequest', function () {
         var promise = q.defer();
          handleEntry.processRequest(promise,res,entry,options,idx,rawReqHeaders);
     });

     it('tally', function () {
         var promise = q.defer();
          handleEntry.tally(promise,options,entry,rawReqHeaders,'http:fakeheader','html..',123,123,1);
     });
});
