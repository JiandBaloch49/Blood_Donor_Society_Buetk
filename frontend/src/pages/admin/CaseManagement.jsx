import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, X, ClipboardList, User, Phone, Droplets,
  Building2, Calendar, Clock, Search, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Info, UserCircle2, Eye,
  Stethoscope, MapPin, Activity, Hash, Layers
} from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMPTY_FORM = {
  patientName: '',
  patientAge: '',
  bloodGroupRequired: 'A+',
  hbLevel: '',
  unitsRequired: '',
  time: '',
  date: new Date().toISOString().split('T')[0],
  hospital: '',
  pickAndDrop: false,
  exchangePossible: false,
  purpose: '',
  attendantName: '',
  attendantPhone: '',
  attendantResidence: '',
  donorId: '',
  donorName: '',
  donorPhone: '',
};

const FormField = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">{hint}</p>}
  </div>
);

const inputClass = "w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none placeholder:text-gray-300";
const selectClass = `${inputClass} cursor-pointer font-semibold`;

/* ─── Case Detail Modal ─── */
const CaseDetailModal = ({ cas, onClose }) => {
  if (!cas) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const Row = ({ icon: Icon, label, value, mono }) => (
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          <p className={`text-sm font-semibold text-gray-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 mb-8">

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-black text-primary">{cas.patientName?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{cas.patientName}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-red-50 text-primary border border-red-100">
                  {cas.bloodGroupRequired}
                </span>
                {cas.patientAge && (
                  <span className="text-[10px] font-medium text-gray-500">Age {cas.patientAge}</span>
                )}
                {cas.purpose && (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-gray-100 text-gray-600">
                    {cas.purpose}
                  </span>
                )}
                {cas.pickAndDrop && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">P&D</span>
                )}
                {cas.exchangePossible && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase">Exchange</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Patient Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Patient Information
            </h4>
            <div className="bg-gray-50/60 rounded-2xl px-4 py-1">
              <Row icon={Activity} label="Hb Level" value={cas.hbLevel ? `${cas.hbLevel} g/dL` : null} />
              <Row icon={Layers} label="Units Required" value={cas.unitsRequired} />
              <Row icon={Building2} label="Hospital / Clinic" value={cas.hospital} />
              <Row icon={Calendar} label="Date" value={formatDate(cas.date)} />
              <Row icon={Clock} label="Time" value={cas.time} />
            </div>
          </div>

          {/* Attendant Section */}
          {(cas.attendantName || cas.attendantPhone || cas.attendantResidence) && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Attendant
              </h4>
              <div className="bg-gray-50/60 rounded-2xl px-4 py-1">
                <Row icon={User} label="Name" value={cas.attendantName} />
                <Row icon={Phone} label="Phone" value={cas.attendantPhone} mono />
                <Row icon={MapPin} label="Residence" value={cas.attendantResidence} />
              </div>
            </div>
          )}

          {/* Donor Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5" /> Donor
            </h4>
            <div className="bg-gray-50/60 rounded-2xl px-4 py-1">
              {cas.donorName ? (
                <>
                  <Row icon={User} label="Donor Name" value={cas.donorName} />
                  <Row icon={Phone} label="Donor Phone" value={cas.donorPhone} mono />
                </>
              ) : (
                <p className="py-4 text-xs font-medium text-gray-400 text-center">Walk-in / Unassigned</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [donors, setDonors] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isLoading: false });
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  // Detail view
  const [detailCase, setDetailCase] = useState(null);
  // Donor combobox
  const [donorSearch, setDonorSearch] = useState('');
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  // Flash state for auto-filled fields
  const [donorFlash, setDonorFlash] = useState(false);
  const donorComboRef = useRef(null);
  const donorNameRef = useRef(null);
  const { toast } = useToast();

  const fetchDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/donors`);
      setDonors(data);
    } catch (err) {
      toast.error('Failed to load donors');
    } finally {
      setIsLoadingDonors(false);
    }
  };

  const fetchCases = async () => {
    setIsLoadingCases(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/admin/cases`);
      setCases(data);
    } catch (err) {
      toast.error('Failed to load cases');
    } finally {
      setIsLoadingCases(false);
    }
  };

  // Close donor combobox on outside click
  useEffect(() => {
    const handler = (e) => {
      if (donorComboRef.current && !donorComboRef.current.contains(e.target)) {
        setIsDonorOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchDonors();
    fetchCases();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Donor selected from combobox — auto-fill + scroll + flash
  const handleDonorPick = (donor) => {
    if (!donor) {
      setFormData(prev => ({ ...prev, donorId: '', donorName: '', donorPhone: '' }));
      setIsDonorOpen(false);
      return;
    }
    setFormData(prev => ({
      ...prev,
      donorId: donor._id,
      donorName: `${donor.firstName} ${donor.lastName}`,
      donorPhone: donor.phone,
    }));
    setIsDonorOpen(false);
    // Flash the auto-filled section and scroll it into view
    setDonorFlash(true);
    setTimeout(() => setDonorFlash(false), 1800);
    setTimeout(() => {
      donorNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) { toast.error('Patient name is required'); return; }
    if (!formData.date) { toast.error('Date is required'); return; }
    if (formData.attendantPhone && !/^[0-9]{11}$/.test(formData.attendantPhone)) {
      toast.error('Attendant phone must be exactly 11 digits'); return;
    }
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        patientAge: formData.patientAge ? Number(formData.patientAge) : undefined,
        hbLevel: formData.hbLevel ? Number(formData.hbLevel) : undefined,
        donorId: formData.donorId || undefined,
      };
      const newCase = await fetchWithRetry(`${API_BASE}/api/admin/cases`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('Case logged successfully');
      setCases([newCase, ...cases]);
      setIsFormOpen(false);
      setFormData(EMPTY_FORM);
      setShowConfirm(false);
      fetchDonors();
    } catch (err) {
      toast.error(err.message || 'Failed to log case');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModal(m => ({ ...m, isLoading: true }));
    try {
      await fetchWithRetry(`${API_BASE}/api/admin/cases/${deleteModal.id}`, { method: 'DELETE' });
      toast.success('Case deleted');
      setCases(cases.filter(c => c._id !== deleteModal.id));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleteModal({ isOpen: false, id: null, isLoading: false });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredCases = cases.filter(c => {
    const matchSearch = c.patientName?.toLowerCase().includes(search.toLowerCase())
      || c.donorName?.toLowerCase().includes(search.toLowerCase())
      || c.hospital?.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === 'All' || c.bloodGroupRequired === filterGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Case Management</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Log and track all blood donation cases.{' '}
              <span className="text-gray-400">Click a patient name to view full details.</span>
            </p>
          </div>
          <button
            onClick={() => { setIsFormOpen(true); setFormData(EMPTY_FORM); setDonorFlash(false); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-lg active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            Log New Case
          </button>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">

        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative group flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search patient, donor, hospital..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border-transparent placeholder:font-medium"
            />
          </div>
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-transparent transition-all cursor-pointer hover:bg-white"
          >
            <option value="All">All Groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest shrink-0">
            {filteredCases.length} record{filteredCases.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Patient</th>
                <th className="px-4 py-5 text-center">Group</th>
                <th className="px-4 py-5">Hospital</th>
                <th className="px-4 py-5">Donor</th>
                <th className="px-4 py-5">Date</th>
                <th className="px-4 py-5">Purpose</th>
                <th className="px-4 py-5 text-center">Flags</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoadingCases ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={8} />)
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <ClipboardList className="w-12 h-12" />
                      <p className="font-black uppercase tracking-widest text-xs">No Cases Found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCases.map(cas => (
                <tr key={cas._id} className="hover:bg-primary/5 transition-all group/row">
                  {/* Clickable patient name → detail modal */}
                  <td className="px-8 py-5">
                    <button
                      onClick={() => setDetailCase(cas)}
                      className="text-left group/name"
                    >
                      <div className="font-bold text-gray-900 group-hover/name:text-primary transition-colors flex items-center gap-1.5">
                        {cas.patientName}
                        <Eye className="w-3 h-3 text-gray-300 group-hover/name:text-primary opacity-0 group-hover/name:opacity-100 transition-all" />
                      </div>
                      {cas.patientAge && <div className="text-[10px] text-gray-400 font-medium mt-0.5">Age {cas.patientAge}</div>}
                    </button>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-flex items-center justify-center bg-red-50 text-primary font-black px-3 py-1.5 rounded-xl min-w-[3rem] text-[11px] border border-red-100">
                      {cas.bloodGroupRequired}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-sm text-gray-700 font-medium">{cas.hospital || '—'}</span>
                  </td>
                  <td className="px-4 py-5">
                    {cas.donorName ? (
                      <div>
                        <div className="font-bold text-gray-800 text-xs">{cas.donorName}</div>
                        <div className="font-mono text-[10px] text-gray-400 mt-0.5">{cas.donorPhone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-xs font-mono text-gray-600">{formatDate(cas.date)}</span>
                    </div>
                    {cas.time && <div className="text-[10px] text-gray-400 font-medium mt-0.5 pl-5">{cas.time}</div>}
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-xs text-gray-500">{cas.purpose || '—'}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {cas.pickAndDrop && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">P&D</span>
                      )}
                      {cas.exchangePossible && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-wide">EXC</span>
                      )}
                      {!cas.pickAndDrop && !cas.exchangePossible && (
                        <span className="text-gray-200 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: cas._id, isLoading: false })}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all active:scale-95"
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Case Form Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-md"
            onClick={() => { setIsFormOpen(false); setFormData(EMPTY_FORM); }}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 mb-6">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Log Blood Case</h3>
                <p className="text-gray-400 font-medium text-sm mt-0.5">Create a complete hospital record.</p>
              </div>
              <button
                onClick={() => { setIsFormOpen(false); setFormData(EMPTY_FORM); }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-8">

              {/* ── Patient Information ── */}
              <section>
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Patient Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Patient Name" required>
                      <input required name="patientName" value={formData.patientName} onChange={handleFormChange} placeholder="Full name of patient" className={inputClass} />
                    </FormField>
                  </div>
                  <FormField label="Patient Age">
                    <input type="number" name="patientAge" min="0" max="120" value={formData.patientAge} onChange={handleFormChange} placeholder="e.g. 35" className={inputClass} />
                  </FormField>
                  <FormField label="Hb Level (g/dL)">
                    <input type="number" name="hbLevel" step="0.1" min="0" max="25" value={formData.hbLevel} onChange={handleFormChange} placeholder="e.g. 7.2" className={inputClass} />
                  </FormField>
                  <FormField label="Blood Group Required" required>
                    <select name="bloodGroupRequired" value={formData.bloodGroupRequired} onChange={handleFormChange} className={selectClass}>
                      {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Units Required">
                    <input name="unitsRequired" value={formData.unitsRequired} onChange={handleFormChange} placeholder="e.g. 500ml / 1 bag" className={inputClass} />
                  </FormField>
                  <FormField label="Purpose">
                    <input name="purpose" value={formData.purpose} onChange={handleFormChange} placeholder="e.g. Operation, Thalassemia" className={inputClass} />
                  </FormField>
                  <FormField label="Hospital / Clinic">
                    <input name="hospital" value={formData.hospital} onChange={handleFormChange} placeholder="e.g. CMH Khuzdar" className={inputClass} />
                  </FormField>
                  <FormField label="Date" required>
                    <input required type="date" name="date" max={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleFormChange} className={inputClass} />
                  </FormField>
                  <FormField label="Time">
                    <input type="time" name="time" value={formData.time} onChange={handleFormChange} className={inputClass} />
                  </FormField>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <label className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl cursor-pointer transition-colors group">
                    <input type="checkbox" name="pickAndDrop" checked={formData.pickAndDrop} onChange={handleFormChange} className="rounded-lg text-primary h-4 w-4 border-gray-300 focus:ring-primary" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700 transition-colors">Pick &amp; Drop Available</span>
                  </label>
                  <label className="flex items-center gap-3 bg-gray-50 hover:bg-violet-50 px-4 py-3 rounded-xl cursor-pointer transition-colors group">
                    <input type="checkbox" name="exchangePossible" checked={formData.exchangePossible} onChange={handleFormChange} className="rounded-lg text-primary h-4 w-4 border-gray-300 focus:ring-primary" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-violet-700 transition-colors">Exchange Possible</span>
                  </label>
                </div>
              </section>

              {/* ── Attendant Information ── */}
              <section>
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500 mb-4 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Attendant Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Attendant Name">
                    <input name="attendantName" value={formData.attendantName} onChange={handleFormChange} placeholder="Name of attendant" className={inputClass} />
                  </FormField>
                  <FormField label="Attendant Phone" hint="Must be 11 digits if provided">
                    <input name="attendantPhone" value={formData.attendantPhone} onChange={handleFormChange} placeholder="03XXXXXXXXX" className={`${inputClass} font-mono`} maxLength={11} />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Attendant Residence / Location">
                      <input name="attendantResidence" value={formData.attendantResidence} onChange={handleFormChange} placeholder="City, Area or full address" className={inputClass} />
                    </FormField>
                  </div>
                </div>
              </section>

              {/* ── Donor Assignment ── */}
              <section>
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500 mb-4 flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5" /> Donor Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Searchable Donor Combobox */}
                  <div className="sm:col-span-2">
                    <FormField label="Select Donor" hint="Search and select — name & phone auto-fill below">
                      <div ref={donorComboRef} className="relative">

                        {/* Trigger */}
                        <button
                          type="button"
                          onClick={() => { setIsDonorOpen(o => !o); setDonorSearch(''); }}
                          disabled={isLoadingDonors}
                          className={`w-full flex items-center justify-between gap-3 ${inputClass} text-left`}
                        >
                          {formData.donorId ? (
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                                {formData.donorName?.charAt(0)}
                              </span>
                              <span className="font-semibold text-gray-800 truncate">{formData.donorName}</span>
                              {(() => {
                                const d = donors.find(x => x._id === formData.donorId);
                                return d ? (
                                  <span className="inline-flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-50 text-primary border border-red-100">{d.bloodGroup}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${d.status === 'Available' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>{d.status}</span>
                                  </span>
                                ) : null;
                              })()}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-medium">{isLoadingDonors ? 'Loading donors...' : '— Unassigned / Walk-in —'}</span>
                          )}
                          {isDonorOpen
                            ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </button>

                        {/* Dropdown */}
                        {isDonorOpen && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {/* Search */}
                            <div className="p-3 border-b border-gray-50">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="Search by name, blood group, status..."
                                  value={donorSearch}
                                  onChange={e => setDonorSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border-transparent transition-all"
                                />
                              </div>
                            </div>
                            {/* List */}
                            <div className="overflow-y-auto max-h-64">
                              {/* Unassigned */}
                              <button
                                type="button"
                                onClick={() => handleDonorPick(null)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!formData.donorId ? 'bg-primary/5' : ''}`}
                              >
                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                  <UserCircle2 className="w-4 h-4 text-gray-400" />
                                </span>
                                <span className="text-sm font-medium text-gray-400">Unassigned / Walk-in</span>
                                {!formData.donorId && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                              </button>

                              {/* Donor rows */}
                              {donors
                                .filter(d => {
                                  const q = donorSearch.toLowerCase();
                                  return (
                                    `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
                                    d.bloodGroup?.toLowerCase().includes(q) ||
                                    (d.status || '').toLowerCase().includes(q) ||
                                    (d.phone || '').includes(q)
                                  );
                                })
                                .map(d => (
                                  <button
                                    key={d._id}
                                    type="button"
                                    onClick={() => handleDonorPick(d)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-t border-gray-50/70 ${formData.donorId === d._id ? 'bg-primary/5' : ''}`}
                                  >
                                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0">
                                      {d.firstName?.charAt(0)}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                      <span className="block font-semibold text-gray-800 text-sm truncate">
                                        {d.firstName} {d.lastName}
                                        <span className="font-mono text-[10px] text-gray-400 ml-2">{d.phone}</span>
                                      </span>
                                      <span className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-50 text-primary border border-red-100">{d.bloodGroup}</span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${d.status === 'Available' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>{d.status || 'Unknown'}</span>
                                      </span>
                                    </span>
                                    {formData.donorId === d._id && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                                  </button>
                                ))
                              }

                              {/* Empty state */}
                              {donors.filter(d => {
                                const q = donorSearch.toLowerCase();
                                return `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
                                  d.bloodGroup?.toLowerCase().includes(q) ||
                                  (d.status || '').toLowerCase().includes(q) ||
                                  (d.phone || '').includes(q);
                              }).length === 0 && donorSearch && (
                                <div className="py-8 text-center text-gray-300">
                                  <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs font-bold">No donors match "{donorSearch}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormField>
                  </div>

                  {/* Auto-filled fields — flash green when a donor is selected */}
                  <div ref={donorNameRef} className={`transition-all duration-500 rounded-xl ${donorFlash ? 'ring-2 ring-green-400 bg-green-50/40' : ''}`}>
                    <FormField label="Donor Name" hint={donorFlash ? '✓ Auto-filled from selection' : 'Auto-filled when donor selected'}>
                      <input
                        name="donorName"
                        value={formData.donorName}
                        onChange={handleFormChange}
                        placeholder="Auto-filled from selection above"
                        className={`${inputClass} ${donorFlash ? 'bg-green-50 border-green-200' : ''}`}
                      />
                    </FormField>
                  </div>
                  <div className={`transition-all duration-500 rounded-xl ${donorFlash ? 'ring-2 ring-green-400 bg-green-50/40' : ''}`}>
                    <FormField label="Donor Phone" hint={donorFlash ? '✓ Auto-filled from selection' : 'Auto-filled when donor selected'}>
                      <input
                        name="donorPhone"
                        value={formData.donorPhone}
                        onChange={handleFormChange}
                        placeholder="Auto-filled from selection above"
                        className={`${inputClass} font-mono ${donorFlash ? 'bg-green-50 border-green-200' : ''}`}
                        maxLength={11}
                      />
                    </FormField>
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-[0.2em]"
                >
                  Review &amp; Confirm Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Case Detail Modal ── */}
      {detailCase && (
        <CaseDetailModal cas={detailCase} onClose={() => setDetailCase(null)} />
      )}

      {/* ── Donation Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showConfirm}
        isLoading={isSubmitting}
        type="success"
        title="Confirm Blood Donation"
        message={`Confirm that ${formData.donorName || 'the selected donor'} has successfully donated blood for patient "${formData.patientName}"? This will update their donation stats and recalculate the priority ranking.`}
        confirmText="Yes, Log This Case"
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowConfirm(false)}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        isLoading={deleteModal.isLoading}
        type="danger"
        title="Delete Case"
        message="Are you sure you want to permanently delete this case record? Note: this does not revert the donor's donation count. This action cannot be undone."
        confirmText="Delete Case"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, isLoading: false })}
      />
    </div>
  );
};

export default CaseManagement;
