const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getEmployeeTasks,
  updateTaskStatus,
  deleteTask,
  acceptTask,
  rejectTask
} = require('../controllers/taskController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, isAdmin, createTask);
router.get('/', authenticateToken, isAdmin, getAllTasks);
router.get('/employee/:employee_id', authenticateToken, getEmployeeTasks);
router.put('/:id', authenticateToken, updateTaskStatus);
router.delete('/:id', authenticateToken, isAdmin, deleteTask);
router.post('/:id/accept', authenticateToken, acceptTask);
router.post('/:id/reject', authenticateToken, rejectTask);

module.exports = router;
