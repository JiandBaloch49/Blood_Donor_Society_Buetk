import React, { useState } from 'react';
import { useToast } from './ui/ToastProvider';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bloodGroup: 'A+',
    userType: 'student',
    rollNumber: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 11 || !/^\d+$/.test(formData.phone)) {
       toast.error('Phone number must be exactly 11 digits');
       return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/public/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        toast.success(data.message || 'Registration successful');
      } else {
        toast.error(data.message || 'Failed to submit registration');
      }
    } catch (err) {
      console.error('Failed to submit registration:', err);
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
      <div className="p-8 text-center bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-xl font-semibold text-green-700 mb-2">Registration Submitted</h3>
        <p className="text-green-600">An admin will contact you shortly to verify your details.</p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({...formData, phone: '', firstName: '', lastName: '', address: '', rollNumber: ''});
          }}
          className="mt-6 text-sm text-gray-500 underline hover:text-gray-700"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="bg-primary text-white p-6">
        <h2 className="text-2xl font-semibold">Register As Donor</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        {/* Toggle User Type */}
        <div className="mb-6 flex gap-4 p-1 bg-gray-100 rounded-lg w-max">
          <button
            type="button"
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${formData.userType === 'student' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setFormData({...formData, userType: 'student'})}
          >
            Student
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${formData.userType === 'resident' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setFormData({...formData, userType: 'resident'})}
          >
            Khuzdar Resident
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="First" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="Last" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="font-normal text-xs text-gray-400">(11 digits)</span> <span className="text-red-500">*</span></label>
            <input required type="tel" pattern="[0-9]{11}" name="phone" value={formData.phone} onChange={handleChange} title="Phone number must be exactly 11 digits" className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="03XXXXXXXXX" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group <span className="text-red-500">*</span></label>
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

          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Address / Street / Department <span className="text-red-500">*</span></label>
             <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder={formData.userType === 'resident' ? "Enter Full Address" : "Enter Hostel / Department"} />
          </div>

          {formData.userType === 'student' && (
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
               <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 22BSCS05" />
            </div>
          )}

          <div className="md:col-span-2 mt-4">
            <button disabled={isSubmitting} type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center">
              {isSubmitting ? (
                <div className="flex justify-center items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  Submitting...
                </div>
              ) : 'Submit Registration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
