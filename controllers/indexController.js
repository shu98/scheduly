var Task = require('../models/task');
var Day = require('../models/day');
var Accomplishment = require('../models/accomplishment');
var User = require('../models/user');
var async = require('async');
var moment = require('moment');

var messages = [
   "Scheduly thinks you're doing great today!",
   "Remember to take care of yourself! Eat well and sleep well, so that you can work well.",
   "Stay calm and eat some chocolate. Or a lot.",
   "Be kind to yourself. Scheduly knows you're doing your best.",
   "Scheduly is supporting you every step of the way.",
   "Nothing is impossible, really.",
   "Make today a masterpiece.",
   "You're always okay!",
   "Believe you can and you're halfway there. ~Theodore Roosevelt",
   "Change your thoughts and you change your world. ~Norman Vincent Peale",
   "Scheduly believes in you! You should too!",
   "Nothing will work unless you do. ~Maya Angelou",
   "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. ~Henry Ford",
   "Happiness can be found in the darkest of times, if one only remembers to turn on the light. ~Dumbledore",
   "Good, better, best. Never let it rest. 'Til your good is better and your better is best. ~St. Jerome",
   "Scheduly hopes you're having a good day.",
   "Remember to smile!",
   "Scheduly hopes you are having fun.",
   "Everything will be okay."
]

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
    "Something I did today that I am proud of is",
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

// Helper function to get today's date 
function get_today(req) {
    var today = new Date(Date.now());
    var month = today.getMonth();
    var day = today.getDate();
    var year = today.getFullYear();

    var start = new Date(year, month, day);
    start.setHours(0, 0, 0, 0);
    start = start.getTime();

    var end = new Date(year, month, day);
    end.setHours(23, 59, 59, 0);
    end = end.getTime();

    Day.findOne({'date': {$gte:start, $lte:end}, user: req.user.id})
        .exec(function(err, found_day) {
            if (!found_day) {
                var date = new Day({date: Date.now(), user:req.user.id});
                date.save();
            }
        })

    return [month, day, year];
}

// GET: index page (current tasks)
exports.index_get = function(req, res) {

    if(req.isAuthenticated()) {

        var today = get_today(req);
        var month = today[0];
        var day = today[1];
        var year = today[2];

        var start = new Date(year, month, day);
        start.setHours(0, 0, 0, 0);
        start = start.getTime();

        var end = new Date(year, month, day);
        end.setHours(23, 59, 59, 0);
        end = end.getTime()

        end = new Date(Date.now());
        end = Date.parse(end);

        var current_time = new Date(Date.now());
        var current_time = current_time.getHours();
        var display = (current_time >= 17);

        var date_formatted = moment(Date.now()).format('MM/DD/YYYY')

        async.series({
            tasks: function(callback) {
                Task.find({'status': 'incomplete', 'user': req.user.id, 'deadline': {$gte:start},
                    $or: [{'repeat': false}, {'repeat': true, 'date_added': {$lte:end}}]
                
                })
                .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                .exec(callback);
            },

            pending_tasks: function(callback) {
                Task.find({'status': 'pending', 'user': req.user.id, 'deadline': {$gte:start},
                        $or: [{'reminder': {$lte:end}}, {'dependencies': [], 'dependency_check': true}]
                    })
                .sort([['priority', 'descending']])
                .exec(callback);
            },

            user: function(callback) {
                User.findById(req.user.id)
                .exec(callback);

            }, 

            num_tasks: function(callback) {
                Task.find({'status': 'complete', 'date_completed': {$gte:start, $lte:end}, 'user':req.user.id})
                .exec(callback)
            },

            num_pending: function(callback) {
                Task.count({'status': 'pending', 'user': req.user.id}, callback);
            },

            overdue: function(callback) {
                Task.findOne({'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:start},'user': req.user.id})
                .exec(callback)
            }

        }, function (err, results) {

            var message_choice = "";
            if (current_time < 10 && current_time > 4) {
                message_choice = "Good morning! Scheduly hopes you're ready for a beautiful day!";
            }
            else if (current_time < 13 && current_time > 11) {
                message_choice = "You're halfway through the day! Keep it up!"
            }
            else if (current_time < 17 && current_time > 14) {
                message_choice = "It's happy hour, and Scheduly is still cheering for you!";
            }
            else if (current_time >= 20) {
                message_choice = "It's been a long day. Scheduly wants you to treat yourself to a good night's sleep.";
            }
            else if (current_time < 4) {
                message_choice = "Scheduly thinks it's late. Make sure to get some sleep!"
            }
            else {
                var choice = Math.floor(Math.random() * messages.length);
                message_choice = messages[choice];
                
            }

            var question_choice = "";
            var question_number = 0;
            var time_of_day = [0, 0];
            var statement_choice = "";
            var day_detail_choice = "";
            
            if (current_time <= 10 && current_time > 4) {
                question_number = Math.floor(Math.random() * 2);
                question_choice = questions[question_number];
                statement_choice = statements[question_number];
                day_detail_choice = statements_day_detail[question_number];
                time_of_day = [0, 1];
            }
            else if (current_time <= 15 && current_time > 10) {
                question_number = Math.floor(Math.random() * 2) + 2;
                question_choice = questions[question_number];
                statement_choice = statements[question_number];
                day_detail_choice = statements_day_detail[question_number];
                time_of_day = [2, 3];
            }
            else if (current_time <= 20 && current_time > 15) {
                question_number = Math.floor(Math.random() * 2) + 4;
                question_choice = questions[question_number];
                statement_choice = statements[question_number];
                day_detail_choice = statements_day_detail[question_number];
                time_of_day = [4, 5];
            }
            else if (current_time > 20 || current_time < 4) {
                question_number = Math.floor(Math.random() * 2) + 6
                question_choice = questions[question_number];
                statement_choice = statements[question_number];
                day_detail_choice = statements_day_detail[question_number];
                time_of_day = [6, 7];
            }

            var start2 = new Date(Date.now());
            var month = start2.getMonth();
            
            month = month + 1;
            var new_month = month < 10 ? '0' + String(month) : String(month);
            var date = String(start2.getFullYear()) + '-' + new_month + '-' + String(start2.getDate());

            var accomplishment = new Accomplishment({});
            var show_question = true;

            Accomplishment.findOne({'question_num': {$in: time_of_day}, 'date_added': {$gte:start, $lte:end}, 'user': req.user.id})
                .exec(function(err, acc) {
                    if (!acc) {
                        accomplishment = new Accomplishment({
                            accomplishment_name: '',
                            date_added: Date.now(),
                            question: question_choice,
                            question_num: question_number,
                            statement: statement_choice,
                            statement_day_detail: day_detail_choice,
                            user: req.user.id
                        });

                        accomplishment.save(function(err) {
                            if (err) {
                                console.log(err);
                            }
                            res.render('index', {tasks: results.tasks, pending_tasks: results.pending_tasks, 
                                date: date_formatted, display: display, accomplishment: accomplishment,
                                user:results.user, message:message_choice, complete:results.num_tasks.length,
                                deadline_default:date, acc:accomplishment, show_question:show_question, title:"Today",
                                show_question:true, overdue:results.overdue===null, num_incomplete:results.tasks.length,
                                num_pending:results.num_pending})

                        });
                    }
                    else {
                        accomplishment = acc;
                        if (acc.accomplishment_name != ''){
                            show_question = false;
                        }

                        res.render('index', {tasks: results.tasks, pending_tasks: results.pending_tasks, 
                            date: date_formatted, display: display, accomplishment: accomplishment,
                            user:results.user, message:message_choice, complete:results.num_tasks.length,
                            deadline_default:date, acc:accomplishment, show_question:show_question, title:"Today",
                            show_question:show_question, overdue:results.overdue===null, num_incomplete:results.tasks.length,
                            num_pending:results.num_pending})
                    }
                })

            
        })

    } 

    else {
        res.redirect('/welcome');
    }  
};

// POST: index page (create new task)
exports.index_task_post = function(req, res) {

    if(req.isAuthenticated()) {

        req.checkBody('task_name', "Task can't be empty!").notEmpty();
        req.checkBody('deadline', 'By when would you like to complete this task?').notEmpty();
        req.checkBody('priority_level').notEmpty();
        req.checkBody('status').notEmpty();

        req.sanitize('task_name').escape().trim();
        req.sanitize('deadline').escape().trim();
        req.sanitize('priority_level').escape().trim();
        req.sanitize('status').escape().trim();

        req.body.task_name = req.body.task_name.replace(new RegExp('&#x27;', 'g'), '\'')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x2F;', 'g'), '/')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x5C;', 'g'), '\\')
        req.body.task_name = req.body.task_name.replace(new RegExp('&amp;', 'g'), '&')

        var task_status = req.body.status;

        var deadline = new Date(req.body.deadline);
        deadline.setMinutes(deadline.getMinutes() + deadline.getTimezoneOffset());

        var new_task = new Task({
            task_name: req.body.task_name,
            task_description: '',
            priority_level: req.body.priority_level,
            date_added: Date.now(),
            deadline: Date.parse(deadline),
            status: task_status,
            user: req.user.id
        });

        new_task.save(function(err) {
            if (task_status==="pending"){
                res.redirect('/tasks/task/pending/' + new_task.id);
            }
            else {
                res.redirect('/');
            }
        });

        
    }
    else {
        res.redirect("/welcome");
    }

};

exports.welcome = function(req, res) {
    res.render('welcome')
}

// POST: accomplishments (create new accomplishment)
exports.index_acc_post = function(req, res) {

    if(req.isAuthenticated()) {
        req.checkBody('answer').notEmpty();
        req.sanitize('answer').escape().trim();

        req.body.answer = req.body.answer.replace(new RegExp('&#x27;', 'g'), '\'')
        req.body.answer = req.body.answer.replace(new RegExp('&#x2F;', 'g'), '/')
        req.body.answer = req.body.answer.replace(new RegExp('&#x5C;', 'g'), '\\')
        req.body.answer = req.body.answer.replace(new RegExp('&amp;', 'g'), '&')

        Accomplishment.update(
            {_id: req.params.id},
            {'accomplishment_name': req.body.answer})
            .exec(function(err) {
                res.redirect('/');
            })
    }
    else {
        res.redirect('/welcome');
    }

};
