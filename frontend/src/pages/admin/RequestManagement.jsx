import React, { useState, useEffect } from 'react';
import { Radio, Trash2, Calendar, Phone, Activity, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/requests`);
      setRequests(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch requests');
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
      let url = `${API_BASE}/api/admin/requests/${data.id}`;
      let method = 'PUT';
      let bodyData = null;

      if (action === 'VERIFY') {
        bodyData = { status: 'verified' };
      } else if (action === 'FULFILL') {
        bodyData = { status: 'fulfilled' };
      } else if (action === 'DELETE') {
        method = 'DELETE';
      }

      const resData = await fetchWithRetry(url, {
        method,
        body: bodyData ? JSON.stringify(bodyData) : undefined
      });

      toast.success(action === 'DELETE' ? 'Request deleted successfully' : 'Status updated successfully');
      if (action === 'DELETE') {
        setRequests(requests.filter(r => r._id !== data.id));
      } else {
        setRequests(requests.map(r => r._id === data.id ? resData : r));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setConfirmModal({ isOpen: false, data: null, action: null });
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'critical': return <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-red-100 ring-2 ring-red-50/50 animate-pulse">Critical</span>;
      case 'high': return <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-orange-100">High</span>;
      default: return <span className="bg-gray-50 text-gray-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-gray-100">{urgency}</span>;
    }
  };

  const getModalProps = () => {
    if (!confirmModal.action) return {};
    switch(confirmModal.action) {
      case 'VERIFY': return { title: 'Verify & Broadcast', message: 'Ready to broadcast this emergency to the public network?', type: 'info', confirmText: 'Start Broadcast' };
      case 'FULFILL': return { title: 'Mark as Fulfilled', message: 'Confirm that this patient has received the necessary donated blood?', type: 'success', confirmText: 'Finalize Fulfillment' };
      case 'DELETE': return { title: 'Expunge Record', message: 'Permanently remove this request from the secure ledger? This action is irreversible.', type: 'danger', confirmText: 'Delete Forever' };
      default: return {};
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative animate-in fade-in duration-700 min-h-[500px]">
      <div className="p-8 border-b border-gray-50">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Emergency Hub</h2>
        <p className="text-gray-500 font-medium text-sm mt-1">Real-time triage and public broadcast coordination.</p>
      </div>

      <div className="p-8 bg-gray-50/50 min-h-[400px]">
        {isLoading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Ledgers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {requests.map(request => (
              <div 
                key={request._id} 
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all group relative overflow-hidden flex flex-col ${
                  request.status === 'pending' 
                  ? 'border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5' 
                  : 'border-gray-100 opacity-80'
                }`}
              >
                
                {/* Delete Trigger */}
                <button 
                  onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'DELETE' })}
                  className="absolute top-3 right-3 p-2 bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all active:scale-95 z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pr-8">
                    <div>
                      <h3 className="font-black text-lg text-gray-900 tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px]">{request.patientName}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-red-50 text-primary font-black px-3 py-1.5 rounded-xl border border-red-100 text-base shadow-sm">
                      {request.bloodGroup}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6 flex-1 text-xs">
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hospital</p>
                        <p className="font-bold text-gray-800 truncate">{request.hospital}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <a href={`tel:${request.phone || request.attendantPhone}`} className="hover:text-primary transition-colors min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                        <p className="font-black text-gray-800 font-mono tracking-tighter truncate">{request.phone || request.attendantPhone}</p>
                      </a>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500">Urgency</span>
                      {getUrgencyBadge(request.urgency)}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto pt-2 flex gap-2">
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'VERIFY' })}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Radio className="w-3 h-3 animate-pulse" />
                        Broadcast
                      </button>
                    )}
                    
                    {request.status === 'verified' && (
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, data: { id: request._id }, action: 'FULFILL' })}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Fulfill
                      </button>
                    )}

                    {request.status === 'fulfilled' && (
                      <div className="flex-1 bg-gray-100 text-gray-400 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest text-center border border-gray-200">
                        Done
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white border-4 border-dashed border-gray-50 rounded-[3rem]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                   <Activity className="w-8 h-8" />
                </div>
                <p className="text-gray-300 font-black uppercase tracking-widest text-sm italic">Clear Ledger: No Active Emergencies</p>
              </div>
            )}
          </div>
        )}
      </div>

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
