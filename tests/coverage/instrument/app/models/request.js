
var __cov_xm5DagacqWL5QAeR7nIfkA = (Function('return this'))();
if (!__cov_xm5DagacqWL5QAeR7nIfkA.__coverage__) { __cov_xm5DagacqWL5QAeR7nIfkA.__coverage__ = {}; }
__cov_xm5DagacqWL5QAeR7nIfkA = __cov_xm5DagacqWL5QAeR7nIfkA.__coverage__;
if (!(__cov_xm5DagacqWL5QAeR7nIfkA['app/models/request.js'])) {
   __cov_xm5DagacqWL5QAeR7nIfkA['app/models/request.js'] = {"path":"app/models/request.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":45,"column":3}},"3":{"start":{"line":46,"column":0},"end":{"line":46,"column":31}}},"branchMap":{}};
}
__cov_xm5DagacqWL5QAeR7nIfkA = __cov_xm5DagacqWL5QAeR7nIfkA['app/models/request.js'];
__cov_xm5DagacqWL5QAeR7nIfkA.s['1']++;var dynamoose=require('dynamoose');__cov_xm5DagacqWL5QAeR7nIfkA.s['2']++;var requestSchema=new dynamoose.Schema({requestId:{type:String,hashKey:true},retries:{type:Number},uid:{type:String},url:{type:String},requestDate:{type:Date},options:{type:Object},processes:{type:Number,default:0},status:{type:String},failedReason:{type:String},response:{type:Object}},{throughput:{read:15,write:5},timestamps:{createdAt:'createdTs',updatedAt:'updatedTs'}});__cov_xm5DagacqWL5QAeR7nIfkA.s['3']++;module.exports=requestSchema;
