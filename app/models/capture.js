var dynamoose = require('dynamoose');

var captureSchema = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     uid: {
          type: String,
     },
     url: {
          type: Object
     },
     '1920x1080': {
          type: String,
          default: null
     },
     '1600x1200': {
          type: String,
          default: null
     },
     '1400x900': {
          type: String,
          default: null
     },
     '1024x768': {
          type: String,
          default: null
     },
     '800x600': {
          type: String,
          default: null
     },
     '420x360': {
          type: String,
          default: null
     },
     status: {
          type: String,
          default: 'init'
     }
});

module.exports = dynamoose.model('Capture', captureSchema);
