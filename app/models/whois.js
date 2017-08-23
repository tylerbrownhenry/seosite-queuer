var dynamoose = require('dynamoose');

var whois = new dynamoose.Schema({
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

module.exports = dynamoose.model('Whois', whois);
