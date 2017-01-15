"use strict";
"use strict";
function checkPermissions(user,request,permissions){
    var perm = permissions[user.stripe.plan];
    /* Make sure input is validated */
    /* As in, accepted schemes input is a white list? */
    if(perm.request.type[request.type] === false){
        return {response: false, selection: 'type', message:'Your current plan does not allow requests of this type: ' + request.type + '.' +};
    }
    if(user.activity[request.type].daily.count >= perm.requests.dailyLimit[request.type]){
        return {response: false, selection: 'user', message:'Your have performed the maximum number of ' + [request.type] +' requests ('+ user.activity[request.type].daily.count +') your current plan allows for the day.'};
    }
    if(user.activity[request.type].monthly.count >= perm.requests.monthlyLimit[request.type]){
        return {response: false, selection: 'user', message:'Your have performed the maximum number of ' + [request.type] +' requests ('+ user.activity[request.type].monthly.count +') your current plan allows for the month.'};
    }
    if(request.filterLevel >= perm.restrictions.filterLimit){
        return {response: false, selection: 'filterLimit', message:'You have selected a filter level of "'+request.filterLevel+'". Your current plan allows a maximum filter level of "' + perm.restictions.filterLimit +'".'};
    }
    if(request.digDepth >= perm.restrictions.digDepth){
        return {response: false, selection: 'digDepth', message:'You have selected a filter level of "'+request.digDepth+'". Your current plan allows a maximum dig depth of "' + perm.restictions.digLimit +'".'};
    }
    if(request.honorRobotExclusions === false && perm.restrictions.honorRobotExclusions.canDisable === false){
        return {response: false, selection: 'honorRobotExclusions', message:'Your current plan does not allow disabling honor robot exclusions '};
    }
    if(request.excludeExternalLinks === true && perm.restrictions.excludeExternalLinks.canDisable === false){
        return {response: false, selection: 'excludeExternalLinks', message:'Your current plan does not allow enabling of including external links.'};
    }
    if(typeof request.excludedSchemes !== 'undefined' && perm.restrictions.excludedSchemes.canUse === false){
        return {response: false, selection: 'excludeExternalLinks', message:'Your current plan does not allow change excluded schemas.'};
    } 

    if(request.acceptedSchemes.indexOf('https') !== -1 && perm.restrictions.acceptedSchemes['https'] === false){
        return {response: false, selection: 'acceptedSchemes', message:'Your current plan does not allow acceptedSchemes ' + request.acceptedSchemes +'.'};
    }
    var failed = false;
    var linkInfo = {};
    _.each(request.linkInformation, function(infoSelect){
        if(perm.restrictions.linkInformation[infoSelect] === false){
            failed = true;
            linkInfo[infoSelect] = true; 
        }
    });
    if(failed === true){
        return {response: false, selection: 'linkInformation', subSelections: [linkInfo], message:'Your current plan does not allow fetching link information: ' + linkInfo};
    }
    return true;
}

module.exports = checkPermissions;