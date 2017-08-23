var dynamoose = require('dynamoose');

var resourceSchema = new dynamoose.Schema({
     url: {
          type: String
     },
     hostname: {
          type: String
     },
     mainPage:{
       type:Boolean
     },
     css:{
       type:Object
     },
     timings: {
          type: Object
     },
     server: {
       type:String
     },
     start: {
          type: String,
          default: +new Date()
     },
     duration: {
          type: String,
          default: 0
     },
     cached: {
          type: Boolean,
          default: false
     },
     gzip: {
          type: Boolean,
          default: false
     },
     minified: {
          type: Boolean,
          default: false
     },
     minifiedDetails: {
          type: Object
     },
     bodySize: {
          type: String
     },
     type: {
          type: String,
     },
     cleanType: {
          type: String,
     },
     _id: {
          type: String,
          rangeKey: true
     },
     requestId: {
          type: String,
          hashKey: true
     },
     status: {
          type: String,
          default:0
     },
     scanStatus: {
          type: String,
          default: 'pending'
     },
     canMinify: {
          type: Boolean
     }

});

module.exports = dynamoose.model('Resource', resourceSchema);
