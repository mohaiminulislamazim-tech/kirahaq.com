import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, ChevronDown, 
  ChevronUp, ChevronRight, CheckCircle2, Send 
} from 'lucide-react';
import { ContactSettings, SiteSettings } from '../types';

interface ContactPageProps {
  onGoHome: () => void;
  contactSettings?: ContactSettings;
  siteSettings?: SiteSettings;
}

export function ContactPage({ onGoHome, contactSettings, siteSettings }: ContactPageProps) {
  const contact: ContactSettings = contactSettings || siteSettings?.contactInfo || (() => {
    try {
      const saved = localStorage.getItem('kirahaq_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.contactInfo) return parsed.contactInfo;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      phone: '+880 1700-000000',
      email: 'info@kirahaq.com',
      location: 'House 12, Road 5, Dhanmondi, Dhaka-1205, Bangladesh',
      workTime: 'Saturday - Thursday: 9:00 AM - 10:00 PM',
      whatsapp: '+880 1700-000000'
    };
  })();

  const phone = contact.phone || '+880 1700-000000';
  const email = contact.email || 'info@kirahaq.com';
  const location = contact.location || 'House 12, Road 5, Dhanmondi, Dhaka-1205, Bangladesh';
  const workTime = contact.workTime || 'Saturday - Thursday: 9:00 AM - 10:00 PM';
  const whatsapp = contact.whatsapp || phone;
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [formSent, setFormSent] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'How do I verify the purity of your Yemeni Sidr Honey?',
      a: 'Every batch of Kira Haq Sidr Honey comes with a lab test certificate checking HMF levels, moisture content (<18%), and sucrose purity. You can also test raw honey solubility in water at home.',
    },
    {
      q: 'What are the courier delivery charges across Bangladesh?',
      a: 'Inside Dhaka City delivery charge is ৳80 (24-48 hours delivery). Outside Dhaka across all districts delivery charge is ৳150 (2-4 days home delivery via Steadfast/SA Paribahan).',
    },
    {
      q: 'Can I order via WhatsApp or phone call directly?',
      a: 'Yes! You can message us on WhatsApp or call +880 1700-000000 anytime to place your order directly with our customer support team.',
    },
    {
      q: 'What is your return & refund policy?',
      a: 'If any product is damaged during delivery or fails purity standards, notify us within 3 days for a 100% full replacement or instant refund.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">Contact Us & FAQ</span>
        </div>

        {/* Hero */}
        <div className="bg-[#1b3d2b] text-white p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>We Are Here to Help</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Get in Touch with Kira Haq</h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Have questions about pure Sidr honey, order status, or wholesale inquiries? Speak with our team.
            </p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Call & WhatsApp Support</h3>
              <p className="text-xs font-mono font-bold text-stone-800">{phone}</p>
              <p className="text-[11px] text-stone-500">{workTime}</p>
            </div>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl text-center block"
            >
              Order on WhatsApp
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl w-fit">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Email Support</h3>
            <p className="text-xs font-bold text-stone-800 break-all">{email}</p>
            <p className="text-[11px] text-stone-500">Instant response within 2-4 business hours.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="p-3 bg-stone-100 text-stone-800 rounded-xl w-fit">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Physical Address & Location</h3>
            <p className="text-xs font-medium text-stone-700">{location}</p>
            <p className="text-[11px] text-stone-500">Operating: {workTime}</p>
          </div>
        </div>

        {/* Message Form & FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Send Us a Quick Message
            </h2>

            {formSent ? (
              <div className="p-6 bg-emerald-50 text-center rounded-2xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto" />
                <h3 className="font-bold text-stone-900">Message Received!</h3>
                <p className="text-xs text-stone-600">Thank you, {senderName}. Our support team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hasan Mahmud"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01700-000000"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Message or Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your query here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-stone-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs text-stone-900 flex items-center justify-between gap-2 bg-stone-50/50 hover:bg-stone-100 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                    )}
                  </button>

                  {activeFaq === idx && (
                    <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
