const supabase = require('../config/supabase');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'employee');

    if (error) throw error;
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { email, password, name, department, position, salary, joinDate } = req.body;

    console.log('=== CREATE EMPLOYEE ===');
    console.log('Data:', { email, name, department, position, salary, joinDate });

    const { data: employee, error } = await supabase
      .from('employees')
      .insert([{
        email,
        password,
        name,
        role: 'employee',
        department,
        position,
        salary: parseFloat(salary),
        join_date: joinDate
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Employee created:', employee.email);
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: employee, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
