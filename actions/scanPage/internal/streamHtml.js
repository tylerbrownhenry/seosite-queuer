"use strict";
var errors         = require("./messages").errors,
simpleResponse = require("./simpleResponse"),
checkErrors = require("./checkErrors"),
bhttp = require("bhttp"),
q = require("q");

/*
Request a URL for its HTML contents and return a stream.
*/

function stream(url, cache, options){
    var promise = q.defer();
    var result;
    console.log('streamhtml...','url',url,'userAgent',options.userAgent);
    bhttp.get(url,{                                                 // TODO :: https://github.com/joepie91/node-bhttp/issues/3   // Always gets the URL because response bodies are never cached
        discardResponse: true,
        headers: { 
            "user-agent": options.userAgent 
        },
        stream: true
    }).then(function(orgResponse){
        var response = simpleResponse(orgResponse);
        result = checkErrors(response);
        
        if (typeof result === 'undefined'){
            result = {
                response: response,
                stream: orgResponse
            };   
            if (options.cacheResponses === true && response.url !== url){
                cache.set(response.url, response);
            }
        }
        console.log('result',result);
        if (response instanceof Error === true){
            throw response;
        }
        if (result instanceof Error === true){
            throw result;
        } 
        return promise.resolve(result);
    }).catch( function(error){
        console.log('Typeof Error ',typeof error,error);
        if(typeof error === 'MultipartError'){

        } else if(typeof error === 'bhttpError'){

        } else if(typeof error === 'ConflictingOptionsError'){

        } else if(typeof error === 'UnsupportedProtocolError'){

        } else if(typeof error === 'RedirectError'){

        } else if(typeof error === 'ConnectionTimeoutError'){

        } else if(typeof error === 'ResponseTimeoutError'){

        } else {

        }
        promise.reject({status:'error',message:error});
    });
    return promise.promise;
}

module.exports = stream;