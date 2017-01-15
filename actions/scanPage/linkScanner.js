/*
 * Routes handlers
 */
    var Q = require('q'),
    defaultOptions = require("./internal/defaultOptions"),
    UrlChecker = require("./UrlChecker"),
    isString = require("is-string"),
    _ = require("underscore"),
    parseHtml    = require("./internal/parseHtml"),
    bhttp    = require("bhttp"),
    linkObj      = require("./internal/linkObj"),
    matchUrl     = require("./internal/matchUrl"),
    linkObj     = require("./internal/linkObj"),
    simpleResponse = require("./internal/simpleResponse"),
    maybeCallback   = require("maybe-callback"),
    RobotDirectives = require("robot-directives"),
    parseOptions = require("./internal/parseOptions"),
    isString = require("is-string"),
    excludeLink = require('./internal/excludeLink'),
    reasons        = require("./internal/messages").reasons,
    getHostKey = require("./internal/getHostKey");

var enqueue = function(input,options) {
    var idOrError;

    // enqueue("url")
    if (typeof input === "string" || input instanceof String === true) {
        input = {
            url: input
        };
    }

    idOrError = _enqueue(input, options);
    return idOrError;
};


/*
    Add item to queue and item list.
*/
function _enqueue(input, options) {
    var hostKey = getHostKey(input.url, options);
    var id = input.id;

    if (hostKey === false) {
        return new Error("Invalid URI");
    }

    if (id == null) id = instance.counter++;

    if (instance.items[id] !== undefined) {
        return new Error("Non-unique ID");
    }

    options.items[id] = {
        active: false,
        hostKey: hostKey,
        id: id,
        input: input
    };

    return id;
}


/*
find:
HtmlChecker? Where is baseUrl defined
Find where UrlChecker gets baseUrl defined
Find where UrlChecker gets options defined
*/

var clean = function(link){
    delete link.html.base;  // TODO :: don't clean this?
    delete link.resolved;
    return link;
};


function enqueueLink(link, instance){
    // console.log('--',link,'---',instance);
    linkObj.resolve(link, instance.baseUrl, instance.options); /* What this do ?*/
    // Returns something like:
    //     var link = {
    //     resolve: true,
    //     html:{
    //         base: ''
    //     }
    //     base: {
    //         original: '',
    //         resolse: ''
    //     },
    //     samePage: true,
    //     internal: true,
    //     url: {
    //         resolved: '',
    //         parsed: ''
    //     }
    // };
    var excludedReason = excludeLink(link, instance);
    
    if (excludedReason !== false){
        link.html.offsetIndex = instance.excludedLinks++;
        link.excluded = true;
        link.excludedReason = excludedReason;
        
        clean(link);
        maybeCallback(instance.handlers.junk)(link);        
        return;
    }
    
    link.html.offsetIndex = link.html.index - instance.excludedLinks;
    link.excluded = false;
    
    instance.linkEnqueued = enqueue(link,instance.options);
    
    if (instance.linkEnqueued instanceof Error){     // TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
        link.broken = true;
        link.brokenReason = instance.linkEnqueued.message === "Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN";        // TODO :: update limited-request-queue to support path-only URLs        
        clean(link);
        maybeCallback(instance.handlers.link)(link);
    }
}

/*
    Copy data from a bhttp response object—either from a request or cache—
    into a link object.
*/
function copyResponseData(response, link, options){
    if (response instanceof Error === false){
        if (response.statusCode !== 200){
            link.broken = true;
            link.brokenReason = "HTTP_" + response.statusCode;
        } else {
            link.broken = false;
        }
        
        link.http.response = response;
        
        if (link.url.resolved !== response.url){
            link.url.redirected = response.url;
            if (link.base.resolved !== null){
                // TODO :: this needs a test
                linkObj.relation(link, link.url.redirected);
            }
        }

    } else {
        link.broken = true;
        if (reasons["ERRNO_"+response.code] != null){
            link.brokenReason = "ERRNO_" + response.code;
        // }
        /* else if (response.message === "Invalid URL"){ link.brokenReason = "BLC_INVALID";} */     
        } else {
            link.brokenReason = "BLC_UNKNOWN";
            link.actualReason = response.code;
        }
    }
    clean(link);
}

function checkUrl(link, baseUrl, options, retry, callback){
    var cached;
    
    if (typeof retry === "undefined"){
        if (isString(link) === true){
            link = linkObj(link);
            linkObj.resolve(link, baseUrl, options);
        }
        if (link.url.resolved === null){ // TODO :: move out to an `linkObj.invalidate()` to share with `HtmlChecker()` ?
            link.broken = true;
            link.brokenReason = "BLC_INVALID";
            clean(link);
            return Promise.resolve(link);
        }
    }
    
    var request = bhttp.request(link.url.resolved,  // TODO :: https://github.com/joepie91/node-bhttp/issues/3  {
        {
        discardResponse: true,
        headers: { "user-agent":options.userAgent },
        method: retry!==405 ? options.requestMethod : "get"
    }).then(function(response){
        response = simpleResponse(response);
        if (response.statusCode === 405 && options.requestMethod === "head" && options.retry405Head === true && retry !== 405){
            return checkUrl(link, baseUrl, cache, options, 405, callback);
        }
        return response;
    })
    .catch( function(error) {
        return error;
    });
    
    if (typeof retry === "undefined"){
        return request.then( function(response){
            // console.log('test');
            copyResponseData(response, link, options);
            link.http.cached = false;
            return link;
        });
    } else {
        return request;
    }
}

module.exports.init = function(input,callback){

//  console.log('test');

    var instance = {
        items: {

        },
        counter: 0,
        baseUrl: input.baseUrl,
        options: defaultOptions,
        excludedLinks: 0,
        linkEnqueued: {
            message: ''
        },
        handlers: {
            junk: function(){

            },
            link: function(){

            }
        }
    }

    defaultOptions.items = {
        
    }

    var link = {
        id: '1',
        base: {
            original:instance.baseUrl,
            parsed:""
        },
        http:{
            cached: ""
        },
        url: { 
            original: input.url, 
            parsed: ''
             },
        html: {
            offsetIndex: '',
            index: ''
        },
        excluded: '',
        excludedReason:'',
        broken: '',
        brokenReason: ''
    }


            // "link":{
            //    "excludedReason":null,
            //    "brokenReason":null,
            //    "excluded":false,
            //    "samePage":false,
            //    "internal":true,
            //    "broken":false,
            //    "http":{
            //       "response":{
            //          "redirects":[

            //          ],
            //          "url":"https://example.myportfolio.com/projects",
            //          "statusMessage":"OK",
            //          "statusCode":200,
            //          "httpVersion":"1.1",
            //          "headers":{
            //             "vary":"Accept-Encoding,Fastly-SSL",
            //             "x-timer":"S1483917628.247880,VS0,VE0",
            //             "x-cache-hits":"2",
            //             "x-cache":"HIT",
            //             "x-served-by":"cache-atl6240-ATL",
            //             "connection":"close",
            //             "age":"65413",
            //             "via":"1.1 varnish",
            //             "date":"Sun, 08 Jan 2017 23:20:28 GMT",
            //             "accept-ranges":"bytes",
            //             "content-length":"42776",
            //             "x-xss-protection":"1; mode=block",
            //             "x-trace-id":"EaHlAgfhD09t4bzUPx6C/GMHe0c",
            //             "x-content-type-options":"nosniff",
            //             "strict-transport-security":"max-age=31536000",
            //             "server":"nginx",
            //             "content-type":"text/html; charset=UTF-8",
            //             "cache-control":"s-maxage=86400"
            //          }
            //       },
            //       "cached":true
            //    },
            //    "html":{
            //       "tag":"<a href=\"/projects\">",
            //       "text":"Projects",
            //       "attrs":{
            //          "href":"/projects"
            //       },
            //       "attrName":"href",
            //       "tagName":"a",
            //       "selector":"html > body > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > header:nth-child(1) > div:nth-child(2) > nav:nth-child(1) > div:nth-child(1) > a:nth-child(1)",
            //       "location":{
            //          "endOffset":13373,
            //          "startOffset":13357,
            //          "col":37,
            //          "line":97
            //       },
            //       "offsetIndex":12,
            //       "index":17
            //    },
            //    "base":{
            //       "resolved":"https://example.myportfolio.com/out-of-this-world-christmas",
            //       "original":"https://example.myportfolio.com/out-of-this-world-christmas"
            //    },
            //    "url":{
            //       "redirected":null,
            //       "resolved":"https://example.myportfolio.com/projects",
            //       "original":"/projects"
            //    }


    // console.log('init!');
    enqueueLink(link,instance);
    checkUrl(link, instance, defaultOptions,undefined,function() {console.log('t');callback();}).then(function(e){
        // console.log(e);
        callback(e);
    });
}