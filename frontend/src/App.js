import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Employees from './components/admin/Employees';
import Attendance from './components/admin/Attendance';
import Tasks from './components/admin/Tasks';
import Payroll from './components/admin/Payroll';
import EmployeeProfile from './components/EmployeeProfile';
import MyAttendance from './components/user/MyAttendance';
import MyTasks from './components/user/MyTasks';
import MyPayslips from './components/user/MyPayslips';
import Profile from './components/user/Profile';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/employees"
            element={
              <PrivateRoute adminOnly>
                <Employees />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/attendance"
            element={
              <PrivateRoute adminOnly>
                <Attendance />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/tasks"
            element={
              <PrivateRoute adminOnly>
                <Tasks />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/payroll"
            element={
              <PrivateRoute adminOnly>
                <Payroll />
              </PrivateRoute>
            }
          />
          
          {/* Employee Profile (Admin & User can view) */}
          <Route
            path="/employee/:employeeId"
            element={
              <PrivateRoute>
                <EmployeeProfile />
              </PrivateRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/my-attendance"
            element={
              <PrivateRoute>
                <MyAttendance />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/my-tasks"
            element={
              <PrivateRoute>
                <MyTasks />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/my-payslips"
            element={
              <PrivateRoute>
                <MyPayslips />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Catch all unknown routes and redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
