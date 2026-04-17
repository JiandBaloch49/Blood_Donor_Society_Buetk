import React from 'react';
import { Droplet, Heart, MapPin, Mail, Phone, Award } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0F172A] text-white py-20 px-4 sm:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* Brand Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Droplet className="w-6 h-6 text-white fill-white/20" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight leading-none uppercase">Blood Donor</h3>
                <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] mt-1 italic">SOCIETY BUETK</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-medium pr-4">
              An elite institutional network dedicated to life-saving blood coordination through rapid intelligence and community engagement.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
                <Award className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
                <Heart className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </div>
            </div>
          </div>

          {/* Quick Connect */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 underline decoration-2 underline-offset-8">Quick Connect</h4>
            <ul className="space-y-4">
              <li><button className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"><div className="w-1.5 h-[2px] bg-primary group-hover:w-4 transition-all"></div> Home Portal</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"><div className="w-1.5 h-[2px] bg-primary group-hover:w-4 transition-all"></div> Emergency Request</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"><div className="w-1.5 h-[2px] bg-primary group-hover:w-4 transition-all"></div> Register as Donor</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group"><div className="w-1.5 h-[2px] bg-primary group-hover:w-4 transition-all"></div> Society Bylaws</button></li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 underline decoration-2 underline-offset-8">HQ Intelligence</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <span className="text-gray-400 text-sm font-medium">BUETK Campus,<br />Khuzdar, Balochistan</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">support@buetk.edu.pk</span>
              </li>
            </ul>
          </div>

          {/* Network Status */}
          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Network Health</h4>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500">All Systems Operational</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
              Real-time synchronization active with central blood bank infrastructure.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
