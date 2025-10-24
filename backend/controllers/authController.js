const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', req.body.email);
    console.log('Password length:', req.body.password?.length);
    
    const { email, password } = req.body;

    // Query employees table
    console.log('Querying database...');
    const { data: user, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Database response:', { user: user ? 'Found' : 'Not found', error });

    if (error || !user) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', { email: user.email, role: user.role });
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    
    // Compare password
    console.log('Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Password comparison failed');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful!');
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
