var Task = require('../models/task');
var Day = require('../models/day');
var User = require('../models/user');
var Accomplishment = require('../models/accomplishment');
var async = require('async');
var moment = require('moment');

// Helper function to get today's date 
function getToday(offset) {
    var today = new Date(Date.now());
    var month = today.getMonth();
    var day = today.getDate()+offset;
    var year = today.getFullYear();

    var start = new Date(year, month, day);
    start.setHours(0, 0, 0, 0);

    var end = new Date(year, month, day);
    end.setHours(23, 59, 59, 0);

    return [start, end]
}

// GET: edit task
exports.task_edit_get = function(req, res) {

    if(req.isAuthenticated()) { 

        var today = getToday(0);
        var year = today[1].getFullYear();
        var month = today[1].getMonth();
        var day = today[1].getDate();

        var end = new Date(year, month, day);
        end.setHours(23, 59, 59, 0);
        end = end.getTime()

        async.series({
            task: function(callback) {
                Task.findById(req.params.id).populate('task')
                    .exec(callback);
            },
            
            incomplete: function(callback) {
                Task.find({_id: {$ne: req.params.id}, 
                    'status': {$in: ['incomplete', 'pending']},
                    'user': req.user.id,
                    $or: [{'repeat': false}, {'repeat': true, 'date_added': {$lte:end}}]
                    })
                    .exec(callback);

            },

            user: function(callback) {
                User.findById(req.user.id)
                .exec(callback);}

            }, function(err, results) {
                if (err) { console.log("error"); }
                for (var all_g_iter = 0; all_g_iter < results.incomplete.length; all_g_iter++) {
                    for (var task_g_iter = 0; task_g_iter < results.task.dependencies.length; task_g_iter++) {
                        console.log(results.task.dependencies[task_g_iter]);
                        if (results.incomplete[all_g_iter]._id.toString()==results.task.dependencies[task_g_iter].toString()) {
                            results.incomplete[all_g_iter].checked='true';
                        }
                    }
                }

                rem = new Date(Date.now())

                // var reminder_today = new Date(results.task.reminder).getDate() === rem.getDate();
                var reminder_today = new Date(results.task.reminder) < Date.now();
                if (results.task.status === 'incomplete' || reminder_today) {
                    rem.setDate(rem.getDate()+1);
                }
                else {
                    rem = new Date(results.task.reminder);   
                }                
                var month = rem.getMonth();
                month = month + 1;
                var new_month = month < 10 ? '0' + String(month) : String(month);
                var new_day = rem.getDate() < 10 ? '0' + String(rem.getDate()) : String(rem.getDate());
                var reminder_date = String(rem.getFullYear()) + '-' + new_month + '-' + new_day;

                var dline = new Date(results.task.deadline)
                // dline.setMinutes(dline.getMinutes() - dline.getTimezoneOffset());

                var month = dline.getMonth();
                month = month + 1;
                var new_month = month < 10 ? '0' + String(month) : String(month);
                var new_day = dline.getDate() < 10 ? '0' + String(dline.getDate()) : String(dline.getDate());

                isPending = results.task.status==="pending";
                isRepeating = results.task.repeat===true;

                var dline = String(dline.getFullYear()) + '-' + new_month + '-' + new_day;

                var reminder_time = "04:00:00";

                rem.setMinutes(rem.getMinutes() - rem.getTimezoneOffset());
                var offset = rem.getTimezoneOffset()/60;

                if (results.task.status==="pending" && !reminder_today){
                    var minute = rem.getMinutes() < 10 ? '0' + String(rem.getMinutes()) : String(rem.getMinutes());
                    var hour = (rem.getHours() + offset)%24 < 10 ? '0' + String((rem.getHours() + offset)%24) : String((rem.getHours() + offset)%24);

                    reminder_time = hour + ":" + minute + ":" + '00'
                }

                res.render('edit_task', {task:results.task, incomplete:results.incomplete, reminder:reminder_date, 
                        deadline:dline, isPending: isPending, user: results.user, isRepeating: isRepeating,
                        default_reminder_time:reminder_time, title:"Edit Task"});
            });
    }

    else {
        res.redirect('/welcome')
    }
};

// POST: edit task
exports.task_edit_post = function(req, res) {

    if(req.isAuthenticated()) { 

        req.checkBody('task_name', "Task can't be empty!").notEmpty();
        req.checkBody('task_description').optional({checkFalsy: true});
        req.checkBody('deadline', 'By when would you like to complete this task?').notEmpty();
        req.checkBody('priority_level').notEmpty();
        req.checkBody('status').notEmpty();
        req.checkBody('reminder').optional({checkFalsy: true});
        req.checkBody('dependency').optional({checkFalsy: true});
        req.checkBody('repeat_on').optional({checkFalsy: true});
        req.checkBody('freq').optional({checkFalsy: true});
        req.checkBody('unit_of_time').optional({checkFalsy: true});
        req.checkBody('reminder_time').notEmpty()

        req.sanitize('task_name').escape().trim();
        req.sanitize('task_description').escape().trim();
        req.sanitize('deadline').escape().trim();
        req.sanitize('priority_level').escape().trim();
        req.sanitize('status').escape().trim();
        req.sanitize('reminder').escape().trim();
        req.sanitize('freq').escape().trim();
        req.sanitize('unit_of_time').escape().trim();
        req.sanitize('reminder_time').escape().trim();

        req.body.task_name = req.body.task_name.replace(new RegExp('&#x27;', 'g'), '\'')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x2F;', 'g'), '/')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x5C;', 'g'), '\\')
        req.body.task_name = req.body.task_name.replace(new RegExp('&amp', 'g'), '&')

        req.body.task_description = req.body.task_description.replace(new RegExp('&#x27;', 'g'), '\'')
        req.body.task_description = req.body.task_description.replace(new RegExp('&#x2F;', 'g'), '/')
        req.body.task_description = req.body.task_description.replace(new RegExp('&#x5C;', 'g'), '\\')
        req.body.task_description = req.body.task_description.replace(new RegExp('&amp', 'g'), '&')


        var today = getToday(0);
        var year = today[0].getFullYear();
        var month = today[0].getMonth();
        var day = today[0].getDate();

        var end = new Date(year, month, day);
        end.setHours(0, 0, 0, 0);
        end = end.getTime()

        // Handle dependencies 
        if(!(req.body.dependency instanceof Array)) {
            if(typeof req.body.dependency==='undefined')
                {req.body.dependency = [];}
            else {
                req.body.dependency = new Array(req.body.dependency);
            }
        }


        for (var i = 0; i < req.body.dependency.length-1; i++) {
            if ((req.body.dependency[i]).indexOf(' ') != -1 || req.body.dependency[i].length < 12) {
                var new_task = new Task({
                    task_name: req.body.dependency[i],
                    task_description: '',
                    priority_level: 0,
                    date_added: Date.now(),
                    deadline: Date.now(),
                    status: 'incomplete',
                    user: req.user.id
                });

                new_task.save(function(err) {
                    if(err) {
                        console.log("err")
                    }
                });
                req.body.dependency[i] = new_task.id;
            }
            
        }

        req.body.dependency.pop(-1);

        if(!(req.body.repeat_on instanceof Array)) {
            if(typeof req.body.repeat_on==='undefined')
                {req.body.repeat_on = [0];}
            else {
                req.body.repeat_on = new Array(req.body.repeat_on);
            }
        }

        var array = [];
        for (var i = 0; i < req.body.repeat_on.length; i++) {
            array.push(parseInt(req.body.repeat_on[i]));
        }

        var dep_check = (req.body.status==="pending" && req.body.dependency.length > 0) ? true : false;
        var deps = req.body.status==="pending" ? req.body.dependency : [];
        var rem = req.body.status==="pending" ? new Date(req.body.reminder) : new Date(Date.now());
        
        rem.setMinutes(rem.getMinutes() + rem.getTimezoneOffset());
        console.log(rem);
        if (req.body.status==="pending") {
            // rem.setDate(rem.getDate() + 1);
            var pieces = req.body.reminder_time.split(':');
            if (pieces.length == 2) {
                pieces.push('00');
            }

            if (pieces.length === 3) {      
                rem.setHours(parseInt(pieces[0]));
                rem.setMinutes(pieces[1]);
                rem.setSeconds(pieces[2]);
            }
        }

        var dline = new Date(req.body.deadline);
        dline.setMinutes(dline.getMinutes() + dline.getTimezoneOffset())

        // Handle repeated tasks 
        var next_appearance = new Date().getDay();
        if (req.body.repeat != "never") {
            var count = 0;

            if (!array.includes(next_appearance)) {
                while (!array.includes((next_appearance+count)%7)) {
                    count++;
                }
            }

            next_appearance = new Date(Date.now());
            next_appearance.setDate(next_appearance.getDate() + count);
            next_appearance.setMinutes(next_appearance.getMinutes() + next_appearance.getTimezoneOffset());

        }

        isrep = req.body.repeat != "never";
        Task.update(
            {_id: req.params.id},
            {'task_name': req.body.task_name, 
            'task_description': req.body.task_description,
            'status': req.body.status,
            'priority_level': req.body.priority_level,
            'deadline': Date.parse(dline),
            'reminder': Date.parse(rem),
            'dependencies': deps,
            'dependency_check': dep_check,
            'repeat': isrep,
            'freq': isrep===true ? req.body.freq : 0,
            'unit_of_time': isrep===true ? req.body.unit_of_time : 'week',
            'repeat_on': (isrep===true && req.body.unit_of_time==='week') ? array : [], 
            'next_appearance': isrep===true ? Date.parse(next_appearance) : Date.now(),
            'date_completed': Date.now(),
            user: req.user.id})
            .exec(function(err) {
                if (req.body.status==="pending" && Date.parse(dline) >= end) {
                    res.redirect('/tasks/pending/')
                }
                else if (Date.parse(dline) < end) {
                    res.redirect('/tasks/overdue')
                }
                else {
                    res.redirect('/');
                }
            });
    }
    else {
        res.redirect('/welcome');
    }
};

// Display pending tasks page
exports.pending = function(req, res) {
    var today = getToday(0);
    var year = today[1].getFullYear();
    var month = today[1].getMonth();
    var day = today[1].getDate();

    var start = new Date(year, month, day);
    start.setHours(0, 0, 0, 0);
    start = start.getTime();

    if(req.isAuthenticated()) { 

        Task.find({'status': 'pending', 'user': req.user.id, 'deadline': {$gte:start}})
            .sort([['reminder', 'ascending'], ['priority_level', 'descending'], ['deadline', 'ascending']])
            .populate('dependencies')
            .exec(function(err, found_tasks) {
                if (found_tasks) {
                    User.find({'user': req.user.id})
                        .exec(function(err, found_user) {
                            res.render('pending', {tasks: found_tasks, user:found_user, title:"On Hold"})
                        })
                }
            })
    }

    else {
        res.redirect('/welcome')
    }
};

// Display archive 
exports.archive = function(req, res) {

    if(req.isAuthenticated()) { 

        Day.find({'user': req.user.id}).sort({date:-1})
            .exec(function(err, found_days) {
                if (found_days) {
                    User.find({'user': req.user.id})
                        .exec(function(err, found_user) {
                            res.render('archive', {days: found_days, user:found_user, title:"Archive"})
                        })

                }
            })
    }
    else {
        res.redirect('/welcome')
    }
    
};

// Display tasks completed for a given day
exports.day_detail = function(req, res) {

    if(req.isAuthenticated()) { 

        Day.findById(req.params.id)
            .exec(function(err, found_day) {
                if (!found_day) {
                    var date = new Day({date: Date.now()});
                    date.save();
                }

                var current = new Date(found_day.date);
                var month = current.getMonth();
                var day = current.getDate();
                var year = current.getFullYear();

                var start = new Date(year, month, day);
                start.setHours(0, 0, 0, 0);

                var end = new Date(year, month, day);
                end.setHours(23, 59, 59, 0);

                async.series({
                    tasks: function(callback) {
                        Task.find({'status': 'complete', 'date_completed': {$gte:start, $lte:end}, user: req.user.id})
                        .sort([['date_completed', 'ascending']])
                        .exec(callback);
                    },

                    accomplishments: function(callback) {
                        Accomplishment.find({'date_added': {$gte:start, $lte:end}, user:req.user.id})
                        .exec(callback);
                    },

                    user: function(callback) {
                        User.findById(req.user.id)
                        .exec(callback);
                    }

                }, function (err, results) {
                    
                    res.render('day_detail', {tasks: results.tasks, date: found_day.date_formatted,
                        acc: results.accomplishments, user: results.user, title:"Completed Tasks"})
                })

        });
    }
    else {
        res.redirect('/welcome')
    }
};

// GET: set reminder (mark pending) page 
exports.mark_pending_get = function(req, res) {

    if(req.isAuthenticated()) { 

        var today = getToday(0);
        var year = today[1].getFullYear();
        var month = today[1].getMonth();
        var day = today[1].getDate();
        
        var end = new Date(year, month, day);
        end.setHours(23, 59, 59, 0);
        end = end.getTime()

        var today_formatted = moment(Date.now()).format('YYYY-MM-DD');

        Task.findById(req.params.id) 
            .exec(function (err, found_task) {
                if (found_task) {
                    Task.find({'_id': {$ne: req.params.id}, 
                        'status': {$in: ['incomplete', 'pending']},
                        'user': req.user.id,
                        $or: [{'repeat': false}, {'repeat': true, 'date_added': {$lte:end}}]
                        })
                        .exec(function (err, incomplete_tasks) {
                            var rem = new Date(Date.now());
                            rem.setDate(rem.getDate()+1)
                            var month = rem.getMonth();
                            month = month + 1;
                            var new_month = month < 10 ? '0' + String(month) : String(month);
                            var new_day = rem.getDate() < 10 ? '0' + String(rem.getDate()) : String(rem.getDate());
                            var reminder_date = String(rem.getFullYear()) + '-' + new_month + '-' + new_day;
                            console.log(reminder_date)

                            // var reminder_date = String(rem.getFullYear()) + '-' + new_month + '-' + String(rem.getDate()+1);

                            for (var all_g_iter = 0; all_g_iter < incomplete_tasks.length; all_g_iter++) {
                                for (var task_g_iter = 0; task_g_iter < found_task.dependencies.length; task_g_iter++) {
                                    if (incomplete_tasks[all_g_iter]._id.toString()==found_task.dependencies[task_g_iter].toString()) {
                                        incomplete_tasks[all_g_iter].checked='true';
                                    }
                                }
                            }

                            User.findById(req.user.id) 
                                .exec(function (err, user) {
                                    if (!incomplete_tasks) {
                                        res.render('set_reminder', {task: found_task, reminder_default: reminder_date, 
                                            incomplete: [], user: user, deadline_default:today_formatted, title:"Schedule Reminder"});
                                    }
                                    else {
                                        res.render('set_reminder', {task: found_task, reminder_default: reminder_date, 
                                            incomplete: incomplete_tasks, user: user, title:"Schedule Reminder", deadline_default:today_formatted});
                                    }
                                })

                            
                        })
                }
            })
    }
    else {
        res.redirect('/welcome')
    }
}

// POST: set reminder (mark pending) page 
exports.set_reminder = function(req, res) {

    if(req.isAuthenticated()) { 

        req.checkBody("reminder", "Please enter a reminder date.").notEmpty();
        req.checkBody("reminder_time", "Please enter a reminder date.").notEmpty();
        req.sanitize("reminder").escape().trim();
        req.sanitize("reminder_time").escape().trim();
        req.checkBody('dependency').optional({checkFalsy:true});

        if(!(req.body.dependency instanceof Array)) {
            if(typeof req.body.dependency==='undefined')
                {req.body.dependency = [];}
            else {
                req.body.dependency = new Array(req.body.dependency);
            }
        }

        for (var i = 0; i < req.body.dependency.length-1; i++) {
            if ((req.body.dependency[i]).indexOf(' ') != -1 || req.body.dependency[i].length < 12) {
                var new_task = new Task({
                    task_name: req.body.dependency[i],
                    task_description: '',
                    priority_level: 0,
                    date_added: Date.now(),
                    deadline: Date.now(),
                    status: 'incomplete',
                    user: req.user.id
                });

                new_task.save(function(err) {
                    if(err) {
                        console.log("err")
                    }
                });
                req.body.dependency[i] = new_task.id;
            }
            
        }

        req.body.dependency.pop(-1);

        console.log(req.body.dependency)
        var rem = new Date(req.body.reminder);
        rem.setMinutes(rem.getMinutes() + rem.getTimezoneOffset());

        var pieces = req.body.reminder_time.split(':');
        console.log(pieces);
        if (pieces.length == 2) {
            pieces.push('00');
        }

        if (pieces.length === 3) {      
            rem.setHours(parseInt(pieces[0]));
            rem.setMinutes(pieces[1]);
            rem.setSeconds(pieces[2]);
        }
        

        Task.update(
            {_id: req.params.id},
            {'status': 'pending', 'reminder': Date.parse(rem), 
            'dependencies': req.body.dependency, 'dependency_check': (req.body.dependency.length===0) ? false : true})
            .exec(function(err) {
                res.redirect('/tasks/pending/');
            });
    }
    else {
        res.redirect('/welcome')
    }

}

// POST: add dependency when marking a task as pending 
exports.add_dependency = function(req, res) {
    if(req.isAuthenticated()) {

        req.checkBody('task_name', "Task can't be empty!").notEmpty();
        req.checkBody('deadline', 'By when would you like to complete this task?').notEmpty();
        req.checkBody('priority_level').notEmpty();

        req.sanitize('task_name').escape().trim();
        req.sanitize('deadline').escape().trim();
        req.sanitize('priority_level').escape().trim();

        req.body.task_name = req.body.task_name.replace(new RegExp('&#x27;', 'g'), '\'')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x2F;', 'g'), '/')
        req.body.task_name = req.body.task_name.replace(new RegExp('&#x5C;', 'g'), '\\')
        req.body.task_name = req.body.task_name.replace(new RegExp('&amp;', 'g'), '&')

        var task_status = 'incomplete';

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

        new_task.save();

        Task.update(
            {'_id': req.params.id}, 
            {'dependency_check':true, 'status':'pending', $push: {'dependencies': new_task.id}})
            .exec(function(err) {
                res.redirect('/tasks/task/pending/' + req.params.id);
            })
    }
    else {
        res.redirect("/welcome");
    }
}

// Display overdue tasks page
exports.overdue_get = function(req, res) {

    if(req.isAuthenticated()) { 

        var today = getToday(0)[0];
        var today_formatted = moment(Date.now()).format('YYYY-MM-DD');

        Task.find({'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id})
            .sort([['deadline', 'ascending'], ['priority_level', 'descending']])
            .populate('dependencies')
            .exec(function(err, found_tasks) {
                if (true) {
                    User.find({'user': req.user.id})
                        .exec(function(err, found_user) {
                            res.render('overdue', {tasks: found_tasks, user:found_user, deadline:today_formatted, title:"Overdue Tasks"})
                        })
                }
            })
    }

    else {
        res.redirect('/welcome')
    }
};

exports.overdue_post = function(req, res) {
    if (req.isAuthenticated()) {

        var today = getToday(0)[0];

        req.checkBody("overdue_choice").notEmpty();
        req.checkBody("deadline").notEmpty();

        req.sanitize("overdue_choice").escape().trim();
        req.sanitize("deadline").escape().trim();

        var date = new Date(req.body.deadline);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

        if (req.body.overdue_choice==="remove" || req.body.overdue_choice==="complete") {
            Task.find({'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id})
                .exec(function(err, found_tasks){ 

                    for (var i = 0; i < found_tasks.length; i++) {

                        var found_task = found_tasks[i];

                        if (found_task.repeat === true) {

                            var next_appearance = new Date(Date.now());
                            if (found_task.unit_of_time === "year") {
                                next_appearance.setYear(next_appearance.getFullYear() + 1*found_task.freq);
                            }
                            else if (found_task.unit_of_time==="month") {
                                next_appearance.setMonth(next_appearance.getMonth() + 1*found_task.freq);
                            }
                            else if (found_task.unit_of_time==="day"){
                                next_appearance.setDate(next_appearance.getDate() + 1*found_task.freq);

                            }
                            else if (found_task.unit_of_time==="week") {
                                var next_day = new Date().getDay()+1;
                                var count = 0;                        
                                if (!found_task.repeat_on.includes(next_day)) {
                                    while (!found_task.repeat_on.includes((next_day+count)%7)) {
                                        count++;
                                    }
                                }

                                if (next_day + count < 7) {
                                    next_appearance.setDate(next_appearance.getDate() + count + 1);
                                }
                                else {
                                    next_appearance.setDate(next_appearance.getDate() + 1 + count + 7*(found_task.freq-1));
                                }
                            }

                            next_appearance.setMinutes(next_appearance.getMinutes() + next_appearance.getTimezoneOffset());

                            var new_task = new Task({
                                task_name: found_task.task_name,
                                task_description: found_task.task_description,
                                priority_level: found_task.priority_level,
                                date_added: Date.parse(next_appearance),
                                deadline: Date.parse(next_appearance),
                                status: "incomplete",
                                reminder: Date.now(),
                                dependencies: [],
                                dependency_check: false,
                                repeat: true,
                                freq: found_task.freq,
                                unit_of_time: found_task.unit_of_time,
                                repeat_on: found_task.repeat_on,
                                next_appearance: Date.parse(next_appearance),
                                user: req.user.id

                            })

                            new_task.save(function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }

                    }

                })            

        }

        if (req.body.overdue_choice === "complete") {
            Task.update(
                {'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id},
                {'date_completed': Date.now(), 'status':'complete'},
                {multi: true})
                .exec(function(err) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/');
                })

        }

        else if (req.body.overdue_choice === "today") {
            Task.update(
                {'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id},
                {'status': 'incomplete', 'deadline': Date.now(), 'dependencies': [], 'dependency_check': false},
                {multi:true})
                .exec(function(err) {
                    res.redirect('/');
                })

        }

        else if (req.body.overdue_choice === "new_deadline") {
            Task.update(
                {'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id},
                {'deadline': date},
                {multi:true})
                .exec(function(err) {
                    res.redirect('/');
                })

        }

        else if (req.body.overdue_choice === "remove") {
            Task.remove({'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lt:today},'user': req.user.id})
                .exec(function(err) {
                    res.redirect('/');
                })

        }
    }

    else {
        res.redirect('/welcome')
    }


    
}


exports.search = function(req, res) {
    if (req.isAuthenticated()) {
        var today = getToday(0);
        var year = today[1].getFullYear();
        var month = today[1].getMonth();
        var day = today[1].getDate();

        var end = new Date(year, month, day);
        end.setHours(23, 59, 59, 0);
        end = end.getTime()

        req.checkBody('searchtasks').notEmpty();
        req.sanitize('searchtasks').escape().trim();

        if (req.body.searchtasks === "priority high") {
            Task.find({'user': req.user.id, 'priority_level': {$gte:9}, 'status': {$in: ['incomplete', 'pending']}})
                .sort([['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "priority relatively high") {
            Task.find({'user': req.user.id, 'priority_level': {$gte:6, $lte:8}, 'status': {$in: ['incomplete', 'pending']} })
                .sort([['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "priority medium") {
            Task.find({'user': req.user.id, 'priority_level': {$gte:3, $lte:5}, 'status': {$in: ['incomplete', 'pending']}})
                .sort([['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "priority low") {
            Task.find({'user': req.user.id, 'priority_level': {$lte:2}, 'status': {$in: ['incomplete', 'pending']}})
                .sort([['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "reminder") {
            Task.find({'user': req.user.id, 'status': 'pending'})
                .sort([['reminder', 'ascending'], ['priority_level', 'descending'], ['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "reminder tomorrow" || req.body.searchtasks === "deadline tomorrow" || req.body.searchtasks === "due tomorrow") {
            var tomorrow = getToday(1);
            
            start = tomorrow[0].getTime();
            end = tomorrow[1].getTime()
            
            if (req.body.searchtasks === "reminder tomorrow") {
                Task.find({'user': req.user.id, 'status': 'pending', 'reminder': {$gte:start, $lte:end},'date_added': {$lte:end}})
                    .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                    .exec(function(err, found_tasks) {
                        if (!found_tasks) {
                            found_tasks = [];
                        }
                        User.findById(req.user.id) 
                            .exec(function(err, user) {
                                res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                            })
                        
                        
                    })
            }

            else if (req.body.searchtasks === "deadline tomorrow" || req.body.searchtasks === "due tomorrow") {
                Task.find({'user': req.user.id, 'status': {$in: ['pending', 'incomplete']}, 'deadline': {$gte:start, $lte:end}, 'date_added': {$lte:start}})
                    .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                    .exec(function(err, found_tasks) {
                        if (!found_tasks) {
                            found_tasks = [];
                        }
                        User.findById(req.user.id) 
                            .exec(function(err, user) {
                                res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                            })
                        
                        
                    })
            }
        }

        else if (req.body.searchtasks === "on hold tasks") {
            res.redirect('/tasks/pending')
        }

        else if (req.body.searchtasks === "incomplete tasks") {
            res.redirect('/')
        }


        else if (req.body.searchtasks === "repeated tasks") {
            Task.find({'user': req.user.id, 'repeat': true, 'date_added': {$lte:end}, 'status': {$in: ['incomplete', 'pending']}})
                .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "complete tasks" || req.body.searchtasks === "deadline today" || req.body.searchtasks === "due today" || req.body.searchtasks === "deadline passed" || req.body.searchtasks === "overdue") {
            var today = getToday(0);
            
            start = today[0].getTime();
            end = today[1].getTime()

            if (req.body.searchtasks === "complete tasks") {
                Day.findOne({'user': req.user.id, 'date': {$gte:start, $lte:end}})
                    .exec(function(err, found_day) {
                        res.redirect(found_day.url)
                        
                    })
            }
            else if (req.body.searchtasks === "deadline today" || req.body.searchtasks === "due today") {
                Task.find({'user': req.user.id, 'deadline': {$gte:start, $lte:end}})
                    .sort([['priority_level', 'descending']])
                    .exec(function(err, found_tasks) {
                        if (!found_tasks) {
                            found_tasks = [];
                        }
                        User.findById(req.user.id) 
                            .exec(function(err, user) {
                                res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                            })
                        
                        
                    })
            }

            else if (req.body.searchtasks === "deadline passed" || req.body.searchtasks === "overdue") {
                res.redirect('/tasks/overdue');
            }

            
        }

        else if (req.body.searchtasks === "daily tasks" || req.body.searchtasks === "weekly tasks" || req.body.searchtasks === "monthly tasks" || req.body.searchtasks === "yearly tasks") {
            var repeat = '';
            if (req.body.searchtasks === "daily tasks") {
                repeat = 'day';
            }
            else if (req.body.searchtasks === "weekly tasks") {
                repeat = 'week';
            }
            else if (req.body.searchtasks === "monthly tasks") {
                repeat = 'month';
            }
            else if (req.body.searchtasks === "yearly tasks") {
                repeat = 'year';
            }

            Task.find({'user': req.user.id, 'repeat': true, 'unit_of_time': repeat})
                .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks === "tasks with dependencies") {
            Task.find({'user': req.user.id, 'status': 'pending', 'dependency_check': true, 'dependencies': {$ne: []}})
                .sort([['priority_level', 'descending'], ['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else if (req.body.searchtasks.match(/priority [0-9]/g) != null || req.body.searchtasks === "priority none") {

            var priority = 0
            if (req.body.searchtasks != "priority none") {
                var temp = req.body.searchtasks.split(' ');
                priority = parseInt(temp[1]);
            }
            
            Task.find({'user': req.user.id, 'priority_level': priority, 'status': {$in: ['incomplete', 'pending']} })
                .sort([['deadline', 'ascending']])
                .exec(function(err, found_tasks) {
                    if (!found_tasks) {
                        found_tasks = [];
                    }
                    User.findById(req.user.id) 
                        .exec(function(err, user) {
                            res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                        })
                    
                    
                })
        }

        else {
            User.findById(req.user.id) 
                .exec(function(err, user) {
                    var found_tasks = [];
                    res.render('search_results', {tasks:found_tasks, user:user, title:"Search Results"})
                })
        }
    }
    else {
        res.redirect('/welcome');
    }


}

exports.search_tasks = function(req, res) {
    Task.find({'user': req.user.id, 'status': {$in: ['pending', 'incomplete']}}, {_id:true, task_name: true})
        .exec(function(err, found_tasks) {
            if (!err) {
                var result = buildResultSet(found_tasks);
                res.send(result)
            }
        })

  //   Task.find({'user': req.user.id, 'status': {$in: ['pending', 'complete']}},
  //       function(err, found_tasks){
  //           var tasks = {}
  //           for (var task in tasks) {
  //             var task_name = tasks[task].task_name;
  //             tasks[task_name] = null;
  //           }
  //           res.send(tasks);
  // });
}





// GET: create task 
exports.task_create_get = function(req, res) {
    
    if(req.isAuthenticated()) { 

        var start = getToday(0)[0];
        var month = start.getMonth();

        async.parallel({
            task: function(callback) {
                Task.findById(req.params.id).populate('task')
                    .exec(callback);
            },
            incomplete: function(callback) {
                Task.find({_id: {$ne: req.params.id}, 'status': {$in: ['incomplete', 'pending']}})
                    .exec(callback);
            },

            user: function(callback) {
                User.findById(req.user.id)
                .exec(callback);}

            }, function(err, results) {
                if (err) { console.log("error"); }

                    month = month + 1;
                    var new_month = month < 10 ? '0' + String(month) : String(month);
                    var date = String(start.getFullYear()) + '-' + new_month + '-' + String(start.getDate());
                    var reminder_date = String(start.getFullYear()) + '-' + new_month + '-' + String(start.getDate()+1);
                
                res.render('create_task', {task_name:results.task.task_name, incomplete:results.incomplete, 
                    default_date:date, reminder_default:reminder_date, user:results.user});
            });
    }

    else {
        res.redirect('/welcome');
    }
};

// POST: create task
exports.task_create_post = function(req, res) {

    req.checkBody('task_name', "Task can't be empty!").notEmpty();
    req.checkBody('task_description').optional({checkFalsy: true});
    req.checkBody('deadline', 'By when would you like to complete this task?').notEmpty();
    req.checkBody('priority_level').notEmpty();
    req.checkBody('status').notEmpty();
    req.checkBody('reminder').optional({checkFalsy: true});
    req.checkBody('dependency').optional({checkFalsy: true});
    req.checkBody('repeat_on').optional({checkFalsy: true});
    req.checkBody('freq').optional({checkFalsy: true});
    req.checkBody('unit_of_time').optional({checkFalsy: true});

    req.sanitize('task_name').escape().trim();
    req.sanitize('task_description').escape().trim();
    req.sanitize('deadline').escape().trim();
    req.sanitize('priority_level').escape().trim();
    req.sanitize('status').escape().trim();
    req.sanitize('reminder').escape().trim();
    req.sanitize('freq').escape().trim();
    req.sanitize('unit_of_time').escape().trim();


    // Handle dependencies 
    if(!(req.body.dependency instanceof Array)) {
        if(typeof req.body.dependency==='undefined')
            {req.body.dependency = [];}
        else {
            req.body.dependency = new Array(req.body.dependency);
        }
    }

    if(!(req.body.repeat_on instanceof Array)) {
        if(typeof req.body.repeat_on==='undefined')
            {req.body.repeat_on = [0];}
        else {
            req.body.repeat_on = new Array(req.body.repeat_on);
        }
    }

    var array = [];
    for (var i = 0; i < req.body.repeat_on.length; i++) {
        array.push(parseInt(req.body.repeat_on[i]));
    }

    // Figure out dates for reminder and deadline 
    var dep_check = (req.body.status==="pending" && req.body.dependency.length > 0) ? true : false;
    var deps = req.body.status==="pending" ? req.body.dependency : [];
    var reminder_date = req.body.status==="pending" ? new Date(req.body.reminder) : new Date(Date.now());
    reminder_date.setMinutes(reminder_date.getMinutes() + reminder_date.getTimezoneOffset())
    var dline = new Date(req.body.deadline);
    dline.setMinutes(dline.getMinutes() + dline.getTimezoneOffset())

    // Create new task 
    var new_task = new Task({
        _id: req.params.id,
        task_name: req.body.task_name,
        task_description: req.body.task_description,
        priority_level: req.body.priority_level,
        date_added: Date.now(),
        deadline: Date.parse(dline),
        status: req.body.status==="pending" ? "pending" : "incomplete",
        reminder: Date.parse(reminder_date),
        dependencies: deps,
        dependency_check: dep_check,
        repeat: false,
        freq: 0,
        unit_of_time: 'week',
        repeat_on: [0],
        next_appearance: Date.now(),
        user: req.user.id

    });

    // Handle repeated tasks 
    if (req.body.status === "repeated") {
        var next_appearance = new Date().getDay();
        var count = 0;

        if (!array.includes(next_appearance)) {
            while (!array.includes((next_appearance+count)%7)) {
                count++;
            }
        }

        next_appearance = new Date(Date.now());
        next_appearance.setDate(next_appearance.getDate() + count);
        next_appearance.setMinutes(next_appearance.getMinutes() + next_appearance.getTimezoneOffset());

        new_task = new Task({
            _id: req.params.id,
            task_name: req.body.task_name,
            task_description: req.body.task_description,
            priority_level: req.body.priority_level,
            date_added: Date.parse(next_appearance),
            deadline: Date.parse(next_appearance),
            status: req.body.status==="pending" ? "pending" : "incomplete",
            reminder: Date.parse(reminder_date),
            dependencies: deps,
            dependency_check: dep_check,
            repeat: true,
            freq: req.body.freq,
            unit_of_time: req.body.unit_of_time,
            repeat_on: array,
            next_appearance: Date.parse(next_appearance),
            user: req.user.id

    });
    }

    // Update task 
    Task.findByIdAndUpdate(req.params.id, new_task, {}, function(err) {
        if (err) {console.log("error")}
        res.redirect('/')
    })
    
};


