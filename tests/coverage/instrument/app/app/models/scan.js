var dynamoose = require('dynamoose');

var scanSchema = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     uid: {
          type: String
     },
     meta: {
          type: Object
     },
     resources: {
          type: Object
     },
     emails: {
          type: Object
     },
     linkCount: {
          type: Number
     },
     thumb: {
          type: String
     },
     url: {
          type: Object
     },
     redirects: {
          type: Number
     },
     message: {
          type: String
     },
     status: {
          type: String
     },
     thumb: String
});

module.exports = dynamoose.model('Scan', scanSchema);
