import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RegistrationForm from '../components/RegistrationForm';
import EmergencyForm from '../components/EmergencyForm';
import { Droplet, Phone, User, CheckCircle, XCircle } from 'lucide-react';

const LandingPage = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/public/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        } else {
          setMembersError('Could not load members');
        }
      } catch (err) {
        setMembersError('Backend unreachable');
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className={`min-h-screen font-sans flex flex-col ${activeForm === null ? 'bg-white' : 'bg-gray-50'}`}>

      {activeForm === null ? (
        <>
          {/*
            ── HERO ZONE ──
            • NO overflow-hidden so the blob's bottom tail is fully visible
            • Tall enough (minHeight 640px) to let the blob show its full curve
            • Navbar lives INSIDE here so blob starts from the very top-left
          */}
          <div className="relative w-full" style={{ minHeight: '640px' }}>

            {/* SVG Blob — behind everything, starts from top of page */}
            <div
              className="absolute z-0 pointer-events-none"
              style={{ width: '960px', height: '680px', left: '-210px', top: '-40px' }}
            >
              <svg
                viewBox="0 0 1440 1052"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <g filter="url(#filter1_d_1705_180)">
                  <path
                    d="M1381.48 890.956C1217.37 775.365 792.518 1044 515.516 1044C238.513 1044 13.9585 810.293 13.9585 522C13.9585 233.707 238.513 0 515.516 0C792.518 0 1626.57 1063.58 1381.48 890.956Z"
                    fill="url(#paint0_linear_1705_180)"
                  />
                </g>
                <defs>
                  <filter id="filter1_d_1705_180" x="9.9585" y="0" width="1420.04" height="1052" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.647059 0 0 0 0 0.643137 0 0 0 0 0.643137 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1705_180" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1705_180" result="shape" />
                  </filter>
                  <linearGradient id="paint0_linear_1705_180" x1="325.389" y1="82.4479" x2="850.428" y2="938.039" gradientUnits="userSpaceOnUse">
                    <stop offset="0.221679" stopColor="#B32323" />
                    <stop offset="0.66922" stopColor="#6A0E0B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Navbar — sits on top of blob (z-20) */}
            <div className="relative z-20 w-full">
              <Navbar activeForm={activeForm} setActiveForm={setActiveForm} />
            </div>

            {/* Hero layout: text left (on blob), buttons right */}
            <div className="relative z-10 flex flex-col lg:flex-row w-full" style={{ minHeight: '540px' }}>

              {/* Desktop: text overlaid on blob */}
              <div
                className="hidden lg:flex absolute inset-y-0 left-0 items-center justify-center text-center pointer-events-none"
                style={{ width: '42%' }}
              >
                <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-xl">
                  <span className="block">Give Blood</span>
                  <span className="block mt-3">Give Life</span>
                </h1>
              </div>

              {/* Mobile: text block */}
              <div className="lg:hidden w-full flex items-center justify-center px-6 py-20">
                <div className="text-white text-center">
                  <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight drop-shadow-xl">
                    <span className="block">Give Blood</span>
                    <span className="block mt-3">Give Life</span>
                  </h1>
                </div>
              </div>

              {/* Desktop spacer */}
              <div className="hidden lg:block lg:w-1/2" />

              {/* Right: Action buttons */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-6 pb-10 lg:p-12 bg-white lg:bg-transparent">
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
              </div>
            </div>
          </div>

          {/* ── SOCIETY MEMBERS SECTION — flows naturally below the hero ── */}
          <section className="w-full bg-white py-14 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Available Society Members</h2>
                <p className="text-gray-500 mt-2 text-sm">Contact any available member below for direct assistance.</p>
                <div className="mt-4 w-16 h-1 bg-primary rounded-full mx-auto"></div>
              </div>

              {membersLoading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              )}
              {!membersLoading && membersError && (
                <p className="text-center text-gray-400 py-8">{membersError}</p>
              )}
              {!membersLoading && !membersError && members.length === 0 && (
                <p className="text-center text-gray-400 py-8">No available members at the moment.</p>
              )}
              {!membersLoading && members.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {members.map(member => (
                    <div key={member._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm leading-tight">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role || 'Volunteer'}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {member.isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {member.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="font-mono">{member.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* ── FOCUSED FORM VIEW ── */
        <>
          <div className="relative z-20 w-full bg-white shadow-sm">
            <Navbar activeForm={activeForm} setActiveForm={setActiveForm} />
          </div>
          <div className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-12 w-full overflow-y-auto animate-in fade-in duration-500">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-12 my-4">
              <button
                onClick={() => setActiveForm(null)}
                className="mb-8 text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors w-max"
              >
                &larr; Back to home
              </button>
              <div className="w-full">
                {activeForm === 'register' && <RegistrationForm />}
                {activeForm === 'emergency' && <EmergencyForm />}
                {activeForm === 'about' && (
                  <div className="w-full">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Blood Donor Society BUETK</h2>
                    <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                      <p>The Blood Donor Society BUETK is a student-led initiative dedicated to ensuring that no life is lost due to a shortage of blood in critical moments.</p>
                      <p>Operating with a strict verification process, we bridge the gap between voluntary blood donors and patients in emergency situations, maximizing trust, privacy, and efficiency.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-4xl font-bold text-primary mb-2">500+</div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Donors</div>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Support</div>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 hidden sm:block">
                        <div className="text-4xl font-bold text-primary mb-2">100%</div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Verified</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LandingPage;
