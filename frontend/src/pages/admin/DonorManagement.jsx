import React, { useState, useEffect } from 'react';
import { Search, Edit2, CheckCircle, XCircle, Trash2, Plus, X } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

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
      const data = await fetchWithRetry(`${API_BASE}/api/admin/donors`);
      setDonors(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch donors');
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
      let url = `${API_BASE}/api/admin/donors/${data.id}`;
      let method = 'PUT';
      let bodyData = null;

      if (action === 'TOGGLE_VERIFY') {
        bodyData = { isVerified: !data.isVerified };
      } else if (action === 'DELETE') {
        method = 'DELETE';
      } else if (action === 'UPDATE_DATE') {
        bodyData = { lastDonated: data.lastDonated };
      }

      const resData = await fetchWithRetry(url, {
        method,
        body: bodyData ? JSON.stringify(bodyData) : undefined
      });

      toast.success(action === 'DELETE' ? 'Donor deleted successfully' : 'Donor updated successfully');
      if (action === 'DELETE') {
        setDonors(donors.filter(d => d._id !== data.id));
      } else {
        setDonors(donors.map(d => d._id === data.id ? resData : d));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setConfirmModal({ isOpen: false, data: null, action: null });
    }
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/donors`, {
        method: 'POST',
        body: JSON.stringify(newDonor)
      });

      toast.success('Donor added successfully');
      setDonors([data, ...donors]);
      setIsAddModalOpen(false);
      setNewDonor({ firstName: '', lastName: '', phone: '', bloodGroup: 'A+', userType: 'student', rollNumber: '', address: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to add donor');
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
    switch (confirmModal.action) {
      case 'DELETE': return { title: 'Delete Donor', message: 'Are you sure you want to completely delete this donor? This cannot be undone.', type: 'danger', confirmText: 'Delete' };
      case 'TOGGLE_VERIFY': return { title: confirmModal.data.isVerified ? 'Unverify Donor' : 'Verify Donor', message: confirmModal.data.isVerified ? 'Are you sure you want to remove verification from this donor?' : 'Are you sure you want to verify this donor and make them visible for public broadcasts?', type: 'warning', confirmText: confirmModal.data.isVerified ? 'Unverify' : 'Verify' };
      case 'UPDATE_DATE': return { title: 'Update Donation Date', message: 'Are you sure you want to update the last donation date?', type: 'info', confirmText: 'Update' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Donor Directory</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Institutional and local donor coordination.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-4 w-full xl:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>

          <div className="relative group flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-white border-transparent focus:bg-white rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-medium"
            />
          </div>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="px-4 py-3 bg-gray-50 hover:bg-white rounded-2xl text-sm font-bold outline-none border-transparent transition-all cursor-pointer">
            <option value="All">All Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-gray-50 hover:bg-white rounded-2xl text-sm font-bold outline-none border-transparent transition-all cursor-pointer">
            <option value="All">All Types</option>
            <option value="student">Student</option>
            <option value="resident">Resident</option>
          </select>
          <label className="flex items-center gap-3 text-sm font-bold text-gray-600 cursor-pointer select-none bg-gray-50 px-4 py-3 rounded-2xl hover:bg-white transition-all">
            <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} className="rounded-lg text-primary h-5 w-5 border-gray-300 focus:ring-primary" />
            Active Only
          </label>
        </div>
      </div>

      <div className="overflow-x-auto w-full relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="px-8 py-5">Donor Profile</th>
              <th className="px-4 py-5 text-center">Group</th>
              <th className="px-4 py-5">Affiliation</th>
              <th className="px-4 py-5">Donation History</th>
              <th className="px-4 py-5 text-center">Status</th>
              <th className="px-4 py-5 text-center">Trust Level</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
            ) : filteredDonors.map(donor => (
              <tr key={donor._id} className="hover:bg-primary/5 transition-all group/row">
                <td className="px-8 py-6">
                  <div className="font-bold text-gray-900 group-hover/row:text-primary transition-colors">{donor.firstName} {donor.lastName}</div>
                  <div className="text-gray-500 font-mono text-xs mt-1 tracking-tighter">{donor.phone}</div>
                  {donor.address && <div className="text-gray-400 text-[10px] mt-1 truncate max-w-[180px] font-medium" title={donor.address}>{donor.address}</div>}
                </td>
                <td className="px-4 py-6 text-center">
                  <span className="inline-flex items-center justify-center bg-red-50 text-primary font-black px-3 py-1.5 rounded-xl min-w-[3rem] text-[11px] border border-red-100">
                    {donor.bloodGroup}
                  </span>
                </td>
                <td className="px-4 py-6">
                  <span className="capitalize font-bold text-gray-700 text-xs px-2.5 py-1 bg-gray-100 rounded-lg">{donor.userType}</span>
                  {donor.rollNumber && <div className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">{donor.rollNumber}</div>}
                </td>
                <td className="px-4 py-6">
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={donor.lastDonated ? donor.lastDonated.split('T')[0] : ''}
                      onChange={(e) => setConfirmModal({ isOpen: true, data: { id: donor._id, lastDonated: e.target.value }, action: 'UPDATE_DATE' })}
                      className="bg-gray-50 group-hover/row:bg-white border-transparent rounded-xl p-2 text-[10px] font-black text-gray-600 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all outline-none"
                    />
                    {donor.lastDonated && (() => {
                      const days = Math.floor((new Date() - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24));
                      return <span className={`text-[9px] font-black uppercase tracking-wider px-2 ${days < 60 ? 'text-red-500' : 'text-green-600'}`}>{days}d since donation</span>;
                    })()}
                  </div>
                </td>
                <td className="px-4 py-6 text-center">
                  {(() => {
                    const available = computeAvailability(donor);
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {available ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {available ? 'Ready' : 'Resting'}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-6 text-center">
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: donor._id, isVerified: donor.isVerified }, action: 'TOGGLE_VERIFY' })}
                    className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-xl transition-all active:scale-95 ${donor.isVerified ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}
                  >
                    {donor.isVerified ? 'Verified' : 'Pending'}
                  </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, data: { id: donor._id }, action: 'DELETE' })}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredDonors.length === 0 && (
              <tr>
                <td colSpan="7" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Search className="w-12 h-12" />
                    <p className="font-black uppercase tracking-widest text-xs">No Results Found</p>
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

      {/* Add Donor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative transform overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl transition-all w-full max-w-lg p-6 sm:p-10 pr-2 sm:pr-6 animate-in zoom-in duration-300 border border-gray-100 max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Onboard Donor</h3>
                <p className="text-gray-400 font-medium text-sm">New database entry.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDonor} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">First Name</label>
                  <input required value={newDonor.firstName} onChange={e => setNewDonor({ ...newDonor, firstName: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Last Name</label>
                  <input required value={newDonor.lastName} onChange={e => setNewDonor({ ...newDonor, lastName: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Phone Number</label>
                <input required type="tel" pattern="[0-9]{11}" placeholder="03XXXXXXXXX" value={newDonor.phone} onChange={e => setNewDonor({ ...newDonor, phone: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Blood Group</label>
                  <select value={newDonor.bloodGroup} onChange={e => setNewDonor({ ...newDonor, bloodGroup: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white font-bold cursor-pointer">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Profile Type</label>
                  <select value={newDonor.userType} onChange={e => setNewDonor({ ...newDonor, userType: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white font-bold cursor-pointer">
                    <option value="student">Student</option>
                    <option value="resident">Resident</option>
                  </select>
                </div>
              </div>

              {newDonor.userType === 'student' && (
                <div className="animate-in fade-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Roll Number</label>
                  <input value={newDonor.rollNumber} onChange={e => setNewDonor({ ...newDonor, rollNumber: e.target.value })} placeholder="e.g. 22BSCS05" className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Location Details</label>
                <input required value={newDonor.address} onChange={e => setNewDonor({ ...newDonor, address: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-2xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Hostel or Full Address" />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-[0.2em]"
                >
                  {isAdding ? 'Processing...' : 'Add Donor Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorManagement;
