var dynamoose = require('dynamoose');

var scanSchema = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     uid: {
          type: String
     },
     htmlResults: {
          type: Object
     },
     issues: {
          type: Object
     },
     thumb: {
          type: String
     },
     url: {
          type: Object,
          default: {}
     },
     redirects: {
          type: Number
     },
     completedTime: {
          type: Date,
          default: +new Date()
     },
     message: {
          type: String
     },
     sslEnabled: {
          type: String
     },
     social:{
       type:Object
     },
     serverInfo:{
      type: Object
     },
     fontInfo: {
        type: Object
     },
     tapTargetCheck: {
       type:Object
     },
     status: {
          type: String
     },
     thumb: String
});

module.exports = dynamoose.model('Scan', scanSchema);
