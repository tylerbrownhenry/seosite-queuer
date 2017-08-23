module.exports = {
  _reject: function(promise,message,err,i_id,retryCommand){
    promise.reject({
         system: 'dynamo',
         systemError: err,
         statusType: 'failed',
         status: 'error',
         source: '--',
         message: 'error:save:validateW3C',
         notify: true,
         retry: true,
         i_id: input.requestId,
         retryCommand: 'request.validateW3C.process',
         retryOptions: {
              input: input
         }
    });
  },
  _resolve: function(){

  }


}
