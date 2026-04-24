import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, Heart, Phone, Calendar, Clock,
  Droplets, RefreshCw, AlertTriangle, CheckCircle, Search
} from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/ToastProvider';
import { fetchWithRetry, API_BASE } from '../../api';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CONDITIONS = ['Thalassemia', 'Hemophilia', 'Chronic Anemia', 'Sickle Cell Disease', 'Other'];

const EMPTY_FORM = {
  patientName: '',
  bloodGroup: 'A+',
  hospital: '',
  attendantPhone: '',
  condition: 'Thalassemia',
  transfusionIntervalDays: 21,
  lastTransfusionDate: '',
  notes: '',
};

const inputClass = "w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none placeholder:text-gray-300";
const selectClass = `${inputClass} cursor-pointer font-semibold`;

const FormField = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">{hint}</p>}
  </div>
);

// Returns color class stack based on urgency (days until next transfusion)
const getUrgencyStyle = (days) => {
  if (days === null || days === undefined) return { row: '', badge: 'bg-gray-100 text-gray-400', label: 'Not Scheduled' };
  if (days < 0) return { row: 'bg-red-50/60', badge: 'bg-red-100 text-red-700 border border-red-200 animate-pulse', label: `${Math.abs(days)}d OVERDUE` };
  if (days <= 3) return { row: 'bg-orange-50/60', badge: 'bg-orange-100 text-orange-700 border border-orange-200', label: `Due in ${days}d` };
  if (days <= 7) return { row: 'bg-amber-50/40', badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: `Due in ${days}d` };
  return { row: '', badge: 'bg-green-50 text-green-700 border border-green-100', label: `${days}d away` };
};

const ChronicManagement = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isLoading: false });
  const [transfusionModal, setTransfusionModal] = useState({ isOpen: false, id: null, name: '', isLoading: false });
  const { toast } = useToast();

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithRetry(`${API_BASE}/api/chronic`);
      setPatients(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load chronic patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (formData.attendantPhone && !/^[0-9]{11}$/.test(formData.attendantPhone)) {
      toast.error('Attendant phone must be exactly 11 digits');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchWithRetry(`${API_BASE}/api/chronic`, {
        method: 'POST',
        body: JSON.stringify({ ...formData, transfusionIntervalDays: Number(formData.transfusionIntervalDays) })
      });
      toast.success('Chronic patient added');
      setIsFormOpen(false);
      setFormData(EMPTY_FORM);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogTransfusion = async () => {
    setTransfusionModal(m => ({ ...m, isLoading: true }));
    try {
      await fetchWithRetry(`${API_BASE}/api/chronic/${transfusionModal.id}/transfusion`, { method: 'PUT' });
      toast.success(`Transfusion logged for ${transfusionModal.name}`);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to log transfusion');
    } finally {
      setTransfusionModal({ isOpen: false, id: null, name: '', isLoading: false });
    }
  };

  const handleDelete = async () => {
    setDeleteModal(m => ({ ...m, isLoading: true }));
    try {
      await fetchWithRetry(`${API_BASE}/api/chronic/${deleteModal.id}`, { method: 'DELETE' });
      toast.success('Patient record removed');
      setPatients(patients.filter(p => p._id !== deleteModal.id));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleteModal({ isOpen: false, id: null, isLoading: false });
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = patients.filter(p =>
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.condition?.toLowerCase().includes(search.toLowerCase()) ||
    p.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Chronic Patients</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Track recurring transfusion needs — sorted by next required date.
            </p>
          </div>
          <button
            onClick={() => { setIsFormOpen(true); setFormData(EMPTY_FORM); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-lg active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {[
          { label: 'Overdue', cls: 'bg-red-100 text-red-700 border border-red-200' },
          { label: 'Due ≤ 3 days', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
          { label: 'Due ≤ 7 days', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
          { label: 'On schedule', cls: 'bg-green-50 text-green-700 border border-green-100' },
        ].map(l => (
          <span key={l.label} className={`text-[10px] font-black px-3 py-1.5 rounded-full ${l.cls} uppercase tracking-[0.1em]`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-gray-50">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search patient name, condition, hospital..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border-transparent placeholder:font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Patient</th>
                <th className="px-4 py-5 text-center">Group</th>
                <th className="px-4 py-5">Condition</th>
                <th className="px-4 py-5">Hospital</th>
                <th className="px-4 py-5">Last Transfusion</th>
                <th className="px-4 py-5">Next Required</th>
                <th className="px-4 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={8} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Heart className="w-12 h-12" />
                      <p className="font-black uppercase tracking-widest text-xs">No Patients Registered</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const style = getUrgencyStyle(p.daysUntilNext);
                return (
                  <tr key={p._id} className={`hover:brightness-95 transition-all ${style.row}`}>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{p.patientName}</div>
                      {p.attendantPhone && (
                        <a href={`tel:${p.attendantPhone}`} className="text-[10px] font-mono text-gray-400 hover:text-primary transition-colors mt-0.5 block">
                          {p.attendantPhone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="inline-flex items-center justify-center bg-red-50 text-primary font-black px-3 py-1.5 rounded-xl min-w-[3rem] text-[11px] border border-red-100">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-xs font-bold text-gray-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{p.condition}</span>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-xs text-gray-600">{p.hospital || '—'}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-mono text-gray-600">{formatDate(p.lastTransfusionDate)}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 pl-5">Every {p.transfusionIntervalDays}d</div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-mono text-gray-700 font-bold">{formatDate(p.nextRequiredDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.1em] ${style.badge}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Log Transfusion */}
                        <button
                          onClick={() => setTransfusionModal({ isOpen: true, id: p._id, name: p.patientName, isLoading: false })}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                          title="Log Transfusion"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Log
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: p._id, isLoading: false })}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Patient Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 mb-6">
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add Chronic Patient</h3>
                <p className="text-gray-400 font-medium text-sm mt-0.5">Register a recurring transfusion need.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-95">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Patient Name" required>
                    <input required name="patientName" value={formData.patientName} onChange={handleFormChange} placeholder="Full name" className={inputClass} />
                  </FormField>
                </div>
                <FormField label="Blood Group" required>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFormChange} className={selectClass}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormField>
                <FormField label="Condition">
                  <select name="condition" value={formData.condition} onChange={handleFormChange} className={selectClass}>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Transfusion Interval (Days)" required hint="e.g. 21 for Thalassemia (every 3 weeks)">
                  <input required type="number" name="transfusionIntervalDays" min="1" max="365" value={formData.transfusionIntervalDays} onChange={handleFormChange} className={inputClass} />
                </FormField>
                <FormField label="Last Transfusion Date">
                  <input type="date" name="lastTransfusionDate" max={new Date().toISOString().split('T')[0]} value={formData.lastTransfusionDate} onChange={handleFormChange} className={inputClass} />
                </FormField>
                <FormField label="Hospital">
                  <input name="hospital" value={formData.hospital} onChange={handleFormChange} placeholder="Hospital or clinic" className={inputClass} />
                </FormField>
                <FormField label="Attendant Phone" hint="11 digits">
                  <input name="attendantPhone" value={formData.attendantPhone} onChange={handleFormChange} placeholder="03XXXXXXXXX" maxLength={11} className={`${inputClass} font-mono`} />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Notes">
                    <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={2} placeholder="Any special notes..." className={`${inputClass} resize-none`} />
                  </FormField>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-[0.2em]"
              >
                {isSubmitting ? 'Saving...' : 'Register Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Log Transfusion Confirm */}
      <ConfirmModal
        isOpen={transfusionModal.isOpen}
        isLoading={transfusionModal.isLoading}
        type="success"
        title="Log Transfusion"
        message={`Confirm transfusion for ${transfusionModal.name} today? This will update their last transfusion date to now and push their next required date forward.`}
        confirmText="Confirm Transfusion"
        onConfirm={handleLogTransfusion}
        onCancel={() => setTransfusionModal({ isOpen: false, id: null, name: '', isLoading: false })}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        isLoading={deleteModal.isLoading}
        type="danger"
        title="Remove Patient"
        message="Are you sure you want to permanently delete this chronic patient record? This cannot be undone."
        confirmText="Delete Record"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, isLoading: false })}
      />
    </div>
  );
};

export default ChronicManagement;
