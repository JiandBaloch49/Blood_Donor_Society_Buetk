import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, X, Phone, UserCheck, Shield, CheckCircle2, XCircle } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', role: 'Volunteer', isAvailable: true });
  const [isAdding, setIsAdding] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/members`);
      setMembers(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAction = async () => {
    const { data, action } = confirmModal;
    setConfirmModal({ ...confirmModal, isLoading: true });

    try {
      if (action === 'DELETE') {
        await fetchWithRetry(`${API_BASE}/api/admin/members/${data.id}`, {
          method: 'DELETE'
        });
        toast.success('Member removed');
        setMembers(members.filter(m => m._id !== data.id));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setConfirmModal({ isOpen: false, data: null, action: null });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (newMember.phone.length !== 11 || !/^\d+$/.test(newMember.phone)) {
       toast.error('Phone number must be exactly 11 digits');
       return;
    }
    setIsAdding(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/members`, {
        method: 'POST',
        body: JSON.stringify(newMember)
      });
      
      toast.success('Member added successfully');
      setMembers([data, ...members]);
      setIsAddModalOpen(false);
      setNewMember({ name: '', phone: '', role: 'Volunteer', isAvailable: true });
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const getModalProps = () => {
    if (!confirmModal.action) return {};
    switch(confirmModal.action) {
      case 'DELETE': return { title: 'Remove Member', message: 'Are you sure you want to permanently remove this member from the public broadcast?', type: 'danger', confirmText: 'Remove' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative animate-in fade-in duration-700 min-h-[500px]">
      <div className="p-8 border-b border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-primary" />
             </div>
             <div>
               <div className="flex items-center gap-3">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Society Members</h2>
                 <span className="text-xs font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{members.length}</span>
               </div>
               <p className="text-gray-500 font-medium text-sm mt-1">Manage public contact profiles on the landing page.</p>
             </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:font-medium"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-xl shadow-primary/20 active:scale-95 shrink-0"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="px-8 py-5">Verified Member</th>
              <th className="px-4 py-5 font-mono">Secure COMMS</th>
              <th className="px-4 py-5">Designation</th>
              <th className="px-4 py-5 text-center">Engagement</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
            ) : members.filter(m => {
                const q = search.toLowerCase();
                return !q || m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.phone?.includes(search);
              }).map(member => (
              <tr key={member._id} className="hover:bg-primary/5 transition-all group/row">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-xs text-primary bg-primary/5">
                        {member.name.charAt(0)}
                      </div>
                      <div className="font-bold text-gray-900 group-hover/row:text-primary transition-colors">{member.name}</div>
                   </div>
                </td>
                <td className="px-4 py-6 text-gray-600 font-mono text-sm tracking-tighter">
                   <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-300" />
                      {member.phone}
                   </div>
                </td>
                <td className="px-4 py-6">
                   <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-lg text-gray-500">{member.role}</span>
                </td>
                <td className="px-4 py-6 text-center">
                   {member.isAvailable ? (
                     <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100">
                        <XCircle className="w-3.5 h-3.5" /> Busy
                     </span>
                   )}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: member._id }, action: 'DELETE' })}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all active:scale-95"
                    title="Remove Member"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && members.filter(m => {
              const q = search.toLowerCase();
              return !q || m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.phone?.includes(search);
            }).length === 0 && (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <UserCheck className="w-14 h-14" />
                    <p className="font-black uppercase tracking-widest text-xs">
                      {search ? `No members match "${search}"` : 'No Members Verified'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        isLoading={confirmModal.isLoading}
        {...getModalProps()}
        onConfirm={handleAction}
        onCancel={() => setConfirmModal({ isOpen: false, data: null, action: null })}
      />

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative transform overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl transition-all w-full max-w-lg p-6 sm:p-10 pr-2 sm:pr-8 animate-in zoom-in duration-300 border border-gray-100 max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Onboard Member</h3>
                <p className="text-gray-400 font-medium text-sm">Add society contact profile.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-95"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Member Name</label>
                <input required value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. Abdullah Khan" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Verified Phone</label>
                <input required type="tel" pattern="[0-9]{11}" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" placeholder="03XXXXXXXXX" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Mission Role</label>
                <input 
                  value={newMember.role} 
                  onChange={e=>setNewMember({...newMember, role: e.target.value})} 
                  className="w-full bg-gray-50 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none font-bold" 
                  placeholder="e.g. Coordinator, Operations"
                />
              </div>
              <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
                 <label className="flex items-center gap-4 cursor-pointer group">
                   <div className="relative">
                      <input type="checkbox" checked={newMember.isAvailable} onChange={e => setNewMember({...newMember, isAvailable: e.target.checked})} className="sr-only" />
                      <div className={`w-12 h-6 rounded-full transition-colors ${newMember.isAvailable ? 'bg-primary' : 'bg-gray-300'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${newMember.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest text-gray-600 group-hover:text-primary transition-colors">Visible for Instant Contact</span>
                 </label>
              </div>
              
              <div className="pt-4">
                <button type="submit" disabled={isAdding} className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-[0.2em]">
                  {isAdding ? 'Processing...' : 'Deploy Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
