require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// CORS Configuration - Updated for Production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://care-share-healthcare-management-system.vercel.app',
    'https://care-share-backend.onrender.com'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Care & Share Healthcare API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
