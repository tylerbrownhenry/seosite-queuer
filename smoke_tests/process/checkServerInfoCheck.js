var arr = require('./config/website-list').slice(0, 20);
require('./config/start-mq-connect-aws')('serverInfo');

var check = require('../../app/settings/requests/serverInfo/process').publish;
_ = require('underscore');

_.each(arr, (e,i) => {
     let data = {
       test:{
         filename:'serverInfo'
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
     check(data);
});
