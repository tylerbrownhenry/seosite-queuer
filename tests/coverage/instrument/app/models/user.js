
var __cov_pLMDjU7n9NtkpHmmsXRgpg = (Function('return this'))();
if (!__cov_pLMDjU7n9NtkpHmmsXRgpg.__coverage__) { __cov_pLMDjU7n9NtkpHmmsXRgpg.__coverage__ = {}; }
__cov_pLMDjU7n9NtkpHmmsXRgpg = __cov_pLMDjU7n9NtkpHmmsXRgpg.__coverage__;
if (!(__cov_pLMDjU7n9NtkpHmmsXRgpg['app/models/user.js'])) {
   __cov_pLMDjU7n9NtkpHmmsXRgpg['app/models/user.js'] = {"path":"app/models/user.js","s":{"1":0,"2":0,"3":0},"b":{},"f":{},"fnMap":{},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":1,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":68,"column":3}},"3":{"start":{"line":69,"column":0},"end":{"line":69,"column":53}}},"branchMap":{}};
}
__cov_pLMDjU7n9NtkpHmmsXRgpg = __cov_pLMDjU7n9NtkpHmmsXRgpg['app/models/user.js'];
__cov_pLMDjU7n9NtkpHmmsXRgpg.s['1']++;var dynamoose=require('dynamoose');;__cov_pLMDjU7n9NtkpHmmsXRgpg.s['2']++;var userSchema=new dynamoose.Schema({email:{type:String,unique:true,lowercase:true},password:String,isAdmin:{type:Boolean,default:false},role:{type:String,default:'org_admin'},oid:{type:String,hashKey:true},uid:{type:String,hashKey:true},name:{type:String,default:''},gender:{type:String,default:''},location:{type:String,default:''},website:{type:String,default:''},picture:{type:String,default:''},plan:{type:String,default:'free'},last4:{type:String},customerId:{type:String},subscriptionId:{type:String},apiToken:{type:String},resetPasswordToken:{type:String},resetPasswordExpires:{type:Date}});__cov_pLMDjU7n9NtkpHmmsXRgpg.s['3']++;module.exports=dynamoose.model('User',userSchema);
