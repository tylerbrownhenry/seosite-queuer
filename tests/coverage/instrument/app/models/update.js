
var __cov_nVWs3wKAu7QbwMwOrbJyEQ = (Function('return this'))();
if (!__cov_nVWs3wKAu7QbwMwOrbJyEQ.__coverage__) { __cov_nVWs3wKAu7QbwMwOrbJyEQ.__coverage__ = {}; }
__cov_nVWs3wKAu7QbwMwOrbJyEQ = __cov_nVWs3wKAu7QbwMwOrbJyEQ.__coverage__;
if (!(__cov_nVWs3wKAu7QbwMwOrbJyEQ['app/models/update.js'])) {
   __cov_nVWs3wKAu7QbwMwOrbJyEQ['app/models/update.js'] = {"path":"app/models/update.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":30,"column":3}},"3":{"start":{"line":32,"column":0},"end":{"line":32,"column":57}}},"branchMap":{}};
}
__cov_nVWs3wKAu7QbwMwOrbJyEQ = __cov_nVWs3wKAu7QbwMwOrbJyEQ['app/models/update.js'];
__cov_nVWs3wKAu7QbwMwOrbJyEQ.s['1']++;var dynamoose=require('dynamoose');__cov_nVWs3wKAu7QbwMwOrbJyEQ.s['2']++;var updateSchema=new dynamoose.Schema({id:{type:String,hashKey:true},uid:{type:String},message:{type:String},page:{type:String},type:{type:String},status:{type:String},statusType:{type:String},i_id:{type:String,default:null}});__cov_nVWs3wKAu7QbwMwOrbJyEQ.s['3']++;module.exports=dynamoose.model('Update',updateSchema);
