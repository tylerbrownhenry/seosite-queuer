"use strict";
var __cov_O2HsalhAPJGue8ZdOHM7OQ = (Function('return this'))();
if (!__cov_O2HsalhAPJGue8ZdOHM7OQ.__coverage__) { __cov_O2HsalhAPJGue8ZdOHM7OQ.__coverage__ = {}; }
__cov_O2HsalhAPJGue8ZdOHM7OQ = __cov_O2HsalhAPJGue8ZdOHM7OQ.__coverage__;
if (!(__cov_O2HsalhAPJGue8ZdOHM7OQ['app/actions/scanPage/internal/defaultOptions.js'])) {
   __cov_O2HsalhAPJGue8ZdOHM7OQ['app/actions/scanPage/internal/defaultOptions.js'] = {"path":"app/actions/scanPage/internal/defaultOptions.js","s":{"1":0,"2":0,"3":0,"4":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":27}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":46}},"3":{"start":{"line":5,"column":0},"end":{"line":31,"column":2}},"4":{"start":{"line":33,"column":0},"end":{"line":33,"column":32}}},"branchMap":{}};
}
__cov_O2HsalhAPJGue8ZdOHM7OQ = __cov_O2HsalhAPJGue8ZdOHM7OQ['app/actions/scanPage/internal/defaultOptions.js'];
__cov_O2HsalhAPJGue8ZdOHM7OQ.s['1']++;require('dotenv').config();__cov_O2HsalhAPJGue8ZdOHM7OQ.s['2']++;var userAgent=require('default-user-agent');__cov_O2HsalhAPJGue8ZdOHM7OQ.s['3']++;var defaultOptions={acceptedSchemes:{'http':true,'https':false},cacheExpiryTime:3600000,cacheResponses:true,excludedKeywords:[],defaultPorts:['https','http'],excludedSchemes:['data','geo','javascript','mailto','sms','tel'],excludeExternalLinks:true,excludeInternalLinks:false,excludeLinksToSamePage:true,filterLevel:1,honorRobotExclusions:true,maxSockets:Infinity,maxSocketsPerHost:1,rateLimit:0,requestMethod:'head',retry405Head:true,tags:require('./tags'),userAgent:userAgent(process.env.USER_AGENT_NAME,process.env.USER_AGENT_NAME)};__cov_O2HsalhAPJGue8ZdOHM7OQ.s['4']++;module.exports=defaultOptions;
