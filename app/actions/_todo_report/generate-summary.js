// var dynamoose = require('dynamoose'),
//      linkSchema = require("../../models/link"),
//      Link = dynamoose.model('Link', linkSchema),
//      requestSchema = require("../../models/request"),
//      Request = dynamoose.model('Request', requestSchema),
//      Issue = require("../../models/issues"),
//      Resource = require("../../models/resource"),
//      Security = require("../../models/security"),
//      MetaData = require("../../models/metaData"),
//      Captures = require("../../models/capture"),
//      utils = require('../../utils'),
//      _ = require('underscore'),
//      q = require('q');
//      //  linkScanner = require("../../actions/sniff/linkScanner"),
//     //  notify = require('../../actions/notify'),
//
// function makeCall(model,name,key,val){
//   var promise = q.defer();
//   console.log('key',key,name,val);
//   model.query(key).eq(val).exec(function(err,resp){
//     if(err){
//       promise.reject(err);
//     } else {
//       promise.resolve({items:resp,name:name});
//     }
//   });
//   return promise.promise;
// }
//
// function getManyBy(models,key,val){
//   var promise = q.defer();
//   var queue = [];
//   _.each(models,function(model){
//     queue.push(makeCall(model.obj,model.name,key,val));
//   });
//
//   q.all(queue).then(function(response){
//     console.log('RESPONSE',response);
//     promise.resolve(response);
//   }).catch(function(err){
//     promise.reject(err);
//   });
//   return promise.promise;
// }
//
// module.exports = function(id,type,status){
//   if(status === 'error'){
//     /* Send an email about error */
//
//   } else {
//     getManyBy([
//       {name:'resource',obj:Resource},
//       {name:'Issue',obj:Issue},
//       {name:'Security',obj:Security},
//       {name:'MetaData',obj:MetaData},
//       {name:'Captures',obj:Captures},
//       {name:'Link',obj:Link}
//     ],'requestId',id).then(function(err,resp){
//
//     }).catch(function(err){
//
//     });
//   }
// }
