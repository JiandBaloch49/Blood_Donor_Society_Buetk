import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Users, AlertCircle, LogOut, Shield, Menu, X, ShieldCheck, UserCheck } from 'lucide-react';

const AdminLayout = () => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const navLinks = [
    { name: 'Donors Directory', path: '/admin/donors', icon: Users },
    { name: 'Society Members', path: '/admin/members', icon: UserCheck },
    { name: 'Emergency Requests', path: '/admin/requests', icon: AlertCircle },
  ];

  if (localStorage.getItem('adminRole') === 'MASTER_ADMIN') {
    navLinks.push({ name: 'Admin Management', path: '/admin/management', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-primary text-white shadow-md z-20 sticky top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 fill-white/20" />
              <div className="flex flex-col justify-center">
                <span className="text-lg sm:text-xl font-bold tracking-wide leading-none pt-1">Dashboard</span>
                <span className="text-[0.65rem] sm:text-xs text-white/70 uppercase tracking-wider mt-1">Executive Management</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex space-x-2 mr-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.includes(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="h-8 w-px bg-white/20 mx-2"></div>

              {/* Desktop Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors ml-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-primary/95 shadow-inner backdrop-blur-sm border-t border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.includes(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-primary shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="h-px w-full bg-white/10 my-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white text-left transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col bg-surface overflow-auto">
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
