import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import LandingPage from './pages/LandingPage';

// Admin Architecture
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import DonorManagement from './pages/admin/DonorManagement';
import RequestManagement from './pages/admin/RequestManagement';
import AdminManagement from './pages/admin/AdminManagement';
import MemberManagement from './pages/admin/MemberManagement';

const RoleGuard = ({ requiredRole, children }) => {
  const role = localStorage.getItem('adminRole');
  if (role !== requiredRole) {
    return <Navigate to="/admin/donors" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
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
             <Route path="members" element={<MemberManagement />} />
             <Route path="requests" element={<RequestManagement />} />
             
             {/* Master Admin Only */}
             <Route path="management" element={
               <RoleGuard requiredRole="MASTER_ADMIN">
                 <AdminManagement />
               </RoleGuard>
             } />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
