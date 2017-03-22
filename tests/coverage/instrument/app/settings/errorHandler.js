
var __cov_KBWclPaXueGtryOPeAFPmQ = (Function('return this'))();
if (!__cov_KBWclPaXueGtryOPeAFPmQ.__coverage__) { __cov_KBWclPaXueGtryOPeAFPmQ.__coverage__ = {}; }
__cov_KBWclPaXueGtryOPeAFPmQ = __cov_KBWclPaXueGtryOPeAFPmQ.__coverage__;
if (!(__cov_KBWclPaXueGtryOPeAFPmQ['app/settings/errorHandler.js'])) {
   __cov_KBWclPaXueGtryOPeAFPmQ['app/settings/errorHandler.js'] = {"path":"app/settings/errorHandler.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0},"b":{"1":[0,0]},"f":{"1":0},"fnMap":{"1":{"name":"closeOnErr","line":1,"loc":{"start":{"line":1,"column":17},"end":{"line":1,"column":52}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":7,"column":1}},"2":{"start":{"line":2,"column":5},"end":{"line":4,"column":6}},"3":{"start":{"line":3,"column":10},"end":{"line":3,"column":23}},"4":{"start":{"line":5,"column":5},"end":{"line":5,"column":22}},"5":{"start":{"line":6,"column":5},"end":{"line":6,"column":17}}},"branchMap":{"1":{"line":2,"type":"if","locations":[{"start":{"line":2,"column":5},"end":{"line":2,"column":5}},{"start":{"line":2,"column":5},"end":{"line":2,"column":5}}]}}};
}
__cov_KBWclPaXueGtryOPeAFPmQ = __cov_KBWclPaXueGtryOPeAFPmQ['app/settings/errorHandler.js'];
__cov_KBWclPaXueGtryOPeAFPmQ.s['1']++;module.exports=function closeOnErr(amqpConn,err){__cov_KBWclPaXueGtryOPeAFPmQ.f['1']++;__cov_KBWclPaXueGtryOPeAFPmQ.s['2']++;if(!err){__cov_KBWclPaXueGtryOPeAFPmQ.b['1'][0]++;__cov_KBWclPaXueGtryOPeAFPmQ.s['3']++;return false;}else{__cov_KBWclPaXueGtryOPeAFPmQ.b['1'][1]++;}__cov_KBWclPaXueGtryOPeAFPmQ.s['4']++;amqpConn.close();__cov_KBWclPaXueGtryOPeAFPmQ.s['5']++;return true;};
