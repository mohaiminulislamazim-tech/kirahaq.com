import React, { useState } from 'react';
import { 
  Search, Heart, ShoppingBag, Menu, X, Sparkles, 
  CheckCircle, Globe, ChevronDown, User, PhoneCall, ShieldCheck,
  Package, ChevronRight
} from 'lucide-react';
import { AppView, Currency, UserAccount, CURRENCY_LIST, CURRENCIES, SiteSettings, DEFAULT_MENU_ITEMS, MenuItem } from '../types';
import { KiraHaqLogo } from './KiraHaqLogo';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currency: Currency;
  currentUser: UserAccount | null;
  currentView?: AppView;
  customLogoUrl?: string;
  announcementText?: string;
  siteSettings?: SiteSettings;
  onNavigate?: (view: AppView) => void;
  onCurrencyChange: (c: Currency) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAiAdvisor: () => void;
  onOpenConsultation: () => void;
  onOpenAccountModal?: () => void;
  onOpenAdminPanel?: () => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  currency,
  currentUser,
  currentView = 'home',
  customLogoUrl,
  announcementText,
  siteSettings,
  onNavigate,
  onCurrencyChange,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenAiAdvisor,
  onOpenConsultation,
  onOpenAccountModal,
  onOpenAdminPanel,
  onSelectCategory,
  activeCategory
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');

  const navItems: MenuItem[] = Array.isArray(siteSettings?.menuItems)
    ? siteSettings.menuItems
    : DEFAULT_MENU_ITEMS;

  const handleNavClick = (view: AppView, categoryName?: string) => {
    if (onNavigate) {
      if (categoryName) {
        onSelectCategory(categoryName);
      } else if (view === 'products') {
        onSelectCategory('All');
      }
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveDropdownId(null);
    setMobileMenuOpen(false);
  };


  const activeAnnouncement = (announcementText || siteSettings?.announcementText || '').trim();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-amber-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#1b3d2b] text-white py-2 px-4 text-xs font-medium border-b border-emerald-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {siteSettings?.announcementMode === 'still' ? (
            /* Still / Fixed Centered Text */
            <div className="flex-1 flex items-center justify-center text-center">
              <span className="flex items-center justify-center gap-2 font-bold text-amber-300 py-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeAnnouncement || '100% Pure Organic Sunnah Products • Special Offer: Use SUNNAH10 for 10% OFF'}</span>
              </span>
            </div>
          ) : (
            /* Running Ticker / Marquee Container */
            <div className="flex-1 overflow-hidden relative flex items-center group cursor-pointer py-0.5">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#1b3d2b] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#1b3d2b] to-transparent z-10 pointer-events-none" />

              <div className="animate-marquee text-emerald-100 flex items-center gap-8">
                {activeAnnouncement ? (
                  <span className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{activeAnnouncement}</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-8 shrink-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>100% Pure & Organic Natural Products</span>
                    </span>
                    <span className="text-amber-400/60">•</span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-amber-300 font-semibold">Special Offer: Use Code "SUNNAH10" for 10% OFF</span>
                    </span>
                    <span className="text-amber-400/60">•</span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Halal Certified & Lab Tested Quality</span>
                    </span>
                    <span className="text-amber-400/60">•</span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Worldwide Express Delivery Available</span>
                    </span>
                    <span className="text-amber-400/60">•</span>
                    <span className="flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Free Prophetic Medicine Consultation</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5">
        <div className="flex items-center justify-between gap-1 sm:gap-4 min-h-[42px] sm:min-h-[48px] w-full">
          
          {/* Mobile Left: Menu Toggle Button */}
          <div className="flex lg:hidden items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-stone-800 hover:text-[#1b3d2b] hover:bg-stone-100/80 active:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Logo - Hidden on mobile if on product-detail, centered on mobile for other pages, Left-aligned on Desktop */}
          <div 
            className={`${
              currentView === 'product-detail' 
                ? 'hidden lg:flex' 
                : 'flex-1 lg:flex-none flex items-center justify-center lg:justify-start px-1 sm:px-0'
            } cursor-pointer shrink-0 min-w-0`} 
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {/* On mobile use compact size, on tablet/desktop use md */}
            <div className="block sm:hidden">
              <KiraHaqLogo 
                size="sm" 
                showSubtitle={false} 
                customLogoUrl={customLogoUrl} 
                siteSettings={siteSettings} 
              />
            </div>
            <div className="hidden sm:block">
              <KiraHaqLogo 
                size="md" 
                showSubtitle={true} 
                customLogoUrl={customLogoUrl} 
                siteSettings={siteSettings} 
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-3 text-sm font-semibold text-stone-800 mx-auto">
            {navItems.map((item) => {
              const hasSub = item.subItems && item.subItems.length > 0;
              const isDropdownOpen = activeDropdownId === item.id;
              const isCurrentActive = currentView === item.pathView && (!item.categoryFilter || activeCategory === item.categoryFilter);

              if (hasSub) {
                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdownId(item.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <button
                      onClick={() => handleNavClick(item.pathView, item.categoryFilter)}
                      className={`py-1.5 px-2.5 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isCurrentActive
                          ? 'text-[#1b3d2b] font-bold border-b-2 border-amber-700'
                          : 'hover:text-[#1b3d2b]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#1b3d2b]' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full pt-1.5 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="bg-white rounded-xl shadow-xl border border-amber-100 py-2 overflow-hidden">
                          <div className="px-3.5 py-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>{item.label}</span>
                            <Package className="w-3.5 h-3.5 text-amber-700" />
                          </div>
                          {item.subItems!.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleNavClick(item.pathView, sub.categoryFilter)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 hover:text-[#1b3d2b] text-stone-700 transition-colors cursor-pointer"
                            >
                              <span>{sub.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-stone-400 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.pathView, item.categoryFilter)}
                  className={`py-1.5 px-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isCurrentActive
                      ? 'text-[#1b3d2b] font-bold border-b-2 border-amber-700'
                      : 'hover:text-[#1b3d2b]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons (Right side) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 z-20 ml-auto lg:ml-0">
            {/* Currency Selector Box & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-white border border-stone-200 hover:border-amber-400 rounded-md text-[11px] sm:text-xs font-bold text-stone-800 shadow-2xs transition-all cursor-pointer"
                title="Select Currency"
              >
                <span>{CURRENCIES[currency]?.flag || '🌐'}</span>
                <span className="hidden sm:inline">{currency}</span>
                <span className="text-[10px] sm:text-xs font-bold">({CURRENCIES[currency]?.symbol || '$'})</span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-500 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 sm:w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 max-h-80 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 flex items-center justify-between bg-stone-50/80 sticky top-0 z-10">
                      <span>Select Currency</span>
                      <span className="text-amber-700 font-serif font-bold">17 Global Currencies</span>
                    </div>
                    {CURRENCY_LIST.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onCurrencyChange(c.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-amber-50/80 transition-colors cursor-pointer ${
                          currency === c.code ? 'bg-emerald-50 text-[#1b3d2b] font-bold border-l-3 border-[#1b3d2b]' : 'text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{c.flag}</span>
                          <span className="font-bold">{c.code}</span>
                          <span className="text-amber-800 font-bold">({c.symbol})</span>
                        </div>
                        <span className="text-[11px] text-stone-500 truncate max-w-[90px] text-right font-normal">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-1 sm:p-1.5 text-stone-800 hover:text-[#1b3d2b] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User Account - Hidden on mobile as it is prominent in mobile menu */}
            <button
              onClick={onOpenAccountModal}
              className="hidden sm:flex p-1 sm:p-1.5 text-stone-800 hover:text-[#1b3d2b] hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
              title={currentUser ? `Account: ${currentUser.name}` : "Customer Account"}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {currentUser && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-1 sm:p-1.5 text-stone-800 hover:text-[#1b3d2b] hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="p-1 sm:p-1.5 text-stone-800 hover:text-[#1b3d2b] hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-stone-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#1b3d2b] text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Navigation</span>
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Sunnah Guide</span>
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const hasSub = item.subItems && item.subItems.length > 0;
              const isExpanded = mobileExpandedId === item.id;

              if (hasSub) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setMobileExpandedId(isExpanded ? null : item.id)}
                      className="w-full flex items-center justify-between py-2 px-3 text-sm font-bold text-stone-800 bg-stone-50 hover:bg-emerald-50 rounded-md transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="pl-4 pr-2 py-1 space-y-1 bg-amber-50/40 rounded-lg border border-amber-100/60">
                        {item.subItems!.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(item.pathView, sub.categoryFilter)}
                            className="w-full text-left py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-between transition-colors text-stone-700 hover:bg-stone-100 cursor-pointer"
                          >
                            <span>{sub.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.pathView, item.categoryFilter)}
                  className="w-full text-left py-2 px-3 text-sm font-semibold text-stone-800 hover:bg-emerald-50 rounded-md transition-colors block cursor-pointer"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAccountModal) onOpenAccountModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 rounded-lg font-semibold"
              >
                <User className="w-4 h-4 text-emerald-700" />
                <span>{currentUser ? currentUser.name : 'Account'}</span>
              </button>

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="px-3 py-1.5 bg-[#1b3d2b] text-amber-300 font-semibold rounded-md text-xs cursor-pointer"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
