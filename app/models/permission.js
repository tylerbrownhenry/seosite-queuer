"use strict";
var dynamoose = require('dynamoose');
var permissionSchema = new dynamoose.Schema({
     label: {
          type: String,
          hashKey: true
     },
     limits: {
          monthly: {
               requests: {
                    type: Number,
                    default: 30
               }
          },
          daily: {
               requests: {
                    type: Number,
                    default: 3
               }
          }
     },
     restrictions: {
          captures: {
               type: Boolean,
               default: false
          },
          links:{
               type: Boolean,
               default: false
          },
          security:{
               type: Boolean,
               default: false
          }

     }
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

module.exports = dynamoose.model('Permission', permissionSchema);
