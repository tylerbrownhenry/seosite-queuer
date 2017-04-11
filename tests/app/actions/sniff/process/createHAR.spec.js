var chai = require('chai'),
     expect = chai.expect,
     createHAR = require('../../../../../app/actions/sniff/process/createHAR'),
     utils = require('../../../../../app/utils'),
     sinon = require('sinon');

describe('app/actions/sniff/process/createHAR.js:', function () {
    var page = {
      address:'http:www.url.com',
      options: {
        bodies:{

        }
      },
      title:'Title',
      types: {

      },
      startTime: new Date(),
      endTime: new Date(),
      cookies:[],
      content: {}
    };
     it('returns empty entries if resources are blank', function (done) {
          var har = createHAR(page);
          expect(har.log.entries.length === 0).to.equal(true);
          done();
     });


     it('processes resources when given', function (done) {
       page.resources = {
         "1":{
            "request":{
               "headers":[
                  {
                     "name":"Accept",
                     "value":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                  },
                  {
                     "name":"User-Agent",
                     "value":"Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1"
                  }
               ],
               "id":1,
               "method":"GET",
               "time":"2017-04-10T22:24:01.472Z",
               "url":"data:http://www.mariojacome.com/"
            },
            "startReply":null,
            "endReply":{
               "contentType":"text/html; charset=UTF-8",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:58 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Location",
                     "value":"http://mariojacome.com/"
                  },
                  {
                     "name":"Content-Length",
                     "value":"0"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/html; charset=UTF-8"
                  }
               ],
               "id":1,
               "redirectURL":"http://mariojacome.com/",
               "stage":"end",
               "status":301,
               "statusText":"Moved Permanently",
               "time":"2017-04-10T22:24:01.959Z",
               "url":"http://www.mariojacome.com/"
            }
         },
         "2":{
            "request":{
               "headers":[
                  {
                     "name":"Accept",
                     "value":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                  },
                  {
                     "name":"User-Agent",
                     "value":"Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1"
                  }
               ],
               "id":2,
               "method":"GET",
               "time":"2017-04-10T22:24:01.960Z",
               "url":""
            },
            "startReply":{
               "body":"",
               "bodySize":11788,
               "contentType":"text/html; charset=UTF-8",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Link",
                     "value":"<http://mariojacome.com/?rest_route=/>; rel=\"https://api.w.org/\", <http://mariojacome.com/>; rel=shortlink"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Transfer-Encoding",
                     "value":"chunked"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/html; charset=UTF-8"
                  }
               ],
               "id":2,
               "redirectURL":null,
               "stage":"start",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.520Z",
               "url":"http://mariojacome.com/"
            },
            "endReply":{
               "contentType":"text/html; charset=UTF-8",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Link",
                     "value":"<http://mariojacome.com/?rest_route=/>; rel=\"https://api.w.org/\", <http://mariojacome.com/>; rel=shortlink"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Transfer-Encoding",
                     "value":"chunked"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/html; charset=UTF-8"
                  }
               ],
               "id":2,
               "redirectURL":null,
               "stage":"end",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.629Z",
               "url":"http://mariojacome.com/"
            }
         },
         "3":{
            "request":{
              url:'data:test',
              time:"2017-04-10T22:24:02.534Z",
            },
            "startReply":{
               "body":"",
               "bodySize":1092,
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Fri, 07 Oct 2016 17:24:02 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"1092"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":3,
               "redirectURL":null,
               "stage":"start",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.689Z",
               "url":"http://mariojacome.com/wp-content/themes/semplice/css/reset.css"
            },
            "endReply":{
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Fri, 07 Oct 2016 17:24:02 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"1092"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":3,
               "redirectURL":null,
               "stage":"end",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.690Z",
               "url":"http://mariojacome.com/wp-content/themes/semplice/css/reset.css"
            }
         },
         "4":{
            "request":{
               "headers":[
                  {
                     "name":"Accept",
                     "value":"text/css,*/*;q=0.1"
                  },
                  {
                     "name":"Referer",
                     "value":"http://mariojacome.com/"
                  },
                  {
                     "name":"User-Agent",
                     "value":"Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1"
                  }
               ],
               "id":4,
               "method":"GET",
               "time":"2017-04-10T22:24:02.559Z",
               "url":"data:http://mariojacome.com/wp-content/themes/semplice/style.css"
            },
            "startReply":{
               "body":"",
               "bodySize":1253,
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Fri, 07 Oct 2016 17:24:00 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"1253"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":4,
               "redirectURL":null,
               "stage":"start",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.719Z",
               "url":"http://mariojacome.com/wp-content/themes/semplice/style.css"
            },
            "endReply":{
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Fri, 07 Oct 2016 17:24:00 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"1253"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=512"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":4,
               "redirectURL":null,
               "stage":"end",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.721Z",
               "url":"http://mariojacome.com/wp-content/themes/semplice/style.css"
            }
         },
         "5":{
            "request":{
               "headers":[
                  {
                     "name":"Accept",
                     "value":"text/css,*/*;q=0.1"
                  },
                  {
                     "name":"Referer",
                     "value":"http://mariojacome.com/"
                  },
                  {
                     "name":"User-Agent",
                     "value":"Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1"
                  }
               ],
               "id":5,
               "method":"GET",
               "time":"2017-04-10T22:24:02.570Z",
               "url":"http://mariojacome.com/wp-includes/js/mediaelement/mediaelementplayer.min.css?ver=2.22.0"
            },
            "startReply":{
               "body":"",
               "bodySize":2652,
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Mon, 18 Jul 2016 14:59:30 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"20431"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=511"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":5,
               "redirectURL":null,
               "stage":"start",
               "status":200,
               "statusText":"OK",
               "time": new Date(),
               "url":"http://mariojacome.com/wp-includes/js/mediaelement/mediaelementplayer.min.css?ver=2.22.0"
            },
            "error":true,
            "endReply":{
               "contentType":"text/css",
               "headers":[
                  {
                     "name":"Date",
                     "value":"Mon, 10 Apr 2017 22:15:59 GMT"
                  },
                  {
                     "name":"Server",
                     "value":"Apache"
                  },
                  {
                     "name":"Last-Modified",
                     "value":"Mon, 18 Jul 2016 14:59:30 GMT"
                  },
                  {
                     "name":"Accept-Ranges",
                     "value":"bytes"
                  },
                  {
                     "name":"Content-Length",
                     "value":"20431"
                  },
                  {
                     "name":"Keep-Alive",
                     "value":"timeout=15, max=511"
                  },
                  {
                     "name":"Connection",
                     "value":"Keep-Alive"
                  },
                  {
                     "name":"Content-Type",
                     "value":"text/css"
                  }
               ],
               "id":5,
               "redirectURL":null,
               "stage":"end",
               "status":200,
               "statusText":"OK",
               "time":"2017-04-10T22:24:02.722Z",
               "url":"http://mariojacome.com/wp-includes/js/mediaelement/mediaelementplayer.min.css?ver=2.22.0"
            }
         }
       }
          var har = createHAR(page);
          expect(har.log.entries.length === 2).to.equal(true);
          done();
     });
});
