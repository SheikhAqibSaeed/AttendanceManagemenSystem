const STANDARD_HOURS_PER_DAY = 8;

/**
 * Get number of working days in a month (Monday–Friday only; excludes Saturday and Sunday).
 * @param {number} year - Full year (e.g. 2026)
 * @param {number} month - Month 1–12
 */
const getWorkingDaysInMonth = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
};

/**
 * Get expected working hours for a month (working days × 8), excluding weekends.
 */
const getExpectedHoursForMonth = (year, month) => {
  const workingDays = getWorkingDaysInMonth(year, month);
  return workingDays * STANDARD_HOURS_PER_DAY;
};

const calculateHourlyRate = (monthlySalary, year, month) => {
  const expectedHours = getExpectedHoursForMonth(year, month);
  return monthlySalary / expectedHours;
};

/**
 * Calculate salary from total hours worked. Uses working days (Mon–Fri) for the given month.
 */
const calculateSalaryFromHours = (totalHours, monthlySalary, year, month) => {
  const hourlyRate = calculateHourlyRate(monthlySalary, year, month);
  return Math.round(totalHours * hourlyRate * 100) / 100;
};

module.exports = {
  getWorkingDaysInMonth,
  getExpectedHoursForMonth,
  calculateHourlyRate,
  calculateSalaryFromHours,
  STANDARD_HOURS_PER_DAY,
};
