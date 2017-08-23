var dynamoose = require('dynamoose'),
     querystring = require('querystring'),
     linkScanner = require("../../actions/sniff/linkScanner"),
     SoftwareSummary = require("../../models/softwareSummary"),
    //  Link = dynamoose.model('Link', linkSchema),
    //  requestSchema = require("../../models/request"),
    //  Request = dynamoose.model('Request', requestSchema),
     notify = require('../../actions/notify').notify,
     utils = require('../../utils'),
     _ = require('underscore'),
     q = require('q'),
     completeRequest = utils.completeRequest;

function completeSoftwareSummary(promise, summary, resp) {
     utils.updateBy(SoftwareSummary, {
               requestId: resp.requestId,
               _id: summary.linkId
          }, {
               $PUT: {
                    status: "complete",
                    resp: resp,
                    summary: summary
               }
          },
          function (err) {
               //console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):response');
               if (err !== null) {
                    //console.log('request/link.js init --> linkScanner:passed --> updateBy(Link):error');
                    promise.reject(_.extend({
                         system: 'dynamo',
                         systemError: err,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         message: 'error:save:software:summary',
                         notify: true,
                         retry: true,
                         i_id: resp.requestId,
                         retryCommand: 'request.softwareSummary.completeSoftwareSummary',
                         retryOptions: {
                              resp: resp,
                              summary: summary
                         }
                    }, resp));
               } else {
                    utils.retryUpdateRequest(summary, promise);
               }
          });
}

function init(msg) {
     var promise = q.defer();
     var resource = JSON.parse(msg.content);
     completeSoftwareSummary
     return promise.promise;
}

module.exports.init = init;
module.exports.completeSoftwareSummary = completeSoftwareSummary;
