var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');

var moment = require('moment');

var Schema = mongoose.Schema;

var User = new Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: false},
	hash: {type: String, required: true},
	email: {type: String, required: false, minlength: 6, default: ''},
	salt: {type: String},
	first_name: {type: String, required: false, default: ''},
	last_name: {type: String, required: false, default: ''}

});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);