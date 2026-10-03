import React, { useState } from 'react';
import { SiteSettings, Currency, DEFAULT_MENU_ITEMS, MenuItem, MenuSubItem } from '../../types';
import { KiraHaqLogo } from '../KiraHaqLogo';
import { 
  Sliders, Save, CheckCircle2, Image as ImageIcon, Type, Globe, Upload,
  Menu as MenuIcon, Plus, Trash2, RotateCcw, Edit3, Layers, Sparkles, CreditCard, PhoneCall, Smartphone, ChevronUp, ChevronDown, Palette, Tag
} from 'lucide-react';

const PRESET_BANNER_COLORS = [
  { name: 'Royal Purple', value: '#581c87' },
  { name: 'Crimson Red', value: '#dc2626' },
  { name: 'Forest Emerald', value: '#065f46' },
  { name: 'Honey Amber', value: '#b45309' },
  { name: 'Ocean Blue', value: '#1e40af' },
  { name: 'Midnight Charcoal', value: '#292524' },
  { name: 'Sunset Orange', value: '#ea580c' },
  { name: 'Rose Gold', value: '#be185d' },
  { name: 'Deep Burgundy', value: '#881337' },
  { name: 'Purple Gradient', value: 'linear-gradient(135deg, #581c87 0%, #1e1b4b 100%)' },
  { name: 'Emerald Gradient', value: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)' },
  { name: 'Ruby Dark Gradient', value: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)' },
  { name: 'Amber Gold Gradient', value: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
];

const resolveColorToHex = (color: string): string => {
  if (!color) return '#581c87';
  if (color.startsWith('#')) return color;
  if (color === 'bg-purple-900') return '#581c87';
  if (color === 'bg-red-600') return '#dc2626';
  if (color === 'bg-stone-700') return '#44403c';
  if (color === 'bg-emerald-800') return '#065f46';
  if (color === 'bg-blue-900') return '#1e3a8a';
  if (color === 'bg-amber-800') return '#92400e';
  return '#581c87';
};

interface AdminSettingsTabProps {
  siteSettings: SiteSettings;
  currency: Currency;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

export function AdminSettingsTab({ siteSettings, currency, onUpdateSiteSettings }: AdminSettingsTabProps) {
  const [formState, setFormState] = useState<SiteSettings>({
    ...siteSettings,
    language: siteSettings.language || 'English',
    menuItems: Array.isArray(siteSettings.menuItems) ? siteSettings.menuItems : DEFAULT_MENU_ITEMS,
    sectionVisibilityMobile: Array.isArray(siteSettings.sectionVisibilityMobile) ? siteSettings.sectionVisibilityMobile : [
      { id: 'heroBanner', name: 'Hero Banner', isVisible: true },
      { id: 'discountBanners', name: 'Discount Banners', isVisible: true },
      { id: 'categories', name: 'Categories', isVisible: true },
      { id: 'featuredProducts', name: 'Featured Products', isVisible: true },
      { id: 'consultation', name: 'Consultation', isVisible: true },
      { id: 'valueProp', name: 'Value Proposition', isVisible: true },
      { id: 'testimonials', name: 'Testimonials', isVisible: true },
      { id: 'blog', name: 'Blog', isVisible: true },
      { id: 'newsletter', name: 'Newsletter', isVisible: true },
    ],
    sectionVisibilityDesktop: Array.isArray(siteSettings.sectionVisibilityDesktop) ? siteSettings.sectionVisibilityDesktop : [
      { id: 'heroBanner', name: 'Hero Banner', isVisible: true },
      { id: 'discountBanners', name: 'Discount Banners', isVisible: true },
      { id: 'categories', name: 'Categories', isVisible: true },
      { id: 'featuredProducts', name: 'Featured Products', isVisible: true },
      { id: 'consultation', name: 'Consultation', isVisible: true },
      { id: 'valueProp', name: 'Value Proposition', isVisible: true },
      { id: 'testimonials', name: 'Testimonials', isVisible: true },
      { id: 'blog', name: 'Blog', isVisible: true },
      { id: 'newsletter', name: 'Newsletter', isVisible: true },
    ]
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>('m2'); // default expand Shop

  React.useEffect(() => {
    if (siteSettings?.menuItems) {
      setFormState(prev => ({
        ...prev,
        ...siteSettings,
        menuItems: siteSettings.menuItems
      }));
    }
  }, [siteSettings]);

  const currentMenuItems = Array.isArray(formState.menuItems) ? formState.menuItems : DEFAULT_MENU_ITEMS;

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const nextState = { ...formState, logoUrl: result };
          setFormState(nextState);
          onUpdateSiteSettings(nextState);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormState(prev => ({ ...prev, heroImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentLogoUpload = (methodId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormState(prev => ({
            ...prev,
            paymentLogos: {
              ...(prev.paymentLogos || {}),
              [methodId]: result
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePaymentLogo = (methodId: string) => {
    setFormState(prev => {
      const updatedLogos = { ...(prev.paymentLogos || {}) };
      delete updatedLogos[methodId];
      return {
        ...prev,
        paymentLogos: updatedLogos
      };
    });
  };

  const handleAddMenuItem = () => {
    const newId = `menu_${Date.now()}`;
    const newItem: MenuItem = {
      id: newId,
      label: 'New Nav Link',
      pathView: 'products',
      categoryFilter: 'All',
      dropdownType: 'custom',
      subItems: [
        { id: `sub_${Date.now()}_1`, label: 'Sub Category 1', categoryFilter: 'Pure Honey' },
        { id: `sub_${Date.now()}_2`, label: 'Sub Category 2', categoryFilter: 'Natural Foods' }
      ]
    };
    const updated = [...currentMenuItems, newItem];
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
    setExpandedMenuId(newId);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = currentMenuItems.filter(item => item.id !== id);
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
  };

  const handleUpdateMenuItemField = (id: string, field: keyof MenuItem, value: any) => {
    const updated = currentMenuItems.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'dropdownType' && value !== 'none' && (!newItem.subItems || newItem.subItems.length === 0)) {
          newItem.subItems = [
            { id: `sub_${Date.now()}_1`, label: 'New Category Sub-link', categoryFilter: 'All' }
          ];
        }
        return newItem;
      }
      return item;
    });
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
  };

  const handleUpdateSubItemField = (itemId: string, subId: string, field: keyof MenuSubItem, value: string) => {
    const updated = currentMenuItems.map(item => {
      if (item.id === itemId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map(sub => sub.id === subId ? { ...sub, [field]: value } : sub)
        };
      }
      return item;
    });
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
  };

  const handleAddSubItem = (itemId: string) => {
    const updated = currentMenuItems.map(item => {
      if (item.id === itemId) {
        const subItems = item.subItems ? [...item.subItems] : [];
        const newSubId = `sub_${Date.now()}`;
        subItems.push({
          id: newSubId,
          label: 'New Dropdown Item',
          categoryFilter: 'All'
        });
        return { 
          ...item, 
          dropdownType: item.dropdownType === 'none' ? 'custom' : item.dropdownType,
          subItems 
        };
      }
      return item;
    });
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
    setExpandedMenuId(itemId);
  };

  const handleDeleteSubItem = (itemId: string, subId: string) => {
    const updated = currentMenuItems.map(item => {
      if (item.id === itemId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => sub.id !== subId)
        };
      }
      return item;
    });
    const nextState = { ...formState, menuItems: updated };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
  };

  const handleResetMenu = () => {
    const nextState = { ...formState, menuItems: DEFAULT_MENU_ITEMS };
    setFormState(nextState);
    onUpdateSiteSettings(nextState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-800 to-stone-900 p-5 rounded-2xl border border-stone-700 shadow-md">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Storefront Settings & Branding Configuration</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure store logo, main hero banner, mega menu links (Home, Shop, Natural Foods), and language options.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Site settings updated successfully! Mega Menu and branding changes are now live on the storefront.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header Announcement Bar Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-700 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Header Announcement Bar Settings</span>
            </h4>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${formState.announcementMode === 'still' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
              {formState.announcementMode === 'still' ? 'Still / Fixed Text' : 'Running / Marquee Text'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Announcement Text Input */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Announcement Text
              </label>
              <textarea
                rows={2}
                value={formState.announcementText || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, announcementText: e.target.value }))}
                placeholder="Write your announcement text here..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Edit the announcement bar message displayed at the top of the website.
              </p>
            </div>

            {/* Display Mode Selection: Running vs Still */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Text Display Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  (formState.announcementMode || 'running') === 'running'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-600'
                }`}>
                  <input
                    type="radio"
                    name="announcementMode"
                    value="running"
                    checked={(formState.announcementMode || 'running') === 'running'}
                    onChange={() => setFormState(prev => ({ ...prev, announcementMode: 'running' }))}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Running / Marquee</span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Running</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Continuous scrolling loop across header</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formState.announcementMode === 'still'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-600'
                }`}>
                  <input
                    type="radio"
                    name="announcementMode"
                    value="still"
                    checked={formState.announcementMode === 'still'}
                    onChange={() => setFormState(prev => ({ ...prev, announcementMode: 'still' }))}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Still / Centered</span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Still</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Stationary centered text without animation</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section Visibility & Ordering Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Layout</span>
            </h4>
            <div className="space-y-3">
                {(formState.sectionVisibilityMobile || []).map((section, index) => (
                <div key={section.id} className="flex items-center gap-3 p-4 bg-stone-900 rounded-xl border border-stone-700">
                    <input
                    type="checkbox"
                    checked={section.isVisible}
                    onChange={(e) => {
                        const newVisibility = [...(formState.sectionVisibilityMobile || [])];
                        newVisibility[index] = { ...section, isVisible: e.target.checked };
                        setFormState(prev => ({ ...prev, sectionVisibilityMobile: newVisibility }));
                    }}
                    className="w-5 h-5 accent-amber-400"
                    />
                    <span className="flex-1 text-sm font-bold text-stone-300">{section.name}</span>
                    <div className="flex gap-1">
                    <button 
                        disabled={index === 0}
                        onClick={() => {
                            const newVisibility = [...(formState.sectionVisibilityMobile || [])];
                            [newVisibility[index], newVisibility[index - 1]] = [newVisibility[index - 1], newVisibility[index]];
                            setFormState(prev => ({ ...prev, sectionVisibilityMobile: newVisibility }));
                        }}
                        className="p-1.5 bg-stone-700 rounded hover:bg-stone-600 disabled:opacity-50"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        disabled={index === (formState.sectionVisibilityMobile?.length || 0) - 1}
                        onClick={() => {
                            const newVisibility = [...(formState.sectionVisibilityMobile || [])];
                            [newVisibility[index], newVisibility[index + 1]] = [newVisibility[index + 1], newVisibility[index]];
                            setFormState(prev => ({ ...prev, sectionVisibilityMobile: newVisibility }));
                        }}
                        className="p-1.5 bg-stone-700 rounded hover:bg-stone-600 disabled:opacity-50"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                ))}
            </div>
            </div>

            <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
                <Smartphone className="w-4 h-4" /> {/* Should be Desktop icon ideally */}
                <span>Desktop Layout</span>
            </h4>
            <div className="space-y-3">
                {(formState.sectionVisibilityDesktop || []).map((section, index) => (
                <div key={section.id} className="flex items-center gap-3 p-4 bg-stone-900 rounded-xl border border-stone-700">
                    <input
                    type="checkbox"
                    checked={section.isVisible}
                    onChange={(e) => {
                        const newVisibility = [...(formState.sectionVisibilityDesktop || [])];
                        newVisibility[index] = { ...section, isVisible: e.target.checked };
                        setFormState(prev => ({ ...prev, sectionVisibilityDesktop: newVisibility }));
                    }}
                    className="w-5 h-5 accent-amber-400"
                    />
                    <span className="flex-1 text-sm font-bold text-stone-300">{section.name}</span>
                    <div className="flex gap-1">
                    <button 
                        disabled={index === 0}
                        onClick={() => {
                            const newVisibility = [...(formState.sectionVisibilityDesktop || [])];
                            [newVisibility[index], newVisibility[index - 1]] = [newVisibility[index - 1], newVisibility[index]];
                            setFormState(prev => ({ ...prev, sectionVisibilityDesktop: newVisibility }));
                        }}
                        className="p-1.5 bg-stone-700 rounded hover:bg-stone-600 disabled:opacity-50"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        disabled={index === (formState.sectionVisibilityDesktop?.length || 0) - 1}
                        onClick={() => {
                            const newVisibility = [...(formState.sectionVisibilityDesktop || [])];
                            [newVisibility[index], newVisibility[index + 1]] = [newVisibility[index + 1], newVisibility[index]];
                            setFormState(prev => ({ ...prev, sectionVisibilityDesktop: newVisibility }));
                        }}
                        className="p-1.5 bg-stone-700 rounded hover:bg-stone-600 disabled:opacity-50"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>

        {/* Mega Menu Editor (Home, Shop, Natural Foods, etc) */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-700 pb-4">
            <div>
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <MenuIcon className="w-4 h-4" />
                <span>Mega Menu & Header Navigation Manager</span>
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Add, delete, and edit main header navigation items, target pages, and dropdown sub-menu categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddMenuItem}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Main Menu</span>
              </button>

              <button
                type="button"
                onClick={handleResetMenu}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentMenuItems.map((menuItem, index) => {
              const isExpanded = expandedMenuId === menuItem.id;
              const hasSubItems = menuItem.subItems && menuItem.subItems.length > 0;

              return (
                <div 
                  key={menuItem.id}
                  className="bg-stone-900 border border-stone-700 rounded-2xl transition-all overflow-hidden"
                >
                  {/* Menu Item Controls Header */}
                  <div className="p-4 bg-stone-900/90 space-y-3">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 shrink-0">
                          #{index + 1}
                        </span>

                        <div className="flex-1 min-w-[140px] sm:min-w-[180px]">
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                            Menu Item Label
                          </label>
                          <input
                            type="text"
                            value={menuItem.label}
                            onChange={(e) => handleUpdateMenuItemField(menuItem.id, 'label', e.target.value)}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. Pure Honey, Shop..."
                          />
                        </div>

                        <div className="w-32 sm:w-36 shrink-0 hidden sm:block">
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                            Target View Page
                          </label>
                          <select
                            value={menuItem.pathView || 'products'}
                            onChange={(e) => handleUpdateMenuItemField(menuItem.id, 'pathView', e.target.value)}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:border-amber-400 focus:outline-none"
                          >
                            <option value="home">Home Page</option>
                            <option value="products">Products Shop</option>
                            <option value="categories">Categories Grid</option>
                            <option value="blog">Islamic Blog</option>
                            <option value="consultation">Consultation</option>
                            <option value="contact">Contact Us</option>
                          </select>
                        </div>

                        <div className="w-36 sm:w-40 shrink-0 hidden lg:block">
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                            Dropdown Style
                          </label>
                          <select
                            value={menuItem.dropdownType || 'none'}
                            onChange={(e) => handleUpdateMenuItemField(menuItem.id, 'dropdownType', e.target.value)}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:border-amber-400 focus:outline-none"
                          >
                            <option value="none">No Dropdown</option>
                            <option value="custom">Custom Sub-items</option>
                            <option value="shop">Full Shop Mega Menu</option>
                            <option value="natural-foods">Natural Foods Mega</option>
                            <option value="sunnah-products">Sunnah Products Mega</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start xl:self-center flex-wrap pt-1 xl:pt-0">
                        <button
                          type="button"
                          onClick={() => setExpandedMenuId(isExpanded ? null : menuItem.id)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-stone-700 shrink-0"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>{menuItem.subItems?.length || 0} Sub-items</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddSubItem(menuItem.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                          title="Add new dropdown sub-item"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Dropdown</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteMenuItem(menuItem.id);
                          }}
                          className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                          title="Delete main menu item"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Secondary Row for Mobile/Tablet Settings */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden pt-2 border-t border-stone-800">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                          Target View
                        </label>
                        <select
                          value={menuItem.pathView || 'products'}
                          onChange={(e) => handleUpdateMenuItemField(menuItem.id, 'pathView', e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2 py-1 text-xs text-stone-200"
                        >
                          <option value="home">Home Page</option>
                          <option value="products">Products Shop</option>
                          <option value="categories">Categories Grid</option>
                          <option value="blog">Islamic Blog</option>
                          <option value="consultation">Consultation</option>
                          <option value="contact">Contact Us</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                          Dropdown Style
                        </label>
                        <select
                          value={menuItem.dropdownType || 'none'}
                          onChange={(e) => handleUpdateMenuItemField(menuItem.id, 'dropdownType', e.target.value)}
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2 py-1 text-xs text-stone-200"
                        >
                          <option value="none">No Dropdown</option>
                          <option value="custom">Custom Sub-items</option>
                          <option value="shop">Full Shop Mega</option>
                          <option value="natural-foods">Natural Foods</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Sub-items list */}
                  {isExpanded && (
                    <div className="p-4 border-t border-stone-800 bg-stone-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Dropdown Sub-Menu Items inside "{menuItem.label}":</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddSubItem(menuItem.id)}
                          className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Sub-item</span>
                        </button>
                      </div>

                      {(!menuItem.subItems || menuItem.subItems.length === 0) ? (
                        <div className="p-4 text-center text-xs text-stone-500 bg-stone-900 rounded-xl border border-dashed border-stone-800">
                          No dropdown sub-items configured. Click "+ Add Sub-item" above to add dropdown links.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {menuItem.subItems.map((sub, sIndex) => (
                            <div 
                              key={sub.id}
                              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-stone-900 p-3.5 rounded-xl border border-stone-800 hover:border-stone-700 transition-colors shadow-xs"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs font-mono text-amber-400 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
                                  {sIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  value={sub.label}
                                  onChange={(e) => handleUpdateSubItemField(menuItem.id, sub.id, 'label', e.target.value)}
                                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:border-amber-400 focus:outline-none font-medium"
                                  placeholder="Dropdown sub-item name..."
                                />
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                                <select
                                  value={sub.categoryFilter || 'All'}
                                  onChange={(e) => handleUpdateSubItemField(menuItem.id, sub.id, 'categoryFilter', e.target.value)}
                                  className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1.5 text-[11px] text-stone-300 focus:border-amber-400 focus:outline-none flex-1 sm:flex-none"
                                >
                                  <option value="All">All Categories</option>
                                  <option value="Pure Honey">Pure Honey</option>
                                  <option value="Natural Foods">Natural Foods</option>
                                  <option value="Sunnah Products">Sunnah Products</option>
                                  <option value="Health Consultation">Consultation</option>
                                  <option value="Gift Packs">Gift Packs</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteSubItem(menuItem.id, sub.id);
                                  }}
                                  className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                                  title="Delete dropdown sub-item"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Logo Configuration */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <ImageIcon className="w-4 h-4" />
            <span>Store Logo & Emblem</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Custom Logo URL or Preset
              </label>
              <input
                type="text"
                placeholder="Leave blank for Calligraphy KH Logo or paste URL..."
                value={formState.logoUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextState = { ...formState, logoUrl: val };
                  setFormState(nextState);
                  onUpdateSiteSettings(nextState);
                }}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <label className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Image</span>
                  <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                </label>

                {formState.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = { ...formState, logoUrl: '' };
                      setFormState(nextState);
                      onUpdateSiteSettings(nextState);
                    }}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Calligraphy Logo</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-700 flex flex-col items-center justify-center space-y-3 min-h-[130px]">
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Storefront Live Header Logo Preview
              </span>
              <div className="p-3 bg-stone-900 rounded-2xl border border-stone-800 shadow-inner flex items-center justify-center">
                <KiraHaqLogo 
                  size="md" 
                  lightMode={true} 
                  showSubtitle={true} 
                  customLogoUrl={formState.logoUrl} 
                />
              </div>
            </div>
          </div>
        </div>


        {/* Hero Banner Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <Type className="w-4 h-4" />
            <span>Hero Banner & Main Title</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Hero Tag / Badge Text
              </label>
              <input
                type="text"
                value={formState.heroBadge}
                onChange={(e) => setFormState(prev => ({ ...prev, heroBadge: e.target.value }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Shop Call-To-Action Button Text
              </label>
              <input
                type="text"
                value={formState.shopCtaText || 'Explore Pure Sidr Honey'}
                onChange={(e) => setFormState(prev => ({ ...prev, shopCtaText: e.target.value }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Hero Headline Title
            </label>
            <input
              type="text"
              value={formState.heroTitle}
              onChange={(e) => setFormState(prev => ({ ...prev, heroTitle: e.target.value }))}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none font-serif font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Hero Subtitle Paragraph
            </label>
            <textarea
              rows={3}
              value={formState.heroSubtitle}
              onChange={(e) => setFormState(prev => ({ ...prev, heroSubtitle: e.target.value }))}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Hero Image URL
            </label>
            <input
              type="text"
              value={formState.heroImage}
              onChange={(e) => setFormState(prev => ({ ...prev, heroImage: e.target.value }))}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
            <label className="mt-2 inline-block px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-colors shadow-xs w-fit">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Hero Image</span>
              <input type="file" accept="image/*" onChange={handleHeroFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Currency & Language Options */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <Globe className="w-4 h-4" />
            <span>Store Currency, Multi-Currency & Language Options</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Default Product Pricing Base Currency
              </label>
              <select
                value={formState.defaultProductCurrency || 'MYR'}
                onChange={(e) => setFormState(prev => ({ ...prev, defaultProductCurrency: e.target.value as Currency }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
              >
                <option value="MYR">🇲🇾 Malaysian Ringgit (MYR - RM) - Default</option>
                <option value="BDT">🇧🇩 Bangladeshi Taka (BDT - ৳)</option>
                <option value="USD">🇺🇸 US Dollar (USD - $)</option>
                <option value="SAR">🇸🇦 Saudi Riyal (SAR - ر.س)</option>
                <option value="AED">🇦🇪 UAE Dirham (AED - د.إ)</option>
                <option value="EUR">🇪🇺 Euro (EUR - €)</option>
                <option value="GBP">🇬🇧 British Pound (GBP - £)</option>
                <option value="CAD">🇨🇦 Canadian Dollar (CAD - CA$)</option>
                <option value="AUD">🇦🇺 Australian Dollar (AUD - AU$)</option>
                <option value="SGD">🇸🇬 Singapore Dollar (SGD - S$)</option>
                <option value="INR">🇮🇳 Indian Rupee (INR - ₹)</option>
              </select>
              <p className="text-[11px] text-stone-400 mt-1">
                New products will automatically default to this currency with auto-sync to all others.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Store Front Language
              </label>
              <select
                value={formState.language || 'English'}
                onChange={(e) => setFormState(prev => ({ ...prev, language: e.target.value as any }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="English">English (Multi-Currency: RM, ৳, $)</option>
                <option value="Arabic">Arabic - العربية (﷼ SAR & RM)</option>
              </select>
            </div>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-300">Live Multi-Currency Configuration</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                1 USD = 4.70 MYR = 120.0 BDT
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Customers can seamlessly switch between Malaysian Ringgit (RM), Bangladeshi Taka (৳), and US Dollars ($) in real-time from the header and footer currency selector.
            </p>
          </div>
        </div>

        {/* Hero Buttons Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <Layers className="w-4 h-4" />
            <span>Hero Call to Action Buttons</span>
          </h4>
          <div className="space-y-4">
            {(formState.heroButtons || []).map((button, index) => (
              <div key={button.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-stone-900 p-4 rounded-xl border border-stone-700">
                <input
                  type="text"
                  placeholder="Button Label"
                  value={button.label}
                  onChange={(e) => {
                    const newButtons = [...(formState.heroButtons || [])];
                    newButtons[index] = { ...newButtons[index], label: e.target.value };
                    setFormState({ ...formState, heroButtons: newButtons });
                  }}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Button URL"
                  value={button.url}
                  onChange={(e) => {
                    const newButtons = [...(formState.heroButtons || [])];
                    newButtons[index] = { ...newButtons[index], url: e.target.value };
                    setFormState({ ...formState, heroButtons: newButtons });
                  }}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormState({ ...formState, heroButtons: (formState.heroButtons || []).filter((_, i) => i !== index) });
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormState({ 
                  ...formState, 
                  heroButtons: [...(formState.heroButtons || []), { id: Date.now().toString(), label: 'New Button', url: '#' }] 
                });
              }}
              className="w-full bg-stone-700 hover:bg-stone-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Button
            </button>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <Globe className="w-4 h-4" />
            <span>Social Media Links</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].map((platform) => (
              <div key={platform}>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 capitalize">
                  {platform} URL
                </label>
                <input
                  type="url"
                  value={formState.socialMedia?.[platform as keyof NonNullable<SiteSettings['socialMedia']>] || ''}
                  onChange={(e) => setFormState(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, [platform]: e.target.value } 
                  }))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Google Play Store App Button Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-700 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Google Play Store Mobile App Settings</span>
            </h4>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${formState.playStoreEnabled !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-900 text-stone-500 border border-stone-700'}`}>
              {formState.playStoreEnabled !== false ? 'Active / Visible' : 'Disabled / Hidden'}
            </span>
          </div>

          <div className="space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-stone-900 rounded-2xl border border-stone-700">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                  <span>Show Google Play Store Button in Footer</span>
                </label>
                <p className="text-[11px] text-stone-400">
                  Choose whether to show or hide the "Get it on Google Play" button in the footer.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formState.playStoreEnabled !== false}
                  onChange={(e) => setFormState(prev => ({ ...prev, playStoreEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Play Store URL Input */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Google Play Store App URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formState.playStoreUrl || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, playStoreUrl: e.target.value }))}
                  placeholder="https://play.google.com/store/apps/details?id=com.kirahaq.app"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                {formState.playStoreUrl && (
                  <a
                    href={formState.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
                    title="Test Play Store Link"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Link</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                Customers will be redirected to the provided Play Store app page in a new tab when clicking this button.
              </p>
            </div>

            {/* Live Button Preview */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-700 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Button Live Preview
              </span>
              <div className="pt-1">
                {formState.playStoreEnabled !== false ? (
                  <a
                    href={formState.playStoreUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { if (!formState.playStoreUrl) e.preventDefault(); }}
                    className="inline-flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl border border-stone-700 shadow-md cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M3.608 1.815c-.244.258-.382.637-.382 1.116v18.138c0 .48.138.858.382 1.116l.061.059 10.155-10.155v-.241L3.669 1.756l-.061.059z" fill="#00D2FF" />
                      <path d="M17.218 15.682l-3.394-3.393v-.241l3.394-3.393.076.043 4.02 2.284c1.148.652 1.148 1.721 0 2.373l-4.02 2.284-.076.043z" fill="#FFD200" />
                      <path d="M13.824 12.289L3.608 22.505c.382.404 1.01.455 1.722.051l11.888-6.755-3.394-3.512z" fill="#FF3A44" />
                      <path d="M13.824 11.711l3.394-3.512L5.33 1.444c-.712-.404-1.34-.353-1.722.051l10.216 10.216z" fill="#00E676" />
                    </svg>
                    <div className="text-left leading-none">
                      <div className="text-[9px] uppercase tracking-widest text-stone-400 font-medium mb-0.5">GET IT ON</div>
                      <div className="text-xs font-bold text-white tracking-wide font-sans">Google Play</div>
                    </div>
                  </a>
                ) : (
                  <p className="text-xs text-rose-400 font-semibold italic">
                    Play Store button is currently disabled.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Apple App Store App Button Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-700 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Apple App Store Mobile App Settings</span>
            </h4>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${formState.appStoreEnabled !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-900 text-stone-500 border border-stone-700'}`}>
              {formState.appStoreEnabled !== false ? 'Active / Visible' : 'Disabled / Hidden'}
            </span>
          </div>

          <div className="space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-stone-900 rounded-2xl border border-stone-700">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                  <span>Show Apple App Store Button in Footer</span>
                </label>
                <p className="text-[11px] text-stone-400">
                  Choose whether to show or hide the "Download on the App Store" button in the footer.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formState.appStoreEnabled !== false}
                  onChange={(e) => setFormState(prev => ({ ...prev, appStoreEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* App Store URL Input */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Apple App Store App URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formState.appStoreUrl || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, appStoreUrl: e.target.value }))}
                  placeholder="https://apps.apple.com/app/id..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Payment Methods Settings */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <CreditCard className="w-4 h-4" />
            <span>Footer & Payment Badge Settings</span>
          </h4>

          {/* Footer About & Copyright */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Footer About Description Paragraph
              </label>
              <textarea
                rows={3}
                value={formState.footerAboutText || 'Dedicated to offering 100% authentic, unadulterated natural foods and prophetic wellness solutions for a healthy Ummah according to Islamic principles.'}
                onChange={(e) => setFormState(prev => ({ ...prev, footerAboutText: e.target.value }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={formState.copyrightText || `© ${new Date().getFullYear()} Kira Haq. All Rights Reserved. Pure by Nature, Guided by Sunnah.`}
                onChange={(e) => setFormState(prev => ({ ...prev, copyrightText: e.target.value }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Active Payment Badges Toggles & Logo Uploads */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Accepted Payment Badges & Custom Logo Uploads
              </label>
              <p className="text-[11px] text-stone-400">
                Enable/disable payment badges for footer display, or upload custom image logos for bKash, Nagad, Rocket, VISA, Mastercard, AMEX, and COD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'bkash', name: 'bKash Mobile Banking', color: 'bg-[#E2136E]' },
                { id: 'nagad', name: 'Nagad MFS', color: 'bg-[#DF2A27]' },
                { id: 'rocket', name: 'Rocket DBBL', color: 'bg-[#8C3494]' },
                { id: 'visa', name: 'VISA Card', color: 'bg-[#1A1F71]' },
                { id: 'mastercard', name: 'Mastercard', color: 'bg-[#EB001B]' },
                { id: 'amex', name: 'American Express', color: 'bg-[#006FCF]' },
                { id: 'cod', name: 'Cash on Delivery', color: 'bg-[#072415]' },
              ].map((pm) => {
                const currentMethods = formState.enabledPaymentMethods || ['bkash', 'nagad', 'rocket', 'visa', 'mastercard', 'amex', 'cod'];
                const isChecked = currentMethods.includes(pm.id);
                const customLogo = formState.paymentLogos?.[pm.id];

                return (
                  <div key={pm.id} className="p-4 bg-stone-900 rounded-2xl border border-stone-700 space-y-3">
                    {/* Enable Checkbox + Title */}
                    <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated = [...currentMethods];
                            if (e.target.checked) {
                              if (!updated.includes(pm.id)) updated.push(pm.id);
                            } else {
                              updated = updated.filter(i => i !== pm.id);
                            }
                            setFormState(prev => ({ ...prev, enabledPaymentMethods: updated }));
                          }}
                          className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${pm.color} shrink-0`}></span>
                          <span className="text-xs font-bold text-stone-200">{pm.name}</span>
                        </div>
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isChecked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-500'}`}>
                        {isChecked ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    {/* Logo Preview & Upload Option */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      {customLogo ? (
                        <div className="flex items-center gap-2 shrink-0 max-w-[150px]">
                          <div className="w-24 h-9 px-2 bg-white rounded-lg border border-stone-300 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={customLogo} alt={pm.name} className="max-h-6 max-w-[80px] w-auto h-auto object-contain shrink-0" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePaymentLogo(pm.id)}
                            className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-lg border border-stone-700 transition-colors shrink-0"
                            title="Reset to Default SVG Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-stone-400 font-medium italic flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>Using Default SVG Logo</span>
                        </div>
                      )}

                      {/* File Upload Input */}
                      <label className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-stone-700 transition-colors shrink-0">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>{customLogo ? 'Change' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePaymentLogoUpload(pm.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Settings */}
          <div className="pt-2 border-t border-stone-700 space-y-4">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Store Contact Info (Footer & Headers)</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formState.contactInfo?.phone || '+880 1700-000000'}
                  onChange={(e) => setFormState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } as any }))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formState.contactInfo?.email || 'info@kirahaq.com'}
                  onChange={(e) => setFormState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } as any }))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Location Address</label>
                <input
                  type="text"
                  value={formState.contactInfo?.location || 'House 12, Road 5, Dhanmondi, Dhaka-1205'}
                  onChange={(e) => setFormState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, location: e.target.value } as any }))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formState.contactInfo?.whatsapp || '+60 17-4505868'}
                  onChange={(e) => setFormState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, whatsapp: e.target.value } as any }))}
                  placeholder="+60 17-4505868"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Messenger Link</label>
                <input
                  type="text"
                  value={formState.contactInfo?.messenger || 'https://m.me/your-facebook-page-id'}
                  onChange={(e) => setFormState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, messenger: e.target.value } as any }))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meta Pixel Configuration */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <Sparkles className="w-4 h-4" />
            <span>Meta Pixel & Conversions API Settings</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Meta Pixel ID
              </label>
              <input
                type="text"
                placeholder="e.g., 123456789012345"
                value={formState.metaSettings?.pixelId || ''}
                onChange={(e) => setFormState(prev => ({ 
                  ...prev, 
                  metaSettings: { ...prev.metaSettings, pixelId: e.target.value } 
                }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Test Event Code
              </label>
              <input
                type="text"
                placeholder="e.g., TEST12345"
                value={formState.metaSettings?.testEventCode || ''}
                onChange={(e) => setFormState(prev => ({ 
                  ...prev, 
                  metaSettings: { ...prev.metaSettings, testEventCode: e.target.value } 
                }))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.metaSettings?.enablePixel ?? false}
                onChange={(e) => setFormState(prev => ({ 
                  ...prev, 
                  metaSettings: { ...prev.metaSettings, enablePixel: e.target.checked } 
                }))}
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-xs font-bold text-stone-200">Enable Meta Pixel</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.metaSettings?.enableConversionsApi ?? false}
                onChange={(e) => setFormState(prev => ({ 
                  ...prev, 
                  metaSettings: { ...prev.metaSettings, enableConversionsApi: e.target.checked } 
                }))}
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-xs font-bold text-stone-200">Enable Conversions API</span>
            </label>
          </div>
        </div>

        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Discount Banner Manager & Custom Colors</span>
            </h4>
            <span className="text-[11px] text-stone-400 font-medium">
              Pick any custom color (Hex/RGB/Gradients) or select from premium presets
            </span>
          </div>

          <div className="space-y-6">
            {(formState.discountOffers || []).map((offer, index) => {
              const currentColorHex = resolveColorToHex(offer.backgroundColor);
              const isTailwind = offer.backgroundColor && offer.backgroundColor.startsWith('bg-');
              const customBg = !isTailwind ? (offer.backgroundColor || '#581c87') : undefined;
              const textColor = offer.textColor || '#ffffff';

              return (
                <div 
                  key={offer.id || `offer-${index}`} 
                  className="bg-stone-950 p-5 sm:p-6 rounded-2xl border border-stone-800 space-y-5 hover:border-stone-700 transition-colors shadow-sm"
                >
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center border border-amber-400/30">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Banner {index + 1}: {offer.title || 'Untitled Banner'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-700">
                        <input
                          type="checkbox"
                          checked={offer.isVisible}
                          onChange={(e) => setFormState(prev => ({
                            ...prev,
                            discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, isVisible: e.target.checked } : o)
                          }))}
                          className="w-4 h-4 accent-amber-400"
                        />
                        <span className={`text-xs font-bold ${offer.isVisible ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {offer.isVisible ? 'Visible on Home' : 'Hidden'}
                        </span>
                      </label>

                      {(formState.discountOffers || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({
                            ...prev,
                            discountOffers: (prev.discountOffers || []).filter((_, i) => i !== index)
                          }))}
                          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Inputs: Text, Subtitle, Category, Discount Range */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Offer Title / Discount Heading
                      </label>
                      <input
                        type="text"
                        value={offer.title}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, title: e.target.value } : o)
                        }))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                        placeholder="e.g. 25% - 75% OFF"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Offer Subtitle / Badge Text
                      </label>
                      <input
                        type="text"
                        value={offer.subtitle}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, subtitle: e.target.value } : o)
                        }))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        placeholder="e.g. EOS SUPER SALE"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Target Click Category
                      </label>
                      <select
                        value={offer.targetCategoryId || 'All'}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, targetCategoryId: e.target.value } : o)
                        }))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="Pure Honey">Pure Honey</option>
                        <option value="Natural Foods">Natural Foods</option>
                        <option value="Sunnah Products">Sunnah Products</option>
                        <option value="Health Consultation">Health Consultation</option>
                        <option value="Gift Packs">Gift Packs</option>
                      </select>
                    </div>
                  </div>

                  {/* Discount Type & Range Filter Configuration (Percentage vs Fix / Flat) */}
                  <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Banner Discount Filter Mode</span>
                        </span>
                        <p className="text-[10px] text-stone-400 mt-0.5">Define which eligible discounted products customers see when clicking this banner</p>
                      </div>

                      {/* Discount Type Selector Pills */}
                      <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({
                            ...prev,
                            discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, discountType: 'percentage' } : o)
                          }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            (!offer.discountType || offer.discountType === 'percentage')
                              ? 'bg-amber-400 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span>% Percentage</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({
                            ...prev,
                            discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, discountType: 'flat' } : o)
                          }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            offer.discountType === 'flat'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span>Fix / Flat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({
                            ...prev,
                            discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, discountType: 'all' } : o)
                          }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            offer.discountType === 'all'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span>All</span>
                        </button>
                      </div>
                    </div>

                    {/* If Percentage Mode is active */}
                    {(!offer.discountType || offer.discountType === 'percentage') && (
                      <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800 space-y-2">
                        <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <span>🏷️ Percentage Discount Range (% OFF Range)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                              Min Discount %
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={offer.minDiscount ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                setFormState(prev => ({
                                  ...prev,
                                  discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, minDiscount: val } : o)
                                }));
                              }}
                              placeholder="e.g. 25 (Auto-detected from title if empty)"
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none placeholder:text-stone-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                              Max Discount %
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={offer.maxDiscount ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                setFormState(prev => ({
                                  ...prev,
                                  discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, maxDiscount: val } : o)
                                }));
                              }}
                              placeholder="e.g. 75 (Auto-detected from title if empty)"
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none placeholder:text-stone-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If Flat Mode is active */}
                    {offer.discountType === 'flat' && (
                      <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800 space-y-2">
                        <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                          <span>✨ Flat OFF Discount Filtering Active</span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Customers clicking this banner will only see products with fixed flat savings (e.g. Flat OFF deals).
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                              Min Flat Savings (Optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={offer.minFlatDiscount ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                setFormState(prev => ({
                                  ...prev,
                                  discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, minFlatDiscount: val } : o)
                                }));
                              }}
                              placeholder="Any flat discount if empty"
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-rose-400 focus:outline-none placeholder:text-stone-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                              Max Flat Savings (Optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={offer.maxFlatDiscount ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                setFormState(prev => ({
                                  ...prev,
                                  discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, maxFlatDiscount: val } : o)
                                }));
                              }}
                              placeholder="e.g. 500"
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-rose-400 focus:outline-none placeholder:text-stone-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If All / Both Mode is active */}
                    {offer.discountType === 'all' && (
                      <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800 space-y-1">
                        <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                          <span>🎉 Percentage & Flat Discounts (All Offers Filtered)</span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Clicking this banner will display all products with either percentage or flat discounts.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Color Customization Section */}
                  <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Banner Background & Text Color Customization</span>
                      </label>
                      <span className="text-[10px] text-stone-400">
                        Current: <code className="text-amber-200 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-700">{offer.backgroundColor || '#581c87'}</code>
                      </span>
                    </div>

                    {/* Color Inputs & Preset Palette */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Background Color Picker & Hex */}
                      <div className="lg:col-span-5 flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <input
                            type="color"
                            value={currentColorHex}
                            onChange={(e) => setFormState(prev => ({
                              ...prev,
                              discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, backgroundColor: e.target.value } : o)
                            }))}
                            className="w-10 h-10 rounded-xl cursor-pointer border border-stone-600 bg-transparent p-0.5"
                            title="Click to choose custom color"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                            Custom Color / Hex Code
                          </label>
                          <input
                            type="text"
                            value={offer.backgroundColor}
                            onChange={(e) => setFormState(prev => ({
                              ...prev,
                              discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, backgroundColor: e.target.value } : o)
                            }))}
                            placeholder="#581c87 or linear-gradient(...)"
                            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Text Color Selection */}
                      <div className="lg:col-span-3">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={offer.textColor || '#ffffff'}
                            onChange={(e) => setFormState(prev => ({
                              ...prev,
                              discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, textColor: e.target.value } : o)
                            }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-stone-600 bg-transparent p-0.5 shrink-0"
                            title="Pick custom text color"
                          />
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({
                                ...prev,
                                discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, textColor: '#ffffff' } : o)
                              }))}
                              className={`px-2 py-1 text-[11px] font-bold rounded border ${offer.textColor === '#ffffff' || !offer.textColor ? 'bg-white text-stone-900 border-white' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
                            >
                              White
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({
                                ...prev,
                                discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, textColor: '#fef08a' } : o)
                              }))}
                              className={`px-2 py-1 text-[11px] font-bold rounded border ${offer.textColor === '#fef08a' ? 'bg-amber-300 text-stone-950 border-amber-300' : 'bg-stone-800 text-amber-200 border-stone-700 hover:bg-stone-700'}`}
                            >
                              Gold
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({
                                ...prev,
                                discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, textColor: '#18181b' } : o)
                              }))}
                              className={`px-2 py-1 text-[11px] font-bold rounded border ${offer.textColor === '#18181b' ? 'bg-stone-950 text-white border-stone-600' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
                            >
                              Dark
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Preset Palette Buttons */}
                      <div className="lg:col-span-4">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                          Quick Preset Palettes
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_BANNER_COLORS.slice(0, 8).map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setFormState(prev => ({
                                ...prev,
                                discountOffers: (prev.discountOffers || []).map((o, i) => i === index ? { ...o, backgroundColor: preset.value } : o)
                              }))}
                              className="w-5 h-5 rounded-md border border-stone-600 hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-2xs"
                              style={{ background: preset.value }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="pt-2 border-t border-stone-800">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                        Live Banner Preview:
                      </span>
                      <div 
                        className={`p-5 rounded-2xl shadow-md text-center flex flex-col items-center justify-center min-h-[90px] transition-all ${isTailwind ? offer.backgroundColor : ''}`}
                        style={{
                          backgroundColor: customBg,
                          color: textColor,
                          ...(customBg && customBg.includes('gradient') ? { background: customBg } : {})
                        }}
                      >
                        <h4 className="text-xl font-extrabold tracking-tight">{offer.title || '25% - 75% OFF'}</h4>
                        <p className="text-sm font-medium opacity-90">{offer.subtitle || 'EOS SUPER SALE'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Banner Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const newId = `d_${Date.now()}`;
                setFormState(prev => ({
                  ...prev,
                  discountOffers: [
                    ...(prev.discountOffers || []),
                    {
                      id: newId,
                      title: 'SPECIAL OFFER',
                      subtitle: 'LIMITED TIME DEAL',
                      backgroundColor: '#065f46',
                      textColor: '#ffffff',
                      isVisible: true,
                      targetCategoryId: 'All'
                    }
                  ]
                }));
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-700 text-stone-200 hover:text-white border border-dashed border-stone-700 hover:border-amber-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Another Discount Banner</span>
            </button>
          </div>
        </div>

        {/* Payment Gateway Configuration */}
        <div className="bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6 shadow-md">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-700 pb-3">
            <CreditCard className="w-4 h-4" />
            <span>Payment Gateway Configuration</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">bKash App Key</label>
              <input type="text" value={formState.paymentGatewaySettings?.bkashAppKey || ''} onChange={(e) => setFormState(prev => ({...prev, paymentGatewaySettings: {...prev.paymentGatewaySettings, bkashAppKey: e.target.value}}))} className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">bKash App Secret</label>
              <input type="password" value={formState.paymentGatewaySettings?.bkashAppSecret || ''} onChange={(e) => setFormState(prev => ({...prev, paymentGatewaySettings: {...prev.paymentGatewaySettings, bkashAppSecret: e.target.value}}))} className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">bKash Username</label>
              <input type="text" value={formState.paymentGatewaySettings?.bkashUsername || ''} onChange={(e) => setFormState(prev => ({...prev, paymentGatewaySettings: {...prev.paymentGatewaySettings, bkashUsername: e.target.value}}))} className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">bKash Password</label>
              <input type="password" value={formState.paymentGatewaySettings?.bkashPassword || ''} onChange={(e) => setFormState(prev => ({...prev, paymentGatewaySettings: {...prev.paymentGatewaySettings, bkashPassword: e.target.value}}))} className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

