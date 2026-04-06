import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Tracking from './pages/Tracking';
import Dashboard from './pages/Dashboard';
import DriverApp from './pages/DriverApp';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<Tracking />} />
            <Route path="/track/:id" element={<Tracking />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Add any strictly protected routes here if needed */}
            </Route>

            {/* Role Specific Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
              <Route path="/driver" element={<DriverApp />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
