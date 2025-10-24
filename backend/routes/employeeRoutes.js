const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.post('/', authenticateToken, isAdmin, createEmployee);
router.put('/:id', authenticateToken, isAdmin, updateEmployee);
router.delete('/:id', authenticateToken, isAdmin, deleteEmployee);

module.exports = router;
