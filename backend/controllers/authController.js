const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', req.body.email);
    console.log('Password received:', req.body.password);
    
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    console.log('User found:', user ? 'Yes' : 'No');

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Stored password:', user.password);
    
    // TEMPORARY: Direct password comparison for testing
    const isValidPassword = (password === user.password) || await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { login };
