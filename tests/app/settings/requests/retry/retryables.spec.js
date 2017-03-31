// var chai = require('chai'),
//      expect = chai.expect,
//      _ = require('underscore'),
//      q = require('q'),
//      retryables = require('../../../../../app/settings/requests/retry/retryables'),
//      utils = require('../../../../../app/utils'),
//      sinon = require('sinon');
//
// describe('app/settings/requests/meta/process.js: without meta data', function () {
//   it('will show 4 meta data errors', function (done) {
//       _.each(_.keys(retryables),function(key){
//         var promise = q.defer();
//         retryables[key](promise,{
//             input:{},
//             i_id:{},
//             res:{},
//             link:{},
//             data:{},
//             update:{},
//             type:{},
//             messageId:{},
//             updatedCount:{},
//             commands:{}
//         }).then(function(){
//
//         })
//       });
//
//        done();
//   });
// });
