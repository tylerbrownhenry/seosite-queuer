    var linkTypes = require("link-types").map,
    maybeCallback   = require("maybe-callback"),
    RobotDirectives = require("robot-directives");
 var matchUrl     = require("../internal/matchUrl");
  var isString = require("is-string");
function excludeLink(link, instance){

    var attrSupported,externalFilter;
    var attrName = link.html.attrName;
    var tagName = link.html.tagName;
    var tagGroup = instance.options.tags[instance.options.filterLevel][tagName];
    console.log('excludeLink',instance.options.filterLevel);
    if (tagGroup != null){
        attrSupported = tagGroup[attrName];
    }

    if (attrSupported !== true){
        return "BLC_HTML";
    } 
    if (instance.options.excludeExternalLinks === true && link.internal === false){
        return "BLC_EXTERNAL";
    } 
    if (instance.options.excludeInternalLinks === true && link.internal === true){
        return "BLC_INTERNAL";
    } 
    if (instance.options.excludeLinksToSamePage === true && link.samePage === true){
        return "BLC_SAMEPAGE";
    } 
    console.log('link',link);
    if (instance.options.excludedSchemes[link.url.parsed.extra.protocolTruncated] === true){
        return "BLC_SCHEME";
    } 
    
    if (instance.options.honorRobotExclusions === true){
        if (instance.robots.oneIs([ RobotDirectives.NOFOLLOW, RobotDirectives.NOINDEX ]) === true){
            return "BLC_ROBOTS";
        }  
        if (instance.robots.is(RobotDirectives.NOIMAGEINDEX) === true){
            if (
                (tagName==="img"      && attrName==="src"   ) || 
                (tagName==="input"    && attrName==="src"   ) || 
                (tagName==="menuitem" && attrName==="icon"  ) || 
                (tagName==="video"    && attrName==="poster")
               ){
                return "BLC_ROBOTS";
            }
        }
        if (!link || !link.html || link.html.attrs!=null && link.html.attrs.rel!=null && linkTypes(link.html.attrs.rel).nofollow===true){
            return "BLC_ROBOTS";
        }
    }
    
    if (matchUrl(link.url.resolved, instance.options.excludedKeywords) === true){
        return "BLC_KEYWORD";
    } 
    
    // Undocumented handler for custom constraints
    externalFilter = maybeCallback(instance.handlers._filter)(link);
    
    if (isString(externalFilter) === true){
        return externalFilter;
    }
    return false;
}
module.exports = excludeLink;