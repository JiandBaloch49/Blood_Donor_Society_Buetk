import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Users, AlertCircle, LogOut, Shield } from 'lucide-react';

const AdminLayout = () => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const navLinks = [
    { name: 'Donors Directory', path: '/admin/donors', icon: Users },
    { name: 'Emergency Requests', path: '/admin/requests', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Permanent Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-xl z-20 hidden md:flex">
        <div className="p-6 border-b border-primary-hover">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 fill-white/20" />
            <h1 className="text-xl font-bold tracking-wide">Dashboard</h1>
          </div>
          <p className="text-xs text-white/70 mt-1 uppercase tracking-wider">Executive Management</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-white text-primary font-semibold shadow-md' : 'text-white/80 hover:bg-primary-hover hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-hover">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/80 hover:bg-primary-hover hover:text-white transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface">
        {/* Mobile Header */}
        <header className="md:hidden bg-primary text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="font-bold">Admin Hub</h1>
          </div>
          <button onClick={handleLogout} className="text-sm">Log Out</button>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-10">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
