const express = require('express');
const router = express.Router();
const { getDailyReport, getMonthlyReport, getSalaryReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/salary', getSalaryReport);

module.exports = router;
