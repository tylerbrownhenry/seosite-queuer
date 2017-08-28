var User = require('./models/user'),
     dynamoose = require('dynamoose'),
     Activity = require('./models/activity'),
     notify = require('./actions/notify'),
     requestSchema = require('./models/request'),
     Request = dynamoose.model('Request', requestSchema),
     Permission = require('./models/permission'),
     _ = require('underscore');

function getNowUTC() {
     var t = +new Date();
     //  var d = new Date()
     //  var n = d.getTimezoneOffset();
     //  t -= n * 60 * 1000;
     return t;
}

function sendEmail() {}

/**
 * checks that an object contains properties listed in an array
 * @param  {Object} input an object
 * @param  {Array} props an array of properties
 * @return {Boolean}
 */
function checkRequirements(input, props) {
     var failed = false;
     _.each(props, function (prop) {
          if (typeof input[prop] === 'undefined') {
               failed = true;
          }
     });
     return failed;
}

/**
 * updates a user's/organization's activity
 * @param  {String}   oid      organization ID
 * @param  {String}   type     activity group type [page||site||sumamry||issues...]
 * @param  {Function} callback callback accepts two paramaters, err and activity data
 */
function updateActivity(oid, type, callback) {
     var updates = {
          $ADD: {}
     };
     updates['$ADD'][type + '-day-count'] = 1;
     updates['$ADD'][type + '-month-count'] = 1;
     updateBy(Activity, {
          oid: oid
     }, updates, function (err) {
          if (err) {
               if (typeof callback === 'function') {
                    return callback(err);
               }
          }
          if (typeof callback === 'function') {
               return callback(null);
          }
     });
}

/**
 * checks a user's/organization's activity
 * @param  {String}   oid      organization ID
 * @param  {Function} callback callback accepts two paramaters, err and activity data
 */
function checkActivity(oid, callback) {
     Activity.get({
          oid: oid
     }, function (err, activity) {
          if (err) {
               if (typeof callback === 'function') {
                    return callback(err);
               }
          }
          if (typeof callback === 'function') {
               return callback(null, activity);
          }
     });
}
/**
 * finds permission in dynamoose
 * @param  {String}   plan     plan label [free||pro]
 * @param  {Function} callback callback accepts two paramaters, err and premission data
 */
function checkPermissions(plan, callback) {
     //  Permission.get({
     //       label: plan
     //  }, function (err, permission) {
     //       if (err) {
     if (typeof callback === 'function') {
          return callback(err);
     }
     // }
     if (typeof callback === 'function') {
          //  return callback(null, permission);
          var permission = {
               limits: {
                    daily: {
                         request: 3,
                         scan: 3
                    },
                    monthly: {
                         request: 1,
                         scan: 1
                    }
               }
          }
          return callback(null, permission);
     }
     //  });
}

/**
 * checks a user's/organization's activity, and if over the request type based on their plan
 * @param  {String}   oid       organization ID
 * @param  {String}   plan     plan label [free||pro]
 * @param  {String}   type     type of request to check
 * @param  {Function} callback callback accepts two paramaters, err and decision as a Boolean
 */
function checkAvailActivity(oid, plan, type, callback) {
     checkActivity(oid, function (err, activity) {
          if (err) {
               return callback(err);
          }
          checkPermissions(plan, function (err, permission) {
               if (err) {
                    return callback(err);
               }
               var dailyAvail = (activity[type + '-day-count'] < permission.limits.daily[type]);
               var monthlyAvail = (activity[type + '-month-count'] < permission.limits.monthly[type]);
               var decision = (dailyAvail === true && monthlyAvail === true);
               callback(null, decision);
          })
     })
}
/**
 * finds and returns a user in dynamo
 * @param  {Object}   args     identifier(s) for the user
 * @param  {Function} callback callback accepts two paramaters, err and user data
 */
function findOneUser(args, callback) {
     try {
          User.get(args, function (err, user) {
               if (err) {
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               } else {
                    if (typeof callback === 'function') {
                         return callback(null, user);
                    }
               }
          });
     } catch (err) {
          if (typeof callback === 'function') {
               return callback({
                    message: 'error:find:user'
               });
          }
     }
}

/**
 * update an item in dynamo
 * @param  {Object}   args     identifier(s) for the item
 * @param  {Object}   updates  what and how to update
 * @param  {Function} callback callback accepts one paramater, err
 */
function updateBy(model, args, updates, callback) {
     try {
          model.update(args, updates, function (err) {
               if (err) {
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               }
               if (typeof callback === 'function') {
                    return callback(null);
               }
          });
     } catch (err) {
          if (typeof callback === 'function') {
               return callback({
                    message: 'error:update:item'
               });
          }
     }
}

/**
 * update a user in dynamo
 * @param  {Object}   args     identifier(s) for the user
 * @param  {Object}   updates  what and how to update
 * @param  {Function} callback callback accepts one paramater, err
 */
function updateUser(args, updates, callback) {
     try {
          User.update(args, updates, function (err) {
               if (err) {
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               }
               if (typeof callback === 'function') {
                    return callback(null);
               }
          });
     } catch (err) {
          if (typeof callback === 'function') {
               return callback({
                    message: 'error:update:user'
               });
          }
     }
}

/**
 * saves a model in dynamo
 * @param  {Object}   model     dynamoDB model instance
 * @param  {Function} callback callback accepts one paramater, err
 */
function saveModel(model, callback) {
     model.save(callback);
}

/**
 * deletes a user from dynamo
 * @param  {String}   uid user ID
 * @param  {Function} cb    callback accepts one paramaters, err
 */
function deleteUser(uid, cb) {
     try {
          User.delete({
               uid: uid
          }, function (err) {
               if (err) {
                    if (typeof cb === 'function') {
                         return cb(err);
                    }
               }
               if (typeof cb === 'function') {
                    return cb(null);
               }
          });
     } catch (err) {
          if (typeof cb === 'function') {
               return cb({
                    message: 'error:delete:user'
               });
          }
     }
}

/**
 * saves a scan
 * @param  {Object}   scan
 * @param  {Function} cb    callback accepts one paramaters, err
 */
function saveScan(scan, cb) {
     try {
          scan.save(function (err) {
               if (err) {
                    if (typeof cb === 'function') {
                         return cb(err);
                    }
               }
               if (typeof cb === 'function') {
                    return cb(null);
               }
          });
     } catch (e) {

     }
}

/**
 * find an item in dyanmo table
 * @param  {String}   model dynamoose model
 * @param  {Object}   args  identifier(s) for item
 * @param  {Function} cb    callback accepts two paramaters, err and item data
 */
function findBy(model, args, cb) {
     try {
          model.get(args, function (err, item) {
               if (err) {
                    if (typeof cb === 'function') {
                         return cb(err);
                    }
               } else {
                    if (typeof cb === 'function') {
                         return cb(null, item);
                    }
               }
          });
     } catch (err) {
          if (typeof cb === 'function') {
               return cb({
                    message: 'error:model:get'
               });
          }
     }
}

function batchPut(model, commands, cb) {
     model.batchPut(commands, function (err, e) {
          cb(err, e);
     });
}

function completeRequest(promise, input, data) {
     updateBy(Request, {
          requestId: input.requestId
     }, {
          $PUT: {
               status: 'complete'
          }
     }, function (err, e) {
          if (err) {
               promise.reject({
                    system: 'dynamo',
                    systemError: err,
                    i_id: input.requestId,
                    status: 'error',
                    message: 'error:request:complete',
                    requestId: input.requestId,
                    retry: true,
                    retryCommand: 'utils.completeRequest',
                    retryOptions: {
                         input: input,
                         data: data
                    }
               });
          } else {
               notify.notify({
                    message: 'success:scan:complete',
                    uid: input.uid,
                    requestType: data.requestType,
                    source: data.source,
                    type: 'page:scan',
                    status: 'success',
                    statusType: 'complete',
                    i_id: input.requestId
               });
               promise.resolve(true);
          }
     });
}

function retryUpdateRequest(input, promise) {
     var update = {
          $ADD: {
               processes: -1
          }
     };
     var arg = {
          requestId: input.requestId
     };

     updateBy(Request, arg, update,
          function (err, data) {
               if (err) {
                    promise.reject({
                         system: 'dynamo',
                         systemError: err,
                         requestId: input.requestId,
                         status: 'error',
                         statusType: 'failed',
                         type: 'page:scan',
                         message: 'error:after:save:update:count',
                         requestId: arg.requestId,
                         i_id: arg.requestId,
                         retry: true,
                         retryCommand: 'utils.retryUpdateRequest',
                         retryOptions: {
                              input: arg
                         }
                    });
                    /* Maybe push to queue to update it later? */
               } else {
                    findBy(Request, {
                         requestId: input.requestId
                    }, function (err, data) {
                         if (data && (data.processes === 0 || data.processes < 0)) {
                              completeRequest(promise, input, data);
                         } else {
                              promise.resolve(true);
                         }
                    });
               }
          });
}

/**
 * adds http:// to a url if it is missing
 * @param  {String} url
 */
function convertUrl(url) {
     if (typeof url === 'string' && url.trim().indexOf('http') === -1) {
          url = 'http://' + url;
     }
     return url
}

module.exports.getNowUTC = getNowUTC;
module.exports.convertUrl = convertUrl;
module.exports.retryUpdateRequest = retryUpdateRequest;
module.exports.completeRequest = completeRequest;
module.exports.findBy = findBy;
module.exports.checkPermissions = checkPermissions;
module.exports.batchPut = batchPut;
module.exports.updateBy = updateBy;
module.exports.sendEmail = sendEmail;
module.exports.updateActivity = updateActivity;
module.exports.checkActivity = checkActivity;
module.exports.checkAvailActivity = checkAvailActivity;
module.exports.findOneUser = findOneUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.saveScan = saveScan;
module.exports.saveModel = saveModel;
module.exports.checkRequirements = checkRequirements;
