import React from 'react';
import { 
  Phone, Mail, MapPin, Clock, 
  Facebook, Youtube, Instagram, Twitter, Shield, Check
} from 'lucide-react';
import { Category, AppView, SiteSettings, ContactSettings } from '../types';
import { KiraHaqLogo } from './KiraHaqLogo';

interface FooterProps {
  onSelectCategory: (cat: Category) => void;
  onOpenConsultation: () => void;
  onNavigate?: (view: AppView) => void;
  customLogoUrl?: string;
  siteSettings?: SiteSettings;
  contactSettings?: ContactSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenConsultation,
  onNavigate,
  customLogoUrl,
  siteSettings,
  contactSettings,
}) => {
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
  const location = contact.location || 'Dhaka, Bangladesh';
  const workTime = contact.workTime || 'Saturday - Thursday: 9:00 AM - 10:00 PM';

  const handleNav = (target: string) => {
    if (onNavigate) {
      if (target === 'home') onNavigate('home');
      else if (target === 'about') onNavigate('about');
      else if (target === 'blog') onNavigate('blog');
      else if (target === 'contact') onNavigate('contact');
      else if (target === 'categories') onNavigate('categories');
      else if (target === 'Health Consultation') onNavigate('consultation');
      else if (target === 'admin') onNavigate('admin');
      else if (target === 'account') onNavigate('account');
      else {
        onSelectCategory(target as Category);
        onNavigate('products');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const aboutText = siteSettings?.footerAboutText || 'Dedicated to offering 100% authentic, unadulterated natural foods and prophetic wellness solutions for a healthy Ummah according to Islamic principles.';
  const copyright = siteSettings?.copyrightText || `© ${new Date().getFullYear()} Kira Haq. All Rights Reserved. Pure by Nature, Guided by Sunnah.`;
  const enabledPayments = siteSettings?.enabledPaymentMethods && siteSettings.enabledPaymentMethods.length > 0 
    ? siteSettings.enabledPaymentMethods 
    : ['bkash', 'nagad', 'rocket', 'visa', 'mastercard', 'amex', 'cod'];

  const quickLinks = siteSettings?.footerQuickLinks && siteSettings.footerQuickLinks.length > 0 
    ? siteSettings.footerQuickLinks 
    : [
        { id: 'ql1', label: 'Home', target: 'home' },
        { id: 'ql2', label: 'Shop All', target: 'All' },
        { id: 'ql3', label: 'Natural Foods', target: 'Natural Foods' },
        { id: 'ql4', label: 'Sunnah Products', target: 'Sunnah Products' },
        { id: 'ql5', label: 'Health Consultation', target: 'Health Consultation' },
        { id: 'ql6', label: 'Blog & Articles', target: 'blog' },
        { id: 'ql7', label: 'About Us', target: 'about' },
      ];

  const productLinks = siteSettings?.footerProductLinks && siteSettings.footerProductLinks.length > 0 
    ? siteSettings.footerProductLinks 
    : [
        { id: 'pl1', label: 'Pure Sidr Honey', target: 'Pure Honey' },
        { id: 'pl2', label: 'Black Seed Oil', target: 'Sunnah Products' },
        { id: 'pl3', label: 'Extra Virgin Olive Oil', target: 'Natural Foods' },
        { id: 'pl4', label: 'Madina Ajwa Dates', target: 'Sunnah Products' },
        { id: 'pl5', label: 'Raw Honeycomb', target: 'Pure Honey' },
        { id: 'pl6', label: 'Sunnah Gift Sets', target: 'Gift Packs' },
      ];

  const renderPaymentBadge = (method: string) => {
    const key = method.toLowerCase();
    const customLogo = siteSettings?.paymentLogos?.[key];
    if (customLogo) {
      return (
        <div 
          key={method}
          className="h-8 w-24 px-2 bg-white rounded-lg border border-stone-200 shadow-xs flex items-center justify-center cursor-default overflow-hidden hover:brightness-105 transition-all shrink-0" 
          title={method.toUpperCase()}
        >
          <img src={customLogo} alt={method} className="max-h-6 max-w-[80px] w-auto h-auto object-contain shrink-0" />
        </div>
      );
    }

    switch (key) {
      case 'bkash':
        return (
          <div 
            key="bkash"
            className="h-8 px-3 bg-[#E2136E] text-white rounded-lg border border-[#c20d5d] flex items-center gap-1.5 shadow-xs cursor-default hover:brightness-105 transition-all" 
            title="bKash Mobile Banking"
          >
            <svg className="h-4.5 w-auto text-white shrink-0" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2L30 16L16 30L2 16L16 2Z" fill="white" opacity="0.95" />
              <path d="M30 16L32 6L26 26L30 16Z" fill="#FFB3CD" />
              <path d="M16 8L22 16L16 24L10 16L16 8Z" fill="#E2136E" />
            </svg>
            <span className="font-extrabold text-xs tracking-tight">bKash</span>
          </div>
        );
      case 'nagad':
        return (
          <div 
            key="nagad"
            className="h-8 px-3 bg-[#DF2A27] text-white rounded-lg border border-[#b81d1b] flex items-center gap-1.5 shadow-xs cursor-default hover:brightness-105 transition-all" 
            title="Nagad Mobile Financial Service"
          >
            <svg className="h-4.5 w-auto text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8 2 6 5 6 9c0 5 4 8 6 13 2-5 6-8 6-13 0-4-2-7-6-7z" fill="white" />
              <path d="M12 6c-2 0-3 1.5-3 3.5 0 2.5 2 4 3 6.5 1-2.5 3-4 3-6.5C15 7.5 14 6 12 6z" fill="#F7921E" />
            </svg>
            <span className="font-extrabold text-xs tracking-tight">Nagad</span>
          </div>
        );
      case 'rocket':
        return (
          <div 
            key="rocket"
            className="h-8 px-3 bg-[#8C3494] text-white rounded-lg border border-[#6d2474] flex items-center gap-1.5 shadow-xs cursor-default hover:brightness-105 transition-all" 
            title="DBBL Rocket Mobile Banking"
          >
            <svg className="h-4 w-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.5c2.5 3.5 5 7.5 5 12a5 5 0 01-10 0c0-4.5 2.5-8.5 5-12zM9 16a3 3 0 006 0H9z" fill="white" />
              <circle cx="12" cy="13" r="1.8" fill="#8C3494" />
            </svg>
            <span className="font-extrabold text-xs tracking-tight">Rocket</span>
          </div>
        );
      case 'visa':
        return (
          <div 
            key="visa"
            className="h-8 px-3 bg-white rounded-lg border border-stone-200 shadow-xs flex items-center justify-center cursor-default hover:bg-stone-50 transition-all" 
            title="VISA Card"
          >
            <svg className="h-4 w-auto" viewBox="0 0 100 32" fill="none">
              <path d="M38.8 3.5L25.6 28.5H17.2L10.3 8.3C9.9 6.7 9.4 6.1 8.2 5.5C6.3 4.5 3.1 3.5 0 2.8L0.4 1H14.1C15.9 1 17.4 2.2 17.8 4.2L21.2 22.2L29.6 1H38.8ZM73.2 20.3C73.3 12.5 62.4 12.1 62.5 8.7C62.6 7.6 63.6 6.5 66 6.2C67.2 6 70.5 5.9 74.3 7.7L75.8 1.4C73.8 0.7 71.1 0 67.7 0C59.5 0 53.7 4.4 53.6 10.6C53.4 15.2 57.7 17.8 60.8 19.3C64 20.9 65.1 21.9 65 23.3C64.9 25.4 62.4 26.3 60 26.3C55.8 26.3 53.4 25.1 51.5 24.2L49.9 30.7C51.8 31.6 55.4 32.3 59.2 32.4C68 32.4 73.2 28 73.2 20.3ZM93.8 28.5H100L94.6 1H89.2C87.9 1 86.8 1.8 86.3 2.9L73.8 28.5H82.4L84.1 23.8H94.6M86.5 17.2L90.8 5.6L93.2 17.2H86.5ZM51.8 1H43.6L37.1 28.5H45.3L51.8 1Z" fill="#1A1F71"/>
            </svg>
          </div>
        );
      case 'mastercard':
        return (
          <div 
            key="mastercard"
            className="h-8 px-3 bg-white rounded-lg border border-stone-200 shadow-xs flex items-center gap-1.5 cursor-default hover:bg-stone-50 transition-all" 
            title="Mastercard"
          >
            <svg className="h-4.5 w-auto" viewBox="0 0 38 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#EB001B"/>
              <circle cx="26" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9"/>
              <path d="M19 4.76a9.96 9.96 0 0 1 3 7.24 9.96 9.96 0 0 1-3 7.24 9.96 9.96 0 0 1-3-7.24 9.96 9.96 0 0 1 3-7.24z" fill="#FF5F00"/>
            </svg>
            <span className="text-[11px] font-extrabold text-stone-900 tracking-tight">mastercard</span>
          </div>
        );
      case 'amex':
      case 'american express':
        return (
          <div 
            key="amex"
            className="h-8 px-3 bg-[#006FCF] text-white rounded-lg border border-[#005bb0] flex items-center justify-center shadow-xs cursor-default hover:brightness-105 transition-all" 
            title="American Express"
          >
            <span className="text-[11px] font-black tracking-wider font-sans italic">AMEX</span>
          </div>
        );
      case 'cod':
      case 'cash on delivery':
        return (
          <div 
            key="cod"
            className="h-8 px-3 bg-[#072415] text-amber-400 rounded-lg border border-emerald-700/80 flex items-center gap-1.5 font-bold text-xs shadow-xs cursor-default hover:bg-[#0a311d] transition-all" 
            title="Cash on Delivery (COD)"
          >
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cash on Delivery</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer id="contact" className="bg-[#0b1a12] text-stone-300 pt-14 pb-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <KiraHaqLogo size="md" lightMode={true} showSubtitle={true} customLogoUrl={customLogoUrl} siteSettings={siteSettings} />
            </div>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {aboutText}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {siteSettings?.socialMedia?.facebook && (
                <a 
                  href={siteSettings.socialMedia.facebook}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {siteSettings?.socialMedia?.youtube && (
                <a 
                  href={siteSettings.socialMedia.youtube}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {siteSettings?.socialMedia?.instagram && (
                <a 
                  href={siteSettings.socialMedia.instagram}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings?.socialMedia?.twitter && (
                <a 
                  href={siteSettings.socialMedia.twitter}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {siteSettings?.socialMedia?.tiktok && (
                <a 
                  href={siteSettings.socialMedia.tiktok}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="TikTok"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.81 1.55v-3.48a4.85 4.85 0 0 1-1-.09z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Mobile App Download Buttons */}
            {(siteSettings?.playStoreEnabled !== false || siteSettings?.appStoreEnabled !== false) && (
              <div className="pt-3 space-y-2">
                <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Experience Mobile Shopping
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  {siteSettings?.playStoreEnabled !== false && (
                    <a
                      href={siteSettings?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.kirahaq.app'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-black hover:bg-stone-900 text-white rounded-lg border border-stone-700 hover:border-amber-400 shadow-md transition-all group cursor-pointer"
                      title="Get it on Google Play Store"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M3.608 1.815c-.244.258-.382.637-.382 1.116v18.138c0 .48.138.858.382 1.116l.061.059 10.155-10.155v-.241L3.669 1.756l-.061.059z" fill="#00D2FF" />
                        <path d="M17.218 15.682l-3.394-3.393v-.241l3.394-3.393.076.043 4.02 2.284c1.148.652 1.148 1.721 0 2.373l-4.02 2.284-.076.043z" fill="#FFD200" />
                        <path d="M13.824 12.289L3.608 22.505c.382.404 1.01.455 1.722.051l11.888-6.755-3.394-3.512z" fill="#FF3A44" />
                        <path d="M13.824 11.711l3.394-3.512L5.33 1.444c-.712-.404-1.34-.353-1.722.051l10.216 10.216z" fill="#00E676" />
                      </svg>
                      <div className="text-left leading-none">
                        <div className="text-[8px] uppercase tracking-wider text-stone-400">GET IT ON</div>
                        <div className="text-[10px] font-bold text-white tracking-wide group-hover:text-amber-300 transition-colors">Google Play</div>
                      </div>
                    </a>
                  )}
                  {siteSettings?.appStoreEnabled !== false && (
                    <a
                      href={siteSettings?.appStoreUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-black hover:bg-stone-900 text-white rounded-lg border border-stone-700 hover:border-amber-400 shadow-md transition-all group cursor-pointer"
                      title="Download on the App Store"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.76 2.5-3.18 2.52-.77.01-1.02-.45-1.92-.45-.9 0-1.18.45-1.93.47-1.46.03-2.52-1.34-3.48-2.67-1.91-2.65-3.35-7.5-1.4-10.82.97-1.68 2.73-2.75 4.64-2.78 1.34-.02 2.6.9 3.39.9.79 0 2.25-1.07 3.79-.92.65.03 2.5.26 3.68 1.94-.09.05-2.15 1.25-2.13 3.75.03 3.12 2.65 4.24 2.77 4.29-.02.06-.45 1.57-1.5 3.11zM15.44 6.06c.64-.78 1.06-1.85.94-2.92-1.06.04-2.35.71-3.1 1.62-.64.76-1.1 1.84-.94 2.92 1.18.09 2.45-.64 3.1-1.62z" />
                      </svg>
                      <div className="text-left leading-none">
                        <div className="text-[8px] uppercase tracking-wider text-stone-400">Download on the</div>
                        <div className="text-[10px] font-bold text-white tracking-wide group-hover:text-amber-300 transition-colors">App Store</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm tracking-wider uppercase border-b border-emerald-900/80 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button onClick={() => handleNav(link.target)} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => onNavigate && onNavigate('admin')} className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Our Products */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm tracking-wider uppercase border-b border-emerald-900/80 pb-2">
              Our Products
            </h4>
            <ul className="space-y-2 text-xs">
              {productLinks.map((link) => (
                <li key={link.id}>
                  <button onClick={() => handleNav(link.target)} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm tracking-wider uppercase border-b border-emerald-900/80 pb-2">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-amber-300 transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-amber-300 transition-colors break-all">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{location}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{workTime}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Payment Icons */}
        <div className="pt-8 border-t border-emerald-950 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-400">
          <p>{copyright}</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-[11px] font-medium text-stone-400 shrink-0">Accepted Payment Methods:</span>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              {enabledPayments.map((method) => renderPaymentBadge(method))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
