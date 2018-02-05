var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var types = ["forward", "focus", "good", "smile", "happy", "proud", "memorable", "someone"]

var questions = [
    "Scheduly wants to know: what is one thing you are looking forward to today?",
    "Scheduly wants to know: what is one goal you want to accomplish today?",
    "Scheduly wants to know: what is something good that has happened so far?",
    "Scheduly wants to know: what is something that made you smile today?",  
    "Scheduly wants to know: who is someone who made your day brighter?",             
    "Scheduly wants to know: what is something you did today that you are proud of?",
    "Scheduly wants to know: what is something memorable that happened today?",
    "Scheduly wants to know: what is something that made you feel happy today?"
  ]

var statements = [
    "One thing that I am looking forward to today is",
    "One goal that I want to accomplish today is",
    "Something good that has happened so far is",
    "Something that made me smile today is",               
    "Someone who made my day brighter is",
    "Something I did today that I are proud of is",
    "Something memorable that happened today is",
    "Something that made me feel happy today is"
  
]

var statements_day_detail = [
    "One thing that you were looking forward to today was",
    "One goal that you wanted to accomplish today was",
    "Something good that happened to you today was",
    "Something that made you smile today was",               
    "Someone who made your day brighter was",
    "Something you did today that you were proud of was",
    "Something memorable that happened to you today was",
    "Something that made you feel happy today was"
  
]

var AccomplishmentSchema = new Schema({
    accomplishment_name: {type: String, required: false, default: ''},
    date_added: {type: Date, default: Date.now, required: true},
    question: {type: String, enum: questions, required: true, default: ''},
    question_num: {type: Number, enum: [0,1,2,3,4,5,6,7], required:true, default:0},
    statement: {type: String, enum: statements, required: true, default: ''},
    statement_day_detail: {type: String, enum: statements_day_detail, required: true, default: ''},
    user: {type: Schema.ObjectId, ref: 'User', required: true}
});

AccomplishmentSchema
.virtual('date_added_formatted')
.get(function() {
    return this.date_added ? moment(this.date_added).format('MMMM Do, YYYY') : '';
});

AccomplishmentSchema
.virtual('url_acc')
.get(function () {
  return '/newacc/' + this._id;
});


module.exports = mongoose.model('Accomplishment', AccomplishmentSchema);