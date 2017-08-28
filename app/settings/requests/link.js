var dynamoose = require('dynamoose'),
     querystring = require('querystring'),
     linkScanner = require("../../actions/sniff/linkScanner"),
     linkSchema = require("../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
     requestSchema = require("../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     notify = require('../../actions/notify').notify,
     utils = require('../../utils'),
     _ = require('underscore'),
     q = require('q'),
     completeRequest = utils.completeRequest;

function completeLink(promise, link, resp) {
    //  console.log('RETRY', link, resp);
     utils.updateBy(Link, {
               requestId: resp.requestId,
               _id: link.linkId
          }, {
               $PUT: {
                    status: "complete",
                    results: resp,
                    _dev_use_only_input: resp,
                    _dev_use_only_link: link,
                    __link: ''
               }
          },
          function (err) {
              //  console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):response');
               if (err !== null) {
                 console.log('consume link update err',err);
                    //console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):error');
                    // console.log('save link update error', err, resp);
                    promise.reject(_.extend({
                         system: 'dynamo',
                         systemError: err,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         url: link.baseUrl,
                         message: 'error:save:link',
                         notify: true,
                         retry: true,
                         i_id: resp.requestId,
                         retryCommand: 'request.link.completeLink',
                         retryOptions: {
                              resp: resp,
                              link: link
                         }
                    }, resp));
               } else {
                //  console.log('consume link retryUpdateRequest');
                    utils.retryUpdateRequest(link, promise);
               }
          });
}

function findAttr(arr, key, value) {
     return typeof _.find(_.keys(arr), function (_key) {
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
 * @param  {Object} msg message from RabbitMQ
 */
function init(msg) {

  let myVar = setTimeout(function(){
     console.log('timed out link',JSON.parse(msg.content));
   }, 30000);

    //  console.log('request/link.js init -->');
     var promise = q.defer();
     var link = JSON.parse(msg.content);
     //console.log('request/link.js init --> link:', link);
     linkScanner.init({
          _link: link._link,
          url: link.url,
          baseUrl: link.baseUrl
     }).then(function (response) {
       clearTimeout(myVar);
          console.log('request/link.js init --> linkScanner:passed##');
          try{
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
               //console.log('request/link.js init --> linkScanner:passed -->');
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
        }catch(e){
          console.log('consume llink process error',e);
        }

          //console.log('request/link.js init --> linkScanner:passed --> updateBy');
          completeLink(promise, link, resp);

     }).catch((err)=>{
       clearTimeout(myVar);

       console.log('consume link err from link scanner',err);
     })
     return promise.promise;
}
module.exports.init = init;
module.exports.completeLink = completeLink;
module.exports.completeRequest = completeRequest;
