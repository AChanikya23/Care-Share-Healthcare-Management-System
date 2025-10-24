const { supabase } = require('../config/supabase');

// Generate payroll for an employee
const generatePayroll = async (req, res) => {
  try {
    const { employee_id, month, year } = req.body;

    // Get employee details
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*, users(name, email)')
      .eq('id', employee_id)
      .single();

    if (empError) throw empError;

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get attendance records for the month
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (attError) throw attError;

    // Calculate total regular and OT hours
    let totalRegularHours = 0;
    let totalOTHours = 0;

    attendance.forEach(att => {
      if (att.check_in && att.check_out) {
        const checkIn = new Date(att.check_in);
        const checkOut = new Date(att.check_out);
        totalRegularHours += (checkOut - checkIn) / (1000 * 60 * 60);
      }
      
      if (att.ot_check_in && att.ot_check_out) {
        const otIn = new Date(att.ot_check_in);
        const otOut = new Date(att.ot_check_out);
        totalOTHours += (otOut - otIn) / (1000 * 60 * 60);
      }
    });

    // Get completed tasks and their allowances
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('allowances')
      .eq('assigned_to', employee_id)
      .eq('status', 'completed');

    if (taskError) throw taskError;

    const taskAllowances = tasks.reduce((sum, task) => {
      return sum + parseFloat(task.allowances || 0);
    }, 0);

    // Calculate salary components
    const basicSalary = parseFloat(employee.salary);
    const otRate = (basicSalary / 160) * 1.5; // 1.5x hourly rate for OT (assuming 160 work hours/month)
    const otPay = totalOTHours * otRate;
    const totalAllowances = taskAllowances; // Can add other allowances here
    const grossSalary = basicSalary + otPay + totalAllowances;
    
    // Standard deductions (can be customized)
    const deductions = grossSalary * 0.1; // 10% deduction (tax, PF, etc.)
    const netSalary = grossSalary - deductions;

    // Check if payroll already exists
    const { data: existing } = await supabase
      .from('payroll')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('month', month)
      .eq('year', year)
      .single();

    let result;
    if (existing) {
      // Update existing payroll
      const { data, error } = await supabase
        .from('payroll')
        .update({
          basic_salary: basicSalary,
          regular_hours: totalRegularHours.toFixed(2),
          ot_hours: totalOTHours.toFixed(2),
          ot_rate: otRate.toFixed(2),
          ot_pay: otPay.toFixed(2),
          task_allowances: taskAllowances.toFixed(2),
          total_allowances: totalAllowances.toFixed(2),
          gross_salary: grossSalary.toFixed(2),
          allowances: totalAllowances.toFixed(2),
          deductions: deductions.toFixed(2),
          net_salary: netSalary.toFixed(2),
          payment_date: new Date().toISOString().split('T')[0],
          status: 'generated'
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new payroll
      const { data, error } = await supabase
        .from('payroll')
        .insert([{
          employee_id,
          basic_salary: basicSalary,
          regular_hours: totalRegularHours.toFixed(2),
          ot_hours: totalOTHours.toFixed(2),
          ot_rate: otRate.toFixed(2),
          ot_pay: otPay.toFixed(2),
          task_allowances: taskAllowances.toFixed(2),
          total_allowances: totalAllowances.toFixed(2),
          gross_salary: grossSalary.toFixed(2),
          allowances: totalAllowances.toFixed(2),
          deductions: deductions.toFixed(2),
          net_salary: netSalary.toFixed(2),
          month,
          year,
          payment_date: new Date().toISOString().split('T')[0],
          status: 'generated'
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(201).json({ 
      message: 'Payroll generated successfully',
      payroll: result,
      summary: {
        employeeName: employee.users.name,
        month,
        year,
        regularHours: totalRegularHours.toFixed(2),
        otHours: totalOTHours.toFixed(2),
        taskAllowances: taskAllowances.toFixed(2),
        netSalary: netSalary.toFixed(2)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all payroll records (Admin)
const getAllPayroll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payroll')
      .select('*, employees(*, users(name, email))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ payslips: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payroll for specific employee
const getEmployeePayroll = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employee_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    res.json({ payslips: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single payslip details
const getPayslipDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('payroll')
      .select('*, employees(*, users(name, email))')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ payslip: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payroll status (approve/paid)
const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('payroll')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Payroll status updated', payroll: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete payroll
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('payroll')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  generatePayroll,
  getAllPayroll,
  getEmployeePayroll,
  getPayslipDetails,
  updatePayrollStatus,
  deletePayroll
};
