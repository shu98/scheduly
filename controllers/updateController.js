var Task = require('../models/task');
var Day = require('../models/day');
var User = require('../models/user');
var async = require('async');

// Complete an incomplete task 
exports.complete_task = function(req, res) {

    if(req.isAuthenticated()) { 

        Task.findById(req.params.id)
            .exec(function(err, found_task) {

                var task_status = found_task.status; 
                var reminder_date = found_task.reminder;

                if (found_task) {
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

                Task.update(
                    {_id: req.params.id},
                    {'status': 'complete', 'date_completed': Date.now()})
                    .exec(function(err) {
                        Task.update(
                            {'dependencies': { $elemMatch: { $eq: req.params.id } }},
                            {$pullAll: {dependencies: [req.params.id]}},
                            {multi: true})
                            .exec(function(err) {
                                if (task_status==="pending" && reminder_date > Date.now()) {
                                    res.redirect('/tasks/pending');
                                }
                                else {
                                    res.redirect('/');
                                }
                                

                            })
                    });
            });
                
     }

     else {
        res.redirect('/welcome')
     }           
    

};

// Complete a pending task 
exports.complete_overdue_task = function (req, res) {

    if(req.isAuthenticated()) { 
 
        Task.findById(req.params.id)
            .exec(function(err, found_task) {

                if (found_task) {
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

                        new_task = new Task({
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

                        new_task.save()
                    }


                }

                Task.update(
                    {_id: req.params.id},
                    {'status': 'complete', 'date_completed': Date.now()})
                    .exec(function(err) {
                        Task.update(
                            {'dependencies': { $elemMatch: { $eq: req.params.id } }},
                            {$pullAll: {dependencies: [req.params.id]}},
                            {multi:true})
                            .exec(function(err) {
                                res.redirect('/tasks/overdue/')
                            
                            })
                    });
            });
                
    }

    else {
        res.redirect('/welcome');
    }           
    

};



// Mark a task as pending
exports.pending_task = function(req, res) {

    res.redirect('/tasks/task/pending/' + req.params.id);

  
};

// Remove an incomplete task
exports.remove_task = function(req, res) {

    if(req.isAuthenticated()) { 

        if (req.body.choice) {
            req.checkBody("choice").notEmpty();
            req.sanitize("choice").escape().trim();

            if (req.body.choice === "one") {

                Task.findById(req.params.id)
                .exec(function(err, found_task) {

                    if (found_task) {
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

                            new_task = new Task({
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

                            new_task.save()
                        }


                    }
                });



            }


    }

    Task.findByIdAndRemove(req.params.id)
        .exec(function(err) {
            if (err) {console.log("error")}
            Task.update(
                {'dependencies': { $elemMatch: { $eq: req.params.id } }},
                {$pullAll: {dependencies: [req.params.id]}},
                {multi:true})
                .exec(function(err) {
                    if (err) {
                        console.log("error")
                    }
                    res.redirect('/')

                })
        });

    }

    else {
        res.redirect('/welcome')
    }
};

// Remove a pending task 
exports.remove_pending_task = function(req, res) {

    if(req.isAuthenticated()) { 

        if (req.body.choice) {
            req.checkBody("choice").notEmpty();
            req.sanitize("choice").escape().trim();

            if (req.body.choice === "one") {

                Task.findById(req.params.id)
                .exec(function(err, found_task) {

                    if (found_task) {
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

                            new_task = new Task({
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

                            new_task.save()
                        }


                    }
                });



            }


    }

    Task.findByIdAndRemove(req.params.id)
        .exec(function(err) {
            if (err) {console.log("error")}
            Task.update(
                {'dependencies': { $elemMatch: { $eq: req.params.id } }},
                {$pullAll: {dependencies: [req.params.id]}},
                {multi:true})
                .exec(function(err) {
                    if (err) {
                        console.log("error");
                    }
                    res.redirect('/tasks/pending/')
                })
        });

    }

    else {
        res.redirect('/welcome')
    }
};

exports.remove_overdue_task = function(req, res) {
    if(req.isAuthenticated()) { 

        if (req.body.choice) {
            req.checkBody("choice").notEmpty();
            req.sanitize("choice").escape().trim();

            if (req.body.choice === "one") {

                Task.findById(req.params.id)
                .exec(function(err, found_task) {

                    if (found_task) {
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

                            new_task = new Task({
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

                            new_task.save()
                        }


                    }
                });



            }


    }

    Task.findByIdAndRemove(req.params.id)
        .exec(function(err) {
            if (err) {console.log("error")}
            Task.update(
                {'dependencies': { $elemMatch: { $eq: req.params.id } }},
                {$pullAll: {dependencies: [req.params.id]}},
                {multi:true})
                .exec(function(err) {
                    if (err) {
                        console.log("error");
                    }
                    res.redirect('/tasks/overdue/')
                })
        });

    }

    else {
        res.redirect('/welcome')
    }
};

// Mark a pending task, whose reminder is today, as incomplete
exports.incomplete_task = function(req, res) {

    if(req.isAuthenticated()) { 

        Task.update(
            {_id: req.params.id},
            {'status': 'incomplete', 'dependencies': [], 'dependency_check': false})
            .exec(function(err) {
                res.redirect('/');
            });
    }

    else {
        res.redirect('/welcome')
    }

};

// Mark a pending task as incomplete 
exports.incomplete_pending_task = function(req, res) {

    if(req.isAuthenticated()) { 
        Task.update(
            {_id: req.params.id},
            {'status': 'incomplete', 'dependencies': [], 'dependency_check': false})
            .exec(function(err) {
                res.redirect('/tasks/pending/');
            });
    }
    else {
        res.redirect('/welcome')
    }

};

// Edit a task 
exports.edit_task = function(req, res) {
    res.redirect('/tasks/task/edit/' + req.params.id);

};

exports.remove_dep_get = function(req, res) {
    if(req.isAuthenticated()) {
        Task.findById({'_id': req.params.iddep})
            .exec(function(err, found_dep) {
                Task.findById({'_id': req.params.idtask}) 
                    .exec(function(err, found_task) {
                        User.findById(req.user.id)
                            .exec(function(err, found_user) {
                                if (found_dep) {
                                    res.render('remove_dep', {task:found_dep, maintask:found_task, user:found_user,title:"Remove Dependency"})
                                }
                        })
                    })
            })
    }
    else {
        res.redirect('/welcome');
    }
}

// POST: remove dependency 
exports.remove_dep_post = function(req, res) {

    if(req.isAuthenticated()) { 

        Task.update(
            {'_id': req.params.idtask},
            {$pullAll: {dependencies: [req.params.iddep]}})
            .exec(function(err) {
                res.redirect('/tasks/pending');
                    })
    }
    else {
        res.redirect('/welcome')
    }

}

exports.remove_dep = function(req, res) {
    res.redirect('/update/remove/confirm/' + req.params.idtask + '/' + req.params.iddep)
}

exports.reminder_tomorrow = function(req, res) {

    if(req.isAuthenticated()) { 

        date = new Date(Date.now());
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        date.setDate(date.getDate() + 1);
        date.setHours(4, 0, 0);

        Task.findById(req.params.id)
            .exec(function(err, found_task) {
                dep_check = false
                if (found_task) {
                    if (found_task.dependencies.length > 0) {
                        dep_check = true;
                    }
                }

                Task.update(
                    {'_id': req.params.id},
                    {'reminder': Date.parse(date), 'dependency_check': dep_check})
                    .exec(function(err) {
                        if (err) {console.log('error')}
                        res.redirect('/'); 
                        })
            })
    }
    else {
        res.redirect('/welcome')
    }

}

exports.deadline_today = function(req, res) {

    if(req.isAuthenticated()) { 

        var today = new Date(Date.now());
        var month = today.getMonth();
        var day = today.getDate();
        var year = today.getFullYear();

        var today = new Date(year, month, day);
        today.setHours(0, 0, 0, 0);
        today = Date.parse(today);

        Task.update(
            {'_id': req.params.id},
            {'status': 'incomplete', 'deadline': Date.now(), 'dependencies': [], 'dependency_check': false})
            .exec(function(err) {
                if (err) {console.log('error')}

                Task.findOne({'status': {$in: ['incomplete', 'pending']}, 'deadline': {$lte:today},'user': req.user.id})
                .exec(function(err, found_task) {
                    if (found_task){
                        res.redirect('/tasks/overdue');
                    }
                    else {
                        res.redirect('/');
                    }
                })
            })
    }

    else {
        res.redirect('/welcome')
    }
}

            





