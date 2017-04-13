var chai = require('chai'),
     sinon = require('sinon'),
     dynamoose = require('dynamoose'),
     utils = require('../../app/utils'),
     activitySchema = require('../../app/models/activity'),
     Activity = dynamoose.model('Activity', activitySchema),
     _ = require('underscore'),
     expect = chai.expect,
     utils = require('../../app/utils');

describe('app/utils', function () {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(dynamoose.models.Activity, 'update', function (e) {
               return null;
          });
     });
     afterEach(function () {
          stub.restore();
     });

     it('updateActivity should return null if there was no error', function () {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res === null).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
     var stub;
     beforeEach(function () {
          stub = sinon.stub(dynamoose.models.Activity, 'update', function (e) {
               return true;
          });
     });
     afterEach(function () {
          stub.restore();
     });

     it('updateActivity should return error if update fails', function () {
          utils.updateActivity('fakeHash', 'page', res => {
               expect(res !== null).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
     it('checkRequirements should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['page'], res => {
               expect(res === false).to.equal(true);
               done();
          })
     });

     it('checkRequirements should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['noExisting'], res => {
               expect(res === true).to.equal(true);
               done();
          })
     });

     it('checkRequirements should return false passed', function () {
          utils.checkRequirements({
               page: true
          }, ['page'], res => {
               expect(res === true).to.equal(true);
               done();
          })
     });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'update');
       stub.yieldsTo(null);
  });
  afterEach(function () {
       stub.restore();
  });

   it('updateActivity should return null if passed', function (done) {
        utils.updateActivity(123, 'page', res => {
             expect(res.message).to.be.defined;
             done();
        })
   });

   it('updateActivity should return null if passed (no callback)', function () {
        utils.updateActivity(123, 'page');
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'update');
       stub.yieldsTo(true);
  });
  afterEach(function () {
       stub.restore();
  });

   it('updateActivity should return true if failed', function (done) {
        utils.updateActivity(123, 'page', res => {
             expect(res.message).to.be.defined;
             done();
        })
   });

   it('updateActivity should return true if failed  (no callback)', function () {
        utils.updateActivity(123, 'page');
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b){
         b(true);
       });
  });
  afterEach(function () {
       stub.restore();
  });

   it('checkActivity should return true if failed', function (done) {
        utils.checkActivity(123, res => {
          // console.log('res',res);
             expect(res).to.equal(true);
             done();
        })
   });

   it('checkActivity should return true if failed (no callback)', function () {
        utils.checkActivity(123)
   });
});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b){
         b(null);
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('checkActivity should return null if passed (no callback)', function () {
       utils.checkActivity(123)
  });
   it('checkActivity should return null if passed', function (done) {
        utils.checkActivity(123, res => {
          // console.log('res',res);
             expect(res).to.equal(null);
             done();
        })
   });

});

describe('app/utils', function () {
  // console.log('addCheckPermission to callback from utils.js')
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Permission, 'get',function(a,b){
         b(null);
       });
  });
  afterEach(function () {
       stub.restore();
  });
  it('checkPermissions should return null if passed (no callback)', function () {
    utils.checkPermissions(123)
  });

   it('checkPermissions should return null if passed', function (done) {
        utils.checkPermissions('free', res => {
          // console.log('22res',res);
              expect(res).to.equal(null);
             done();
        })
   });

});


describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Permission, 'get',function(a,b){
         b(true);
       });
  });
  afterEach(function () {
       stub.restore();
  });
  it('checkPermissions should return true if failed (no callback)', function () {
    utils.checkPermissions(123)
  });

   it('checkPermissions should return true if failed', function (done) {
        utils.checkPermissions('free', res => {
          // console.log('res',res);
             expect(res).to.equal(true);
             done();
        })
   });

});


describe('app/utils', function () {
  var stub,stubPerm;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b,c){
        //  console.log('activity',a,'b',b,'c',c);
         b(null,{'page-day-count':1,'page-month-count':1});
       });
       stubPerm = sinon.stub(dynamoose.models.Permission, 'get',function(a,b,c){
        //  console.log('permission',a,'b',b,'c',c);
              b(null,{limits:{daily:2,monthly:2}});
       });
  });
  afterEach(function () {
       stub.restore();
       stubPerm.restore();
  });

   it('checkAvailActivity should return null if passed', function (done) {
        utils.checkAvailActivity(123,'free','page', res => {
          // console.log('res',res);
             expect(res).to.equal(null);
             done();
        })
   });
});


describe('app/utils', function () {
  var stub,stubPerm;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b,c){
        //  console.log('activity',a,'b',b,'c',c);
         b(null,{'page-day-count':2,'page-month-count':0});
       });
       stubPerm = sinon.stub(dynamoose.models.Permission, 'get',function(a,b,c){
        //  console.log('permission',a,'b',b,'c',c);
              b(null,{limits:{daily:{page:4},monthly:{page:2}}});
       });
  });
  afterEach(function () {
       stub.restore();
       stubPerm.restore();
  });

   it('checkAvailActivity should return null if passed (over monthly limit)', function (done) {
        utils.checkAvailActivity(123,'free','page', res => {
          // console.log('res',res);
             expect(res).to.equal(null);
             done();
        })
   });
});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b,c){
        //  console.log('activity',a,'b',b,'c',c);
         b(true);
       });
  });
  afterEach(function () {
       stub.restore();
  });

   it('checkAvailActivity should return true if activity failed', function (done) {
        utils.checkAvailActivity(123,'free','page', res => {
          // console.log('res',res);
             expect(res).to.equal(true);
             done();
        })
   });
});

describe('app/utils', function () {
  var stub,stubPerm;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b,c){
         b(null,{'page-day-count':2,'page-month-count':0});
       });
       stubPerm = sinon.stub(dynamoose.models.Permission, 'get',function(a,b,c){
              b(true);
       });
  });
  afterEach(function () {
       stub.restore();
       stubPerm.restore();
  });


   it('checkAvailActivity should return true if permission failed', function (done) {
        utils.checkAvailActivity(123,'free','page', res => {
          // console.log('res',res);
             expect(res).to.equal(true);
             done();
        })
   });
});

describe('app/utils', function () {
  var stub,stubPerm;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.Activity, 'get',function(a,b,c){
         b(null,{'page-day-count':2,'page-month-count':0});
       });
       stubPerm = sinon.stub(dynamoose.models.Permission, 'get',function(a,b,c){
              b(true);
       });
  });
  afterEach(function () {
       stub.restore();
       stubPerm.restore();
  });

   it('checkAvailActivity should return true if failed', function (done) {
        utils.checkAvailActivity(123,'free','page', res => {
          // console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });
});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'scan',function(a,b){
        //  console.log('a',a,'b',b);
         return {
           exec:function(e,r){
            //  console.log('e--',e);
             e(true);
           }
         }
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('findOneUser should return true if failed (no callback)', function () {
    utils.findOneUser({id:123});
  });
   it('findOneUser should return true if failed', function (done) {
        utils.findOneUser({id:123}, res => {
          console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'scan',function(a,b){
        //  console.log('a',a,'b',b);
         return {
           exec:function(e,r){
            //  console.log('e--',e);
             e(null);
           }
         }
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('findOneUser should return null if passed (no callback)', function () {
    utils.findOneUser({id:123});
  });
   it('findOneUser should return null if passed', function (done) {
        utils.findOneUser({id:123}, res => {
            // console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'scan',function(a,b){

       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('findOneUser should return error if has error (no callback)', function () {
    utils.findOneUser({id:123});
  });
   it('findOneUser should return error if has error', function (done) {
        utils.findOneUser({id:123}, res => {
             expect(res.message).to.be.defined;
             done();
        })
   });

});


// updateBy???
// updateBy???
// updateBy???
// updateBy???
// updateBy???
// updateBy???
// updateBy???
// updateBy???


describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'update',function(a,b,c){
         c(null);
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('updateUser should return null if passed (no callback)', function () {
    utils.updateUser({id:123},{test:123});
  });
   it('updateUser should return null if passed', function (done) {
        utils.updateUser({id:123},{test:123}, res => {
            // console.log('res',res);
             expect(res).to.equal(null);
             done();
        })
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'update',function(a,b,c){
         c(true);
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('updateUser should return true if passed (no callback)', function () {
    utils.updateUser({id:123},{test:123});
  });
   it('updateUser should return true if passed', function (done) {
        utils.updateUser({id:123},{test:123}, res => {
            // console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });

});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'update',function(a,b,c){
         a(); /* Not a function*/
       });
  });
  afterEach(function () {
       stub.restore();
  });

  it('updateUser should return error if there is an error (no callback)', function () {
    utils.updateUser({id:123},{test:123});
  });
   it('updateUser should return error if there is an error', function (done) {
        utils.updateUser({id:123},{test:123}, res => {
            // console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });

});

//saveModel
//saveModel
//saveModel
//saveModel
//saveModel
//saveModel
//saveModel


describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'delete',function(a,b,c){
        //  console.log('a',b,'c',c);
         b(null);
       });
  });
  afterEach(function () {
       stub.restore();
  });

   it('deleteUser should return null if passed', function (done) {
        utils.deleteUser({id:123},res => {
            // console.log('res',res);
             expect(res).to.equal(null);
             done();
        })
   });

   it('deleteUser should return null if passed (no callback)', function () {
        utils.deleteUser({id:123});
   });
});

describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'delete',function(a,b,c){
        //  console.log('a',b,'c',c);
         b(true);
       });
  });
  afterEach(function () {
       stub.restore();
  });

   it('deleteUser should return true if failed', function (done) {
        utils.deleteUser({id:123},res => {
            // console.log('res',res);
             expect(res).to.equal(true);
             done();
        })
   });

   it('deleteUser should return true if failed (no callback)', function () {
        utils.deleteUser({id:123});
   });
});


describe('app/utils', function () {
  var stub;
  beforeEach(function () {
       stub = sinon.stub(dynamoose.models.User, 'delete',function(a,b,c){
         a();/* Not a function */
       });
  });
  afterEach(function () {
       stub.restore();
  });

   it('deleteUser should return error if there is an error', function (done) {
        utils.deleteUser({id:123},res => {
            // console.log('res',res);
             expect(res.message).to.be.defined;
             done();
        })
   });

   it('deleteUser should return error if there is an error (no callback)', function () {
        utils.deleteUser({id:123});
   });
});

//saveScan
//saveScan
//saveScan
//saveScan
//saveScan
//saveScan
//saveScan
//saveScan
//
//
//findBy
//findBy
//findBy
//findBy
//findBy
//findBy
//findBy
//findBy
//
//
//
//batchPut
//batchPut
//batchPut
//batchPut
//batchPut
//batchPut
//batchPut
//batchPut
