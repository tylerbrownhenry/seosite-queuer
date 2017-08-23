var dynamoose = require('dynamoose');

var metaDataSchema = new dynamoose.Schema({
     type: {
          type: String
     },
     element: {
          type: String
     },
     found: {
          type: Boolean,
          default:false
     },
     message: {
          type: String,
     },
     text: {
          type: String,
     },
     keywords: {
          type: Object,
     },
     _id: {
          type: String,
          rangeKey: true
     },
     requestId: {
       type: String,
       hashKey: true,
     }
});

module.exports = dynamoose.model('MetaData', metaDataSchema);
