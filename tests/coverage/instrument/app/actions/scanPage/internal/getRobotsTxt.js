"use strict";
var __cov_N2EpUIaee43N4IDN9i_hYg = (Function('return this'))();
if (!__cov_N2EpUIaee43N4IDN9i_hYg.__coverage__) { __cov_N2EpUIaee43N4IDN9i_hYg.__coverage__ = {}; }
__cov_N2EpUIaee43N4IDN9i_hYg = __cov_N2EpUIaee43N4IDN9i_hYg.__coverage__;
if (!(__cov_N2EpUIaee43N4IDN9i_hYg['app/actions/scanPage/internal/getRobotsTxt.js'])) {
   __cov_N2EpUIaee43N4IDN9i_hYg['app/actions/scanPage/internal/getRobotsTxt.js'] = {"path":"app/actions/scanPage/internal/getRobotsTxt.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"getRobotsTxt","line":9,"loc":{"start":{"line":9,"column":0},"end":{"line":9,"column":36}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":40}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":40}},"3":{"start":{"line":5,"column":0},"end":{"line":5,"column":29}},"4":{"start":{"line":6,"column":0},"end":{"line":6,"column":28}},"5":{"start":{"line":7,"column":0},"end":{"line":7,"column":31}},"6":{"start":{"line":9,"column":0},"end":{"line":28,"column":1}},"7":{"start":{"line":10,"column":5},"end":{"line":10,"column":29}},"8":{"start":{"line":13,"column":5},"end":{"line":13,"column":21}},"9":{"start":{"line":14,"column":5},"end":{"line":14,"column":45}},"10":{"start":{"line":15,"column":5},"end":{"line":15,"column":22}},"11":{"start":{"line":16,"column":5},"end":{"line":16,"column":23}},"12":{"start":{"line":18,"column":5},"end":{"line":27,"column":23}},"13":{"start":{"line":30,"column":0},"end":{"line":30,"column":30}}},"branchMap":{}};
}
__cov_N2EpUIaee43N4IDN9i_hYg = __cov_N2EpUIaee43N4IDN9i_hYg['app/actions/scanPage/internal/getRobotsTxt.js'];
__cov_N2EpUIaee43N4IDN9i_hYg.s['1']++;var guard=require('robots-txt-guard');__cov_N2EpUIaee43N4IDN9i_hYg.s['2']++;var parse=require('robots-txt-parse');__cov_N2EpUIaee43N4IDN9i_hYg.s['3']++;var bhttp=require('bhttp');__cov_N2EpUIaee43N4IDN9i_hYg.s['4']++;var urllib=require('url');__cov_N2EpUIaee43N4IDN9i_hYg.s['5']++;var urlobj=require('urlobj');function getRobotsTxt(url,options){__cov_N2EpUIaee43N4IDN9i_hYg.f['1']++;__cov_N2EpUIaee43N4IDN9i_hYg.s['7']++;url=urlobj.parse(url);__cov_N2EpUIaee43N4IDN9i_hYg.s['8']++;url.hash=null;__cov_N2EpUIaee43N4IDN9i_hYg.s['9']++;url.path=url.pathname='/robots.txt';__cov_N2EpUIaee43N4IDN9i_hYg.s['10']++;url.query=null;__cov_N2EpUIaee43N4IDN9i_hYg.s['11']++;url.search=null;__cov_N2EpUIaee43N4IDN9i_hYg.s['12']++;return bhttp.get(urllib.format(url),{discardResponse:true,headers:{'user-agent':options.userAgent},stream:true}).then(parse).then(guard);}__cov_N2EpUIaee43N4IDN9i_hYg.s['13']++;module.exports=getRobotsTxt;
