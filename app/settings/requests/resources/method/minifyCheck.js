var dynamoose = require('dynamoose'),
     Issue = require('../../../../models/issues'),
     Resource = require("../../../../models/resource"),
     requestSchema = require("../../../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     notify = require('../../../../actions/notify').notify,
     minifyCheck = require('../../../../actions/minifyCheck/index'),
     checkRobots = require('../../../../actions/checkRobots/index'),
     utils = require('../../../../utils'),
     _ = require('underscore'),
     q = require('q');

/**
 * return if minifiying saves at least 10%;
 * @param  {Number} efficiency
 * @return {Boolean}
 */
function minifiedCheck(efficiency) {
     return efficiency < 0.1;
}

function completeResource(promise, resource, response, robots) {
     var updates = {};
     if (typeof robots == 'undefined') {
          update = {
               scanStatus: "complete",
               minified: minifiedCheck(response.stats.efficiency),
               minifiedDetails: response.stats
          };
          if (response.css) {
               update.css = {
                    hasMediaQueries: response.css.hasMediaQueries,
                    hasPrintStyles: response.css.hasPrintStyles
               }
          }
          response.styles = '';
          updates = {
               $PUT: update
          };
     } else {
          updates = {
               $PUT: {
                    scanStatus: "complete",
               }
          };
     }

     promise.resolve({
       _id: resource._id,
       updates:updates,
       robots: robots
     })
    //  utils.updateBy(Resource, {
          //      requestId: resource.requestId,
          //      _id: resource._id
          // }, updates,
          // function (err) {
          //      if (err !== null) {
          //           promise.reject({
          //                system: 'dynamo',
          //                systemError: err,
          //                statusType: 'failed',
          //                status: 'error',
          //                source: '--',
          //                url: resource.url,
          //                message: 'error:save:resource',
          //                notify: true,
          //                retry: true,
          //                i_id: response.requestId,
          //                retryCommand: 'resource.request.completeResource',
          //                retryOptions: {
          //                     resp: response,
          //                     resource: resource,
          //                     robots: robots
          //                }
          //           });
          //      } else {
          //        promise.resolve();
          //      }
          // });
}

function checkMin(obj) {
     var promise = q.defer();
     try {
          minifyCheck(obj, function (err, resp) {
               promise.resolve({
                    err: err,
                    resp: resp
               });
          });
     } catch (e) {
          promise.reject(e);
     }
     return promise.promise;
}

function init(_input) {
     let promise = _input.promise,
          resource = _input.params;
     if (resource.type === 'robots') {
          checkRobots(resource, (error, response) => {
               if (error || !response) {
                    response = {
                         sitemap: false,
                         robots: false
                    };
               }

               completeResource(promise, resource, response,{
                     $PUT: {
                          sitemap: response.sitemap,
                          robots: response.robots
                     }
                });

              //  utils.updateBy(Issue, {
              //       requestId: resource.requestId
              //  },robots, function (e, r) {

          });
     } else {
          checkMin(resource).then((response) => {
               if (!response || response.err) {
                    response = response || {};
                    response.resp = response.resp || {};
                    response.resp.stats = {
                         minifiedSize: 0,
                         originalSize: 0,
                         efficiency: 0
                    }
               }
               completeResource(promise, resource, response.resp);
          });
     }
     return promise.promise;
}
module.exports.init = init;
module.exports.completeResource = completeResource;
