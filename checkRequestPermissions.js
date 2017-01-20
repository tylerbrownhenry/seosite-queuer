"use strict";

var q = require('q');
var _ = require('underscore');

function checkPermissions(user,request,permissions){
    var promise = q.defer();
    var perm = permissions;
    var problems = [];
    if(perm.restrictions.type[request.type] === false){
        problems.push({selection: 'type', message:'Your current plan does not allow requests of this type: ' + request.type + '.'});
    }
    if(user.activity[request.type+'s'].daily.count >= perm.limits.daily[request.type]){
        problems.push({selection: 'user', message:'Your have performed the maximum number of ' + [request.type] +' requests ('+ user.activity[request.type+'s'].daily.count +') your current plan allows for the day.'});
    }
    if(user.activity[request.type+'s'].monthly.count >= perm.limits.monthly[request.type]){
        problems.push({selection: 'user', message:'Your have performed the maximum number of ' + [request.type] +' requests ('+ user.activity[request.type+'s'].monthly.count +') your current plan allows for the month.'});
    }
    if(user.activity.requests.monthly.count >= perm.limits.monthly.requests){
        problems.push({selection: 'user', message:'Your have performed the maximum number of scan api requests ('+ user.activity.requests.monthly.count +') your current plan allows for the month.'});
    }
    if(user.activity.requests.daily.count >= perm.limits.daily.requests){
        problems.push({selection: 'user', message:'Your have performed the maximum number of scan api requests ('+ user.activity.requests.monthly.count +') your current plan allows for the day.'});
    }
    if(request.filterLevel >= perm.restrictions.filterLimit){
        problems.push({selection: 'filterLimit', message:'You have selected a filter level of "'+request.filterLevel+'". Your current plan allows a maximum filter level of "' + perm.restictions.filterLimit +'".'});
    }
    if(request.digDepth >= perm.restrictions.digDepth){
        problems.push({selection: 'digDepth', message:'You have selected a dig depth of "'+request.digDepth+'". Your current plan allows a maximum dig depth of "' + perm.restictions.digLimit +'".'});
    }
    if(request.honorRobotExclusions === false && perm.restrictions.honorRobotExclusions.canDisable === false){
        problems.push({selection: 'honorRobotExclusions', message:'Your current plan does not allow disabling honor robot exclusions '});
    }
    if(request.excludeExternalLinks === true && perm.restrictions.excludeExternalLinks.canDisable === false){
        problems.push({selection: 'excludeExternalLinks', message:'Your current plan does not allow enabling of including external links.'});
    }
    // if(typeof request.excludedSchemes !== 'undefined' && perm.restrictions.excludedSchemes.canUse === false){
    //     problems.push({response: false, selection: 'excludeExternalLinks', message:'Your current plan does not allow change excluded schemas.'});
    // } 

    if(request.acceptedSchemes.indexOf('https') !== -1 && perm.restrictions.acceptedSchemes['https'] === false){
        problems.push({selection: 'acceptedSchemes', message:'Your current plan does not allow acceptedSchemes ' + request.acceptedSchemes +'.'});
    }
    var failed = false;
    var linkInfo = [];
    _.each(_.keys(request.linkInformation), function(infoSelect){
        if(perm.restrictions.linkInformation[infoSelect] === false && request.linkInformation[infoSelect] === true){
            failed = true;
            linkInfo.push(infoSelect);
        }
    });
    if(failed === true){
        problems.push({selection: 'linkInformation', subSelections: linkInfo, message:'Your current plan does not allow fetching this link information.'});
    } 
    if(problems.length > 0){
        var selections = [];
        var subSelections = [];
        var messages = [];
        _.each(err,function(_e){
           messages.push({parent:_e.selection,message:_e.message});
            if(typeof _e.subSelections !== 'undefined'){
                _.each(_e.subSelections, function(__e){
                   subSelections.push({parent:_e.selection,selection:__e,message:_e.message});
               });
            }
        });
        promise.reject({
            success: false,
            subSelctions: subSelctions,
            message: messages
        });
    } else {
         promise.resolve(true)
    } 
    return promise.promise;
}

module.exports = checkPermissions;