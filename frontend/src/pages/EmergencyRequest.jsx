import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmergencyForm from '../components/EmergencyForm';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ChevronLeft } from 'lucide-react';

const EmergencyRequest = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50">
      <SEO 
        title="Request Emergency Blood in Khuzdar | Fast Match" 
        description="Need blood urgently at Civil Hospital or anywhere in Khuzdar? Submit an emergency request to our network of active donors instantly."
        keywords="Emergency Blood Request Khuzdar, Need Blood Khuzdar, Civil Hospital Khuzdar Blood"
      />
      
      <Navbar activeForm="emergency" setActiveForm={() => {}} />

      <main className="flex-grow flex flex-col items-center justify-center p-4 py-12 md:py-20 animate-in fade-in duration-500">
        <div className="w-full max-w-2xl mb-8">
            <h1 className="sr-only">Request Emergency Blood in Khuzdar</h1>
            <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Command Center
            </Link>
        </div>
        
        <EmergencyForm />
      </main>

      <Footer />
    </div>
  );
};

export default EmergencyRequest;
