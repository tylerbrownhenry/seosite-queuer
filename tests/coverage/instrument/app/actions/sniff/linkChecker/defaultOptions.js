"use strict";
var __cov_YO3dyVa4vQlA3G_eDrF5hA = (Function('return this'))();
if (!__cov_YO3dyVa4vQlA3G_eDrF5hA.__coverage__) { __cov_YO3dyVa4vQlA3G_eDrF5hA.__coverage__ = {}; }
__cov_YO3dyVa4vQlA3G_eDrF5hA = __cov_YO3dyVa4vQlA3G_eDrF5hA.__coverage__;
if (!(__cov_YO3dyVa4vQlA3G_eDrF5hA['app/actions/sniff/linkChecker/defaultOptions.js'])) {
   __cov_YO3dyVa4vQlA3G_eDrF5hA['app/actions/sniff/linkChecker/defaultOptions.js'] = {"path":"app/actions/sniff/linkChecker/defaultOptions.js","s":{"1":0,"2":0,"3":0,"4":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":27}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":46}},"3":{"start":{"line":5,"column":0},"end":{"line":32,"column":2}},"4":{"start":{"line":34,"column":0},"end":{"line":34,"column":32}}},"branchMap":{}};
}
__cov_YO3dyVa4vQlA3G_eDrF5hA = __cov_YO3dyVa4vQlA3G_eDrF5hA['app/actions/sniff/linkChecker/defaultOptions.js'];
__cov_YO3dyVa4vQlA3G_eDrF5hA.s['1']++;require('dotenv').config();__cov_YO3dyVa4vQlA3G_eDrF5hA.s['2']++;var userAgent=require('default-user-agent');__cov_YO3dyVa4vQlA3G_eDrF5hA.s['3']++;var defaultOptions={acceptedSchemes:{'http':true,'https':false},cacheExpiryTime:3600000,cacheResponses:true,excludedKeywords:[],excludedSchemes:['data','geo','javascript','mailto','sms','tel'],excludeExternalLinks:false,excludeInternalLinks:false,excludeLinksToSamePage:true,filterLevel:2,honorRobotExclusions:true,maxSockets:Infinity,maxSocketsPerHost:1,rateLimit:0,requestMethod:'head',retry405Head:true,tags:require('./tags'),userAgent:userAgent(process.env.USER_AGENT_NAME,process.env.USER_AGENT_NAME)};__cov_YO3dyVa4vQlA3G_eDrF5hA.s['4']++;module.exports=defaultOptions;
