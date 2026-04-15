import React, { useState } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import EmergencyForm from '../components/EmergencyForm';
import { Droplet } from 'lucide-react';

const LandingPage = () => {
  const [activeForm, setActiveForm] = useState(null); // 'register' or 'emergency'

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="w-full py-6 px-10 flex justify-between items-center bg-white border-b border-gray-100 z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Droplet className="text-primary w-8 h-8 fill-primary/20" />
          <span className="font-bold text-gray-900 text-lg hidden sm:block">BD Platform</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="text-gray-900 font-semibold border-b-2 border-primary pb-1">Home</a>
          <a href="#" className="hover:text-primary transition-colors">About Us</a>
          <a href="#" className="hover:text-primary transition-colors">Find Blood</a>
          <a href="#" className="hover:text-primary transition-colors">Register Now</a>
        </div>

        <div>
          <button className="border-2 border-primary text-primary px-6 py-2 rounded-md font-semibold hover:bg-primary/5 transition-colors text-sm">
            Log In
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Left Side: Maroon Wave Panel */}
        <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-full flex items-center justify-center p-10 overflow-hidden bg-white">
          {/* SVG Wave Background mimicking the image */}
          <div className="absolute inset-0 z-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[120%] -mt-10" fill="#800000">
               <path d="M0,0 L100,0 C60,40 100,60 50,100 L0,100 Z" />
            </svg>
          </div>
          
          <div className="z-10 text-white relative lg:-mt-20">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight drop-shadow-lg">
              Give Blood<br/>
              Give Life
            </h1>
          </div>
        </div>

        {/* Right Side: Actions and Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white lg:bg-transparent">
          
          {!activeForm ? (
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <button 
                onClick={() => setActiveForm('emergency')}
                className="w-full bg-primary hover:bg-primary-hover text-white text-lg font-bold py-5 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <Droplet className="w-6 h-6 fill-white/20" />
                Emergency Request
              </button>
              
              <button 
                onClick={() => setActiveForm('register')}
                className="w-full bg-primary hover:bg-primary-hover text-white text-lg font-bold py-5 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Register as Donor
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setActiveForm(null)}
                className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                &larr; Back to home
              </button>
              
              {activeForm === 'register' && <RegistrationForm />}
              {activeForm === 'emergency' && <EmergencyForm />}
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
};

export default LandingPage;
