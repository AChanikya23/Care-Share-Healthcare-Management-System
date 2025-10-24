const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, position, phone, address } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('employees')
      .insert([{ 
        name, 
        email, 
        password: hashedPassword,
        role: 'employee',
        department,
        position,
        phone,
        address
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
