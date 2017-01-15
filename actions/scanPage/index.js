/*
 * Routes handlers
 */
    var Q = require('q'),
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
    console.log('link',link,'instance',instance);
    
    linkObj.resolve(link, instance.baseUrl, instance.options); /* What this do ?*/
    
    var excludedReason = excludeLink(link, instance);
    
    if (excludedReason !== false){
        link.html.offsetIndex = instance.excludedLinks++;
        link.excluded = true;
        link.excludedReason = excludedReason;
        
        linkObj.clean(link);
        console.log('link?????');
        maybeCallback(instance.handlers.junk)(link);
        
        return;
    }
    
    link.html.offsetIndex = link.html.index - instance.excludedLinks;
    link.excluded = false;
    
    instance.linkEnqueued = instance.urlChecker.enqueue(link);
    
    // TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
    if (instance.linkEnqueued instanceof Error){
        link.broken = true;
        // TODO :: update limited-request-queue to support path-only URLs
        link.brokenReason = instance.linkEnqueued.message==="Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN";
        
        linkObj.clean(link);
    
        maybeCallback(instance.handlers.link)(link);
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
            console.log('done???');
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
    console.log('html!!!');
    var tree;
    var thisObj = this;
    
    if (instance.active === false){

        instance.active = true;
        instance.baseUrl = baseUrl;
        instance.robots = robots;
        
        parseHtml(html).then(function(document){
            console.log('document!');
            // return;
            tree = document;
            return scrapeHtml(document, robots);
        }).then( function(links){
            if(links){
                console.log('index.js: Number of links on page',links &&links.length);
            } else {
                console.log('index.js: Number of links on page',0);
            }
            instance.foundLinks = links;
            maybeCallback(instance.handlers.html)(tree,instance.robots,links);
            maybeCallback(instance.handlers.links)(links);
            if(scanLinks !== false){
                _.each(links,function(link){
                    enqueueLink(link,instance);
                });
            }
            
            instance.parsed = true;
            
            if (instance.urlChecker.numActiveLinks() === 0 && instance.urlChecker.numQueuedLinks() === 0){
                // complete(instance);
                console.log('test--->');
                finished.cb('done!',instance);
            }
        });   
        return true;
    }
    return false;
};

module.exports.init = function processPageRequest(input, callback) {
    finished.cb = callback;
    var response = {
        links: {
            all:[],
            broken: [],
            internal: [],
            checked:[]
        }
    };

    var url = input.url;
    var cache = {
        set: function(){

        },
    }; /* URL CACHE */
    myHtmlChecker.options.cacheResponses = false;
    
    streamHtml(url,cache,myHtmlChecker.options).then( function(result){
        console.log('result!!!');
        myHtmlChecker.currentResponse = result.response;
        myHtmlChecker.currentRobots = new RobotDirectives({ /* What is this? */
            userAgent: myHtmlChecker.options.userAgent /* Is default what we want? */
        });      
        robotHeaders(myHtmlChecker);
        // defaultOptions.userAgent                  
        // Passes robots instance so that headers are included in robot exclusion checks
        scan(result.stream, result.response.url, myHtmlChecker.currentRobots,myHtmlChecker,input.scanLinks);
        // callback(true);
    }).catch( function(error){
        callback(false,error);
    });
}