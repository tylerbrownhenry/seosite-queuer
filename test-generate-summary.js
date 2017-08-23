require('dotenv').config();
var dynamoose = require('dynamoose');

dynamoose.AWS.config.update({
     region: "us-west-2",
     endpoint: process.env.AWS_DYNAMODB_ENDPOINT
});

var generate = require('./app/actions/report/generate-summary');

generate('ZSMH64','embed:scan','success');
