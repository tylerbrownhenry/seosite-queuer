var dynamoose = require('dynamoose');

var linkSchema = new dynamoose.Schema({
     url: {
          type: String
     },
     site: {
          type: String
     },
     queueId: {
          type: String
     },
     found: {
          type: Date
     },
     _id: {
          type: String,
          hashKey: true
     },
     linkId: {
          type: String
     },
     uid: {
          type: String
     },
     requestId: {
          type: String
     },
     scanned: {
          type: Date
     },
     status: {
          type: String,
          default: 'pending'
     },
     __link: {
          type: Object
     },
     results: {
          type: Object
     }
});

module.exports = linkSchema;
