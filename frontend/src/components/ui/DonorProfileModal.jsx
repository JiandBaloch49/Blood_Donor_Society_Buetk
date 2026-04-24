import React, { useState, useEffect } from 'react';
import {
  X, User, Phone, Droplets, Award, Clock, Calendar,
  TrendingUp, ClipboardList, AlertCircle, CheckCircle
} from 'lucide-react';
import { fetchWithRetry, API_BASE } from '../../api';
import { useToast } from './ToastProvider';
import { TableRowSkeleton } from './Skeleton';

const BLOOD_GROUP_COLORS = {
  'A+': 'bg-red-100 text-red-700 border-red-200',
  'A-': 'bg-rose-100 text-rose-700 border-rose-200',
  'B+': 'bg-orange-100 text-orange-700 border-orange-200',
  'B-': 'bg-amber-100 text-amber-700 border-amber-200',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-violet-100 text-violet-700 border-violet-200',
  'O+': 'bg-blue-100 text-blue-700 border-blue-200',
  'O-': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const DonorProfileModal = ({ donorId, donorName, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!donorId) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithRetry(`${API_BASE}/api/admin/donors/${donorId}`);
        setProfile(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load donor profile');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [donorId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-[2rem] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#8B0000] to-[#c0392b] p-6 sm:p-8 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-7 w-48 bg-white/20 rounded-xl" />
              <div className="h-4 w-32 bg-white/10 rounded-lg" />
            </div>
          ) : profile ? (
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black tracking-tight truncate">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-3.5 h-3.5 opacity-70" />
                  <span className="font-mono text-sm opacity-90">{profile.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Blood Group Badge */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border bg-white/90 ${BLOOD_GROUP_COLORS[profile.bloodGroup] || 'text-gray-700'}`}>
                    <Droplets className="w-3 h-3" />
                    {profile.bloodGroup}
                  </span>
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${profile.status === 'Available'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                  }`}>
                    {profile.status === 'Available'
                      ? <CheckCircle className="w-3 h-3" />
                      : <AlertCircle className="w-3 h-3" />
                    }
                    {profile.status}
                  </span>
                  {/* Priority Badge */}
                  {profile.priorityRank && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-yellow-100 text-yellow-800 border border-yellow-300">
                      <Award className="w-3 h-3" />
                      Priority #{profile.priorityRank}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Stats Row */}
        {!isLoading && profile && (
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 flex-shrink-0">
            <div className="p-4 text-center">
              <div className="text-2xl font-black text-gray-900">{profile.totalDonations ?? 0}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mt-0.5">Donations</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sm font-black text-gray-900">{formatDate(profile.lastDonated)}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mt-0.5">Last Donated</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-black text-gray-900">
                {daysSince(profile.lastDonated) !== null ? `${daysSince(profile.lastDonated)}d` : '—'}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mt-0.5">Days Since</div>
            </div>
          </div>
        )}

        {/* Donation History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-500">Donation History</h3>
            {!isLoading && profile && (
              <span className="ml-auto text-xs font-black bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                {profile.donationHistory?.length ?? 0} cases
              </span>
            )}
          </div>

          {isLoading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={4} />
                ))}
              </tbody>
            </table>
          ) : profile?.donationHistory?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <ClipboardList className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Cases Logged</p>
              <p className="text-xs text-gray-300 mt-1">Cases will appear here once this donor is assigned to one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-4 py-3 text-center">Group</th>
                    <th className="px-4 py-3">Hospital</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {profile.donationHistory.map((cas) => (
                    <tr key={cas._id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{cas.patientName}</div>
                        {cas.patientAge && (
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Age {cas.patientAge}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-black border ${BLOOD_GROUP_COLORS[cas.bloodGroupRequired] || 'bg-gray-100 text-gray-600'}`}>
                          {cas.bloodGroupRequired}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-600 font-medium">{cas.hospital || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-600 font-mono">{formatDate(cas.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-500">{cas.purpose || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorProfileModal;
