import React, { useState, useEffect } from 'react';
import { Radio, Trash2 } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (err) {
      toast.error('Backend unreachable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async () => {
    const { data, action } = confirmModal;
    setConfirmModal({ ...confirmModal, isLoading: true });

    try {
      let url = `http://localhost:5000/api/admin/requests/${data.id}`;
      let method = 'PUT';
      let bodyData = null;

      if (action === 'VERIFY') {
        bodyData = { status: 'verified' };
      } else if (action === 'FULFILL') {
        bodyData = { status: 'fulfilled' };
      } else if (action === 'DELETE') {
        method = 'DELETE';
      }

      const options = {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' }
      };
      if (bodyData) options.body = JSON.stringify(bodyData);

      const res = await fetch(url, options);
      const resData = await res.json();

      if (res.ok) {
        toast.success(action === 'DELETE' ? 'Request deleted' : 'Request updated successfully');
        if (action === 'DELETE') {
          setRequests(requests.filter(r => r._id !== data.id));
        } else {
          setRequests(requests.map(r => r._id === data.id ? resData : r));
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

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'critical': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Critical</span>;
      case 'high': return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">High</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{urgency}</span>;
    }
  };

  const getModalProps = () => {
    if (!confirmModal.action) return {};
    switch(confirmModal.action) {
      case 'VERIFY': return { title: 'Verify Request', message: 'Are you sure you want to verify this request? It will be ready for broadcast.', type: 'info', confirmText: 'Verify' };
      case 'FULFILL': return { title: 'Fulfill Request', message: 'Are you sure you completed this request? This marks it as matched with a donor.', type: 'success', confirmText: 'Mark Complete' };
      case 'DELETE': return { title: 'Delete Request', message: 'Are you sure you want to permanently delete this request?', type: 'danger', confirmText: 'Delete' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Emergency Broadcast Hub</h2>
        <p className="text-gray-500 text-sm mt-1">Review incoming public requests and verify them for broadcast.</p>
      </div>

      {isLoading && requests.length === 0 ? (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/50">
          {requests.map(request => (
            <div key={request._id} className={`bg-white rounded-lg shadow-sm border flex flex-col relative overflow-hidden group ${request.status === 'pending' ? 'border-primary/30 border-t-4 border-t-primary' : 'border-gray-200'}`}>
              
              <button 
                onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'DELETE' })}
                className="absolute top-2 right-2 p-2 bg-white rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 pr-6">
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
                  <p><span className="font-medium text-gray-900">Contact:</span> {request.phone || request.attendantPhone}</p>
                  <p className="flex items-center gap-2"><span className="font-medium text-gray-900">Urgency:</span> {getUrgencyBadge(request.urgency)}</p>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4 flex gap-2">
                  {request.status === 'pending' && (
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'VERIFY' })}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Radio className="w-4 h-4" />
                      Verify & Broadcast
                    </button>
                  )}
                  
                  {request.status === 'verified' && (
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'FULFILL' })}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-3 rounded text-sm transition-colors border border-green-200"
                    >
                      Mark as Fulfilled
                    </button>
                  )}

                  {request.status === 'fulfilled' && (
                    <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-2 px-3 rounded text-sm text-center border border-gray-200">
                      Request Completed
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}

          {requests.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-dashed rounded-xl">
              No emergency requests currently logged.
            </div>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        isLoading={confirmModal.isLoading}
        {...getModalProps()}
        onConfirm={handleAction}
        onCancel={() => setConfirmModal({ isOpen: false, data: null, action: null })}
      />
    </div>
  );
};

export default RequestManagement;
