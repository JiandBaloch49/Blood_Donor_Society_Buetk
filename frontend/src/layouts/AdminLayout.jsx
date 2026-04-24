import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, AlertCircle, LogOut, Shield, Menu, X, ShieldCheck, UserCheck, ClipboardList, Heart } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../api';
import logo from '../components/image.png';
import buetk from '../components/buetk.png';

const AdminLayout = () => {
  const role = localStorage.getItem('adminRole');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication check — cookies are handled by browser/backend
  if (!role) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await fetchWithRetry(`${API_BASE}/api/admin/logout`, { method: 'POST' }, 0);
      localStorage.removeItem('adminRole');
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
      // Fallback: clear role and redirect anyway
      localStorage.removeItem('adminRole');
      navigate('/admin/login');
    }
  };

  const navLinks = [
    { name: 'Donors', path: '/admin/donors', icon: Users },
    { name: 'Members', path: '/admin/members', icon: UserCheck },
    { name: 'Cases', path: '/admin/cases', icon: ClipboardList },
    { name: 'Chronic', path: '/admin/chronic', icon: Heart },
    { name: 'Requests', path: '/admin/requests', icon: AlertCircle },
  ];

  if (role === 'MASTER_ADMIN') {
    navLinks.push({ name: 'Admins', path: '/admin/management', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-primary text-white shadow-md z-20 sticky top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            <Link to="/admin/donors" className="flex items-center gap-2 md:gap-3 group focus:outline-none">
              <div className="flex gap-1.5">
                <img 
                  src={buetk} 
                  alt="BUETK Monogram" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain border-2 border-white/20 shadow-md transition-transform group-hover:scale-105"
                />
                <img 
                  src={logo} 
                  alt="Blood Donor Society Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/20 shadow-md transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm md:text-base font-black tracking-tight leading-none">Blood Donor</span>
                <span className="text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-widest mt-1">SOCIETY BUETK</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex space-x-1 mr-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.includes(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive ? 'bg-white text-primary shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="h-6 w-px bg-white/20 mx-1"></div>

              {/* Desktop Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
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
