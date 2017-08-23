var dynamoose = require('dynamoose');

var pingIP = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     ip: {
       type:Object
     },
     status: {
       type:Boolean,
       default: false
     }

});

module.exports = dynamoose.model('PingIP', pingIP);
