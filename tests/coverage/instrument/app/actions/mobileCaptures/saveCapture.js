
var __cov_YYMjpGSnLfe32SbSHopyFA = (Function('return this'))();
if (!__cov_YYMjpGSnLfe32SbSHopyFA.__coverage__) { __cov_YYMjpGSnLfe32SbSHopyFA.__coverage__ = {}; }
__cov_YYMjpGSnLfe32SbSHopyFA = __cov_YYMjpGSnLfe32SbSHopyFA.__coverage__;
if (!(__cov_YYMjpGSnLfe32SbSHopyFA['app/actions/mobileCaptures/saveCapture.js'])) {
   __cov_YYMjpGSnLfe32SbSHopyFA['app/actions/mobileCaptures/saveCapture.js'] = {"path":"app/actions/mobileCaptures/saveCapture.js","s":{"1":0,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0},"fnMap":{"1":{"name":"doit","line":8,"loc":{"start":{"line":8,"column":0},"end":{"line":8,"column":55}}},"2":{"name":"(anonymous_2)","line":10,"loc":{"start":{"line":10,"column":31},"end":{"line":10,"column":61}}},"3":{"name":"(anonymous_3)","line":22,"loc":{"start":{"line":22,"column":43},"end":{"line":22,"column":67}}},"4":{"name":"(anonymous_4)","line":29,"loc":{"start":{"line":29,"column":49},"end":{"line":29,"column":64}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":27}},"2":{"start":{"line":2,"column":0},"end":{"line":2,"column":29}},"3":{"start":{"line":3,"column":0},"end":{"line":3,"column":23}},"4":{"start":{"line":4,"column":0},"end":{"line":6,"column":3}},"5":{"start":{"line":8,"column":0},"end":{"line":38,"column":1}},"6":{"start":{"line":10,"column":5},"end":{"line":37,"column":8}},"7":{"start":{"line":11,"column":10},"end":{"line":36,"column":11}},"8":{"start":{"line":12,"column":15},"end":{"line":12,"column":77}},"9":{"start":{"line":13,"column":15},"end":{"line":13,"column":90}},"10":{"start":{"line":15,"column":15},"end":{"line":20,"column":17}},"11":{"start":{"line":22,"column":15},"end":{"line":35,"column":18}},"12":{"start":{"line":23,"column":20},"end":{"line":34,"column":21}},"13":{"start":{"line":24,"column":25},"end":{"line":24,"column":78}},"14":{"start":{"line":25,"column":25},"end":{"line":25,"column":56}},"15":{"start":{"line":29,"column":25},"end":{"line":29,"column":68}},"16":{"start":{"line":30,"column":25},"end":{"line":30,"column":112}},"17":{"start":{"line":31,"column":25},"end":{"line":32,"column":54}},"18":{"start":{"line":33,"column":25},"end":{"line":33,"column":69}},"19":{"start":{"line":40,"column":0},"end":{"line":40,"column":22}}},"branchMap":{"1":{"line":11,"type":"if","locations":[{"start":{"line":11,"column":10},"end":{"line":11,"column":10}},{"start":{"line":11,"column":10},"end":{"line":11,"column":10}}]},"2":{"line":23,"type":"if","locations":[{"start":{"line":23,"column":20},"end":{"line":23,"column":20}},{"start":{"line":23,"column":20},"end":{"line":23,"column":20}}]},"3":{"line":30,"type":"cond-expr","locations":[{"start":{"line":30,"column":65},"end":{"line":30,"column":95}},{"start":{"line":30,"column":98},"end":{"line":30,"column":112}}]}}};
}
__cov_YYMjpGSnLfe32SbSHopyFA = __cov_YYMjpGSnLfe32SbSHopyFA['app/actions/mobileCaptures/saveCapture.js'];
__cov_YYMjpGSnLfe32SbSHopyFA.s['1']++;var guid=require('guid');__cov_YYMjpGSnLfe32SbSHopyFA.s['2']++;var AWS=require('aws-sdk');__cov_YYMjpGSnLfe32SbSHopyFA.s['3']++;var fs=require('fs');__cov_YYMjpGSnLfe32SbSHopyFA.s['4']++;var s3=new AWS.S3({region:process.env.AWS_REGION});function doit(filenameFull,callback,requestId,size){__cov_YYMjpGSnLfe32SbSHopyFA.f['1']++;__cov_YYMjpGSnLfe32SbSHopyFA.s['6']++;fs.readFile(filenameFull,function(err,temp_png_data){__cov_YYMjpGSnLfe32SbSHopyFA.f['2']++;__cov_YYMjpGSnLfe32SbSHopyFA.s['7']++;if(err!=null){__cov_YYMjpGSnLfe32SbSHopyFA.b['1'][0]++;__cov_YYMjpGSnLfe32SbSHopyFA.s['8']++;console.log('Error loading saved screenshot: '+err.message);__cov_YYMjpGSnLfe32SbSHopyFA.s['9']++;return callback('error','Error loading saved screenshot: '+err.message);}else{__cov_YYMjpGSnLfe32SbSHopyFA.b['1'][1]++;__cov_YYMjpGSnLfe32SbSHopyFA.s['10']++;upload_params={Body:temp_png_data,Key:guid.raw()+'.png',ACL:'public-read',Bucket:process.env.AWS_BUCKET_NAME};__cov_YYMjpGSnLfe32SbSHopyFA.s['11']++;s3.putObject(upload_params,function(err,s3_data){__cov_YYMjpGSnLfe32SbSHopyFA.f['3']++;__cov_YYMjpGSnLfe32SbSHopyFA.s['12']++;if(err!=null){__cov_YYMjpGSnLfe32SbSHopyFA.b['2'][0]++;__cov_YYMjpGSnLfe32SbSHopyFA.s['13']++;console.log('Error uploading to s3: '+err.message);__cov_YYMjpGSnLfe32SbSHopyFA.s['14']++;callback('error',err.message);}else{__cov_YYMjpGSnLfe32SbSHopyFA.b['2'][1]++;__cov_YYMjpGSnLfe32SbSHopyFA.s['15']++;fs.unlink(filenameFull,function(err){__cov_YYMjpGSnLfe32SbSHopyFA.f['4']++;});__cov_YYMjpGSnLfe32SbSHopyFA.s['16']++;var s3Region=process.env.AWS_REGION?(__cov_YYMjpGSnLfe32SbSHopyFA.b['3'][0]++,'s3-'+process.env.AWS_REGION):(__cov_YYMjpGSnLfe32SbSHopyFA.b['3'][1]++,'s3-us-west-2');__cov_YYMjpGSnLfe32SbSHopyFA.s['17']++;var s3Url='https://'+s3Region+'.amazonaws.com/'+process.env.AWS_BUCKET_NAME+'/'+upload_params.Key;__cov_YYMjpGSnLfe32SbSHopyFA.s['18']++;callback('success',s3Url,requestId,size);}});}});}__cov_YYMjpGSnLfe32SbSHopyFA.s['19']++;module.exports=doit;
