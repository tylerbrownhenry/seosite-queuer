var capture = require("../../actions/mobileCaptures/index").doit;
var q = require('q');

function _capture(msg) {
    var promise = q.defer();
    var input = JSON.parse(msg.content);
    var url = input.url;
    var sizes = input.sizes;
    var requestId = input.requestId;
    console.log('Capture Go',url,'requestId',requestId);
    capture(url,requestId,sizes).then(function(res){
        console.log('Capture Success',res);
        promise.resolve({
            status:'success',
            size:res.size,
            url: res.url,
            requestId: res.requestId,
            data:'Captures taken'
        });                    
    }).catch(function(err){
        console.log('Capture Error',err);
        promise.reject(err);
    });
    return promise.promise;
}

module.exports = _capture;