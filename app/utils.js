var User = require('./models/user'),
     dynamoose = require('dynamoose'),
     activitySchema = require('./models/activity'),
     Activity = dynamoose.model('Activity', activitySchema),
     Permission = require('./models/permission'),
     _ = require('underscore');
/**
 * checks that an object contains properties listed in an array
 * @param  {Object} input an object
 * @param  {Array} props an array of properties
 * @return {Boolean}
 */
function checkRequirements(input, props) {
     //console.log('utils.js -> checkRequirements');
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
     }, function (err, permission) {
          if (err) {
               if (typeof callback === 'function') {
                    return callback(err);
               }
          }
          if (typeof callback === 'function') {
               return callback(null, permission);
          }
     });
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
 * finds a user in dynamo
 * @param  {Object}   args     identifier(s) for the user
 * @param  {Function} callback callback accepts two paramaters, err and user data
 */
function findUser(args, callback) {
     try {
          //console.log('User', args)
          User.scan(args).exec(function (err, user) {
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
 * finds and returns a user in dynamo
 * @param  {Object}   args     identifier(s) for the user
 * @param  {Function} callback callback accepts two paramaters, err and user data
 */
function findOneUser(args, callback) {
     try {
          //console.log('User', args)
          User.scan(args).exec(function (err, user) {
               if (err) {
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               } else {
                    if (typeof callback === 'function') {
                         return callback(null, user[0]);
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
     //console.log('updateBy');
     try {
          //console.log('utils.js --> updateBy')
          model.update(args, updates, function (err) {
               //console.log('utils.js --> updateBy -> response');
               if (err) {
                    //console.log('utils.js --> updateBy:failed');
                    if (typeof callback === 'function') {
                         return callback(err);
                    }
               }
               //console.log('utils.js --> updateBy:passed');
               if (typeof callback === 'function') {
                    return callback(null);
               }
          });
     } catch (err) {
          //console.log('utils.js --> updateBy:error', err);
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
               //console.log('ERR---UPDATE', err, callback);
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
 * @param  {Object}   model     identifier(s) for the user
 * @param  {Function} callback callback accepts one paramater, err
 */
function saveModel(model, callback) {
     //console.log('test saveModel');
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
     //console.log('saving scan');
     try {
          scan.save(function (err) {
               //console.log('utils.js saveScan response', err);
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
          //console.log('utils.js saveScan catch error', e);
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
 * delete an item from a dynamo table
 * @param  {String}   model dynamoose model
 * @param  {Object}   args  identifier(s) for item
 * @param  {Function} cb     callback accepts one paramaters, err
 */
function deleteBy(model, args, cb) {
     try {
          model.delete(args, function (err) {
               if (err) {
                    if (typeof callback === 'function') {
                         return cb(err);
                    }

               }
               if (typeof callback === 'function') {
                    return cb(null);
               }

          });
     } catch (err) {
          return cb({
               message: 'error:delete:item'
          });
     }
}

function batchPut(model, commands, cb) {
     model.batchPut(commands, function (err, e) {
          cb(err, e);
     });
}

module.exports.findBy = findBy;
module.exports.batchPut = batchPut;
module.exports.updateBy = updateBy;
module.exports.updateActivity = updateActivity;
module.exports.checkActivity = checkActivity;
module.exports.checkAvailActivity = checkAvailActivity;
module.exports.findUser = findUser; /* Deprecate */
module.exports.findOneUser = findOneUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.saveScan = saveScan;
module.exports.saveModel = saveModel;
module.exports.checkRequirements = checkRequirements;
