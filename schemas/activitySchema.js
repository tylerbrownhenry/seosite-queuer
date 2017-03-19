var dynamoose = require('dynamoose');
var activitySchema = new dynamoose.Schema({
     "oid": {
          type: String,
          hashKey: true
     },
     "page-all-count": {
          type: Number,
          default: 0
     },
     "site-all-count": {
          type: Number,
          default: 0
     },
     "link-all-count": {
          type: Number,
          default: 0
     },
     "resource-all-count": {
          type: Number,
          default: 0
     },
     "capture-all-count": {
          type: Number,
          default: 0
     },
     "issue-all-count": {
          type: Number,
          default: 0
     },
     "page-month-reset": {
          type: Date,
          default: Date.now()
     },
     "page-day-reset": {
          type: Date,
          default: Date.now()
     },
     "page-day-count": {
          type: Number,
          default: 0
     },
     "page-month-count": {
          type: Number,
          default: 0
     },
     "site-month-reset": {
          type: Date,
          default: Date.now()
     },
     "site-day-reset": {
          type: Date,
          default: Date.now()
     },
     "site-day-count": {
          type: Number,
          default: 0
     },
     "site-month-count": {
          type: Number,
          default: 0
     },
     "link-month-reset": {
          type: Date,
          default: Date.now()
     },
     "link-day-reset": {
          type: Date,
          default: Date.now()
     },
     "link-day-count": {
          type: Number,
          default: 0
     },
     "link-month-count": {
          type: Number,
          default: 0
     },
     "resource-month-reset": {
          type: Date,
          default: Date.now()
     },
     "resource-day-reset": {
          type: Date,
          default: Date.now()
     },
     "resource-day-count": {
          type: Number,
          default: 0
     },
     "resource-month-count": {
          type: Number,
          default: 0
     },
     "issue-month-reset": {
          type: Date,
          default: Date.now()
     },
     "issue-day-reset": {
          type: Date,
          default: Date.now()
     },
     "issue-day-count": {
          type: Number,
          default: 0
     },
     "issue-month-count": {
          type: Number,
          default: 0
     },
     "capture-month-reset": {
          type: Date,
          default: Date.now()
     },
     "capture-day-reset": {
          type: Date,
          default: Date.now()
     },
     "capture-day-count": {
          type: Number,
          default: 0
     },
     "capture-month-count": {
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
module.exports = activitySchema;
