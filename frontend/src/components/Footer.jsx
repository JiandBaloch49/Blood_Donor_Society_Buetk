import React from 'react';
import logo from './sds.jpeg';

const Footer = ({ setActiveForm }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <img
            src={logo}
            alt="BUETK Blood Logo"
            className="h-10 w-auto object-contain cursor-pointer"
            onClick={() => setActiveForm && setActiveForm(null)}
          />
          <p className="text-slate-500 text-[11px] font-medium tracking-wide">
            © {currentYear} Students Deverloper Society, BUET Khuzdar. All rights reserved.
          </p>
        </div>

        {/* Right Side: Simple Links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveForm && setActiveForm(null)}
            className="text-slate-500 hover:text-red-800 text-sm font-bold transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => setActiveForm && setActiveForm('emergency')}
            className="text-slate-500 hover:text-red-800 text-sm font-bold transition-colors"
          >
            Emergency Request
          </button>
          <button
            onClick={() => setActiveForm && setActiveForm('register')}
            className="text-slate-500 hover:text-red-800 text-sm font-bold transition-colors"
          >
            Register
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
