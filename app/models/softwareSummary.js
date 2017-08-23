var dynamoose = require('dynamoose');

var softwareSummary = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     summary: {
       type:Object
     },
     status: {
       type:Boolean,
       default: false
     }

});

module.exports = dynamoose.model('SoftwareSummary', softwareSummary);
