
var __cov_6IMCvZ$34C0NSPfaFmLpzQ = (Function('return this'))();
if (!__cov_6IMCvZ$34C0NSPfaFmLpzQ.__coverage__) { __cov_6IMCvZ$34C0NSPfaFmLpzQ.__coverage__ = {}; }
__cov_6IMCvZ$34C0NSPfaFmLpzQ = __cov_6IMCvZ$34C0NSPfaFmLpzQ.__coverage__;
if (!(__cov_6IMCvZ$34C0NSPfaFmLpzQ['app/models/alert.js'])) {
   __cov_6IMCvZ$34C0NSPfaFmLpzQ['app/models/alert.js'] = {"path":"app/models/alert.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":40,"column":3}},"3":{"start":{"line":42,"column":0},"end":{"line":42,"column":55}}},"branchMap":{}};
}
__cov_6IMCvZ$34C0NSPfaFmLpzQ = __cov_6IMCvZ$34C0NSPfaFmLpzQ['app/models/alert.js'];
__cov_6IMCvZ$34C0NSPfaFmLpzQ.s['1']++;var dynamoose=require('dynamoose');__cov_6IMCvZ$34C0NSPfaFmLpzQ.s['2']++;var alertSchema=new dynamoose.Schema({alertId:{type:String,hashKey:true},uid:{type:String},messages:{type:Array,default:[]},page:{type:String},type:{type:String},status:{type:String},requestDate:{type:Date,default:Date.now()},temp_id:{type:String,default:null},requestId:{type:String,default:null},i_id:{type:String,default:null}});__cov_6IMCvZ$34C0NSPfaFmLpzQ.s['3']++;module.exports=dynamoose.model('Alert',alertSchema);
