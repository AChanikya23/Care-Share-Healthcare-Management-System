const { supabase } = require('../config/supabase');

// Create task (Admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, priority, due_date, allowances } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          assigned_to,
          priority: priority || 'medium',
          due_date,
          allowances: allowances || 0,
          status: 'pending'
        }
      ])
      .select('*, employees(*, users(name, email))')
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Task created successfully', task: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tasks (Admin)
const getAllTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, employees(*, users(name, email))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ tasks: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tasks for specific employee
const getEmployeeTasks = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', employee_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ tasks: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task status (Employee can update)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Task updated successfully', task: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete task (Admin only)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Accept task (Employee)
const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'in_progress', progress: 0 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Task accepted successfully', task: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reject task (Employee)
const rejectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Task rejected', task: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getEmployeeTasks,
  updateTaskStatus,
  deleteTask,
  acceptTask,
  rejectTask
};
