import React, { useState, useEffect } from 'react';
import { Search, Edit2, CheckCircle, XCircle } from 'lucide-react';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const fetchDonors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/donors', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonors(data);
      }
    } catch (err) {
      console.error(err);
      // Demo mock data fallback if backend offline
      setDonors([
        { _id: '1', firstName: 'Ali', lastName: 'Khan', phone: '03001234567', bloodGroup: 'O+', userType: 'student', rollNumber: '22BSCS05', isVerified: true, isAvailable: true, lastDonated: null },
        { _id: '2', firstName: 'Sara', lastName: 'Ahmed', phone: '03119876543', bloodGroup: 'A-', userType: 'resident', rollNumber: '', isVerified: false, isAvailable: true, lastDonated: '2023-11-01T00:00:00Z' },
      ]);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleUpdateDonor = async (id, field, value) => {
    // Optimistic UI updates
    setDonors(donors.map(d => d._id === id ? { ...d, [field]: value } : d));
    
    try {
      await fetch(`http://localhost:5000/api/admin/donors/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify({ [field]: value })
      });
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchesSearch = (d.firstName + ' ' + d.lastName).toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === 'All' || d.bloodGroup === filterGroup;
    const matchesType = filterType === 'All' || d.userType === filterType;
    return matchesSearch && matchesGroup && matchesType;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage public donor entries and availability.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search names..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          
          <select 
            value={filterGroup} 
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none bg-white focus:ring-primary"
          >
            <option value="All">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm outline-none bg-white focus:ring-primary"
          >
            <option value="All">All Types</option>
            <option value="student">Students</option>
            <option value="resident">Residents</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-semibold">Donor Name (Phone)</th>
              <th className="p-4 font-semibold">Blood Group</th>
              <th className="p-4 font-semibold">Type / Roll No</th>
              <th className="p-4 font-semibold">Last Donated</th>
              <th className="p-4 font-semibold text-center">Available</th>
              <th className="p-4 font-semibold text-center">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredDonors.map(donor => (
              <tr key={donor._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{donor.firstName} {donor.lastName}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{donor.phone}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center justify-center bg-red-100 text-red-800 font-bold px-2 py-1 rounded w-10 text-xs">
                    {donor.bloodGroup}
                  </span>
                </td>
                <td className="p-4">
                  <span className="capitalize">{donor.userType}</span>
                  {donor.rollNumber && <div className="text-xs text-gray-500 mt-0.5">{donor.rollNumber}</div>}
                </td>
                <td className="p-4">
                  {/* Inline editable Date */}
                  <input
                    type="date"
                    value={donor.lastDonated ? donor.lastDonated.split('T')[0] : ''}
                    onChange={(e) => handleUpdateDonor(donor._id, 'lastDonated', e.target.value)}
                    className="border border-gray-200 rounded p-1 text-xs text-gray-700 bg-white cursor-pointer hover:border-primary focus:outline-none"
                  />
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleUpdateDonor(donor._id, 'isAvailable', !donor.isAvailable)}
                    className={`inline-flex p-1.5 rounded-full transition-colors ${donor.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    title="Toggle Availability"
                  >
                    {donor.isAvailable ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </td>
                <td className="p-4 text-center">
                   <button 
                    onClick={() => handleUpdateDonor(donor._id, 'isVerified', !donor.isVerified)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${donor.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700 hover:bg-blue-50'}`}
                  >
                    {donor.isVerified ? 'Verified' : 'Verify'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredDonors.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No donors found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorManagement;
