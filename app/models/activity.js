var dynamoose = require('dynamoose');

var activitySchema = new dynamoose.Schema({
     "oid": {
          type: String,
          hashKey: true
     },
     "email": {
       type: String,
     },
     "customerId":  {
       type: String
     },
     "request-month-reset": {
          type: String,
          default: +new Date()
     },
     "request-day-reset": {
          type: String,
          default: +new Date()
     },
     "request-all-count": {
          type: Number,
          default: 0
     },
     "request-day-count": {
          type: Number,
          default: 0
     },
     "request-month-count": {
          type: Number,
          default: 0
     }
}, {
     "throughput": {
          read: 15,
          write: 5
     },
     "timestamps": {
          createdAt: 'createdTs',
          updatedAt: 'updatedTs'
     }
});
module.exports = dynamoose.model('Activity', activitySchema);
