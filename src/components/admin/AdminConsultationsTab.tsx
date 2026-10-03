import React, { useState, useEffect } from 'react';
import { ConsultationBooking } from '../../types';
import { 
  Calendar, Phone, Mail, UserCheck, Clock, CheckCircle2, AlertCircle, 
  Trash2, Plus, Edit3, Save, Search, Filter, Stethoscope, Video, MapPin, X
} from 'lucide-react';

interface AdminConsultationsTabProps {
  consultations?: ConsultationBooking[];
}

const DEFAULT_PRACTITIONERS = [
  'Hakeem Imran Khan (Herbal & Prophetic Practitioner)',
  'Hakeem Shahbaz Alam (Senior Sunnah Specialist)',
  'Dr. Farhana Yasmine (Female Nutritionist & Ruqyah Specialist)',
  'Dr. Ayesha Siddiqua (Prophetic Medicine Expert)'
];

const DEFAULT_SERVICES = [
  'Hijama Therapy (Sunnah Cupping Detox)',
  'Ruqyah & Spiritual Wellness Consultation',
  'Sunnah Nutrition & Wholesome Diet Plan',
  'Lifestyle & Chronic Fatigue Coaching',
  'Prophetic Herbal Medicine Remedies'
];

const DEFAULT_SAMPLE_BOOKINGS: ConsultationBooking[] = [
  {
    serviceId: 'cs_1',
    patientName: 'Dr. Rafiqul Islam',
    phone: '+880 1711-998877',
    email: 'rafiqul@gmail.com',
    serviceTitle: 'Prophetic Dietary & Immunity Plan',
    practitioner: 'Hakeem Imran Khan',
    preferredDate: '2026-08-02',
    preferredTime: '11:00 AM',
    type: 'Online Video Call',
    status: 'Confirmed',
    notes: 'Patient suffering from digestive acidity and seasonal allergies. Wants Sidr honey dosage guidance.'
  },
  {
    serviceId: 'cs_2',
    patientName: 'Nasrin Jahan',
    phone: '+880 1811-332211',
    email: 'nasrin.jahan@yahoo.com',
    serviceTitle: 'Sunnah Cupping & Herbal Detox',
    practitioner: 'Dr. Shahbaz Alam',
    preferredDate: '2026-08-05',
    preferredTime: '03:30 PM',
    type: 'In-Clinic Visit',
    status: 'Pending',
    notes: 'Requested female attendant for hijama therapy session.'
  },
  {
    serviceId: 'cs_3',
    patientName: 'Tariq Hassan',
    phone: '+880 1912-445566',
    email: 'tariq.h@hotmail.com',
    serviceTitle: 'Ruqyah & Spiritual Wellness',
    practitioner: 'Hakeem Shahbaz Alam',
    preferredDate: '2026-08-10',
    preferredTime: '05:00 PM',
    type: 'Online Video Call',
    status: 'Completed',
    notes: 'Follow-up consultation after 14-day Kalonji oil detox regimen.'
  }
];

export function AdminConsultationsTab({ consultations = [] }: AdminConsultationsTabProps) {
  // Load bookings from localStorage or fallback
  const [bookingList, setBookingList] = useState<ConsultationBooking[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_consultations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading kirahaq_consultations:', e);
    }
    return consultations.length > 0 ? consultations : DEFAULT_SAMPLE_BOOKINGS;
  });

  // Sync Listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_consultations');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setBookingList(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_consultations_updated', handleSync);
    return () => window.removeEventListener('kirahaq_consultations_updated', handleSync);
  }, []);

  // Save helper
  const saveBookings = (newList: ConsultationBooking[]) => {
    setBookingList(newList);
    try {
      localStorage.setItem('kirahaq_consultations', JSON.stringify(newList));
      window.dispatchEvent(new Event('kirahaq_consultations_updated'));
    } catch (e) {
      console.error('Failed to save kirahaq_consultations:', e);
    }
  };

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<ConsultationBooking | null>(null);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<ConsultationBooking | null>(null);

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('+880 ');
  const [email, setEmail] = useState('');
  const [serviceTitle, setServiceTitle] = useState(DEFAULT_SERVICES[0]);
  const [practitioner, setPractitioner] = useState(DEFAULT_PRACTITIONERS[0]);
  const [preferredDate, setPreferredDate] = useState('2026-08-01');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [type, setType] = useState<string>('Online Video Call');
  const [status, setStatus] = useState<string>('Pending');
  const [notes, setNotes] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setPatientName('');
    setPhone('+880 ');
    setEmail('');
    setServiceTitle(DEFAULT_SERVICES[0]);
    setPractitioner(DEFAULT_PRACTITIONERS[0]);
    setPreferredDate(new Date().toISOString().split('T')[0]);
    setPreferredTime('11:00 AM');
    setType('Online Video Call');
    setStatus('Pending');
    setNotes('');
    setEditingBooking(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (b: ConsultationBooking) => {
    setEditingBooking(b);
    setPatientName(b.patientName || '');
    setPhone(b.phone || '+880 ');
    setEmail(b.email || '');
    setServiceTitle(b.serviceTitle || b.service || DEFAULT_SERVICES[0]);
    setPractitioner(b.practitioner || DEFAULT_PRACTITIONERS[0]);
    setPreferredDate(b.preferredDate || b.date || new Date().toISOString().split('T')[0]);
    setPreferredTime(b.preferredTime || b.timeSlot || '11:00 AM');
    setType(b.type || 'Online Video Call');
    setStatus(b.status || 'Pending');
    setNotes(b.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('error', 'Please enter patient full name.');
      return;
    }
    if (!phone.trim()) {
      showToast('error', 'Please enter patient contact phone number.');
      return;
    }

    if (editingBooking) {
      const updatedList = bookingList.map((b) => {
        if ((b.serviceId || b.patientName) === (editingBooking.serviceId || editingBooking.patientName)) {
          return {
            ...b,
            patientName: patientName.trim(),
            phone: phone.trim(),
            email: email.trim() || 'patient@kira-haq.com',
            serviceTitle,
            practitioner,
            preferredDate,
            preferredTime,
            type,
            status,
            notes: notes.trim()
          };
        }
        return b;
      });
      saveBookings(updatedList);
      showToast('success', `Consultation for "${patientName.trim()}" updated successfully!`);
    } else {
      const newBooking: ConsultationBooking = {
        serviceId: `cs_${Date.now()}`,
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || 'patient@kira-haq.com',
        serviceTitle,
        practitioner,
        preferredDate,
        preferredTime,
        type,
        status,
        notes: notes.trim()
      };
      saveBookings([newBooking, ...bookingList]);
      showToast('success', `New consultation for "${patientName.trim()}" booked successfully!`);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    const updatedList = bookingList.map((b, idx) => {
      const matchId = b.serviceId || `cs_${idx}`;
      if (matchId === id) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    saveBookings(updatedList);
    showToast('success', `Consultation status changed to "${newStatus}"`);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmBooking) {
      const id = deleteConfirmBooking.serviceId;
      const updatedList = bookingList.filter((b, idx) => (b.serviceId || `cs_${idx}`) !== id);
      saveBookings(updatedList);
      showToast('success', `Consultation record for "${deleteConfirmBooking.patientName}" deleted.`);
      setDeleteConfirmBooking(null);
    }
  };

  // KPI Statistics
  const totalCount = bookingList.length;
  const pendingCount = bookingList.filter(b => (b.status || 'Pending') === 'Pending').length;
  const confirmedCount = bookingList.filter(b => b.status === 'Confirmed').length;
  const completedCount = bookingList.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookingList.filter(b => b.status === 'Cancelled').length;

  // Filtered Bookings
  const filteredBookings = bookingList.filter(b => {
    const currentStatus = b.status || 'Pending';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      (b.patientName && b.patientName.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.serviceTitle && b.serviceTitle.toLowerCase().includes(q)) ||
      (b.practitioner && b.practitioner.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Consultations</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Patient appointment requests</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Pending Requests</div>
          <div className="text-xl font-serif font-bold text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Needs confirmation</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Confirmed Sessions</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{confirmedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Scheduled on calendar</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-blue-400">Completed</div>
          <div className="text-xl font-serif font-bold text-blue-400 mt-1">{completedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Sessions finished</div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-amber-400" />
            <span>Health & Cupping Consultation Requests ({bookingList.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage patient consultation appointment requests, practitioner schedules, and booking statuses for Hijama, Ruqyah, and Dietary Coaching.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNew}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>+ Log New Appointment</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search patient name, phone, email, service, or practitioner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs shrink-0 overflow-x-auto">
          {(['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-stone-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Consultation Appointments Found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            No booking requests match your search or filter settings. Try adjusting search or log a new appointment.
          </p>
          <button
            type="button"
            onClick={handleStartAddNew}
            className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Appointment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b, idx) => {
            const id = b.serviceId || `cs_${idx}`;
            const currentStatus = b.status || 'Pending';

            return (
              <div 
                key={id} 
                className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-stone-700 transition-all"
              >
                <div className="space-y-3">
                  
                  {/* Top Header & Status Selector */}
                  <div className="flex items-start justify-between border-b border-stone-800 pb-3 gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-white text-base leading-snug">
                        {b.patientName}
                      </h4>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        {b.serviceTitle || b.service || 'Sunnah Wellness Session'}
                      </p>
                    </div>

                    <select
                      value={currentStatus}
                      onChange={(e) => handleUpdateStatus(id, e.target.value)}
                      className={`border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer shrink-0 ${
                        currentStatus === 'Confirmed' 
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                          : currentStatus === 'Pending'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                          : currentStatus === 'Completed'
                          ? 'bg-blue-950/90 text-blue-300 border-blue-800'
                          : 'bg-rose-950/90 text-rose-300 border-rose-800'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Info Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-300 pt-1">
                    <div className="flex items-center gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono font-medium">{b.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{b.email || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{b.preferredDate || b.date} ({b.preferredTime || b.timeSlot})</span>
                    </div>

                    <div className="flex items-center gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{b.practitioner || 'Hakeem Imran Khan'}</span>
                    </div>
                  </div>

                  {/* Notes / Symptoms */}
                  {b.notes && (
                    <div className="text-xs text-stone-300 bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Patient Notes / Health History:</span>
                      <p className="leading-relaxed text-stone-300">{b.notes}</p>
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-3 border-t border-stone-800 gap-2">
                  <span className="text-[11px] font-bold text-amber-300/80 flex items-center gap-1.5">
                    {b.type && b.type.includes('In-Clinic') ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{b.type || 'Online Consultation'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(b)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-blue-400 border border-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmBooking(b)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT CONSULTATION MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingBooking ? 'Edit Consultation Booking' : 'Log New Consultation Appointment'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Patient Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1700-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Consultation Service
                  </label>
                  <select
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {DEFAULT_SERVICES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Assigned Practitioner
                  </label>
                  <select
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {DEFAULT_PRACTITIONERS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Session Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('Online Video Call')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      type === 'Online Video Call'
                        ? 'bg-amber-400 text-stone-950 border-amber-300'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    💻 Online Video Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('In-Clinic Visit')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      type === 'In-Clinic Visit'
                        ? 'bg-amber-400 text-stone-950 border-amber-300'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    🏥 In-Clinic Visit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Health History / Consultation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention health symptoms, allergies, or practitioner notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBooking ? 'Update Booking' : 'Confirm Appointment'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM DIALOG ================= */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Appointment Record?</h4>
                <p className="text-xs text-stone-400">This consultation record will be removed.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to delete appointment for <strong className="text-amber-400">"{deleteConfirmBooking.patientName}"</strong> ({deleteConfirmBooking.serviceTitle})?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBooking(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
