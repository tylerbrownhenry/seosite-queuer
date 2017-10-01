let _ = require('underscore'),
q = require('q'),
w3cjs = require('./w3cjs/lib/w3cjs');

/**
 * checks W3C Compatibility of string of html
 * @param  {String}   html      string of html
 * @param  {Function} callback
 * @return {Boolean}
 */
module.exports = (html) => {
     let deferred = q.defer(),
    results = w3cjs.validate({
         input: html,
         output: 'json',
         callback: function (err,res) {
            if(err || !res ){
              console.log('w3cValidate failed');
              return deferred.reject({message:'failed:validateW3C'});
            }
             var resp = {
                  valid: false,
                  warnings: 0,
                  infos: 0,
                  errors: 0
             }
             if(res.messages){
               _.each(res.messages, function (message) {
                    if (message.type === 'warning') {
                         resp.warnings++;
                    } else if(message.type === 'error') {
                         resp.errors++;
                    }else if(message.type === 'info') {
                         resp.infos++;
                    }
               });
             }
             deferred.resolve(resp);
         }
     });
     return deferred.promise;
}
