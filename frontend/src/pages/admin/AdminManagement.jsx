import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/ToastProvider';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Shield, Trash2, Plus, Mail, Lock, UserCog, Key } from 'lucide-react';
import { fetchWithRetry, API_BASE } from '../../api';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', role: 'ADMIN' });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, adminId: null });

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/all`);
      setAdmins(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/create`, {
        method: 'POST',
        body: JSON.stringify(newAdmin)
      });

      toast.success(data.message);
      setAdmins([data.admin, ...admins]);
      setNewAdmin({ email: '', password: '', role: 'ADMIN' });
    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.adminId) return;
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/${confirmModal.adminId}`, {
        method: 'DELETE'
      });

      toast.success(data.message);
      setAdmins(admins.filter(a => a._id !== confirmModal.adminId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete admin');
    } finally {
      setConfirmModal({ isOpen: false, adminId: null });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Access Control</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Institutional security and administrative permissions.</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Create Form */}
        <div className="lg:col-span-5 xl:col-span-4 group">
          <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 transition-all group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-primary/5">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2 tracking-tight">
              <Plus className="w-5 h-5 text-primary" /> Provision New Admin
            </h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Network Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full bg-white border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" placeholder="22BSCS05@gmail.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Secure Passphrase</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} className="w-full bg-white border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Clearance Level</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })} className="w-full bg-white border-transparent rounded-2xl pl-12 pr-10 py-4 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer appearance-none">
                    <option value="ADMIN">STANDARD ADMIN</option>
                    <option value="MASTER_ADMIN">MASTER ADMIN</option>
                  </select>
                </div>
              </div>
              <button
                disabled={isCreating}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-[1.5rem] font-black transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
              >
                {isCreating ? 'Provisioning...' : 'Provision Account'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-7 xl:col-span-8 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-6 py-5">Identity Profile</th>
                <th className="px-4 py-5">Security Clearance</th>
                <th className="px-4 py-5">Enrolled On</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} columns={4} />)
              ) : admins.map(admin => (
                <tr key={admin._id} className="hover:bg-primary/5 transition-all group/row">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="font-bold text-gray-900 group-hover/row:text-primary transition-colors">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${admin.role === 'MASTER_ADMIN'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {admin.role === 'MASTER_ADMIN' ? <Shield className="w-3 h-3" /> : null}
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-6 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, adminId: admin._id })}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all active:scale-95"
                      title="Deactivate Admin"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && admins.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Lock className="w-14 h-14" />
                      <p className="font-black uppercase tracking-widest text-xs">Access Ledger Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Revoke Access"
        message="Are you sure you want to permanently revoke this administrator's access to the secure network? This action cannot be undone."
        confirmText="Revoke Access"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, adminId: null })}
      />
    </div>
  );
};

export default AdminManagement;
