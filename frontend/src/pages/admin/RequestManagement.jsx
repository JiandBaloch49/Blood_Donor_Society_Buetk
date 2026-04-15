import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
      // Demo mock data
      setRequests([
        { _id: '1', patientName: 'Fatima', bloodGroup: 'B+', hospital: 'Civil Hospital', urgency: 'critical', phone: '03009999999', status: 'pending', createdAt: new Date().toISOString() },
        { _id: '2', patientName: 'Usman', bloodGroup: 'A-', hospital: 'District Hospital', urgency: 'high', phone: '03118888888', status: 'verified', createdAt: new Date().toISOString() }
      ]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setRequests(requests.map(r => r._id === id ? { ...r, status: newStatus } : r));
    try {
      await fetch(`http://localhost:5000/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'critical': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Critical</span>;
      case 'high': return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">High</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{urgency}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Emergency Broadcast Hub</h2>
        <p className="text-gray-500 text-sm mt-1">Review incoming public requests and verify them for broadcast.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/50">
        {requests.map(request => (
          <div key={request._id} className={`bg-white rounded-lg shadow-sm border p-5 flex flex-col ${request.status === 'pending' ? 'border-primary/30 border-t-4 border-t-primary' : 'border-gray-200'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{request.patientName}</h3>
                <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <span className="block bg-red-100 text-red-800 text-lg font-bold px-3 py-1 rounded-md">
                  {request.bloodGroup}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
              <p><span className="font-medium text-gray-900">Hospital:</span> {request.hospital}</p>
              <p><span className="font-medium text-gray-900">Contact:</span> {request.phone}</p>
              <p className="flex items-center gap-2"><span className="font-medium text-gray-900">Urgency:</span> {getUrgencyBadge(request.urgency)}</p>
            </div>

            <div className="mt-auto border-t border-gray-100 pt-4 flex gap-2">
              {request.status === 'pending' && (
                <button 
                  onClick={() => handleUpdateStatus(request._id, 'verified')}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Radio className="w-4 h-4" />
                  Verify & Broadcast
                </button>
              )}
              
              {request.status === 'verified' && (
                <button 
                  onClick={() => handleUpdateStatus(request._id, 'fulfilled')}
                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-3 rounded text-sm transition-colors border border-green-200"
                >
                  Mark as Fulfilled
                </button>
              )}

              {request.status === 'fulfilled' && (
                <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-2 px-3 rounded text-sm text-center">
                  Request Completed
                </div>
              )}
            </div>

          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-dashed rounded-xl">
            No emergency requests currently logged.
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestManagement;
