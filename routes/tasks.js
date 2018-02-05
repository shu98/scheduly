var express = require('express');
var router = express.Router();

var task_controller = require('../controllers/taskController');

// Create tasks
router.get('/task/create/:id', task_controller.task_create_get);
router.post('/task/create/:id', task_controller.task_create_post);

// Edit tasks
router.get('/task/edit/:id', task_controller.task_edit_get);
router.post('/task/edit/:id', task_controller.task_edit_post);

// Render pending tasks and archive pages 
router.get('/pending', task_controller.pending);
router.get('/archive', task_controller.archive);

// Render day detail pages 
router.get('/archive/day/:id', task_controller.day_detail);

// Mark as pending
router.get('/task/pending/:id', task_controller.mark_pending_get);
router.post('/task/reminder/:id', task_controller.set_reminder);

// Add dependency 
router.post('/dependency/:id', task_controller.add_dependency);

// Search
router.post('/search', task_controller.search);
// router.post('/search/tasks', task_controller.search_tasks);
// router.get('/searchresults', task_controller.)

// Overdue 
router.get('/overdue', task_controller.overdue_get);
router.post('/overdue', task_controller.overdue_post);

module.exports = router;