import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      }, 0); // Disable retries for login to prevent spam
      
      localStorage.setItem('adminRole', data.role);
      toast.success('Login Successful');
      navigate('/admin/donors');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
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
              disabled={isLoading}
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none transition-all focus:scale-[1.01] disabled:opacity-50" 
              placeholder="executive@blooddonorsociety.org" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              required 
              type="password" 
              disabled={isLoading}
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none transition-all focus:scale-[1.01] disabled:opacity-50" 
              placeholder="Enter secure password" 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-all shadow-sm active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  Authenticating...
                </>
              ) : 'Authenticate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
