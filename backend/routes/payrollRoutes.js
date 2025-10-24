const express = require('express');
const router = express.Router();
const {
  generatePayroll,
  getAllPayroll,
  getEmployeePayroll,
  getPayslipDetails,
  updatePayrollStatus,
  deletePayroll
} = require('../controllers/payrollController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/generate', authenticateToken, isAdmin, generatePayroll);
router.get('/', authenticateToken, isAdmin, getAllPayroll);
router.get('/employee/:employee_id', authenticateToken, getEmployeePayroll);
router.get('/:id', authenticateToken, getPayslipDetails);
router.put('/:id/status', authenticateToken, isAdmin, updatePayrollStatus);
router.delete('/:id', authenticateToken, isAdmin, deletePayroll);

module.exports = router;
