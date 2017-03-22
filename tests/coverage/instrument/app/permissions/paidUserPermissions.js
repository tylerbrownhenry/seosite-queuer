
var __cov_7ov4PNBOLR5J9S9tt$RkMg = (Function('return this'))();
if (!__cov_7ov4PNBOLR5J9S9tt$RkMg.__coverage__) { __cov_7ov4PNBOLR5J9S9tt$RkMg.__coverage__ = {}; }
__cov_7ov4PNBOLR5J9S9tt$RkMg = __cov_7ov4PNBOLR5J9S9tt$RkMg.__coverage__;
if (!(__cov_7ov4PNBOLR5J9S9tt$RkMg['app/permissions/paidUserPermissions.js'])) {
   __cov_7ov4PNBOLR5J9S9tt$RkMg['app/permissions/paidUserPermissions.js'] = {"path":"app/permissions/paidUserPermissions.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":49}},"2":{"start":{"line":3,"column":0},"end":{"line":57,"column":1}},"3":{"start":{"line":59,"column":0},"end":{"line":59,"column":44}}},"branchMap":{}};
}
__cov_7ov4PNBOLR5J9S9tt$RkMg = __cov_7ov4PNBOLR5J9S9tt$RkMg['app/permissions/paidUserPermissions.js'];
__cov_7ov4PNBOLR5J9S9tt$RkMg.s['1']++;var Permission=require('../models/permission');__cov_7ov4PNBOLR5J9S9tt$RkMg.s['2']++;var permission={label:'paid',limits:{monthly:{requests:1000,links:1000,captures:1000},daily:{requests:100,links:100,captures:100}},restrictions:{type:{page:true},captures:true,filterLimit:10,digDepthLimit:100,excludeExternalLinks:{canDisable:true},honorRobotExclusions:{canDisable:true},excludedSchemes:{canUse:true},saveSelectors:{canEnable:true},linkInformation:{selector:true,element:true,redirects:true,location:true,redirects:true,status:true,url:true,href:true,parent:true},acceptedSchemes:{http:true,https:true}}};__cov_7ov4PNBOLR5J9S9tt$RkMg.s['3']++;module.exports=new Permission(permission);
