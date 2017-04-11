"use strict";
var errors = require("./messages").errors,
     simpleResponse = require("./simpleResponse"),
     checkErrors = require("./checkErrors"),
     bhttp = require("bhttp"),
     q = require("q");

function stream(url, options) {
     var promise = q.defer(),
          result;
     bhttp.get(url, {
          discardResponse: true,
          headers: {
               "user-agent": options.userAgent
          },
          stream: true
     }).then(function (orgResponse) {
          var response = simpleResponse(orgResponse);
          result = checkErrors(response);

          if (typeof result === 'undefined') {
               result = {
                    response: response,
                    stream: orgResponse
               };
          }
          if (response instanceof Error) {
               throw response;
          }
          if (result instanceof Error) {
               throw result;
          }
          return promise.resolve(result);
     }).catch(function (error) {
          promise.reject({
               status: 'error',
               message: error
          });
     });
     return promise.promise;
}

module.exports = stream;
