var User = require('./models/user'),
     dynamoose = require('dynamoose'),
     Activity = require('./models/activity'),
     notify = require('./actions/notify'),
     requestSchema = require('./models/request'),
     Request = dynamoose.model('Request', requestSchema),
     Permission = require('./models/permission'),
     _ = require('underscore');

/**
 * returns current date as number
 * @return {Number}
 */
function getNowUTC() {
     var t = +new Date();
     return t;
}

/**
 * (todo?) send an email
 */
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
     Permission.get({
          label: plan
     }, callback);
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
     try {
          model.save(callback);
     } catch (e) {
          if (typeof callback == 'function') {
               callback(e);
          }
     }
}

/**
 * deletes a user from dynamo
 * @param  {String}   uid user ID
 * @param  {Function} cb    callback accepts one paramaters, err
 */
function deleteUser(uid, callback) {
     try {
          User.delete({
               uid: uid
          }, function (err) {
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
               callback({
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
function saveScan(scan, callback) {
     try {
          scan.save(function (err) {
               if (err) {
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               }
               if (typeof callback === 'function') {
                    return callback(null);
               }
          });
     } catch (e) {
          if (typeof callback === 'function') {
               callback({
                    message: 'error:save:scan'
               });
          }
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

/**
 * performs a batchput of commands to dynamodb
 * @param  {Object}   model    dynamodb model constructor
 * @param  {Array}   commands  array of commands to save
 * @param  {Function} cb       callback
 */
function batchPut(model, commands, callback) {
     try {
          model.batchPut(commands, function (err, res) {
               callback(err, res);
          });
     } catch (err) {
          if (typeof callback === 'function') {
               return callback({
                    message: 'error:model:batchPut'
               });
          }
     }
}

/**
 * saves a request as complete and sends notificaton
 * @param  {Object} promise
 * @param  {Object} input
 * @param  {Object} data
 */
function completeRequest(promise, input, message, status) {
     try {
          updateBy(Request, {
               requestId: input.requestId
          }, {
               $PUT: {
                    status: 'complete'
               }
          }, function (err, e) {
               if (err) {
                    promise.reject();
               } else {
                    notify.notify({
                         message: (message) ? message : 'success:scan:complete',
                         uid: input.uid,
                         requestType: input.requestType,
                         source: input.source,
                         type: 'page:scan',
                         status: (status)?status:'success',
                         statusType: 'complete',
                         i_id: input.requestId
                    });
                    _smoke(input.requestId);
                    promise.resolve(true);
               }
          });
     } catch (err) {
          promise.reject({
               reason:'dynamo',
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
                    message:message,
                    status:status
               }
          });
     }
}

/**
 * retry commands for updating request process count
 * @param  {Object} input   request data
 * @param  {Object} promise
 */
function retryUpdateRequest(input, promise) {
     var update = {
          $ADD: {
               processes: (input.processes) ? (input.processes * -1) : -1
          }
     };
     var arg = {
          requestId: input.requestId
     };

     updateBy(Request, arg, update,
          function (err, data) {
               if (err) {
                    _smoke(input.requestId);
                    _count(update['$ADD'].processes);
                    promise.reject();
               } else {
                 _smoke(input.requestId);
                 _count(update['$ADD'].processes);
                 promise.resolve();
               }
          });
          return promise.promise;
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


let smokeCallback = ()=>{};

function setSmoke(cb){
  if(typeof cb == 'function'){
    smokeCallback = cb;
  } else {
  }
}

function _smoke(res){
  smokeCallback(res);
}
let _countProcesses = function(){
_countProcesses}

function countProcesses(cb){
  if(typeof cb == 'function'){
    _countProcesses = cb;
  }
}

function _count(res){
  _countProcesses(res);
}

module.exports.getNowUTC = getNowUTC;
module.exports.setSmoke = setSmoke;
module.exports.countProcesses = countProcesses;
module.exports.convertUrl = convertUrl;
module.exports.retryUpdateRequest = retryUpdateRequest;
module.exports.updateRequestProcesses = retryUpdateRequest;
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
