import React, { useState, useEffect } from 'react';
import { useToast } from './ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../api';

const RegistrationForm = () => {
  // Load initial state from localStorage if available
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('registration_form_draft');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      bloodGroup: 'A+',
      userType: 'student',
      rollNumber: '',
    };
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Auto-save form data on change
  useEffect(() => {
    localStorage.setItem('registration_form_draft', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 11 || !/^\d+$/.test(formData.phone)) {
       toast.error('Phone number must be exactly 11 digits');
       return;
    }
    setIsSubmitting(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/public/donors`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setSubmitted(true);
      localStorage.removeItem('registration_form_draft'); // Clear draft on success
      toast.success(data.message || 'Registration successful');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="p-10 text-center bg-green-50 border border-green-100 rounded-[2rem] animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-2xl font-black text-green-800 mb-3">Registration Received</h3>
        <p className="text-green-700/80 font-medium leading-relaxed max-w-sm mx-auto">
          Thank you for joining. An admin will verify your details and contact you shortly.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({
              firstName: '',
              lastName: '',
              phone: '',
              address: '',
              bloodGroup: 'A+',
              userType: 'student',
              rollNumber: '',
            });
          }}
          className="mt-8 text-sm font-bold text-green-600 hover:text-green-800 transition-colors bg-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-95"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Become a Donor</h2>
        <p className="text-gray-500 font-medium mt-1">Join our network of life-savers.</p>
        <div className="mt-4 w-12 h-1 bg-primary rounded-full"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Toggle User Type */}
        <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-max">
          <button
            type="button"
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.userType === 'student' ? 'bg-white shadow-xl text-primary scale-100' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setFormData({...formData, userType: 'student'})}
          >
            Student
          </button>
          <button
            type="button"
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.userType === 'resident' ? 'bg-white shadow-xl text-primary scale-100' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setFormData({...formData, userType: 'resident'})}
          >
            Resident
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">First Name</label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="First Name" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Last Name</label>
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="Last Name" />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone (11 Digits)</label>
            <input required type="tel" pattern="[0-9]{11}" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-mono" placeholder="03XXXXXXXXX" />
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Blood Group</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat appearance-none font-bold">
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

          <div className="sm:col-span-2">
             <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{formData.userType === 'resident' ? "Home Address" : "Hostel / Department"}</label>
             <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder={formData.userType === 'resident' ? "Enter full street address" : "Enter hostel name or department"} />
          </div>

          {formData.userType === 'student' && (
            <div className="sm:col-span-2">
               <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Roll Number</label>
               <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-mono" placeholder="e.g. 22BSCS05" />
            </div>
          )}

          <div className="sm:col-span-2 pt-4">
            <button 
              disabled={isSubmitting} 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center text-lg uppercase tracking-widest"
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  Processing...
                </div>
              ) : 'Finalize Registration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
