var dynamoose = require('dynamoose');

var securitySchema = new dynamoose.Schema({
     type: {
          type: String
     },
     message: {
          type: String
     },
     text: {
          type: String
     },
     requestId: {
          type: String,
          hashKey: true,
     }
});

module.exports = dynamoose.model('Security', securitySchema);
