const { supabase } = require('../config/supabase');

// Regular Check-in
const checkIn = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single();

    if (existing && existing.check_in) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert([
        {
          employee_id,
          date: today,
          check_in: now,
          status: 'present'
        }
      ], { onConflict: 'employee_id,date' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Checked in successfully', attendance: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Regular Check-out
const checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: now })
      .eq('employee_id', employee_id)
      .eq('date', today)
      .select()
      .single();

    if (error) throw error;
    
    // Calculate regular hours
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(now);
    const hours = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);

    res.json({ 
      message: 'Checked out successfully', 
      attendance: data,
      regularHours: hours
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// OT Check-in
const otCheckIn = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if regular check-out is done
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single();

    if (!attendance || !attendance.check_out) {
      return res.status(400).json({ error: 'Please complete regular check-out first' });
    }

    if (attendance.ot_check_in) {
      return res.status(400).json({ error: 'Already checked in for OT today' });
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({ ot_check_in: now })
      .eq('employee_id', employee_id)
      .eq('date', today)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'OT check-in successful', attendance: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// OT Check-out
const otCheckOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({ ot_check_out: now })
      .eq('employee_id', employee_id)
      .eq('date', today)
      .select()
      .single();

    if (error) throw error;

    // Calculate OT hours
    const otCheckIn = new Date(data.ot_check_in);
    const otCheckOut = new Date(now);
    const otHours = ((otCheckOut - otCheckIn) / (1000 * 60 * 60)).toFixed(2);

    res.json({ 
      message: 'OT check-out successful', 
      attendance: data,
      otHours: otHours
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get today's attendance for employee
const getTodayAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Calculate hours if data exists
    let regularHours = 0;
    let otHours = 0;

    if (data) {
      if (data.check_in && data.check_out) {
        const checkIn = new Date(data.check_in);
        const checkOut = new Date(data.check_out);
        regularHours = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);
      }

      if (data.ot_check_in && data.ot_check_out) {
        const otCheckIn = new Date(data.ot_check_in);
        const otCheckOut = new Date(data.ot_check_out);
        otHours = ((otCheckOut - otCheckIn) / (1000 * 60 * 60)).toFixed(2);
      }
    }

    res.json({ 
      attendance: data || null,
      regularHours: parseFloat(regularHours),
      otHours: parseFloat(otHours)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employees(*, users(name, email))')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ attendance: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee attendance
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ attendance: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  checkIn, 
  checkOut, 
  otCheckIn,
  otCheckOut,
  getTodayAttendance,
  getAllAttendance, 
  getEmployeeAttendance 
};
