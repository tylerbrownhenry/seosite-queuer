
var __cov_nFbuoRFx1_CyEbyofXTWCA = (Function('return this'))();
if (!__cov_nFbuoRFx1_CyEbyofXTWCA.__coverage__) { __cov_nFbuoRFx1_CyEbyofXTWCA.__coverage__ = {}; }
__cov_nFbuoRFx1_CyEbyofXTWCA = __cov_nFbuoRFx1_CyEbyofXTWCA.__coverage__;
if (!(__cov_nFbuoRFx1_CyEbyofXTWCA['app/settings/requests/capture/publish.js'])) {
   __cov_nFbuoRFx1_CyEbyofXTWCA['app/settings/requests/capture/publish.js'] = {"path":"app/settings/requests/capture/publish.js","s":{"1":0,"2":1,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0},"b":{"1":[0,0],"2":[0,0,0]},"f":{"1":0,"2":0,"3":0},"fnMap":{"1":{"name":"publishCaptures","line":7,"loc":{"start":{"line":7,"column":0},"end":{"line":7,"column":37}}},"2":{"name":"(anonymous_2)","line":18,"loc":{"start":{"line":18,"column":18},"end":{"line":18,"column":39}}},"3":{"name":"(anonymous_3)","line":20,"loc":{"start":{"line":20,"column":19},"end":{"line":20,"column":34}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":63}},"2":{"start":{"line":7,"column":0},"end":{"line":25,"column":1}},"3":{"start":{"line":8,"column":5},"end":{"line":23,"column":6}},"4":{"start":{"line":9,"column":10},"end":{"line":22,"column":13}},"5":{"start":{"line":19,"column":15},"end":{"line":19,"column":48}},"6":{"start":{"line":21,"column":15},"end":{"line":21,"column":55}},"7":{"start":{"line":24,"column":5},"end":{"line":24,"column":12}},"8":{"start":{"line":27,"column":0},"end":{"line":27,"column":33}}},"branchMap":{"1":{"line":8,"type":"if","locations":[{"start":{"line":8,"column":5},"end":{"line":8,"column":5}},{"start":{"line":8,"column":5},"end":{"line":8,"column":5}}]},"2":{"line":8,"type":"binary-expr","locations":[{"start":{"line":8,"column":9},"end":{"line":8,"column":22}},{"start":{"line":8,"column":26},"end":{"line":8,"column":44}},{"start":{"line":8,"column":48},"end":{"line":8,"column":84}}]}}};
}
__cov_nFbuoRFx1_CyEbyofXTWCA = __cov_nFbuoRFx1_CyEbyofXTWCA['app/settings/requests/capture/publish.js'];
__cov_nFbuoRFx1_CyEbyofXTWCA.s['1']++;var publisher=require('../../../amqp-connections/publisher');function publishCaptures(input,res){__cov_nFbuoRFx1_CyEbyofXTWCA.f['1']++;__cov_nFbuoRFx1_CyEbyofXTWCA.s['3']++;if((__cov_nFbuoRFx1_CyEbyofXTWCA.b['2'][0]++,input.options)&&(__cov_nFbuoRFx1_CyEbyofXTWCA.b['2'][1]++,input.options.save)&&(__cov_nFbuoRFx1_CyEbyofXTWCA.b['2'][2]++,input.options.save.captures===true)){__cov_nFbuoRFx1_CyEbyofXTWCA.b['1'][0]++;__cov_nFbuoRFx1_CyEbyofXTWCA.s['4']++;publisher.publish('','capture',new Buffer(JSON.stringify({url:res.url.resolvedUrl,requestId:requestId,uid:input.uid,sizes:['1920x1080']})),{url:res.url.resolvedUrl,requestId:requestId}).then(function(err,data){__cov_nFbuoRFx1_CyEbyofXTWCA.f['2']++;__cov_nFbuoRFx1_CyEbyofXTWCA.s['5']++;console.log('Capture published');}).catch(function(err){__cov_nFbuoRFx1_CyEbyofXTWCA.f['3']++;__cov_nFbuoRFx1_CyEbyofXTWCA.s['6']++;console.log('Error publishing capture');});}else{__cov_nFbuoRFx1_CyEbyofXTWCA.b['1'][1]++;}__cov_nFbuoRFx1_CyEbyofXTWCA.s['7']++;return;}__cov_nFbuoRFx1_CyEbyofXTWCA.s['8']++;module.exports=publishCaptures;
