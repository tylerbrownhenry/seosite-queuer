const scrapeHtml = require("../sniff/linkChecker/initScrapeHtml"),
     createHAR = require("./createHAR"),
     softwareSummary = require('../softwareSummary'),
     validateW3C = require("../../settings/requests/w3cValidate/process").publish,
     _ = require("underscore"),
     q = require("q");

/**
 * finds all emails in a string
 * @param  {String} text string of text to parse
 * @return {Array}      list of emails found in string
 */
function extractEmails(text) {
     return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

/**
 * handles html content from a page scan
 * @param  {Object} response object containing summary data of page scan
 * @param  {Object} options  options for page scan
 * @param  {Object} pageInfo results from parsing html
 */
module.exports = (response, options, pageInfo) => {
     console.log('tapTargetCheck',pageInfo);
     let deferred = q.defer();
     response.title = pageInfo.title;
     pageInfo.content = (pageInfo && pageInfo.content) ? pageInfo.content : '';
     response.content = {
          mimeType: response.mimeType,
          size: pageInfo.content.length
     };

     let emails = extractEmails(pageInfo.content);

     validateW3C({
          html: pageInfo.content,
          parse: true,
          requestId: options.requestId
     });

     softwareSummary(options.address, response, pageInfo).then((res) => {
          console.log('evaluate results softwareSummary res', res);
          scrapeHtml(pageInfo.content, options.address, options.customHeaders, options.requestId).then((instance) => {
               var har = createHAR(response);
               har.fontInfo = pageInfo.fontInfo;
               har.socialInfo = pageInfo.socialInfo;
               har.htmlResults = instance.htmlResults
               har.links = instance.foundLinks;
               har.softwareSummary = res.softwareSummary;
               har.url = {
                    resolvedUrl: options.url,
                    url: options.address
               };
               har.emails = emails;
               deferred.resolve(har);
          }).catch((e) => {
               console.log('evaluteResults err', e);
               deferred.reject(e);
          });
     });
return deferred.promise;

}
