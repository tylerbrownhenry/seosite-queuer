var arr = require('./config/website-list').slice(0, 20);
require('./config/start-mq-connect-aws')('checkSSL');

var check = require('../../app/settings/requests/checkSSL/process').publish;
_ = require('underscore');

_.each(arr, (e,i) => {
     let data = {
       test:{
         filename:'checkSSL'
       },
       input:{
         input:{
           requestId:'1234'
         },
         res:{
           socialInfo: {
             twitterUsername: null
           },
           url:{
             url: e
           }
         }
       }
     };
     check(data);
});
