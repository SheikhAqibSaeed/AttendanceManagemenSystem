const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const {
  calculateWorkingHours,
  isLate,
  getLateMinutes,
  getOvertimeHours,
} = require('../utils/attendanceUtils');

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getTimeNow = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.role === 'admin' ? req.body.employeeId || req.user.employeeId : req.user.employeeId;
    const date = req.body.date || getTodayDate();
    const checkInTime = req.body.checkInTime || getTimeNow();

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in for this date' });
    }

    const late = isLate(checkInTime);
    const lateMinutes = getLateMinutes(checkInTime);
    const status = late ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      employeeId,
      date,
      checkInTime,
      status,
      isLate: late,
      lateMinutes,
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.role === 'admin' ? req.body.employeeId || req.user.employeeId : req.user.employeeId;
    const date = req.body.date || getTodayDate();
    const checkOutTime = req.body.checkOutTime || getTimeNow();

    const attendance = await Attendance.findOne({ employeeId, date });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in found for this date' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out for this date' });
    }

    const totalWorkingHours = calculateWorkingHours(attendance.checkInTime, checkOutTime);
    const overtimeHours = getOvertimeHours(totalWorkingHours);

    attendance.checkOutTime = checkOutTime;
    attendance.totalWorkingHours = totalWorkingHours;
    attendance.overtimeHours = overtimeHours;
    await attendance.save();

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let filter = {};
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, checkInTime: -1 });

    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, month, year } = req.query;

    const filter = { employeeId };

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0);
      filter.date = { $gte: start, $lte: end.toISOString().split('T')[0] };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
