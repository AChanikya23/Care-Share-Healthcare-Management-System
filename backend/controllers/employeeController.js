const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, position, phone, address } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        name, 
        email, 
        password: hashedPassword,
        role: 'employee',
        department: department || null,
        position: position || null,
        phone: phone || null,
        address: address || null
      }])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json({ 
      success: true,
      message: 'Employee created successfully',
      employee: data 
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'employee')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('role', 'employee')
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'employee');

    if (error) throw error;
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
