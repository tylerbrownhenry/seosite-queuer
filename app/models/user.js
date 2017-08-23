var dynamoose = require('dynamoose');
var userSchema = new dynamoose.Schema({
     email: {
          type: String,
          unique: true,
          lowercase: true
     },
     status: {
       type: String,
       default: 'active'
     },
     password: String,
     isAdmin: {
          type: Boolean,
          default: false
     },
     customerId: {
          type: String,
     },
     timezone: {
       type:String
     },
     role: {
          type: String,
          default: 'org_admin'
     },
     oid: {
          type: String,
     },
     uid: {
          type: String,
          hashKey: true
     },
     name: {
          type: String,
          default: ''
     },
     gender: {
          type: String,
          default: ''
     },
     location: {
          type: String,
          default: ''
     },
     website: {
          type: String,
          default: ''
     },
     picture: {
          type: String,
          default: ''
     },
     created: {
          type: String,
          default: +new Date()
     }
});
module.exports = dynamoose.model('User', userSchema);
