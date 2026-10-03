import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, User, Phone, Mail, Stethoscope } from 'lucide-react';
import { ConsultationBooking } from '../types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [service, setService] = useState('Hijama Therapy');
  const [practitioner, setPractitioner] = useState('Hakeem Shahbaz Alam (Senior Sunnah Specialist)');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('+880 ');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('2026-07-28');
  const [time, setTime] = useState('11:00 AM');
  const [type, setType] = useState<'Online' | 'In-Person'>('Online');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState<ConsultationBooking | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert('Please fill in required fields.');
      return;
    }

    const booking: ConsultationBooking = {
      serviceId: 'srv-' + Math.floor(Math.random() * 10000),
      serviceTitle: service,
      practitioner,
      patientName,
      phone,
      email: email || 'patient@kira-haq.com',
      preferredDate: date,
      preferredTime: time,
      type: type === 'Online' ? 'Online Video Call' : 'In-Clinic Visit',
      notes,
      status: 'Pending'
    };

    try {
      const saved = localStorage.getItem('kirahaq_consultations');
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [booking, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem('kirahaq_consultations', JSON.stringify(updated));
      window.dispatchEvent(new Event('kirahaq_consultations_updated'));
    } catch (err) {
      console.error('Error saving consultation booking:', err);
    }

    setBooked(booking);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {booked ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-700" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                APPOINTMENT BOOKED
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1b3d2b] mt-1">
                Consultation Scheduled
              </h2>
              <p className="text-stone-600 text-xs mt-1">
                JazakAllah Khair! Our clinic team will reach out via phone/WhatsApp to confirm your appointment details.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl text-left border border-stone-200 text-xs space-y-2 text-stone-700">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-900">Patient:</span>
                <span>{booked.patientName} ({booked.phone})</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-900">Service:</span>
                <span className="font-bold text-emerald-800">{booked.serviceTitle}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-900">Practitioner:</span>
                <span>{booked.practitioner}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-900">Date & Time:</span>
                <span>{booked.preferredDate} at {booked.preferredTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-900">Session Mode:</span>
                <span className="font-bold text-amber-800">{booked.type} Session</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#1b3d2b] text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                ISLAMIC HEALTH CONSULTATION
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1b3d2b]">
                Book Appointment
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Consultation Service *</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="Hijama Therapy">Hijama Therapy (Sunnah Cupping Detox)</option>
                  <option value="Ruqyah Treatment">Ruqyah & Spiritual Wellness Consultation</option>
                  <option value="Diet Consultation">Sunnah Nutrition & Wholesome Diet Plan</option>
                  <option value="Lifestyle Guidance">Lifestyle & Chronic Fatigue Coaching</option>
                  <option value="Prophetic Medicine">Prophetic Herbal Medicine Remedies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Select Practitioner</label>
                <select
                  value={practitioner}
                  onChange={(e) => setPractitioner(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="Hakeem Shahbaz Alam (Senior Sunnah Specialist)">Hakeem Shahbaz Alam (Senior Sunnah Specialist)</option>
                  <option value="Hakeem Imran Khan (Herbal & Prophetic Practitioner)">Hakeem Imran Khan (Herbal & Prophetic Practitioner)</option>
                  <option value="Dr. Farhana Yasmine (Female Nutritionist & Ruqyah Specialist)">Dr. Farhana Yasmine (Female Nutritionist)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Time *</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Session Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('Online')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                      type === 'Online' ? 'bg-emerald-50 border-[#1b3d2b] text-[#1b3d2b]' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    💻 Online Video Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('In-Person')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                      type === 'In-Person' ? 'bg-emerald-50 border-[#1b3d2b] text-[#1b3d2b]' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    🏥 In-Person (Dhaka Center)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Appointment Request
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
