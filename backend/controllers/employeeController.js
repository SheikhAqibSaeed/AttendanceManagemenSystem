const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
  try {
    const { employeeId, userName, email, phone, monthlySalary, role, password } = req.body;

    const exists = await Employee.findOne({ $or: [{ email }, { employeeId: employeeId?.toUpperCase() }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Employee with this email or ID already exists' });
    }

    const empId = employeeId?.toUpperCase() || `EMP${Date.now().toString().slice(-6)}`;

    const employee = await Employee.create({
      employeeId: empId,
      userName,
      email,
      phone,
      monthlySalary: monthlySalary || 0,
      role: role || 'employee',
      password: password || 'changeme123',
    });

    const user = await Employee.findById(employee._id).select('-password');
    res.status(201).json({ success: true, employee: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { userName, email, phone, monthlySalary, role, password } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (userName) employee.userName = userName;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (monthlySalary !== undefined) employee.monthlySalary = monthlySalary;
    if (role) employee.role = role;
    if (password) employee.password = password;

    await employee.save();

    const updated = await Employee.findById(employee._id).select('-password');
    res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
