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
          type: String,
          default: +new Date()
     },
     _id: {
          type: String,
          rangeKey: true
          // ,
          // index: {
          //   global: true,
          //   rangeKey: 'requestId',
          //   name: 'linkIdIndex',
          //   project: true, // ProjectionType: ALL
          //   throughput: 5 // read and write are both 5
          // }
     },
     linkId: {
          type: String
     },
     uid: {
          type: String
     },
     requestId: {
       type: String,
       hashKey: true,
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
