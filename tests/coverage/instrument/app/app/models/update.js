var dynamoose = require('dynamoose');

var updateSchema = new dynamoose.Schema({
    id:{
         type: String,
         hashKey: true
    },
    uid:{
      type: String
    },
    message: {
      type: String,
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
    statusType:{
      type:String
    },
    i_id: {
      type: String,
      default: null
    }
});

module.exports = dynamoose.model('Update', updateSchema);
