import React, { useState } from 'react';
import { SiteSettings, ContactSettings } from '../../types';
import { Phone, Mail, MapPin, Clock, Save, CheckCircle2, MessageSquare } from 'lucide-react';

interface AdminContactTabProps {
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

export function AdminContactTab({ siteSettings, onUpdateSiteSettings }: AdminContactTabProps) {
  const defaultContact: ContactSettings = {
    phone: '+60 17-4505868',
    email: 'info@kirahaq.com',
    location: 'House 12, Road 5, Dhanmondi, Dhaka-1205, Bangladesh',
    workTime: 'Saturday - Thursday: 9:00 AM - 10:00 PM',
    whatsapp: '+60 17-4505868',
    messenger: 'https://m.me/your-facebook-page-id'
  };

  const [contactForm, setContactForm] = useState<ContactSettings>(
    siteSettings.contactInfo || defaultContact
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SiteSettings = {
      ...siteSettings,
      contactInfo: contactForm
    };

    onUpdateSiteSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-800 to-stone-900 p-5 rounded-2xl border border-stone-700 shadow-md">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-400" />
            <span>Contact Information & Business Details</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Update store contact numbers, support email, physical store address, and operating hours.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Contact details saved successfully! Storefront contact page will reflect these updates instantly.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Customer Care Phone Number *</span>
            </label>
            <input
              type="text"
              required
              value={contactForm.phone}
              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+880 1700-000000"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* WhatsApp Support Number */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Support Number</span>
            </label>
            <input
              type="text"
              value={contactForm.whatsapp || ''}
              onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="+60 17-4505868"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Facebook Messenger Link */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Facebook Messenger Link</span>
            </label>
            <input
              type="text"
              value={contactForm.messenger || ''}
              onChange={(e) => setContactForm(prev => ({ ...prev, messenger: e.target.value }))}
              placeholder="https://m.me/your-facebook-page-id"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Support Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={contactForm.email}
              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="info@kirahaq.com"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Work Time / Business Hours */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Operating Hours / Work Time *</span>
            </label>
            <input
              type="text"
              required
              value={contactForm.workTime}
              onChange={(e) => setContactForm(prev => ({ ...prev, workTime: e.target.value }))}
              placeholder="Sat - Thu: 9:00 AM - 10:00 PM"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Store Location */}
        <div>
          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Store / Clinic Physical Location *</span>
          </label>
          <textarea
            rows={3}
            required
            value={contactForm.location}
            onChange={(e) => setContactForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="House address, road number, area, district, country..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Contact Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
