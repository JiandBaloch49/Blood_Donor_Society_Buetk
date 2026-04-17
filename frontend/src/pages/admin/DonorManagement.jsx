import React, { useState, useEffect } from 'react';
import { Search, Edit2, CheckCircle, XCircle, Trash2, Plus, X } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: compute availability from lastDonated
  const computeAvailability = (donor) => {
    if (!donor.lastDonated) return true;
    const diffDays = Math.floor((new Date() - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24));
    return diffDays >= 60;
  };
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDonor, setNewDonor] = useState({ firstName: '', lastName: '', phone: '', bloodGroup: 'A+', userType: 'student', rollNumber: '', address: '' });
  const [isAdding, setIsAdding] = useState(false);

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/donors', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonors(data);
      } else {
        toast.error('Failed to fetch donors');
      }
    } catch (err) {
      toast.error('Backend unreachable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleAction = async () => {
    const { data, action } = confirmModal;
    setConfirmModal({ ...confirmModal, isLoading: true });

    try {
      let url = `http://localhost:5000/api/admin/donors/${data.id}`;
      let method = 'PUT';
      let bodyData = null;

      if (action === 'TOGGLE_AVAILABILITY') {
        bodyData = { isAvailable: !data.isAvailable };
      } else if (action === 'TOGGLE_VERIFY') {
        bodyData = { isVerified: !data.isVerified };
      } else if (action === 'DELETE') {
        method = 'DELETE';
      } else if (action === 'UPDATE_DATE') {
        bodyData = { lastDonated: data.lastDonated };
      }

      const options = {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' }
      };
      if (bodyData) options.body = JSON.stringify(bodyData);

      const res = await fetch(url, options);
      const resData = await res.json();

      if (res.ok) {
        toast.success(action === 'DELETE' ? 'Donor deleted successfully' : 'Donor updated successfully');
        if (action === 'DELETE') {
          setDonors(donors.filter(d => d._id !== data.id));
        } else {
          setDonors(donors.map(d => d._id === data.id ? resData : d));
        }
      } else {
        toast.error(resData.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setConfirmModal({ isOpen: false, data: null, action: null });
    }
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/donors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newDonor)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Donor added successfully');
        setDonors([data, ...donors]);
        setIsAddModalOpen(false);
        setNewDonor({ firstName: '', lastName: '', phone: '', bloodGroup: 'A+', userType: 'student', rollNumber: '', address: '' });
      } else {
        toast.error(data.message || 'Failed to add donor');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchesSearch = (d.firstName + ' ' + d.lastName + ' ' + d.phone).toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === 'All' || d.bloodGroup === filterGroup;
    const matchesType = filterType === 'All' || d.userType === filterType;
    const isActuallyAvailable = computeAvailability(d);
    const matchesAvailable = !filterAvailable || isActuallyAvailable;
    return matchesSearch && matchesGroup && matchesType && matchesAvailable;
  });

  const getModalProps = () => {
    if (!confirmModal.action) return {};
    switch(confirmModal.action) {
      case 'DELETE': return { title: 'Delete Donor', message: 'Are you sure you want to completely delete this donor? This cannot be undone.', type: 'danger', confirmText: 'Delete' };
      case 'TOGGLE_AVAILABILITY': return { title: 'Change Availability', message: `Are you sure you want to mark this donor as ${confirmModal.data.isAvailable ? 'Not Available' : 'Available'}?`, type: 'warning', confirmText: 'Change' };
      case 'TOGGLE_VERIFY': return { title: confirmModal.data.isVerified ? 'Unverify Donor' : 'Verify Donor', message: confirmModal.data.isVerified ? 'Are you sure you want to remove verification from this donor?' : 'Are you sure you want to verify this donor and make them visible for public broadcasts?', type: 'warning', confirmText: confirmModal.data.isVerified ? 'Unverify' : 'Verify' };
      case 'UPDATE_DATE': return { title: 'Update Donation Date', message: 'Are you sure you want to update the last donation date?', type: 'info', confirmText: 'Update' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage public donor entries.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Donor
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name/phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:ring-primary outline-none"
            />
          </div>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none bg-white">
            <option value="All">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none bg-white">
            <option value="All">All Types</option>
            <option value="student">Students</option>
            <option value="resident">Residents</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} className="rounded text-primary h-4 w-4" />
            Available Only
          </label>
        </div>
      </div>

      <div className="overflow-x-auto w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-semibold">Donor Details</th>
              <th className="p-4 font-semibold text-center">Blood Group</th>
              <th className="p-4 font-semibold">Type / Roll No</th>
              <th className="p-4 font-semibold">Last Donated</th>
              <th className="p-4 font-semibold text-center">Available</th>
              <th className="p-4 font-semibold text-center">Verified</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm opacity-100 transition-opacity">
            {filteredDonors.map(donor => (
              <tr key={donor._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{donor.firstName} {donor.lastName}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{donor.phone}</div>
                  {donor.address && <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]" title={donor.address}>{donor.address}</div>}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center bg-red-100 text-red-800 font-bold px-2 py-1 rounded w-10 text-xs">
                    {donor.bloodGroup}
                  </span>
                </td>
                <td className="p-4">
                  <span className="capitalize font-medium text-gray-800">{donor.userType}</span>
                  {donor.rollNumber && <div className="text-xs text-gray-500 mt-0.5 uppercase">{donor.rollNumber}</div>}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={donor.lastDonated ? donor.lastDonated.split('T')[0] : ''}
                      onChange={(e) => setConfirmModal({ isOpen: true, data: { id: donor._id, lastDonated: e.target.value }, action: 'UPDATE_DATE' })}
                      className="border border-gray-200 rounded p-1 text-xs text-gray-700 bg-white cursor-pointer hover:border-primary focus:outline-none"
                    />
                    {donor.lastDonated && (() => {
                      const days = Math.floor((new Date() - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24));
                      return <span className={`text-[10px] font-medium ${days < 60 ? 'text-red-500' : 'text-green-600'}`}>{days}d ago</span>;
                    })()}
                  </div>
                </td>
                <td className="p-4 text-center">
                  {(() => {
                    const available = computeAvailability(donor);
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                        available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {available ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-4 text-center">
                   <button 
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: donor._id, isVerified: donor.isVerified }, action: 'TOGGLE_VERIFY' })}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors w-20 ${donor.isVerified ? 'bg-blue-100 text-blue-700 hover:bg-blue-200/50' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    {donor.isVerified ? 'Verified' : 'Verify'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: donor._id }, action: 'DELETE' })}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors inline-block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredDonors.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No donors found matching criteria.
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

      {/* Add Donor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Add New Donor</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleAddDonor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">First Name <span className="text-red-500">*</span></label>
                    <input required value={newDonor.firstName} onChange={e=>setNewDonor({...newDonor, firstName: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Last Name <span className="text-red-500">*</span></label>
                    <input required value={newDonor.lastName} onChange={e=>setNewDonor({...newDonor, lastName: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Phone <span className="text-gray-400 font-normal">(11 digits)</span> <span className="text-red-500">*</span></label>
                  <input required type="tel" pattern="[0-9]{11}" placeholder="03001234567" value={newDonor.phone} onChange={e=>setNewDonor({...newDonor, phone: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Blood Group <span className="text-red-500">*</span></label>
                    <select value={newDonor.bloodGroup} onChange={e=>setNewDonor({...newDonor, bloodGroup: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none bg-white">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Role <span className="text-red-500">*</span></label>
                    <select value={newDonor.userType} onChange={e=>setNewDonor({...newDonor, userType: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none bg-white">
                      <option value="student">Student</option>
                      <option value="resident">Resident</option>
                    </select>
                  </div>
                </div>
                {newDonor.userType === 'student' && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Roll Number</label>
                    <input value={newDonor.rollNumber} onChange={e=>setNewDonor({...newDonor, rollNumber: e.target.value})} placeholder="e.g. 21BSCS01" className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Address/Department <span className="text-red-500">*</span></label>
                  <input required value={newDonor.address} onChange={e=>setNewDonor({...newDonor, address: e.target.value})} className="w-full border rounded p-2 text-sm focus:border-primary outline-none" />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isAdding} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-sm font-semibold disabled:opacity-50">
                    {isAdding ? 'Adding...' : 'Add Donor'}
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

export default DonorManagement;
