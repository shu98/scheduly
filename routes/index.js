var express = require('express');
var router = express.Router();

var index_controller = require('../controllers/indexController');

router.get('/', index_controller.index_get);
// router.get('/?sortby=.*', index_controller.index_get);
router.post('/newtask', index_controller.index_task_post);
router.post('/newacc/:id', index_controller.index_acc_post);
router.get('/welcome', index_controller.welcome)

module.exports = router;
