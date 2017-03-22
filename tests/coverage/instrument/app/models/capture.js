
var __cov_fV7q5ajCnQ$zXptk9aQevg = (Function('return this'))();
if (!__cov_fV7q5ajCnQ$zXptk9aQevg.__coverage__) { __cov_fV7q5ajCnQ$zXptk9aQevg.__coverage__ = {}; }
__cov_fV7q5ajCnQ$zXptk9aQevg = __cov_fV7q5ajCnQ$zXptk9aQevg.__coverage__;
if (!(__cov_fV7q5ajCnQ$zXptk9aQevg['app/models/capture.js'])) {
   __cov_fV7q5ajCnQ$zXptk9aQevg['app/models/capture.js'] = {"path":"app/models/capture.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":39,"column":3}},"3":{"start":{"line":41,"column":0},"end":{"line":41,"column":59}}},"branchMap":{}};
}
__cov_fV7q5ajCnQ$zXptk9aQevg = __cov_fV7q5ajCnQ$zXptk9aQevg['app/models/capture.js'];
__cov_fV7q5ajCnQ$zXptk9aQevg.s['1']++;var dynamoose=require('dynamoose');__cov_fV7q5ajCnQ$zXptk9aQevg.s['2']++;var captureSchema=new dynamoose.Schema({requestId:{type:String,hashKey:true},url:{type:Object},'1920x1080':{type:String,default:null},'1600x1200':{type:String,default:null},'1400x900':{type:String,default:null},'1024x768':{type:String,default:null},'800x600':{type:String,default:null},'420x360':{type:String,default:null},status:{type:String,default:'init'}});__cov_fV7q5ajCnQ$zXptk9aQevg.s['3']++;module.exports=dynamoose.model('Capture',captureSchema);
