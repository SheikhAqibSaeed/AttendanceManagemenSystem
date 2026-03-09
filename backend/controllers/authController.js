const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ams-secret-key', {
    expiresIn: '30d',
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(employee._id);
    const user = await Employee.findById(employee._id).select('-password');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { employeeId, userName, email, phone, monthlySalary, role, password } = req.body;

    const exists = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Employee with this email or ID already exists' });
    }

    const employee = await Employee.create({
      employeeId: employeeId?.toUpperCase() || `EMP${Date.now().toString().slice(-6)}`,
      userName,
      email,
      phone,
      monthlySalary: monthlySalary || 0,
      role: role || 'employee',
      password,
    });

    const token = generateToken(employee._id);
    const user = await Employee.findById(employee._id).select('-password');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await Employee.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
