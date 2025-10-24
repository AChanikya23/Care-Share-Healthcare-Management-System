const { supabase } = require('../config/supabase');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ employees: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('employees')
      .select('*, users(name, email)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ employee: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create employee
const createEmployee = async (req, res) => {
  try {
    const { user_id, department, position, salary, join_date } = req.body;

    const { data, error } = await supabase
      .from('employees')
      .insert([{ user_id, department, position, salary, join_date }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Employee created', employee: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Employee updated', employee: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
