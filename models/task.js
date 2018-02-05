var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    task_name: {type: String, required: true},
    task_description: {type: String, required: false},

    status: {type: String, enum: ["complete", "pending", "incomplete"], default: "incomplete", required: true},
    priority_level: {type: Number, min: 0, max: 10, default: 0, required: true},

    date_added: {type: Date, default: Date.now, required: true},
    date_completed: {type: Date, default: Date.now, required: true},
    deadline: {type: Date, default: Date.now, required: true},

    reminder: {type: Date, default: Date.now, required: false},

    dependencies: [this],

    dependency_check: {type: Boolean, required: true, default: false},
    
    user: {type: Schema.ObjectId, ref: 'User', required: true},

    repeat: {type: Boolean, required: true, default: false},
    freq: {type: Number, required: false, default: 1}, 
    unit_of_time: {type: String, enum: ["day", "week", "month", "year"], 
      required: false, default: "week"},
    repeat_on: [{type: Number, enum: [0, 1, 2, 3, 4, 5, 6], 
      required: false, default: 0}], 
    // repeat_ends: {type: Date, default: Date.now, required: false},
    // repeat_count: {type: Number, default: 0, required: false},

    next_appearance: {type: Date, required: false, default: Date.now()},

    labels: [{type: String, required: false, default: ''}]

});

TaskSchema
.virtual('date_added_formatted')
.get(function() {
    return this.date_added ? moment(this.date_added).format('MMMM Do, YYYY') : '';
});

TaskSchema
.virtual('date_completed_formatted')
.get(function() {
    return this.date_completed ? moment(this.date_completed).format('MMMM Do, YYYY') : '';
});

TaskSchema
.virtual('deadline_formatted')
.get(function() {
    return this.deadline ? moment(this.deadline).format('MMMM Do, YYYY') : '';
});

TaskSchema
.virtual('deadline_formatted_2')
.get(function() {
    return this.deadline ? moment(this.deadline).format('MM/DD/YY') : '';
});

TaskSchema
.virtual('reminder_formatted')
.get(function() {
    return this.reminder ? moment(this.reminder).format('MMMM Do, YYYY') : '';
});

TaskSchema
.virtual('reminder_formatted_2')
.get(function() {
    return this.reminder ? moment(this.reminder).format('MM/DD/YY') : '';
});

TaskSchema
.virtual('time_formatted')
.get(function() {
    var hour = this.reminder.getHours();
    var minute = this.reminder.getMinutes();
    var second = this.reminder.getSeconds();

    h = hour < 10 ? '0' + String(hour) : String(hour);
    m = minute < 10 ? '0' + String(minute) : String(minute);
    s = '00';

    return moment(h + ':' + m + ':' + s, 'HH:mm:ss').format("hh:mm A");
})

TaskSchema
.virtual('url_complete')
.get(function () {
  return '/update/complete/' + this._id;
});

TaskSchema
.virtual('url_incomplete')
.get(function () {
  return '/update/incomplete/' + this._id;
});

TaskSchema
.virtual('url_incomplete_pending')
.get(function () {
  return '/update/incomplete_pending/' + this._id;
});

TaskSchema
.virtual('url_complete_pending')
.get(function () {
  return '/update/complete_pending/' + this._id;
});

TaskSchema
.virtual('url_pending')
.get(function () {
  return '/update/pending/' + this._id;
});

TaskSchema
.virtual('url_remove')
.get(function () {
  return '/update/remove/' + this._id;
});

TaskSchema
.virtual('url_remove_pending')
.get(function () {
  return '/update/remove/pending/' + this._id;
});

TaskSchema
.virtual('url_remove_overdue')
.get(function () {
  return '/update/remove_overdue/' + this._id;
});

TaskSchema
.virtual('url_complete_overdue')
.get(function () {
  return '/update/complete_overdue/' + this._id;
});

TaskSchema
.virtual('url_edit')
.get(function () {
  return '/update/edit/' + this._id;
});

TaskSchema
.virtual('url_reminder')
.get(function () {
  return '/tasks/task/reminder/' + this._id;
});

TaskSchema
.virtual('url_dependency')
.get(function () {
  return '/tasks/task/dependency/' + this._id;
});

TaskSchema
.virtual('url_reminder_tomorrow')
.get(function () {
  return '/update/tomorrow/' + this._id;
});

TaskSchema
.virtual('url_deadline_today')
.get(function() {
  return '/update/today/' + this._id;
})

TaskSchema
.virtual('url_add_dependency')
.get(function() {
  return '/tasks/dependency/' + this._id;
})

module.exports = mongoose.model('Task', TaskSchema);