import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/login';
import Layout from './components/Layout';
import Button from '@mui/material/Button';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import EmployeesDashboard from './pages/EmployeesDashboard';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200">
      <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">Welcome to the Employee Tracker 🎉</h1>
        <p className="text-gray-600 text-lg mb-4 text-center max-w-md">
          Track your work, manage tasks, and boost productivity. Employees can check in, log work, and submit progress. Admins can manage employees, assign tasks, and view detailed logs.
        </p>
        <div className="flex space-x-4">
          <Button component={Link} to="/login" variant="contained" color="primary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Login
          </Button>
          <Button component={Link} to="/signup" variant="outlined" color="primary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/dashboard" element={<EmployeesDashboard />} />
      </Routes>
      </Layout>
    </Router>
  );
}
