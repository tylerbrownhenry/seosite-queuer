var arr = require('./config/website-list').slice(0, 20);
require('./config/start-mq-connect-aws')('tapTargetCheck');

var tapTargetCheck = require('../../app/settings/requests/tapTargetCheck/process').publish;
_ = require('underscore');
_.each(arr, (e,i) => {
     let data = {
       test:{
         filename:'tapTargetCheck'
       },
       input:{
         input:{
           requestId:'1234'
         },
         res:{
           url:{
             url: e
           }
         }
       }
     };
     tapTargetCheck(data);
});
