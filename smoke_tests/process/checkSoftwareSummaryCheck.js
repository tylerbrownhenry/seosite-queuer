var arr = require('./config/website-list').slice(0, 20);
require('./config/start-mq-connect-aws')('softwareSummary');

var check = require('../../app/settings/requests/softwareSummary/process').publish;
_ = require('underscore');

_.each(arr, (e,i) => {
     let data = {
       test:{
         filename:'softwareSummary'
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
