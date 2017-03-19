require('dotenv').config();
var dynamoose = require('dynamoose');
dynamoose.AWS.config.update({
     region: "us-west-2",
     endpoint: process.env.AWS_DYNAMODB_ENDPOINT
});

var utils = require('./app/utils');

utils.findUser({email:'2pdasc@email.com'},function(err,user){
  console.log('err',err,'user',user[0].oid);

});
