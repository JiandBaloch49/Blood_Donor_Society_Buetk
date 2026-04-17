import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/ToastProvider';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Shield, Trash2, Plus } from 'lucide-react';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', role: 'ADMIN' });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, adminId: null });

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        toast.error('Failed to fetch admins');
      }
    } catch (err) {
      toast.error('Network error. Backend might be unreachable.');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setAdmins([data.admin, ...admins]);
        setNewAdmin({ email: '', password: '', role: 'ADMIN' });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.adminId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/${confirmModal.adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setAdmins(admins.filter(a => a._id !== confirmModal.adminId));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to delete admin');
    } finally {
      setConfirmModal({ isOpen: false, adminId: null });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg hidden sm:block">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrator Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage sub-admins and access control. Master Admins only.</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 border border-gray-200 rounded-lg p-5 h-fit bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Admin
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full border rounded p-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="ADMIN">ADMIN</option>
                <option value="MASTER_ADMIN">MASTER_ADMIN</option>
              </select>
            </div>
            <button disabled={isCreating} type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded text-sm font-semibold transition-colors disabled:opacity-50">
              {isCreating ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
                <th className="p-3 font-semibold rounded-tl-lg">Email</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Created</th>
                <th className="p-3 font-semibold rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {admins.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{admin.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${admin.role === 'MASTER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, adminId: admin._id })}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                      title="Delete Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Administrator"
        message="Are you sure you want to permanently delete this administrator? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, adminId: null })}
      />
    </div>
  );
};

export default AdminManagement;
