
var __cov_hZzDA7ve4W9CtLWt_jYrfQ = (Function('return this'))();
if (!__cov_hZzDA7ve4W9CtLWt_jYrfQ.__coverage__) { __cov_hZzDA7ve4W9CtLWt_jYrfQ.__coverage__ = {}; }
__cov_hZzDA7ve4W9CtLWt_jYrfQ = __cov_hZzDA7ve4W9CtLWt_jYrfQ.__coverage__;
if (!(__cov_hZzDA7ve4W9CtLWt_jYrfQ['app/settings/requests/retry/retryables.js'])) {
   __cov_hZzDA7ve4W9CtLWt_jYrfQ['app/settings/requests/retry/retryables.js'] = {"path":"app/settings/requests/retry/retryables.js","s":{"1":1,"2":1,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":1,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":1,"17":0,"18":0,"19":0,"20":0,"21":1,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":1,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0},"b":{},"f":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0},"fnMap":{"1":{"name":"requiresDatabase","line":3,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":27}}},"2":{"name":"saveAsActive","line":9,"loc":{"start":{"line":9,"column":0},"end":{"line":9,"column":35}}},"3":{"name":"processHar","line":18,"loc":{"start":{"line":18,"column":0},"end":{"line":18,"column":33}}},"4":{"name":"notify","line":27,"loc":{"start":{"line":27,"column":0},"end":{"line":27,"column":28}}},"5":{"name":"markedRequstAsFailed","line":33,"loc":{"start":{"line":33,"column":0},"end":{"line":33,"column":42}}},"6":{"name":"processUrl","line":42,"loc":{"start":{"line":42,"column":0},"end":{"line":42,"column":32}}}},"statementMap":{"1":{"start":{"line":3,"column":0},"end":{"line":7,"column":1}},"2":{"start":{"line":9,"column":0},"end":{"line":16,"column":1}},"3":{"start":{"line":10,"column":2},"end":{"line":10,"column":74}},"4":{"start":{"line":11,"column":2},"end":{"line":11,"column":25}},"5":{"start":{"line":12,"column":2},"end":{"line":12,"column":29}},"6":{"start":{"line":13,"column":2},"end":{"line":13,"column":22}},"7":{"start":{"line":14,"column":2},"end":{"line":14,"column":22}},"8":{"start":{"line":15,"column":2},"end":{"line":15,"column":30}},"9":{"start":{"line":18,"column":0},"end":{"line":25,"column":1}},"10":{"start":{"line":19,"column":2},"end":{"line":19,"column":70}},"11":{"start":{"line":20,"column":2},"end":{"line":20,"column":31}},"12":{"start":{"line":21,"column":2},"end":{"line":21,"column":28}},"13":{"start":{"line":22,"column":2},"end":{"line":22,"column":35}},"14":{"start":{"line":23,"column":2},"end":{"line":23,"column":36}},"15":{"start":{"line":24,"column":2},"end":{"line":24,"column":30}},"16":{"start":{"line":27,"column":0},"end":{"line":32,"column":1}},"17":{"start":{"line":28,"column":2},"end":{"line":28,"column":44}},"18":{"start":{"line":29,"column":2},"end":{"line":29,"column":20}},"19":{"start":{"line":30,"column":2},"end":{"line":30,"column":15}},"20":{"start":{"line":31,"column":2},"end":{"line":31,"column":25}},"21":{"start":{"line":33,"column":0},"end":{"line":40,"column":1}},"22":{"start":{"line":34,"column":2},"end":{"line":34,"column":90}},"23":{"start":{"line":35,"column":2},"end":{"line":35,"column":25}},"24":{"start":{"line":36,"column":2},"end":{"line":36,"column":22}},"25":{"start":{"line":37,"column":2},"end":{"line":37,"column":29}},"26":{"start":{"line":38,"column":2},"end":{"line":38,"column":30}},"27":{"start":{"line":39,"column":2},"end":{"line":39,"column":30}},"28":{"start":{"line":42,"column":0},"end":{"line":49,"column":1}},"29":{"start":{"line":43,"column":2},"end":{"line":43,"column":70}},"30":{"start":{"line":44,"column":2},"end":{"line":44,"column":25}},"31":{"start":{"line":45,"column":2},"end":{"line":45,"column":22}},"32":{"start":{"line":46,"column":2},"end":{"line":46,"column":29}},"33":{"start":{"line":47,"column":2},"end":{"line":47,"column":20}},"34":{"start":{"line":48,"column":2},"end":{"line":48,"column":30}},"35":{"start":{"line":55,"column":0},"end":{"line":61,"column":1}},"36":{"start":{"line":63,"column":0},"end":{"line":63,"column":26}}},"branchMap":{}};
}
__cov_hZzDA7ve4W9CtLWt_jYrfQ = __cov_hZzDA7ve4W9CtLWt_jYrfQ['app/settings/requests/retry/retryables.js'];
function requiresDatabase(){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['1']++;}function saveAsActive(promise,opts){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['2']++;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['3']++;var _saveAsActive=requre('../settings/requests/summary').saveAsActive;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['4']++;opts.promise=promise;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['5']++;opts.requestId=opts.i_id;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['6']++;opts.isRetry=true;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['7']++;_saveAsActive(opts);__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['8']++;return opts.promise.promise;}function processHar(promise,opts){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['3']++;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['10']++;var _processHar=requre('../settings/requests/summary').processHar;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['11']++;opts.input.promise=promise;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['12']++;opts.input.isRetry=true;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['13']++;opts.input.requestId=opts.i_id;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['14']++;_processHar(opts.input,opts.res);__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['15']++;return opts.promise.promise;}function notify(promise,msg){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['4']++;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['17']++;var _notify=requre('../actions/notify');__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['18']++;promise.resolve();__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['19']++;_notify(msg);__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['20']++;return promise.promise;}function markedRequstAsFailed(promise,msg){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['5']++;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['22']++;var _markedRequstAsFailed=requre('../settings/requests/summary').markedRequstAsFailed;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['23']++;opts.promise=promise;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['24']++;opts.isRetry=true;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['25']++;opts.requestId=opts.i_id;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['26']++;_markedRequstAsFailed(opts);__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['27']++;return opts.promise.promise;}function processUrl(promise,msg){__cov_hZzDA7ve4W9CtLWt_jYrfQ.f['6']++;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['29']++;var _processUrl=requre('../settings/requests/summary').processUrl;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['30']++;opts.promise=promise;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['31']++;opts.isRetry=true;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['32']++;opts.requestId=opts.i_id;__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['33']++;_processUrl(opts);__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['34']++;return opts.promise.promise;}__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['35']++;var commands={'request.summary.markedRequstAsFailed':markedRequstAsFailed,'request.summary.processUrl':processUrl,'request.summary.saveAsActive':saveAsActive,'request.summary.processHar':processHar,'notify':notify};__cov_hZzDA7ve4W9CtLWt_jYrfQ.s['36']++;module.exports=commands;
