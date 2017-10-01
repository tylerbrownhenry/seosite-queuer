const q = require("q"),
     validateW3C = require('../../../actions/validateW3C/index');

function process(html) {
     let deferred = q.defer();
     validateW3C(html).then((results)=> {
          deferred.resolve({
               w3cValidate: {
                    data: results,
                    status: 'success'
               }
          });
     }).catch((results)=>{
        deferred.reject({
               w3cValidate: {
                    data: results,
                    status: 'failed'
               }
        })
     });
     return deferred.promise;
}

module.exports = {
     process: process
};
