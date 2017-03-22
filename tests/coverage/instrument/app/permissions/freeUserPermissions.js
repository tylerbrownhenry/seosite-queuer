
var __cov_wCyChBrLusNpMDzA10zn4Q = (Function('return this'))();
if (!__cov_wCyChBrLusNpMDzA10zn4Q.__coverage__) { __cov_wCyChBrLusNpMDzA10zn4Q.__coverage__ = {}; }
__cov_wCyChBrLusNpMDzA10zn4Q = __cov_wCyChBrLusNpMDzA10zn4Q.__coverage__;
if (!(__cov_wCyChBrLusNpMDzA10zn4Q['app/permissions/freeUserPermissions.js'])) {
   __cov_wCyChBrLusNpMDzA10zn4Q['app/permissions/freeUserPermissions.js'] = {"path":"app/permissions/freeUserPermissions.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":49}},"2":{"start":{"line":3,"column":0},"end":{"line":57,"column":1}},"3":{"start":{"line":59,"column":0},"end":{"line":59,"column":44}}},"branchMap":{}};
}
__cov_wCyChBrLusNpMDzA10zn4Q = __cov_wCyChBrLusNpMDzA10zn4Q['app/permissions/freeUserPermissions.js'];
__cov_wCyChBrLusNpMDzA10zn4Q.s['1']++;var Permission=require('../models/permission');__cov_wCyChBrLusNpMDzA10zn4Q.s['2']++;var permission={label:'free',limits:{monthly:{page:100,site:0,requests:100,links:0,captures:0},daily:{page:5,site:0,requests:5,links:0,captures:0}},restrictions:{type:{site:false,page:true},captures:false,filterLimit:1,digDepthLimit:0,excludeExternalLinks:{canDisable:false},honorRobotExclusions:{canDisable:false},excludedSchemes:{canUse:false},saveSelectors:{canEnable:false},linkInformation:{selector:false,element:false,redirects:false,location:false,redirects:false,status:false,url:true,href:true,parent:false},acceptedSchemes:{http:true,https:false}}};__cov_wCyChBrLusNpMDzA10zn4Q.s['3']++;module.exports=new Permission(permission);
