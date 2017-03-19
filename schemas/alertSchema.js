var dynamoose = require('dynamoose');

var alertSchema = new dynamoose.Schema({
     uid: {
          type: String
     },
     messages: []
});

module.exports = dynamoose.model('Alert', alertSchema);
