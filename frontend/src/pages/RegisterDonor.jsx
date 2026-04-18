import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RegistrationForm from '../components/RegistrationForm';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ChevronLeft } from 'lucide-react';

const RegisterDonor = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      <SEO 
        title="Register as a Blood Donor | Blood Donor Society Buetk" 
        description="Join the largest network of blood donors in Khuzdar. Register as a university student or city resident and help save lives in emergencies."
        keywords="Register Blood Donor Khuzdar, BUETK Blood Donor Registration, Donate Blood Balochistan"
      />
      
      <Navbar activeForm="register" setActiveForm={() => {}} />

      <main className="flex-grow flex flex-col items-center justify-center p-4 py-12 md:py-20 animate-in fade-in duration-500">
        <div className="w-full max-w-2xl mb-8">
            <h1 className="sr-only">Register as a Blood Donor - BUETK Khuzdar</h1>
            <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Command Center
            </Link>
        </div>
        
        <RegistrationForm />
      </main>

      <Footer />
    </div>
  );
};

export default RegisterDonor;
