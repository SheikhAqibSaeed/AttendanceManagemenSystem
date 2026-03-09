const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendance,
  getAttendanceByEmployee,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, authorize('admin'), getAttendance);
router.get('/:employeeId', protect, getAttendanceByEmployee);

module.exports = router;
