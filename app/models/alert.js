var dynamoose = require('dynamoose');

var alertSchema = new dynamoose.Schema({
    alertId:{
         type: String,
         hashKey: true
    },
    uid:{
      type: String
    },
    messages: {
      type: Array,
      default: []
    },
    source: {
      type: String
    },
    type: {
      type: String
    },
    status: {
      type: String
    },
    requestDate: {
      type: String,
      default: +new Date()
    },
    temp_id: {
      type: String,
      default: null
    },
    requestId: {
      type: String,
      default: null
    },
    i_id: {
      type: String,
      default: null
    }
});

module.exports = dynamoose.model('Alert', alertSchema);
