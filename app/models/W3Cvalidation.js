var dynamoose = require('dynamoose');

var w3cValidation = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     data: {
       type:Object
     },
     status: {
       type:Boolean,
       default: false
     }
});

module.exports = dynamoose.model('W3Cvalidation', w3cValidation);
