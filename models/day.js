var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var DaySchema = new Schema({
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: 'User', required: true},

    // user: {type: Schema.ObjectID, ref: 'User', required: true}
});

DaySchema
.virtual('date_formatted')
.get(function() {
    return this.date ? moment(this.date).format('MMMM Do, YYYY') : '';
});

DaySchema
.virtual('url')
.get(function () {
  return '/tasks/archive/day/' + this._id;
});

module.exports = mongoose.model('Day', DaySchema);