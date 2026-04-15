import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';

// Admin Architecture
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import DonorManagement from './pages/admin/DonorManagement';
import RequestManagement from './pages/admin/RequestManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard Layout */}
        <Route path="/admin" element={<AdminLayout />}>
           {/* Default redirect to donors */}
           <Route index element={<Navigate to="/admin/donors" replace />} />
           <Route path="donors" element={<DonorManagement />} />
           <Route path="requests" element={<RequestManagement />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
