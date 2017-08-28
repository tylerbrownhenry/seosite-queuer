var dynamoose = require('dynamoose'),
     Issue = require('../../models/issues'),
     Resource = require("../../models/resource"),
     requestSchema = require("../../models/request"),
     Request = dynamoose.model('Request', requestSchema),
     notify = require('../../actions/notify').notify,
     minifyCheck = require('../../actions/minifyCheck/index'),
     checkRobots = require('../../actions/checkRobots/index'),
     utils = require('../../utils'),
     _ = require('underscore'),
     q = require('q'),
     completeRequest = utils.completeRequest;

function minifiedCheck(efficiency) {
     return efficiency < 0.1;
}

function completeResource(promise, resource, response, robots) {
  try{


     var updates = {};
     //  console.log('completeResource-->!!',resource,response,robots);
     if (robots !== true) {
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
          // console.log('response CSS',response);
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
     console.log('RESOURECE',resource._id,resource);
     utils.updateBy(Resource, {
               requestId: resource.requestId,
               _id: resource._id
          }, updates,
          function (err) {
               if (err !== null) {
                    console.log('save resource update error', err, response);
                    promise.reject({
                         system: 'dynamo',
                         systemError: err,
                         statusType: 'failed',
                         status: 'error',
                         source: '--',
                         url: resource.url,
                         message: 'error:save:resource',
                         notify: true,
                         retry: true,
                         i_id: response.requestId,
                         retryCommand: 'resource.request.completeResource',
                         retryOptions: {
                              resp: response,
                              resource: resource,
                              robots: robots
                         }
                    });
               } else {
                    utils.retryUpdateRequest(resource, promise);
               }
          });
        }catch(e){
          console.log('e',e);
        }
}

function checkMin(obj) {
     var promise = q.defer();
      console.log('CHECKMIN', obj);
     try {
          minifyCheck(obj, function (err, resp) {
               console.log('CHECKMIN RESP', resp);
               promise.resolve({
                    err: err,
                    resp: resp
               });
          })
     } catch (e) {
          console.log('resource failed', e);
          promise.reject(e);
     }
     return promise.promise;
}

function init(msg) {
     var promise = q.defer();
     var resource = JSON.parse(msg.content);
      console.log('processResource$$$$ checkRobots-->', resource);
     if (resource.type === 'robots') {
          console.log('yy checkRobots-->');
          checkRobots(resource, (error, response) => {
                console.log('xx time out checkRobots-->', error, 'response', resource.url);
               if (error || !response) {
                    response = {
                         sitemap: false,
                         robots: false
                    };
               }
               utils.updateBy(Issue, {
                    requestId: resource.requestId
               }, {
                    $PUT: {
                         sitemap: response.sitemap,
                         robots: response.robots
                    }
               }, function (e, r) {
                    if (e !== null) {
                         promise.reject({
                              system: 'dynamo',
                              systemError: e,
                              statusType: 'failed',
                              status: 'error',
                              source: '--',
                              message: 'error:save:resource:robots',
                              notify: false,
                              retry: true,
                              i_id: resource.requestId,
                              retryCommand: 'utils.updateBy',
                              retryOptions: {
                                   model: 'Issue',
                                   input: {
                                        requestId: resource.requestId
                                   },
                                   update: {
                                        $PUT: {
                                             sitemap: response.sitemap,
                                             robots: response.robots
                                        }
                                   }
                              }
                         });
                    }
               });
               completeResource(promise, resource, response, true);
          });
     } else {
          checkMin(resource).then((response) => {
                console.log('processResource$$$$', response.err, '-->', response.resp, 'resource', resource);
               if (!response || response.err) {
                    console.log('resource error checkMin-->--> failed');
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
module.exports.completeRequest = completeRequest;
