var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User',
   new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  isAdmin: { type:Boolean, default:false},
  role:  { type: String, default:'org_admin'},
  oid:  { type: String},
  uid: String,
    activity: {
        requests:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        },
        pages:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        },
        sites:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        },
        captures:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        },
        resources:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        },
        links:{
            daily: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
            monthly: {
                refreshed: { type: Date, default: Date.now() },
                count:{ type: Number, default: 0 },
            },
        }
    },
  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  apiToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}),'users');
