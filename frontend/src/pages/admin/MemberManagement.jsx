import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, X, Phone, UserCheck, Shield } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', role: 'Volunteer', isAvailable: true });
  const [isAdding, setIsAdding] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/members', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        toast.error('Failed to fetch members');
      }
    } catch (err) {
      toast.error('Backend unreachable');
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
        const res = await fetch(`http://localhost:5000/api/admin/members/${data.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const resData = await res.json();

        if (res.ok) {
          toast.success('Member removed');
          setMembers(members.filter(m => m._id !== data.id));
        } else {
          toast.error(resData.message || 'Action failed');
        }
      }
    } catch (err) {
      toast.error('Server error');
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
      const res = await fetch('http://localhost:5000/api/admin/members', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Member added successfully');
        setMembers([data, ...members]);
        setIsAddModalOpen(false);
        setNewMember({ name: '', phone: '', role: 'Volunteer', isAvailable: true });
      } else {
        toast.error(data.message || 'Failed to add member');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsAdding(false);
    }
  };

  const getModalProps = () => {
    if (!confirmModal.action) return {};
    switch(confirmModal.action) {
      case 'DELETE': return { title: 'Delete Society Member', message: 'Are you sure you want to permanently remove this member from the public broadcast?', type: 'danger', confirmText: 'Remove' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg hidden sm:block">
              <UserCheck className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-gray-900">Society Members</h2>
             <p className="text-gray-500 text-sm mt-1">Manage public contact cards available on the landing page.</p>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-semibold">Member Name</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm opacity-100 transition-opacity">
            {members.map(member => (
              <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{member.name}</td>
                <td className="p-4 text-gray-600 font-mono text-sm">{member.phone}</td>
                <td className="p-4 font-medium text-gray-700">{member.role}</td>
                <td className="p-4 text-center">
                   {member.isAvailable ? (
                     <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Available</span>
                   ) : (
                     <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Not Available</span>
                   )}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: member._id }, action: 'DELETE' })}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors inline-block"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && members.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No society members added yet.
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Add Society Member</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Full Name <span className="text-red-500">*</span></label>
                  <input required value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Phone <span className="text-gray-400 font-normal">(11 digits)</span> <span className="text-red-500">*</span></label>
                  <input required type="tel" pattern="[0-9]{11}" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" placeholder="03XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Assigned Role</label>
                  <input 
                    value={newMember.role} 
                    onChange={e=>setNewMember({...newMember, role: e.target.value})} 
                    className="w-full border rounded p-2 text-sm focus:border-primary outline-none" 
                    placeholder="e.g. Coordinator, Volunteer"
                  />
                </div>
                <div>
                   <label className="flex items-center gap-2 text-sm text-gray-700 mt-2 cursor-pointer">
                     <input type="checkbox" checked={newMember.isAvailable} onChange={e => setNewMember({...newMember, isAvailable: e.target.checked})} className="rounded text-primary focus:ring-primary h-4 w-4" />
                     Available for public contact immediately
                   </label>
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isAdding} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-sm font-semibold disabled:opacity-50">
                    {isAdding ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
