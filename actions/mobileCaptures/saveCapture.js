var guid = require('guid');
var AWS = require('aws-sdk');
var fs = require('fs');
var s3 = new AWS.S3({region: process.env.AWS_REGION});

function doit(filenameFull,callback){
    //load the saved file
    fs.readFile(filenameFull, function(err, temp_png_data){
        if(err!=null){
              console.log("Error loading saved screenshot: " + err.message);
              return callback('error',"Error loading saved screenshot: " + err.message);
        }else{
            upload_params = {
                Body: temp_png_data,
                Key: guid.raw() + ".png",
                ACL: "public-read",
                Bucket: process.env.AWS_BUCKET_NAME
            };
            //start uploading
            s3.putObject(upload_params, function(err, s3_data) {
                if(err!=null){
                    console.log("Error uploading to s3: " + err.message);
                    return response.json(500, { 'error': 'Problem uploading to S3.' + err.message });
                }else{
                    //clean up and respond
                    fs.unlink(filenameFull, function(err){}); //delete local file
                    var s3Region = process.env.AWS_REGION? 's3-' + process.env.AWS_REGION : 's3'
                    var s3Url = 'https://' + s3Region + ".amazonaws.com/" + process.env.AWS_BUCKET_NAME +
                    '/' + upload_params.Key;
                    callback('success',s3Url);
                }
            });
        }
    });
}

module.exports = doit;