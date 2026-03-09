const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const {
  calculateSalaryFromHours,
  getExpectedHoursForMonth,
  getWorkingDaysInMonth,
} = require('../utils/salaryCalculator');

const getTodayDate = () => new Date().toISOString().split('T')[0];

exports.getDailyReport = async (req, res) => {
  try {
    const date = req.query.date || getTodayDate();

    const attendance = await Attendance.find({ date }).sort({ checkInTime: 1 });

    const totalEmployees = await Employee.countDocuments({ role: 'employee' });
    const present = attendance.length;
    const absent = totalEmployees - present;
    const lateEmployees = attendance.filter((a) => a.isLate).length;
    const totalWorkingHours = attendance.reduce((sum, a) => sum + (a.totalWorkingHours || 0), 0);

    res.status(200).json({
      success: true,
      report: {
        date,
        totalEmployees,
        present,
        absent,
        lateEmployees,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        attendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(y, m, 0).toISOString().split('T')[0];

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const byDate = {};
    attendance.forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);
    });

    const dailyStats = Object.entries(byDate).map(([date, records]) => ({
      date,
      present: records.length,
      totalHours: records.reduce((s, r) => s + (r.totalWorkingHours || 0), 0),
      late: records.filter((r) => r.isLate).length,
    }));

    const workingDays = getWorkingDaysInMonth(parseInt(y), parseInt(m));

    res.status(200).json({
      success: true,
      report: {
        month: parseInt(m),
        year: parseInt(y),
        startDate,
        endDate,
        workingDays,
        dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
        totalRecords: attendance.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalaryReport = async (req, res) => {
  try {
    let { month, year, employeeId } = req.query;
    if (req.user.role === 'employee') employeeId = req.user.employeeId;
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(y, m, 0).toISOString().split('T')[0];

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (employeeId) filter.employeeId = employeeId;

    const attendance = await Attendance.find(filter);

    const hoursByEmployee = {};
    attendance.forEach((a) => {
      if (!hoursByEmployee[a.employeeId]) hoursByEmployee[a.employeeId] = 0;
      hoursByEmployee[a.employeeId] += a.totalWorkingHours || 0;
    });

    const empFilter = employeeId ? { employeeId } : {};
    const employees = await Employee.find(empFilter).select('-password');

    const workingDays = getWorkingDaysInMonth(parseInt(y), parseInt(m));
    const expectedHours = getExpectedHoursForMonth(parseInt(y), parseInt(m));

    const salaryReport = await Promise.all(
      employees.map(async (emp) => {
        const totalHours = hoursByEmployee[emp.employeeId] || 0;
        const calculatedSalary = calculateSalaryFromHours(
          totalHours,
          emp.monthlySalary,
          parseInt(y),
          parseInt(m)
        );
        const hourlyRate = emp.monthlySalary / expectedHours;

        return {
          employeeId: emp.employeeId,
          userName: emp.userName,
          email: emp.email,
          monthlySalary: emp.monthlySalary,
          totalWorkingHours: Math.round(totalHours * 100) / 100,
          workingDays,
          expectedHours,
          hourlyRate: Math.round(hourlyRate * 100) / 100,
          calculatedSalary,
        };
      })
    );

    res.status(200).json({
      success: true,
      report: {
        month: parseInt(m),
        year: parseInt(y),
        workingDays,
        expectedHours,
        salaryReport: employeeId ? salaryReport[0] : salaryReport,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
