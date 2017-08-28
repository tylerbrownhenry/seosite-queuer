var arr = require('./config/website-list').slice(0, 20);
require('./config/start-mq-connect-aws')('socialCheck');

var check = require('../../app/settings/requests/checkSocial/process').publish;
_ = require('underscore');

_.each(arr, (e,i) => {
     let data = {
       test:{
         filename:'socialCheck'
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
