var scrapeHtml = require("../sniff/linkChecker/initScrapeHtml");
var createHAR = require("./createHAR");
var validateW3C = require("../../settings/requests/w3cValidate/process").publish;
var _ = require("underscore");
var q = require("q");

function extractEmails(text) {
     return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

module.exports = function (response, options, pageInfo) {
      var promise = q.defer();
     response.title = pageInfo.title;
     response.content = {
          mimeType: response.mimeType,
          size: pageInfo.content.length,
     };

     var emails = extractEmails(pageInfo.content);
     validateW3C({html:pageInfo.content,parse:true,requestId:options.requestId});


     scrapeHtml(pageInfo.content, options.address, options.customHeaders, options.requestId).then(function (instance) {
          var har = createHAR(response);
          har.fontInfo = pageInfo.fontInfo;
          har.socialInfo = pageInfo.socialInfo;
          har.htmlResults = instance.htmlResults
          har.links = instance.foundLinks;
          har.url = {
               resolvedUrl: options.url,
               url: options.address
          };
          // har.emails = passedEmails;
          promise.resolve(har);
     });
     return promise.promise;

}
