var guid = require('guid');
var AWS = require('aws-sdk');
var fs = require('fs');
var s3 = new AWS.S3({
     accessKeyId: 'AKIAJCC7DRYWXZQOGCNA' ||process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: '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' || process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION
});

function saveImage(originalFileName,filenameFull, callback, requestId, device) {
     //load the saved file
     fs.readFile(filenameFull, function (err, temp_png_data) {
          if (err != null) {
               console.log("Error loading saved screenshot: " + err.message);
               return callback('error', "Error loading saved screenshot: " + err.message);
          } else {
               upload_params = {
                    Body: temp_png_data,
                    Key: guid.raw() + ".png",
                    ACL: "public-read",
                    Bucket: process.env.AWS_BUCKET_NAME
               };
               //start uploading
               s3.putObject(upload_params, function (err, s3_data) {
                    if (err != null) {
                         console.log("Error uploading to s3: " + err.message);
                         fs.unlink(filenameFull, function (err) {}); //delete local file
                         fs.unlink(originalFileName, function (err) {}); //delete local file
                         callback('error', err.message);
                    } else {
                         //clean up and respond
                         fs.unlink(filenameFull, function (err) {}); //delete local file
                         fs.unlink(originalFileName, function (err) {}); //delete local file
                         var s3Region = process.env.AWS_REGION ? 's3-' + process.env.AWS_REGION : 's3-us-west-2'
                         var s3Url = 'https://' + s3Region + ".amazonaws.com/" + process.env.AWS_BUCKET_NAME +
                              '/' + upload_params.Key;
                         callback('success', s3Url, requestId, device);
                    }
               });
          }
     });
}

module.exports = saveImage;
