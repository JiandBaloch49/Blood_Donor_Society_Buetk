import React, { useState } from 'react';
import { Droplet, Menu, X } from 'lucide-react';
import logo from './image.png';

const Navbar = ({ activeForm, setActiveForm }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (formName) => {
    setActiveForm(formName);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <button onClick={() => handleNavClick(null)} className="flex items-center gap-2 md:gap-2.5 flex-shrink-0 focus:outline-none">
            <img 
              src={logo} 
              alt="Blood Donor Society BUETK Logo" 
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover shadow-sm border-2 border-white/10"
            />
            <div className="flex flex-col items-start font-['Inter',_'Poppins',_sans-serif] text-left justify-center">
              <span className={`font-bold text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide leading-none ${activeForm === null ? 'text-white drop-shadow-sm' : 'text-[#1E293B]'}`}>
                Blood Donor
              </span>
              <span className={`font-medium text-xs sm:text-sm md:text-base lg:text-lg tracking-widest leading-tight mt-0.5 lg:mt-1 ${activeForm === null ? 'text-white/90 drop-shadow-sm' : 'text-[#1E293B]/80'}`}>
                SOCIETY BUETK
              </span>
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavClick(null)} 
              className={`${activeForm === null ? 'text-primary font-bold' : 'text-gray-600'} hover:text-primary font-medium transition-colors`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('emergency')} 
              className={`${activeForm === 'emergency' ? 'text-primary font-bold' : 'text-gray-600'} hover:text-primary font-medium transition-colors`}
            >
              Emergency Request
            </button>
            <button 
              onClick={() => handleNavClick('register')} 
              className={`${activeForm === 'register' ? 'text-primary font-bold' : 'text-gray-600'} hover:text-primary font-medium transition-colors`}
            >
              Register as Donor
            </button>
            <button 
              onClick={() => handleNavClick('about')} 
              className={`${activeForm === 'about' ? 'text-primary font-bold' : 'text-gray-600'} hover:text-primary font-medium transition-colors`}
            >
              About Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu} 
              className="text-gray-600 hover:text-primary focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto shadow-lg relative z-50">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            <button 
              onClick={() => handleNavClick(null)}
              className="block w-full px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md border-b border-gray-50 text-center"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('emergency')}
              className="block w-full px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md border-b border-gray-50 text-center"
            >
              Emergency Request
            </button>
            <button 
              onClick={() => handleNavClick('register')}
              className="block w-full px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md border-b border-gray-50 text-center"
            >
              Register as Donor
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className="block w-full px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md text-center"
            >
              About Us
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
