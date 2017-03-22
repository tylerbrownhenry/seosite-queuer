
var __cov_WTIWjvzjfjZF4z3CjdlKRA = (Function('return this'))();
if (!__cov_WTIWjvzjfjZF4z3CjdlKRA.__coverage__) { __cov_WTIWjvzjfjZF4z3CjdlKRA.__coverage__ = {}; }
__cov_WTIWjvzjfjZF4z3CjdlKRA = __cov_WTIWjvzjfjZF4z3CjdlKRA.__coverage__;
if (!(__cov_WTIWjvzjfjZF4z3CjdlKRA['app/models/scan.js'])) {
   __cov_WTIWjvzjfjZF4z3CjdlKRA['app/models/scan.js'] = {"path":"app/models/scan.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":39,"column":3}},"3":{"start":{"line":41,"column":0},"end":{"line":41,"column":53}}},"branchMap":{}};
}
__cov_WTIWjvzjfjZF4z3CjdlKRA = __cov_WTIWjvzjfjZF4z3CjdlKRA['app/models/scan.js'];
__cov_WTIWjvzjfjZF4z3CjdlKRA.s['1']++;var dynamoose=require('dynamoose');__cov_WTIWjvzjfjZF4z3CjdlKRA.s['2']++;var scanSchema=new dynamoose.Schema({requestId:{type:String,hashKey:true},uid:{type:String},meta:{type:Object},resources:{type:Object},emails:{type:Object},linkCount:{type:Number},thumb:{type:String},url:{type:Object},redirects:{type:Number},message:{type:String},status:{type:String},thumb:String});__cov_WTIWjvzjfjZF4z3CjdlKRA.s['3']++;module.exports=dynamoose.model('Scan',scanSchema);
