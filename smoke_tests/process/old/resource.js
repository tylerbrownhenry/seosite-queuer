require('dotenv').config();
var dynamoose = require('dynamoose');
dynamoose.AWS.config.update({
     region: "us-west-2",
     endpoint: process.env.AWS_DYNAMODB_ENDPOINT
});

var dynamoose = require('dynamoose');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
     region: process.env.AWS_REGION
});


var request = require('../../app/settings/requests/resource');
// request.init(new Buffer(JSON.stringify({"content":{"url":"http://wwww.ign.com","type":"js"}}))).then((resp)=>{
request.init({"content":JSON.stringify({"url":"http://wwww.ign.com","type":"js","requestId":"123","_id":'123'})}).then((resp)=>{
  console.log('resp',resp);
})
//https://www.google-analytics.com/u/d?_v=j60&id=99&tid=UA-9999999-1&ad=9999.999&bd=999.999&ar=999.999&br=999.990&an=9.999&bn=0&ac=999.999&bc=0&as=9&z=999999
