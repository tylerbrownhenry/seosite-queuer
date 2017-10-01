let dynamoose = require('dynamoose'),
     querystring = require('querystring'),
     linkScanner = require("../../../../actions/sniff/linkScanner"),
     linkSchema = require("../../../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
     utils = require('../../../../utils'),
     _ = require('underscore'),
     q = require('q');

/**
 * looks in an array for a key or key value pair
 * @param  {Array} arr
 * @param  {String} key
 * @param  {String} value
 * @return {Boolean}
 */
function findAttr(arr, key, value) {
     return typeof _.find(_.keys(arr), (_key) => {
          if (_key === key) {
               if (value) {
                    if (value === arr[key]) {
                         return arr[key];
                    }
               } else {
                    return arr[key];
               }
          }
     }) !== 'undefined';
}

/**
 * wrapper for linkScanner, parses message from RabbitMQ and passes it to LinkScanner
 * @param  {Object} data parsed message from RabbitMQ
 */
function process(data) {
     let myVar = setTimeout(() => {
          promise.reject({
               linkId: data.params.linkId,
               updates: {
                    $PUT: {
                         status: "failed",
                    }
               }
          });
     }, 30000);
     let promise = q.defer(),
          link = data.params;
     linkScanner.init({
          _link: link._link,
          url: link._link.url.original,
          baseUrl: link.baseUrl
     }).then(function (response) {
          clearTimeout(myVar);
          var isImg = link._link.html.tagName === 'img';
          var hasParams = null;
          if (link && link._link.url && link._link.url.original) {
               hasParams = _.keys(querystring.parse(link._link.url.original.split('?')[1], null, null)).length > 0;
          }
          var resp = {
               hasParams: (response.internal) ? hasParams : null,
               isImg: isImg,
               hasNoFollow: (response.internal) ? null : findAttr(link._link.html.attrs, 'rel', 'nofollow'),
               hasAlt: (isImg) ? findAttr(link._link.html.attrs, 'alt') : null,
               selector: link._link.html.selector,
               tag: link._link.html.tag,
               tagName: link._link.html.tagName,
               internal: response.internal,
               samePage: response.samePage,
               linkId: link.linkId,
               uid: link.uid,
               requestId: link.requestId
          };

          if (response) {
               if (response.broken === true) {
                    resp.broken = response.broken;
                    resp.brokenReason = response.brokenReason;
                    resp._brokenReason = response._brokenReason;
                    resp.excluded = response.excluded;
                    resp.excludedReason = response.excludedReason;
               }

               if (response.url && response.url.parsed && response.url.parsed.extra) {
                    resp.filename = response.url.parsed.extra.filename
               }

               if (response.http && response.http.response && response.http.response.headers) {
                    resp["content-type"] = response.http.response.headers["content-type"];
                    resp["content-length"] = response.http.response.headers["content-length"];
                    resp.statusCode = response.http.response.statusCode;
                    resp.statusMessage = response.http.response.statusMessage;
               }
          }
          promise.resolve({
               linkId: resp.linkId,
               updates: {
                    $PUT: {
                         status: "complete",
                         results: resp
                    }
               }
          })
     }).catch((err) => {
          clearTimeout(myVar);
          promise.resolve({
               linkId: data.params.linkId,
               updates: {
                    $PUT: {
                         status: "failed",
                    }
               }
          });
     })
     return promise.promise;
}

module.exports.process = process;
