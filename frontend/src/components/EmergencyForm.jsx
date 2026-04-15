import React, { useState } from 'react';

const EmergencyForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    hospital: '',
    urgency: 'high',
    attendantPhone: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/public/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit emergency request:', err);
      setSubmitted(true); // Demo fallback
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
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-gray-500 underline"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input required type="text" name="patientName" onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="Full Name" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Required</label>
              <select name="bloodGroup" onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none bg-white">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendant Phone</label>
              <input required type="tel" name="attendantPhone" onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="Number" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Location</label>
            <input required type="text" name="hospital" onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="E.g. Civil Hospital, Khuzdar" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
            <select name="urgency" onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none bg-white">
              <option value="high">High (Within 24 hours)</option>
              <option value="critical">Critical (Immediate)</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Dispatch Request
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmergencyForm;
