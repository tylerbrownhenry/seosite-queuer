
var __cov_V2$0Qw_XjlSYAes9WcAyBw = (Function('return this'))();
if (!__cov_V2$0Qw_XjlSYAes9WcAyBw.__coverage__) { __cov_V2$0Qw_XjlSYAes9WcAyBw.__coverage__ = {}; }
__cov_V2$0Qw_XjlSYAes9WcAyBw = __cov_V2$0Qw_XjlSYAes9WcAyBw.__coverage__;
if (!(__cov_V2$0Qw_XjlSYAes9WcAyBw['app/actions/sniff/process/processResponses.js'])) {
   __cov_V2$0Qw_XjlSYAes9WcAyBw['app/actions/sniff/process/processResponses.js'] = {"path":"app/actions/sniff/process/processResponses.js","s":{"1":0,"2":0,"3":0,"4":1,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"fnMap":{"1":{"name":"processResponses","line":4,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":32}}},"2":{"name":"(anonymous_2)","line":14,"loc":{"start":{"line":14,"column":38},"end":{"line":14,"column":58}}},"3":{"name":"(anonymous_3)","line":22,"loc":{"start":{"line":22,"column":29},"end":{"line":22,"column":50}}},"4":{"name":"(anonymous_4)","line":23,"loc":{"start":{"line":23,"column":36},"end":{"line":23,"column":51}}},"5":{"name":"(anonymous_5)","line":28,"loc":{"start":{"line":28,"column":14},"end":{"line":28,"column":29}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":30}},"2":{"start":{"line":2,"column":0},"end":{"line":2,"column":21}},"3":{"start":{"line":3,"column":0},"end":{"line":3,"column":45}},"4":{"start":{"line":4,"column":0},"end":{"line":33,"column":1}},"5":{"start":{"line":5,"column":5},"end":{"line":5,"column":29}},"6":{"start":{"line":6,"column":5},"end":{"line":6,"column":23}},"7":{"start":{"line":7,"column":5},"end":{"line":7,"column":26}},"8":{"start":{"line":8,"column":5},"end":{"line":8,"column":38}},"9":{"start":{"line":9,"column":5},"end":{"line":9,"column":26}},"10":{"start":{"line":10,"column":5},"end":{"line":12,"column":6}},"11":{"start":{"line":11,"column":10},"end":{"line":11,"column":65}},"12":{"start":{"line":13,"column":5},"end":{"line":13,"column":41}},"13":{"start":{"line":14,"column":5},"end":{"line":21,"column":8}},"14":{"start":{"line":15,"column":10},"end":{"line":20,"column":11}},"15":{"start":{"line":16,"column":15},"end":{"line":16,"column":49}},"16":{"start":{"line":17,"column":15},"end":{"line":17,"column":76}},"17":{"start":{"line":19,"column":15},"end":{"line":19,"column":35}},"18":{"start":{"line":22,"column":5},"end":{"line":31,"column":8}},"19":{"start":{"line":23,"column":10},"end":{"line":26,"column":13}},"20":{"start":{"line":24,"column":15},"end":{"line":24,"column":40}},"21":{"start":{"line":25,"column":15},"end":{"line":25,"column":52}},"22":{"start":{"line":27,"column":10},"end":{"line":27,"column":32}},"23":{"start":{"line":29,"column":10},"end":{"line":29,"column":46}},"24":{"start":{"line":30,"column":10},"end":{"line":30,"column":30}},"25":{"start":{"line":32,"column":5},"end":{"line":32,"column":28}},"26":{"start":{"line":35,"column":0},"end":{"line":35,"column":34}}},"branchMap":{"1":{"line":6,"type":"binary-expr","locations":[{"start":{"line":6,"column":12},"end":{"line":6,"column":16}},{"start":{"line":6,"column":20},"end":{"line":6,"column":22}}]},"2":{"line":8,"type":"binary-expr","locations":[{"start":{"line":8,"column":19},"end":{"line":8,"column":31}},{"start":{"line":8,"column":35},"end":{"line":8,"column":37}}]},"3":{"line":10,"type":"if","locations":[{"start":{"line":10,"column":5},"end":{"line":10,"column":5}},{"start":{"line":10,"column":5},"end":{"line":10,"column":5}}]}}};
}
__cov_V2$0Qw_XjlSYAes9WcAyBw = __cov_V2$0Qw_XjlSYAes9WcAyBw['app/actions/sniff/process/processResponses.js'];
__cov_V2$0Qw_XjlSYAes9WcAyBw.s['1']++;var _=require('underscore');__cov_V2$0Qw_XjlSYAes9WcAyBw.s['2']++;var q=require('q');__cov_V2$0Qw_XjlSYAes9WcAyBw.s['3']++;var entryHandler=require('../handleEntry');function processResponses(opts){__cov_V2$0Qw_XjlSYAes9WcAyBw.f['1']++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['5']++;var promise=q.defer();__cov_V2$0Qw_XjlSYAes9WcAyBw.s['6']++;opts=(__cov_V2$0Qw_XjlSYAes9WcAyBw.b['1'][0]++,opts)||(__cov_V2$0Qw_XjlSYAes9WcAyBw.b['1'][1]++,{});__cov_V2$0Qw_XjlSYAes9WcAyBw.s['7']++;var data=opts.data;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['8']++;var options=(__cov_V2$0Qw_XjlSYAes9WcAyBw.b['2'][0]++,opts.options)||(__cov_V2$0Qw_XjlSYAes9WcAyBw.b['2'][1]++,{});__cov_V2$0Qw_XjlSYAes9WcAyBw.s['9']++;var reqPromises=[];__cov_V2$0Qw_XjlSYAes9WcAyBw.s['10']++;if(!data){__cov_V2$0Qw_XjlSYAes9WcAyBw.b['3'][0]++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['11']++;promise.reject('PhantomJS could not process the page');}else{__cov_V2$0Qw_XjlSYAes9WcAyBw.b['3'][1]++;}__cov_V2$0Qw_XjlSYAes9WcAyBw.s['12']++;console.log('processResponses -->');__cov_V2$0Qw_XjlSYAes9WcAyBw.s['13']++;_.each(_.keys(data.log.entries),function(key,idx){__cov_V2$0Qw_XjlSYAes9WcAyBw.f['2']++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['14']++;try{__cov_V2$0Qw_XjlSYAes9WcAyBw.s['15']++;var entry=data.log.entries[key];__cov_V2$0Qw_XjlSYAes9WcAyBw.s['16']++;reqPromises.push(new entryHandler(entry,idx,key,options));}catch(err){__cov_V2$0Qw_XjlSYAes9WcAyBw.s['17']++;promise.reject(err);}});__cov_V2$0Qw_XjlSYAes9WcAyBw.s['18']++;q.all(reqPromises).then(function(responses){__cov_V2$0Qw_XjlSYAes9WcAyBw.f['3']++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['19']++;_.each(_.keys(responses),function(key){__cov_V2$0Qw_XjlSYAes9WcAyBw.f['4']++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['20']++;var res=responses[key];__cov_V2$0Qw_XjlSYAes9WcAyBw.s['21']++;data.log.entries[res.idx]=res.data;});__cov_V2$0Qw_XjlSYAes9WcAyBw.s['22']++;promise.resolve(data);}).catch(function(err){__cov_V2$0Qw_XjlSYAes9WcAyBw.f['5']++;__cov_V2$0Qw_XjlSYAes9WcAyBw.s['23']++;console.log('processResponses err');__cov_V2$0Qw_XjlSYAes9WcAyBw.s['24']++;promise.reject(err);});__cov_V2$0Qw_XjlSYAes9WcAyBw.s['25']++;return promise.promise;}__cov_V2$0Qw_XjlSYAes9WcAyBw.s['26']++;module.exports=processResponses;
