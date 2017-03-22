var dynamoose = require('dynamoose');;

var userSchema = new dynamoose.Schema({
     email: {
          type: String,
          unique: true,
          lowercase: true
     },
     password: String,
     isAdmin: {
          type: Boolean,
          default: false
     },
     role: {
          type: String,
          default: 'org_admin'
     },
     oid: {
          type: String,
          hashKey: true
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
     plan: {
          type: String,
          default: 'free'
     },
     last4: {
          type: String,
     },
     customerId: {
          type: String,
     },
     subscriptionId: {
          type: String,
     },
     apiToken: {
          type: String,
     },
     resetPasswordToken: {
          type: String,
     },
     resetPasswordExpires: {
          type: Date,
     },
});
module.exports = dynamoose.model('User', userSchema);
