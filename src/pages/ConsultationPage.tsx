import React, { useState } from 'react';
import { 
  UserCheck, Calendar, Clock, Phone, Mail, CheckCircle2, 
  Sparkles, ShieldCheck, ChevronRight, MessageSquare 
} from 'lucide-react';

interface ConsultationPageProps {
  onGoHome: () => void;
  onBookSubmitted?: (data: any) => void;
}

export function ConsultationPage({ onGoHome, onBookSubmitted }: ConsultationPageProps) {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [practitioner, setPractitioner] = useState('Hakim Abdullah Al-Madani (Senior Tibb Specialist)');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [healthConcern, setHealthConcern] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const practitionersList = [
    {
      name: 'Hakim Abdullah Al-Madani',
      role: 'Chief Practitioner, Tibb-e-Nabawi',
      exp: '18+ Years Experience in Prophetic Herbal Formulations',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Dr. Fatima Rahman (Tibb Consult)',
      role: 'Female Holistic Wellness & Women Health Specialist',
      exp: '12+ Years Experience in Organic Dietary Therapy',
      image: 'https://images.unsplash.com/photo-1594824813566-78a98c56e300?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const bookingData = {
      patientName,
      phone,
      email,
      practitioner,
      preferredDate,
      timeSlot,
      notes: healthConcern,
      date: new Date().toLocaleDateString(),
    };

    if (onBookSubmitted) onBookSubmitted(bookingData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">Prophetic Health Consultation</span>
        </div>

        {/* Hero Section */}
        <div className="bg-[#1b3d2b] text-white p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Certified Tibb Experts</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Book a Prophetic Health Consultation</h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Receive personalized diet recommendations, Sidr honey regimens, and prophetic herbal guidance directly from experienced Hakims.
            </p>
          </div>
        </div>

        {/* Form & Expert Profiles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Booking Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">Consultation Appointment Reserved!</h2>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Jazakallah Khair, <strong>{patientName}</strong>! Our assistant will call you at <strong>{phone}</strong> to confirm your slot with <strong>{practitioner}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
                  Patient & Appointment Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abdullah Rahman"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +880 1700-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Select Practitioner</label>
                    <select
                      value={practitioner}
                      onChange={(e) => setPractitioner(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold text-stone-800 cursor-pointer"
                    >
                      {practitionersList.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold text-stone-800 cursor-pointer"
                    >
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning)</option>
                      <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Health Concern / Symptoms Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe any chronic health condition, immunity concern, digestion, or dietary goals..."
                    value={healthConcern}
                    onChange={(e) => setHealthConcern(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Confirm Consultation Request</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Col: Hakim Cards */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Our Panel of Hakims</h3>
            {practitionersList.map((p) => (
              <div key={p.name} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{p.name}</h4>
                  <p className="text-[11px] font-semibold text-emerald-800">{p.role}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{p.exp}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
