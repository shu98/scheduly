var express = require('express');
var router = express.Router();

var update_controller = require('../controllers/updateController');

// Complete an incomplete or pending task 
router.post('/complete/:id', update_controller.complete_task);
// router.post('/complete_pending/:id', update_controller.complete_pending_task);

// Mark a task as pending 
router.post('/pending/:id', update_controller.pending_task);

// Remove an incomplete or pending task 
router.post('/remove/:id', update_controller.remove_task);
router.post('/remove/pending/:id', update_controller.remove_pending_task);

// Mark a pending task as incomplete 
router.post('/incomplete/:id', update_controller.incomplete_task);

// Edit a task 
router.post('/edit/:id', update_controller.edit_task);

// Mark a pending task, whose reminder is today, as incomplete
router.post('/incomplete_pending/:id', update_controller.incomplete_pending_task);

// Remove one dependency
router.post('/remove/:idtask/:iddep', update_controller.remove_dep);
router.get('/remove/confirm/:idtask/:iddep', update_controller.remove_dep_get);
router.post('/remove/confirm/:idtask/:iddep', update_controller.remove_dep_post);

// Reminder tomorrow
router.post('/tomorrow/:id', update_controller.reminder_tomorrow);

// Deadline today
router.post('/today/:id', update_controller.deadline_today);

// Overdue tasks
router.post('/complete_overdue/:id', update_controller.complete_overdue_task);
router.post('/remove_overdue/:id', update_controller.remove_overdue_task);


module.exports = router;


