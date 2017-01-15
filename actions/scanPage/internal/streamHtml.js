"use strict";
var errors         = require("./messages").errors,
simpleResponse = require("./simpleResponse"),
checkErrors = require("./checkErrors"),
bhttp = require("bhttp");

/*
Request a URL for its HTML contents and return a stream.
*/
function streamHtml(url, cache, options){
    var result;
    
    var request = bhttp.get(url,{  // TODO :: https://github.com/joepie91/node-bhttp/issues/3   // Always gets the URL because response bodies are never cached
        discardResponse: true,
        headers: { "user-agent":options.userAgent },
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
        return response;
    }).catch( function(error){
        return error;
    });
    
    if (options.cacheResponses === true){
        cache.set(url, request);
    }
    
    return request.then(function(response){
        if (response instanceof Error === true){
            throw response;
        }
        if (result instanceof Error === true){
            throw result;
        } 
        return result;
    });
}

module.exports = streamHtml;