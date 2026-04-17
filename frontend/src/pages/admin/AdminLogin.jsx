import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        if (data.role) localStorage.setItem('adminRole', data.role);
        toast.success('Login Successful');
        navigate('/admin/donors');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server unreachable. Please ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary text-white p-6 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold">Executive Login</h2>
          <p className="text-primary-hover text-sm mt-1 text-white/70">Secure Admin Dashboard Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input 
              required 
              type="email" 
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" 
              placeholder="executive@blooddonorsociety.org" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              required 
              type="password" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" 
              placeholder="Enter secure password" 
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm">
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
