const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user's current password
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ profile: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { changePassword, getProfile, updateProfile };
