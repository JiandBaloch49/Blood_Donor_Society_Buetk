import React, { useState } from 'react';
import { useToast } from './ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../api';
import { Phone, User, MapPin, Activity, Radio, CheckCircle2, RefreshCcw } from 'lucide-react';

const EmergencyForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    hospital: '',
    urgency: 'high',
    attendantPhone: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.attendantPhone.length !== 11 || !/^\d+$/.test(formData.attendantPhone)) {
       toast.error('Attendant phone number must be exactly 11 digits');
       return;
    }
    setIsSubmitting(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/public/requests`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setSubmitted(true);
      toast.success(data.message || 'Mission critical request dispatched');
    } catch (err) {
      toast.error(err.message || 'System interruption. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto p-12 text-center bg-white rounded-[2.5rem] shadow-2xl border border-green-100 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
           <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Dispatch Confirmed</h3>
        <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
          Your emergency request has been broadcasted to the society network. An administrator will initiate contact via <span className="text-gray-900 font-black underline decoration-green-500">{formData.attendantPhone}</span> immediately.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({...formData, patientName: '', attendantPhone: '', hospital: ''});
          }}
          className="mt-10 flex items-center gap-2 mx-auto text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors active:scale-95 px-6 py-3 rounded-2xl hover:bg-gray-50"
        >
          <RefreshCcw className="w-4 h-4" />
          New Dispatch Request
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 border border-gray-100 p-1">
      <div className="bg-primary p-10 text-white relative overflow-hidden rounded-[2.2rem]">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Radio className="w-32 h-32 animate-pulse" />
         </div>
         <h2 className="text-3xl font-black tracking-tight mb-2">Emergency Hub</h2>
         <p className="text-white/80 font-medium text-sm">Critical life-saving coordination network.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Patient Identity</label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
               <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold" placeholder="Full Legal Name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 text-center md:text-left">Blood Type Required</label>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setFormData({...formData, bloodGroup: group})}
                    className={`py-3 rounded-xl text-xs font-black transition-all active:scale-90 border-2 ${
                      formData.bloodGroup === group 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Active Contact</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input required type="tel" pattern="[0-9]{11}" name="attendantPhone" value={formData.attendantPhone} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="03XXXXXXXXX" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Institutional Location</label>
            <div className="relative group">
               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
               <input required type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold" placeholder="e.g. DHQ Hospital, Khuzdar" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Triage Urgency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {id: 'low', label: 'Monitor'},
                  {id: 'medium', label: 'Urgent'},
                  {id: 'high', label: 'High Priority'},
                  {id: 'critical', label: 'CRITICAL'}
                ].map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setFormData({...formData, urgency: u.id})}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all active:scale-90 border-2 ${
                      formData.urgency === u.id 
                      ? 'bg-gray-900 border-gray-900 text-white shadow-xl' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
          </div>

          <div className="pt-6">
            <button 
              disabled={isSubmitting} 
              type="submit" 
              className="w-full relative bg-primary hover:bg-primary-hover text-white font-black py-4 sm:py-6 rounded-[1.8rem] transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-70 text-xs sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.3em] overflow-hidden"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                   <Activity className="animate-spin h-5 w-5" />
                   Initiating Broadcast...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Radio className="w-5 h-5 animate-pulse" />
                  Dispatch Emergency Request
                </div>
              )}
            </button>
          </div>
          
          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest px-4">
             Your IP identity is logged for security. False reporting is punishable by law.
          </p>
        </div>
      </form>
    </div>
  );
};

export default EmergencyForm;
