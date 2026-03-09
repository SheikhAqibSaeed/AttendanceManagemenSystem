const STANDARD_CHECK_IN = '09:00';
const OVERTIME_THRESHOLD = 8;

const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const parseMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateWorkingHours = (checkIn, checkOut) => {
  const inMins = parseTimeToMinutes(checkIn);
  const outMins = parseTimeToMinutes(checkOut);
  const totalMins = outMins - inMins;
  return Math.round((totalMins / 60) * 100) / 100;
};

const isLate = (checkInTime) => {
  const checkInMins = parseTimeToMinutes(checkInTime);
  const standardMins = parseTimeToMinutes(STANDARD_CHECK_IN);
  return checkInMins > standardMins;
};

const getLateMinutes = (checkInTime) => {
  if (!isLate(checkInTime)) return 0;
  const checkInMins = parseTimeToMinutes(checkInTime);
  const standardMins = parseTimeToMinutes(STANDARD_CHECK_IN);
  return checkInMins - standardMins;
};

const getOvertimeHours = (totalWorkingHours) => {
  return Math.max(0, Math.round((totalWorkingHours - OVERTIME_THRESHOLD) * 100) / 100);
};

module.exports = {
  calculateWorkingHours,
  isLate,
  getLateMinutes,
  getOvertimeHours,
  STANDARD_CHECK_IN,
  OVERTIME_THRESHOLD,
};
