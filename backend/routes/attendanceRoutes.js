const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  otCheckIn,
  otCheckOut,
  getTodayAttendance,
  getAllAttendance,
  getEmployeeAttendance
} = require('../controllers/attendanceController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/checkin', authenticateToken, checkIn);
router.post('/checkout', authenticateToken, checkOut);
router.post('/ot-checkin', authenticateToken, otCheckIn);
router.post('/ot-checkout', authenticateToken, otCheckOut);
router.get('/today/:employee_id', authenticateToken, getTodayAttendance);
router.get('/', authenticateToken, isAdmin, getAllAttendance);
router.get('/employee/:employee_id', authenticateToken, getEmployeeAttendance);

module.exports = router;
