import React, { useState } from 'react';
import { useToast } from './ui/ToastProvider';

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
      const response = await fetch('http://localhost:5000/api/public/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        toast.success(data.message || 'Request submitted successfully');
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Failed to submit emergency request:', err);
      toast.error('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-primary/10 border border-primary/20 rounded-md">
        <h3 className="text-xl font-semibold text-primary mb-2">Emergency Request Received</h3>
        <p className="text-gray-700">An admin has been alerted and will coordinate with you via phone immediately.</p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({...formData, patientName: '', attendantPhone: '', hospital: ''});
          }}
          className="mt-6 text-sm text-gray-500 underline hover:text-gray-700"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden border-t-4 border-primary">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Emergency Blood Request</h2>
        <p className="text-sm text-gray-500 mt-1">Please fill this out accurately for urgent dispatch.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name <span className="text-red-500">*</span></label>
            <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="Full Name" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Required <span className="text-red-500">*</span></label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none bg-white">
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendant Phone <span className="text-red-500">*</span></label>
              <input required type="tel" pattern="[0-9]{11}" name="attendantPhone" value={formData.attendantPhone} onChange={handleChange} title="Phone number must be exactly 11 digits" className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="03XXXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Location <span className="text-red-500">*</span></label>
            <input required type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="E.g. Civil Hospital, Khuzdar" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level <span className="text-red-500">*</span></label>
            <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none bg-white">
              <option value="high">High (Within 24 hours)</option>
              <option value="critical">Critical (Immediate)</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="pt-4">
            <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                   Dispatching...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Dispatch Request
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmergencyForm;
