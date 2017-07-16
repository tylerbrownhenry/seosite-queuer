var dynamoose = require('dynamoose');

var requestSchema = new dynamoose.Schema({
     requestId: {
          type: String,
          hashKey: true
     },
     retries: {
          type: Number
     },
     uid: {
          type: String
     },
     page: {
          type: String
     },
     url: {
          type: String
     },
     requestDate: {
          type: Date,
          default: +new Date()
     },
     options: {
          type: Object
     },
     processes: {
          type: Number,
          default: 0
     },
     status: {
          type: String,
     },
     failedReason: {
          type: String,
     },
     response: {
          type: Object
     },
}, {
     throughput: {
          read: 15,
          write: 5
     },
     timestamps: {
          createdAt: 'createdTs',
          updatedAt: 'updatedTs'
     }
});
module.exports = requestSchema;
