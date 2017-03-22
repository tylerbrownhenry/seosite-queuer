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
    page: {
      type: String
    },
    type: {
      type: String
    },
    status: {
      type: String
    },
    requestDate: {
      type: Date,
      default: Date.now()
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
