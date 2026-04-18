import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RegistrationForm from '../components/RegistrationForm';
import EmergencyForm from '../components/EmergencyForm';
import Footer from '../components/Footer';
import { Droplet, Phone, User, CheckCircle, XCircle, Activity, Building2, Clock, ChevronRight } from 'lucide-react';
import { fetchWithRetry, API_BASE } from '../api';
import { CardSkeleton } from '../components/ui/Skeleton';

const LandingPage = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setMembersLoading(true);
      setRequestsLoading(true);

      // Parallel fetches for performance
      try {
        const [membersData, requestsData] = await Promise.all([
          fetchWithRetry(`${API_BASE}/api/public/members`),
          fetchWithRetry(`${API_BASE}/api/public/requests`)
        ]);
        setMembers(membersData);
        setRequests(requestsData);
      } catch (err) {
        console.error('Fetch error:', err);
        setMembersError('System sync issue detected.');
        setRequestsError('Active feed currently unavailable.');
      } finally {
        setMembersLoading(false);
        setRequestsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${activeForm === null ? 'bg-white' : 'bg-gray-50'}`}>

      {activeForm === null ? (
        <>
          {/* Unified Top Section: Navbar + Hero */}
          <section className="relative w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[90vh] flex flex-col">

            {/* SVG Background — absolute, z-0, anchors to left on desktop and center on mobile */}
            <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
              <svg
                viewBox="600 100 1440 1052"
                preserveAspectRatio="xMinYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block"
              >
                <defs>
                  <filter id="hero_filter_shadow" x="9.9585" y="0" width="1420.04" height="1052" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.647 0 0 0 0 0.643 0 0 0 0 0.643 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1705_180" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1705_180" result="shape" />
                  </filter>
                  <linearGradient id="hero_grad_maroon" x1="325.389" y1="82.4479" x2="850.428" y2="938.039" gradientUnits="userSpaceOnUse">
                    <stop offset="0.22" stopColor="#B32323" />
                    <stop offset="0.67" stopColor="#6A0E0B" />
                  </linearGradient>
                </defs>
                <g filter="url(#hero_filter_shadow)">
                  <path
                    d="M1381.48 890.956C1217.37 775.365 792.518 1044 515.516 1044C238.513 1044 13.9585 810.293 13.9585 522C13.9585 233.707 238.513 0 515.516 0C792.518 0 1626.57 1063.58 1381.48 890.956Z"
                    fill="url(#hero_grad_maroon)"
                  />
                </g>
              </svg>
            </div>

            {/* Navbar — Layered at z-50 */}
            <div className="relative z-50 w-full">
              <Navbar activeForm={activeForm} setActiveForm={setActiveForm} />
            </div>

            {/* Hero Content — Layered at z-10, takes remaining space */}
            <div className="relative z-10 flex-grow flex flex-col lg:flex-row h-full">

              {/* Left — Headline text, visually contained by SVG shape */}
              <div className="flex-1 flex items-center justify-center lg:justify-start px-8 sm:px-12 lg:px-20 text-center lg:text-left animate-in slide-in-from-left duration-700">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg">
                    <span className="block">Give Blood</span>
                    <span className="block mt-1 sm:mt-2">Give Life</span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base lg:text-lg text-white/80 font-medium max-w-md leading-relaxed">
                    Join BUETK's elite coordination network. Real-time intelligence bridging donors and emergency needs.
                  </p>
                </div>
              </div>

              {/* Right — CTA Buttons */}
              <div className="flex-1 flex items-center justify-center lg:justify-start px-8 sm:px-12 lg:px-20 pb-12 lg:pb-0 animate-in fade-in slide-in-from-right duration-700">
                <div className="flex flex-col gap-5 w-full max-w-sm lg:max-w-xs">
                  <button
                    onClick={() => setActiveForm('emergency')}
                    className="w-full lg:w-auto py-5 lg:px-10 bg-primary hover:bg-primary-hover text-white text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Droplet className="w-5 h-5 fill-white/20" />
                    Emergency Request
                  </button>
                  <button
                    onClick={() => setActiveForm('register')}
                    className="w-full lg:w-auto py-5 lg:px-10 bg-white text-primary border-2 border-primary/10 hover:border-primary/30 hover:bg-primary hover:text-white text-lg font-black rounded-2xl shadow-xl transition-all active:scale-95"
                  >
                    Become a Donor
                  </button>
                </div>
              </div>

            </div>

          </section>

          {/* Members Directory */}
          <section className="w-full bg-white py-24 px-4 sm:px-8 border-t border-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 px-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <div className="w-8 h-[2px] bg-primary"></div>
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Network Intelligence</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">Available Society Members</h2>
                  <p className="text-gray-500 mt-4 text-lg font-medium">Real-time engagement directory for institutional support and emergency coordination.</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">LIVE READY</span>
                  </div>
                </div>
              </div>

              {membersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : membersError ? (
                <div className="text-center py-24 bg-red-50 rounded-[3rem] border border-red-100 px-8 max-w-2xl mx-auto animate-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 font-black text-2xl mb-2 tracking-tight">{membersError}</p>
                  <p className="text-gray-500 font-medium">Our synchronization servers are currently busy. Please refresh.</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-gray-100 border-dashed max-w-2xl mx-auto">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">System Idle: No Members In Field</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {members.map(member => (
                    <div
                      key={member._id}
                      className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all p-8 flex flex-col relative"
                    >
                      {/* Availability Tag */}
                      <div className="absolute top-6 right-6">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${member.isAvailable ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${member.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          {member.isAvailable ? 'Ready' : 'In Field'}
                        </span>
                      </div>

                      <div className="mb-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all group-hover:rotate-6">
                          <User className="w-8 h-8 text-gray-300 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{member.name}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 italic">{member.role || 'Operational Member'}</p>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Secure Line</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="w-1 h-1 bg-primary/20 rounded-full"></div>)}
                          </div>
                        </div>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center justify-between gap-3 w-full bg-gray-50 hover:bg-primary group-hover:bg-primary group-hover:text-white text-gray-900 font-black py-5 px-6 rounded-[1.8rem] transition-all active:scale-95 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20"
                        >
                          <span className="font-mono text-sm tracking-tight">{member.phone}</span>
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Phone className="w-4 h-4" />
                          </div>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Emergency Intel Feed */}
          <section className="w-full bg-[#F8FAFC] py-32 px-4 sm:px-8 border-t border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50"></div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16 px-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Emergency Intel</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto">Active Critical Requests</h2>
                <p className="text-gray-500 mt-6 text-lg font-medium max-w-xl mx-auto">Priority cases requiring immediate logistical support and blood unit coordination.</p>
              </div>

              {requestsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : requestsError ? (
                <div className="text-center py-16 bg-white rounded-[3rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] px-8 leading-relaxed italic">{requestsError}</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[3rem] border border-gray-100 border-dashed max-w-2xl mx-auto">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-green-600 font-black uppercase tracking-widest text-xs">No active critical emergencies</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {requests.map(req => (
                    <div
                      key={req._id}
                      className={`bg-white rounded-[2rem] p-6 border-2 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col group ${req.urgency === 'critical' ? 'border-primary shadow-primary/5' :
                        req.urgency === 'high' ? 'border-orange-500 shadow-orange-500/5' : 'border-gray-50'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 px-2.5 py-1 rounded-full w-fit ${req.urgency === 'critical' ? 'bg-primary text-white animate-pulse' :
                            req.urgency === 'high' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {req.urgency}
                          </span>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight mt-1 truncate max-w-[150px]">{req.displayName}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black tracking-tighter shrink-0 ${req.urgency === 'critical' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-900 border border-gray-100'
                          }`}>
                          {req.bloodGroup}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <Building2 className="w-4 h-4 text-gray-300 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                            <p className="text-xs font-bold text-gray-700 leading-tight line-clamp-1">{req.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <Clock className="w-4 h-4 text-gray-300" />
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time</p>
                            <p className="text-xs font-bold text-gray-700 leading-tight">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <a href={`tel:${req.attendantPhone}`} className="flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 transition-colors group/phone">
                          <Phone className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-0.5">Contact Line</p>
                            <p className="text-sm font-black text-primary font-mono tracking-tighter">{req.attendantPhone}</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <Footer setActiveForm={setActiveForm} />
        </>
      ) : (
        /* Form View */
        <div className="flex flex-col flex-1">
          <div className="relative z-20 w-full bg-white shadow-xl">
            <Navbar activeForm={activeForm} setActiveForm={setActiveForm} />
          </div>
          <div className="flex-1 flex items-start justify-center p-4 sm:p-8 lg:p-14 w-full overflow-y-auto animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl border border-gray-50 p-6 sm:p-10 lg:p-14 relative">
              <button
                onClick={() => setActiveForm(null)}
                className="mb-10 text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 transition-all hover:-translate-x-1"
              >
                &larr; BACK TO HOME
              </button>
              <div className="w-full">
                {activeForm === 'register' && <RegistrationForm />}
                {activeForm === 'emergency' && <EmergencyForm />}
                {activeForm === 'about' && (
                  <div className="w-full animate-in slide-in-from-bottom duration-700">
                    <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Society Mission</h2>
                    <div className="space-y-6 text-gray-600 text-xl leading-relaxed font-medium">
                      <p>The Blood Donor Society BUETK is an elite student initiative dedicated to saving lives through community-driven blood coordination.</p>
                      <p>Our platform uses advanced validation and real-time tracking to bridge the gap between donors and emergency needs.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center hover:bg-white hover:shadow-xl transition-all group">
                        <div className="text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform">500+</div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Verified Donors</div>
                      </div>
                      <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center hover:bg-white hover:shadow-xl transition-all group">
                        <div className="text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform">24/7</div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Rapid Support</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;