var dynamoose = require('dynamoose');

var captureSchema = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     'ipadlandscape': {
          type: String,
          default: null
     },
     'iphone6': {
          type: String,
          default: null
     },
     '1920x1080': {
          type: String,
          default: null
     },
     status: {
          type: Boolean,
          default: false
     }
});

module.exports = dynamoose.model('Capture', captureSchema);
