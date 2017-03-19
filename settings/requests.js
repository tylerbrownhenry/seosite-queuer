"use strict";
var q = require('q');
var _ = require('underscore');

function _authorize(req, res) {
     var promise = q.defer();
     User.findOne({
          uid: req.body.uid,
          apiToken: req.body.token
     }, function (err, user) {
          if (user !== null) {
               var user = user.toJSON();
          }
          if (err) {
               promise.reject({
                    success: false,
                    type: 'error',
                    message: [{
                         parent: 'form',
                         title: 'Rats... ',
                         message: 'Failed to authenticate token.'
                    }]
               });
          } else {
               if (typeof user === 'undefined' || user === null) {
                    promise.reject({
                         success: false,
                         type: 'userInput',
                         message: [{
                              parent: 'form',
                              title: 'Shucks... ',
                              message: 'Invalid user/token combination.'
                         }]
                    });
               } else {
                    promise.resolve(user);
               }
          }
     });
     return promise.promise;
}

function checkOptions(req) {
     var promise = q.defer();
     var resp = true;
     if (!req || !req.body) {
          promise.reject({
               success: false,
               type: 'userInput',
               message: [{
                    parent: 'url',
                    title: 'Whoops! ',
                    message: 'Url is required.'
               }, {
                    parent: 'options',
                    title: 'Doh! ',
                    message: 'Options are required.'
               }]
          });
     } else {
          promise.resolve();
     }
     return promise.promise;
}

function checkRequirements(requirements, input) {
     var promise = q.defer();
     var passed = true;
     var _params = [];
     _.each(requirements, function (key) {
          if (typeof input[key] === 'undefined' || input[key] === '') {
               passed = false;
               _params.push(key);
          }
     });
     if (passed === true) {
          promise.resolve();
     } else {
          var messages = [];
          _.each(_params, function (param) {
               messages.push({
                    parent: param,
                    title: 'Oops!',
                    message: 'Missing required parameter: ' + param + '.'
               })
          });
          promise.reject({
               success: false,
               type: 'userInput',
               message: messages
          });
     }
     return promise.promise;
}

function checkApiCall(req, res, params) {
     var promise = q.defer();
     checkOptions(req).then(function () {
          console.log('server.js checkOptions success');
          checkRequirements(params, req.body).then(function () {
               console.log('server.js checkRequirements success');
               _authorize(req).then(function (user) {
                    console.log('server.js _authorize success');
                    var options = JSON.parse(req.body.options);
                    validate(user, options, permissions[user.stripe.plan]).then(function (passed) {
                         console.log('server.js checkRequestPermissions success');
                         promise.resolve(user, options);
                    }).catch(function (err) {
                         console.log('server.js checkApiCall checkRequestPermissions err', err);
                         promise.reject(err);
                    })
               }).catch(function (err) {
                    console.log('server.js checkApiCall _authorize err', err);
                    promise.reject(err);
               });
          }).catch(function (err) {
               console.log('server.js checkApiCall checkRequirements err', err);
               promise.reject(err);
          });
     }).catch(function (err) {
          console.log('server.js checkApiCall checkOptions err', err);
          promise.reject(err);
     });
     return promise.promise;
}

function _preFlight(req, res, needs, callback) {
     checkApiCall(req, res, needs).then(function (user, options) {
          callback(user, options);
     }).catch(function (err) {
          notify({
               message: JSON.stringify(err.message),
               title: 'Validation Error',
               uid: req.body.uid,
               page: req.body.page,
               type: req.body.type,
               temp_id: req.body.temp_id,
               i_id: null,
               status: 'error',
          });
     });
}

function validate(user, request, permissions) {
     if (typeof approvedRequestTypes[request.type] !== 'undefined') {
          return approvedRequestTypes[request.type](user, request, permissions);
     } else {
          var promise = q.defer();
          promise.reject({
               success: false,
               message: [{
                    parent: 'form',
                    message: 'Cannot make a request of this type:' + request.type
               }]
          });
          return promise.promise;
     }
}

function siteRequestValidate() {

}

function linkRequestValidate() {

}

function captureRequestValidate() {
     var promise = q.defer();
     promise.resolve();
     return promise.promise;
}

function pageRequestValidate(user, request, permissions) {
     console.log('######', request, user);
     var promise = q.defer();
     var perm = permissions;
     var problems = [];
     if (perm.restrictions.type[request.type] === false) {
          problems.push({
               parent: 'type',
               hint: 'upgrade',
               message: 'Your current plan does not allow requests of this type: ' + request.type + '.'
          });
     }
     if (user.activity[request.type + 's'].daily.count >= perm.limits.daily[request.type]) {
          problems.push({
               parent: 'form',
               hint: 'upgrade',
               message: 'Your have performed the maximum number of ' + [request.type] + ' requests (' + user.activity[request.type + 's'].daily.count + ') your current plan allows for the day.'
          });
     }
     if (user.activity[request.type + 's'].monthly.count >= perm.limits.monthly[request.type]) {
          problems.push({
               parent: 'form',
               hint: 'upgrade',
               message: 'Your have performed the maximum number of ' + [request.type] + ' requests (' + user.activity[request.type + 's'].monthly.count + ') your current plan allows for the month.'
          });
     }
     if (user.activity.requests.monthly.count >= perm.limits.monthly.requests) {
          problems.push({
               parent: 'form',
               hint: 'upgrade',
               message: 'Your have performed the maximum number of requests (' + perm.limits.monthly.requests + ') your current plan allows for the month.'
          });
     }
     if (user.activity.requests.daily.count >= perm.limits.daily.requests) {
          problems.push({
               parent: 'form',
               hint: 'upgrade',
               message: 'Your have performed the maximum number of requests (' + perm.limits.daily.requests + ') your current plan allows for the day.'
          });
     }
     if (request.filterLevel >= perm.restrictions.filterLimit) {
          problems.push({
               parent: 'filterLimit',
               hint: 'upgrade',
               message: 'You have selected a filter level of "' + request.filterLevel + '". Your current plan allows a maximum filter level of "' + perm.restictions.filterLimit + '".'
          });
     }
     if (request.digDepth >= perm.restrictions.digDepth) {
          problems.push({
               parent: 'digDepth',
               hint: 'upgrade',
               message: 'You have selected a dig depth of "' + request.digDepth + '". Your current plan allows a maximum dig depth of "' + perm.restictions.digLimit + '".'
          });
     }
     if (request.honorRobotExclusions === false && perm.restrictions.honorRobotExclusions.canDisable === false) {
          problems.push({
               parent: 'honorRobotExclusions',
               hint: 'upgrade',
               message: 'Your current plan does not allow disabling honor robot exclusions '
          });
     }
     if (request.excludeExternalLinks === true && perm.restrictions.excludeExternalLinks.canDisable === false) {
          problems.push({
               parent: 'excludeExternalLinks',
               hint: 'upgrade',
               message: 'Your current plan does not allow enabling of including external links.'
          });
     }
     // if(typeof request.excludedSchemes !== 'undefined' && perm.restrictions.excludedSchemes.canUse === false){
     //     problems.push({response: false, selection: 'excludeExternalLinks', message:'Your current plan does not allow change excluded schemas.'});
     // }

     if (request.acceptedSchemes.indexOf('https') !== -1 && perm.restrictions.acceptedSchemes['https'] === false) {
          problems.push({
               parent: 'acceptedSchemes',
               hint: 'upgrade',
               message: 'Your current plan does not allow acceptedSchemes ' + request.acceptedSchemes + '.'
          });
     }
     var failed = false;
     var linkInfo = [];
     _.each(_.keys(request.linkInformation), function (infoSelect) {
          if (perm.restrictions.linkInformation[infoSelect] === false && request.linkInformation[infoSelect] === true) {
               failed = true;
               linkInfo.push(infoSelect);
          }
     });
     if (failed === true) {
          problems.push({
               parent: 'linkInformation',
               hint: 'upgrade',
               subSelections: linkInfo,
               message: 'Your current plan does not allow fetching this link information.'
          });
     }
     if (problems.length > 0) {
          var selections = [];
          var subSelections = [];
          var messages = [];
          _.each(problems, function (_e) {
               messages.push({
                    parent: _e.parent,
                    message: _e.message,
                    hint: _e.hint,
                    title: _e.title
               });
               if (typeof _e.subSelections !== 'undefined') {
                    _.each(_e.subSelections, function (__e) {
                         subSelections.push({
                              parent: _e.parent,
                              selection: __e,
                              message: _e.message
                         });
                    });
               }
          });
          promise.reject({
               success: false,
               subSelections: subSelections,
               message: messages
          });
     } else {
          promise.resolve(true)
     }
     return promise.promise;
}

var approvedRequestTypes = {
     // site: siteRequestValidate,
     page: pageRequestValidate,
     summary: pageRequestValidate,
     freeSummary: pageRequestValidate,
     link: linkRequestValidate,
     capture: captureRequestValidate
}

module.exports = {
     _preFlight: _preFlight,
     validate: validate,
     types: {
          page: require('./requests/page'),
          link: require('./requests/link'),
          // site: require('./requests/link'),
          summary: require('./requests/summary'),
          freeSummary: require('./requests/summary'),
          capture: require('./requests/capture')
     }
}
