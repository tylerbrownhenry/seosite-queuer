/*
 * Routes handlers
 */
var q = require('q'),
defaultOptions = require("./internal/defaultOptions"),
UrlChecker = require("./UrlChecker"),
isString = require("is-string"),
_ = require("underscore"),
parseHtml = require("./internal/parseHtml"),
bhttp = require("bhttp"),
matchUrl = require("./internal/matchUrl"),
linkObj = require("./internal/linkObj"),
simpleResponse = require("./internal/simpleResponse"),
maybeCallback = require("maybe-callback"),
RobotDirectives = require("robot-directives"),
parseOptions = require("./internal/parseOptions"),
isString = require("is-string"),
excludeLink = require('./internal/excludeLink'),
reasons = require("./internal/messages").reasons,
getHostKey = require("./internal/getHostKey");

var enqueue = function(input, options) {
    var idOrError;
    if (typeof input === "string" || input instanceof String === true) {
        input = {
            url: input
        };
    }
    idOrError = _enqueue(input, options);
    return idOrError;
};

function _enqueue(input, options) {
    var hostKey = getHostKey(input.url, options);
    var id = input.id;

    if (hostKey === false) {
        return new Error("Invalid URI");
    }

    if (id == null && typeof instance !== 'undefined'){
        id = instance.counter++;

    } 

    if (typeof instance !== 'undefined' && instance.items[id] !== undefined) {
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

var clean = function(link) {
    delete link.html.base;
    delete link.resolved;
    return link;
};


function enqueueLink(link, instance) {
    linkObj.resolve(link, instance.baseUrl, instance.options); 

    var excludedReason = excludeLink(link, instance);

    if (excludedReason !== false) {
        link.html.offsetIndex = instance.excludedLinks++;
        link.excluded = true;
        link.excludedReason = excludedReason;

        clean(link);
        maybeCallback(instance.handlers.junk)(link);
        return;
    }

    link.html.offsetIndex = link.html.index - instance.excludedLinks;
    link.excluded = false;

    instance.linkEnqueued = enqueue(link, instance.options);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    console.log('instance.linkEnqueued',instance.linkEnqueued);
    if (instance.linkEnqueued instanceof Error) { // TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
        link.broken = true;
        link.brokenReason = instance.linkEnqueued.message === "Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN"; // TODO :: update limited-request-queue to support path-only URLs        
        link._brokenReason = instance.linkEnqueued;
        clean(link);
        maybeCallback(instance.handlers.link)(link);
    }
}

function copyResponseData(response, link) {
    if (response instanceof Error === false) {
        if (response.statusCode !== 200) {
            link.broken = true;
            link.brokenReason = "HTTP_" + response.statusCode;
        } else {
            link.broken = false;
        }

        link.http.response = response;

        if (link.url.resolved !== response.url) {
            link.url.redirected = response.url;
            if (link.base.resolved !== null) {
                linkObj.relation(link, link.url.redirected); // TODO :: this needs a test
            }
        }

    } else {
        link.broken = true;
        if (reasons["ERRNO_" + response.code] != null) {
            link.brokenReason = "ERRNO_" + response.code;
        } else {
            link.brokenReason = "BLC_UNKNOWN";
            link.actualReason = response;
        }
    }
    clean(link);
}

function checkUrl(link, baseUrl, options, retry, method) {
    var cached;

    if (retry === undefined) {
        if (isString(link) === true) {
            link = linkObj(link);
            linkObj.resolve(link, baseUrl, options);
        }
        if (link.url.resolved === null) {
            link.broken = true;
            link.brokenReason = "BLC_INVALID";
            linkObj.clean(link);
            return Promise.resolve(link);
        }
    }

    var request = bhttp.request(link.url.resolved, // TODO :: https://github.com/joepie91/node-bhttp/issues/3
        {
            discardResponse: true,
            headers: {
                "user-agent": options.userAgent
            },
            method: retry !== 405 ? options.requestMethod : method
        }).then(function(response) {
        response = simpleResponse(response);
        if (response.statusCode === 405 && method !== 'post' && options.requestMethod === "head" && options.retry405Head === true && retry !== 405) {
            return checkUrl(link, baseUrl, options, 405,"get"); // Retry possibly broken server with "get"
        }
        if (retry === 405 && method === 'get') {
            return checkUrl(link, baseUrl, options, 405,"post"); // Retry possibly broken server with "get"
        }
        return response;
    }).catch(function(error) {
        return error; // The error will be stored as a response
    });

    if (retry === undefined) {
        return request.then(function(response) {
            copyResponseData(response, link, options);
            link.http.cached = false;
            return link;
        });
    } else {
        return request;
    }
}

module.exports.init = function(input) {
    var promise = q.defer();
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
            junk: function() {

            },
            link: function() {

            }
        },
    }

    var link = input._link

    defaultOptions.items = {}

    instance.robots = new RobotDirectives({
        userAgent: instance.options.userAgent
    });;

    enqueueLink(link, instance);
    console.log('checking url');
    var resp = checkUrl(link.url.original, input.baseUrl, defaultOptions);

    resp.then(function(_link) {
        promise.resolve(_link);
    });

    return resp;
}