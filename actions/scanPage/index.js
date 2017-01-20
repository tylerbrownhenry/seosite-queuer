var q = require('q'),
defaultOptions = require("./internal/defaultOptions"),
UrlChecker = require("./UrlChecker"),
linkTypes = require("link-types").map,
isString = require("is-string"),
_ = require("underscore"),
parseHtml    = require("./internal/parseHtml"),
streamHtml = require("./internal/streamHtml"),
linkObj      = require("./internal/linkObj"),
matchUrl     = require("./internal/matchUrl"),
scrapeHtml   = require("./internal/scrapeHtml"),
maybeCallback   = require("maybe-callback"),
RobotDirectives = require("robot-directives"),
parseOptions = require("./internal/parseOptions"),
excludeLink = require('./internal/excludeLink'),
isString = require("is-string");

function enqueueLink(link, instance){    

    linkObj.resolve(link, instance.baseUrl, instance.options); 
    
    var excludedReason = excludeLink(link, instance);
    
    if (excludedReason !== false){
        link.html.offsetIndex = instance.excludedLinks++;
        link.excluded = true;
        link.excludedReason = excludedReason;        
        linkObj.clean(link);
        return;
    }
    
    link.html.offsetIndex = link.html.index - instance.excludedLinks;
    link.excluded = false;
    
    instance.linkEnqueued = instance.urlChecker.enqueue(link);
    
    if (instance.linkEnqueued instanceof Error){  // TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
        link.broken = true;
        link.brokenReason = instance.linkEnqueued.message==="Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN";  // TODO :: update limited-request-queue to support path-only URLs
        linkObj.clean(link);
    }
}

function complete(message,instance){
    console.log('complete!!!');
    finished.cb(message,instance);
    // reset(instance);
    // maybeCallback(instance.handlers.complete)();
}

function HtmlChecker(options, handlers){
    var thisObj = this; 
    reset(this);
    
    this.handlers = handlers || {};
    this.options = parseOptions(options);
    this.urlChecker = new UrlChecker(this.options,{
        link: function(result){
            maybeCallback(thisObj.handlers.link)(result);
        },
        end: function(){
            console.log('done??? index');
            // If stream finished
            if (thisObj.parsed === true){
                console.log('test--->');

                complete(thisObj);
               // finished.cb('done!',instance);
            }
        }
    });
}

HtmlChecker.prototype.clearCache = function(){
    return this.urlChecker.clearCache();
};

HtmlChecker.prototype.numActiveLinks = function(){
    return this.urlChecker.numActiveLinks();
};

HtmlChecker.prototype.numQueuedLinks = function(){
    return this.urlChecker.numQueuedLinks();
};

HtmlChecker.prototype.pause = function(){
    return this.urlChecker.pause();
};

HtmlChecker.prototype.resume = function(){
    return this.urlChecker.resume();
};

HtmlChecker.prototype.__getCache = function(){
    return this.urlChecker.__getCache();
};

//::: PRIVATE FUNCTIONS

function complete(instance){
    reset(instance);
    maybeCallback(instance.handlers.complete)();
}

function reset(instance){
    instance.active = false;
    instance.baseUrl = undefined;
    instance.excludedLinks = 0;
    instance.linkEnqueued = null;
    instance.parsed = false;
    instance.robots = null;
}

function processDocument(document){
    myHtmlChecker.document = document;
    console.log('Process the html document here, look for meta tags etc!');
}

var options = parseOptions(options);
    
var myHtmlChecker = new HtmlChecker(options,{
        /* Added */
        links: function(links){
            console.log('all of the links found on the page processed here, maybe do socket.io broadcast?');
            // console.log('links',links);
        },
        html: function(tree, robots){
            console.log('html document');
            processDocument(tree);
            // maybeCallback(thisObj.handlers.html)(tree, robots, thisObj.currentResponse, thisObj.currentPageUrl, thisObj.currentCustomData);
        },
        _filter: function(result){
            console.log('put a custom filter here and return a string for why a link on a page would not / should not pass!!! User limit up?');
            /*
                Part of user's list?
                User is at their limit?
            */
            // Undocumented handler for excluding links via custom constraints
            // return maybeCallback(thisObj.handlers._filter)(result);
        },
        junk: function(result){
            console.log('testHTMLCHECKER!!!');
            // maybeCallback(thisObj.handlers.junk)(result, thisObj.currentCustomData);
        },
        link: function(result){
            console.log('testHTMLCHECKER!!!');
            // maybeCallback(thisObj.handlers.link)(result, thisObj.currentCustomData);
        },
        complete: function(){
            console.log('testHTMLCHECKER!!!');
            finished.cb(this, null);
        }
    });

    myHtmlChecker.urlChecker = new UrlChecker(this.options,{
        link: function(result){
            console.log('done!');
            // maybeCallback(thisObj.handlers.link)(result);
        },
        end: function(){
            console.log('done! end!',this.parsed,myHtmlChecker.parsed);
            // If stream finished
            if (myHtmlChecker.parsed === true){
                // complete(this);
                // finished.cb('done!',myHtmlChecker);
            }
        }
    });

    var finished = {
        cb: function(){
            console.log('callback not given!');
        }
    }

function robotHeaders(instance){
    if (instance.currentResponse.headers["x-robots-tag"] != null){     // TODO :: https://github.com/joepie91/node-bhttp/issues/20 // TODO :: https://github.com/nodejs/node/issues/3591
        instance.currentRobots.header(instance.currentResponse.headers["x-robots-tag"]);
    }
}


function scan(html, baseUrl, robots, instance, scanLinks){

    var promise = q.defer();
    var tree;
    var thisObj = this;

    instance.baseUrl = baseUrl;
    instance.robots = robots;
        
    parseHtml(html).then(function(document){
        tree = document;
        return scrapeHtml(document, robots);
    }).then( function(links){

        instance.foundLinks = links;
        instance._tree = tree;

        if(typeof instance !== 'undefined' || typeof instance.foundLinks === 'undefined' || instance.foundLinks === null || instance.foundLinks.length === 0){
            return promise.resolve(instance);
        }
        
        _.each(links,function(link){
            enqueueLink(link,instance);
        });
        
        instance.parsed = true;
        promise.resolve(instance);

    }).catch(function(err){
        promise.reject({status:'error',message:err});
    });

    return promise.promise;
};

module.exports.init = function processPageRequest(input) {
    console.log('init pageScanner...')
    var promise = q.defer();
    var url = input.url;
    var cache = {
        set: function(){

        }
    }; 
    myHtmlChecker.options.cacheResponses = false;
    streamHtml(url,cache,myHtmlChecker.options).then(function(result){
        console.log('streamHtml success...')
        myHtmlChecker.currentResponse = result.response;
        myHtmlChecker.currentRobots = new RobotDirectives({
            userAgent: myHtmlChecker.options.userAgent /* Is default what we want? */
        });      
        robotHeaders(myHtmlChecker);
        scan(result.stream, result.response.url, myHtmlChecker.currentRobots,myHtmlChecker,input.scanLinks).then(function(data){
            console.log('scan success...');
            promise.resolve(data);
        }).catch(function(err){
            console.log('scan failure...')
            promise.reject(err);
        });
    }).catch(function(err){
        console.log('streamHtml failure...')
        promise.reject(err);
    });
    return promise.promise;

}