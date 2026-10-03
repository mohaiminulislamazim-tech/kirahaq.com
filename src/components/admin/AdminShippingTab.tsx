import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, XCircle, 
  Globe, MapPin, Tag, AlertCircle, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { 
  ShippingCharge, 
  Currency, 
  ALL_COUNTRIES, 
  CURRENCIES, 
  CURRENCY_LIST, 
  getCurrencyForCountry,
  formatShippingRuleCharge 
} from '../../types';

interface AdminShippingTabProps {
  currency: Currency;
}

const DEFAULT_SHIPPING_CHARGES: ShippingCharge[] = [
  {
    id: 'sc_01',
    country: 'Bangladesh',
    state: 'Dhaka',
    city: 'Dhaka City',
    amount: 0,
    currency: 'BDT',
    shippingMethod: 'Express City Delivery',
    shippingChargeBdt: 0,
    shippingChargeUsd: 0,
    freeShipping: true,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_02',
    country: 'Bangladesh',
    state: '',
    city: '',
    amount: 80,
    currency: 'BDT',
    shippingMethod: 'Standard Delivery',
    shippingChargeBdt: 80,
    shippingChargeUsd: 0.67,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_03',
    country: 'Malaysia',
    state: '',
    city: '',
    amount: 15,
    currency: 'MYR',
    shippingMethod: 'Standard Courier',
    shippingChargeBdt: 384,
    shippingChargeUsd: 3.20,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_04',
    country: 'Singapore',
    state: '',
    city: '',
    amount: 10,
    currency: 'SGD',
    shippingMethod: 'Air Parcel Express',
    shippingChargeBdt: 900,
    shippingChargeUsd: 7.50,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_05',
    country: 'United States',
    state: '',
    city: '',
    amount: 10,
    currency: 'USD',
    shippingMethod: 'USPS Priority / Courier',
    shippingChargeBdt: 1800,
    shippingChargeUsd: 10.00,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_06',
    country: 'United Kingdom',
    state: '',
    city: '',
    amount: 12,
    currency: 'GBP',
    shippingMethod: 'Royal Mail International',
    shippingChargeBdt: 1800,
    shippingChargeUsd: 15.00,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_07',
    country: 'Saudi Arabia',
    state: '',
    city: '',
    amount: 30,
    currency: 'SAR',
    shippingMethod: 'Gulf Express Delivery',
    shippingChargeBdt: 960,
    shippingChargeUsd: 8.00,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_08',
    country: 'United Arab Emirates',
    state: '',
    city: '',
    amount: 30,
    currency: 'AED',
    shippingMethod: 'Emirates Fast Courier',
    shippingChargeBdt: 960,
    shippingChargeUsd: 8.00,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'sc_09',
    country: 'Worldwide (All Other Countries)',
    state: '',
    city: '',
    amount: 20,
    currency: 'USD',
    shippingMethod: 'International DHL / FedEx',
    shippingChargeBdt: 2400,
    shippingChargeUsd: 20.00,
    freeShipping: false,
    status: 'active',
    active: true,
    createdAt: '2026-07-01'
  }
];

export function AdminShippingTab({ currency }: AdminShippingTabProps) {
  // State for Shipping Charges
  const [shippingCharges, setShippingCharges] = useState<ShippingCharge[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_shipping_charges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize older records if amount or currency missing
          return parsed.map((item: any) => {
            const ruleCurrency: Currency = item.currency || (item.shippingChargeBdt !== undefined && !item.shippingChargeUsd ? 'BDT' : 'USD');
            const ruleAmount = item.amount !== undefined 
              ? item.amount 
              : (ruleCurrency === 'BDT' ? (item.shippingChargeBdt || 0) : (item.shippingChargeUsd || 0));
            return {
              ...item,
              amount: ruleAmount,
              currency: ruleCurrency,
              shippingMethod: item.shippingMethod || 'Standard Delivery',
              active: item.status !== 'inactive'
            };
          });
        }
      }
    } catch (e) {
      console.error('Error reading kirahaq_shipping_charges:', e);
    }
    return DEFAULT_SHIPPING_CHARGES;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShippingCharge | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ShippingCharge | null>(null);

  // Form Fields (Exact fields specified in requirements)
  const [formCountry, setFormCountry] = useState('Bangladesh');
  const [formCountrySearch, setFormCountrySearch] = useState('');
  const [formState, setFormState] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAmount, setFormAmount] = useState<number | string>(80);
  const [formCurrency, setFormCurrency] = useState<Currency>('BDT');
  const [formShippingMethod, setFormShippingMethod] = useState('Standard Delivery');
  const [formFreeShipping, setFormFreeShipping] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Toast Notice
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync to localStorage
  const saveCharges = (newList: ShippingCharge[]) => {
    try {
      setShippingCharges(newList);
      localStorage.setItem('kirahaq_shipping_charges', JSON.stringify(newList));
      window.dispatchEvent(new Event('kirahaq_shipping_updated'));
    } catch (e) {
      console.error('Failed to save kirahaq_shipping_charges:', e);
    }
  };

  // Listen for sync from other tabs
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_shipping_charges');
        if (saved) {
          setShippingCharges(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_shipping_updated', handleSync);
    return () => window.removeEventListener('kirahaq_shipping_updated', handleSync);
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return shippingCharges.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = 
        item.country.toLowerCase().includes(query) ||
        (item.state && item.state.toLowerCase().includes(query)) ||
        (item.city && item.city.toLowerCase().includes(query)) ||
        (item.shippingMethod && item.shippingMethod.toLowerCase().includes(query)) ||
        (item.currency && item.currency.toLowerCase().includes(query));

      const matchCountry = selectedCountryFilter === 'all' || item.country === selectedCountryFilter;
      const matchStatus = selectedStatusFilter === 'all' || item.status === selectedStatusFilter;

      return matchQuery && matchCountry && matchStatus;
    });
  }, [shippingCharges, searchQuery, selectedCountryFilter, selectedStatusFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountryFilter, selectedStatusFilter]);

  // Statistics
  const totalZones = shippingCharges.length;
  const activeZones = shippingCharges.filter(c => c.status === 'active').length;
  const freeZones = shippingCharges.filter(c => c.freeShipping && c.status === 'active').length;
  const inactiveZones = shippingCharges.filter(c => c.status === 'inactive').length;

  // Handle Country Selection Change (Auto-suggest currency, but preserve full admin editability)
  const handleCountryChange = (newCountry: string) => {
    setFormCountry(newCountry);
    const suggestedCurr = getCurrencyForCountry(newCountry);
    setFormCurrency(suggestedCurr.code);
  };

  // Handle Country Search Input & Auto-select matching country
  const handleCountrySearchChange = (val: string) => {
    setFormCountrySearch(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return;
    const matches = ALL_COUNTRIES.filter(c => c.toLowerCase().includes(trimmed));
    if (matches.length > 0) {
      if (!matches.includes(formCountry)) {
        handleCountryChange(matches[0]);
      }
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultCountry = 'Bangladesh';
    setFormCountry(defaultCountry);
    setFormCountrySearch('');
    setFormState('');
    setFormCity('');
    setFormAmount(80);
    setFormCurrency('BDT');
    setFormShippingMethod('Standard Delivery');
    setFormFreeShipping(false);
    setFormStatus('active');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ShippingCharge) => {
    setEditingItem(item);
    setFormCountry(item.country);
    setFormCountrySearch('');
    setFormState(item.state || '');
    setFormCity(item.city || '');
    const cur: Currency = item.currency || (item.shippingChargeBdt !== undefined && !item.shippingChargeUsd ? 'BDT' : 'USD');
    const amt = item.amount !== undefined 
      ? item.amount 
      : (cur === 'BDT' ? (item.shippingChargeBdt || 0) : (item.shippingChargeUsd || 0));
    setFormAmount(amt);
    setFormCurrency(cur);
    setFormShippingMethod(item.shippingMethod || 'Standard Delivery');
    setFormFreeShipping(Boolean(item.freeShipping));
    setFormStatus(item.status || 'active');
    setIsModalOpen(true);
  };

  // Save / Update Zone - Stored exactly as entered with ZERO automatic conversion
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCountry.trim()) {
      showToast('error', 'Please select or enter a country.');
      return;
    }

    const cleanAmount = formFreeShipping ? 0 : Number(formAmount) || 0;
    const now = new Date().toISOString().split('T')[0];

    if (editingItem) {
      // Update existing
      const updatedList = shippingCharges.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            country: formCountry.trim(),
            state: formState.trim(),
            city: formCity.trim(),
            amount: cleanAmount,
            currency: formCurrency,
            shippingMethod: formShippingMethod.trim() || 'Standard Delivery',
            freeShipping: formFreeShipping,
            shippingChargeBdt: formCurrency === 'BDT' ? cleanAmount : Math.round(cleanAmount * 120),
            shippingChargeUsd: formCurrency === 'USD' ? cleanAmount : (cleanAmount / (CURRENCIES[formCurrency]?.rateFromUsd || 1)),
            status: formStatus,
            active: formStatus === 'active',
            updatedAt: now
          };
        }
        return item;
      });
      saveCharges(updatedList);
      showToast('success', `Shipping rule for "${formCountry}" (${CURRENCIES[formCurrency]?.symbol || ''}${cleanAmount} ${formCurrency}) saved.`);
    } else {
      // Create new
      const newZone: ShippingCharge = {
        id: 'sc_' + Date.now(),
        country: formCountry.trim(),
        state: formState.trim(),
        city: formCity.trim(),
        amount: cleanAmount,
        currency: formCurrency,
        shippingMethod: formShippingMethod.trim() || 'Standard Delivery',
        freeShipping: formFreeShipping,
        shippingChargeBdt: formCurrency === 'BDT' ? cleanAmount : Math.round(cleanAmount * 120),
        shippingChargeUsd: formCurrency === 'USD' ? cleanAmount : (cleanAmount / (CURRENCIES[formCurrency]?.rateFromUsd || 1)),
        status: formStatus,
        active: formStatus === 'active',
        createdAt: now,
        updatedAt: now
      };
      saveCharges([newZone, ...shippingCharges]);
      showToast('success', `New shipping rule for "${formCountry}" (${CURRENCIES[formCurrency]?.symbol || ''}${cleanAmount} ${formCurrency}) created!`);
    }

    setIsModalOpen(false);
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const updatedList = shippingCharges.map(item => {
      if (item.id === id) {
        const nextStatus: 'active' | 'inactive' = item.status === 'active' ? 'inactive' : 'active';
        return { 
          ...item, 
          status: nextStatus, 
          active: nextStatus === 'active',
          updatedAt: new Date().toISOString().split('T')[0] 
        };
      }
      return item;
    });
    saveCharges(updatedList);
    showToast('success', 'Shipping rule status updated.');
  };

  // Delete Zone
  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    const updatedList = shippingCharges.filter(item => item.id !== deleteConfirmItem.id);
    saveCharges(updatedList);
    showToast('success', `Shipping rule for "${deleteConfirmItem.country}" deleted.`);
    setDeleteConfirmItem(null);
  };

  // Filtered country dropdown options in form
  const filteredCountryOptions = useMemo(() => {
    if (!formCountrySearch) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => c.toLowerCase().includes(formCountrySearch.toLowerCase()));
  }, [formCountrySearch]);

  return (
    <div className="space-y-6 font-sans text-stone-100">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-bold transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
            : 'bg-rose-950 border-rose-500 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Shipping Charge Management</h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Configure exact country & zone shipping charges. Every shipping rule stores and outputs its exact configured amount and currency without conversion.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shipping Rule</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
            <span>Total Rules</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalZones}</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
            <span>Active Rules</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeZones}</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
            <span>Free Shipping</span>
            <Tag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{freeZones}</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
            <span>Disabled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-stone-400">{inactiveZones}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by country, state, city, method, or currency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCountryFilter}
              onChange={(e) => setSelectedCountryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all" className="bg-stone-900">All Countries</option>
              {Array.from(new Set(shippingCharges.map(c => c.country))).map(country => (
                <option key={country} value={country} className="bg-stone-900">{country}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all" className="bg-stone-900">All Status</option>
              <option value="active" className="bg-stone-900">Active</option>
              <option value="inactive" className="bg-stone-900">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Zones Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider font-bold border-b border-stone-800">
              <tr>
                <th className="px-5 py-3.5">Country</th>
                <th className="px-5 py-3.5">State / Region</th>
                <th className="px-5 py-3.5">City / Zone</th>
                <th className="px-5 py-3.5">Shipping Method</th>
                <th className="px-5 py-3.5">Configured Charge</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-medium">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-stone-500">
                    <MapPin className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                    <p className="font-bold text-stone-400 text-sm">No shipping rules found</p>
                    <p className="text-xs">Try adjusting your search query or add a new rule.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const displayCharge = formatShippingRuleCharge(item);
                  return (
                    <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{item.country}</span>
                      </td>

                      <td className="px-5 py-3.5 text-stone-300">
                        {item.state ? (
                          <span className="px-2 py-0.5 bg-stone-800 text-stone-200 rounded-md text-[11px]">
                            {item.state}
                          </span>
                        ) : (
                          <span className="text-stone-500 italic">All States</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-stone-300">
                        {item.city ? (
                          <span className="px-2 py-0.5 bg-stone-800 text-stone-200 rounded-md text-[11px]">
                            {item.city}
                          </span>
                        ) : (
                          <span className="text-stone-500 italic">All Cities</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-stone-300 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-800/80 rounded-md text-[11px] text-stone-200">
                          <Truck className="w-3 h-3 text-amber-400" />
                          {item.shippingMethod || 'Standard Delivery'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold">
                        {item.freeShipping ? (
                          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" /> Free Shipping
                          </span>
                        ) : (
                          <span className="text-amber-300 font-mono font-bold text-sm">
                            {displayCharge}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            item.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {item.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-300 rounded-lg transition-colors cursor-pointer"
                            title="Edit Shipping Rule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white text-stone-300 rounded-lg transition-colors cursor-pointer"
                            title="Delete Shipping Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <div>
              Showing page <span className="font-bold text-white">{currentPage}</span> of{' '}
              <span className="font-bold text-white">{totalPages}</span> ({filteredList.length} total)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Shipping Rule' : 'Create Shipping Rule'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white bg-stone-800 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* 1. Country */}
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">1. Country *</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search country name..."
                    value={formCountrySearch}
                    onChange={(e) => handleCountrySearchChange(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                  <select
                    value={formCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs font-bold cursor-pointer"
                  >
                    {filteredCountryOptions.map(c => (
                      <option key={c} value={c} className="bg-stone-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2 & 3. State / Region & City / Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1.5">2. State / Region (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Selangor, California"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1.5">3. City / Zone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka City, KL, New York"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              {/* Free Shipping Checkbox */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>Free Delivery (0 Fee)</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    If enabled, delivery charge is completely free for this rule.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFreeShipping}
                    onChange={(e) => setFormFreeShipping(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* 4 & 5. Shipping Charge Amount & Currency */}
              {!formFreeShipping && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-950 border border-stone-800 rounded-2xl">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1.5">4. Shipping Charge Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                        {CURRENCIES[formCurrency]?.symbol || ''}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="e.g. 80"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1.5">5. Currency *</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value as Currency)}
                      required
                      className="w-full px-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 text-xs cursor-pointer"
                    >
                      {CURRENCY_LIST.map(c => (
                        <option key={c.code} value={c.code} className="bg-stone-900">
                          {c.flag} {c.code} - {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-full pt-1 text-[11px] text-amber-400/90 font-medium">
                    Output Preview: <strong>{CURRENCIES[formCurrency]?.symbol || ''}{Number(formAmount || 0).toFixed(2)} {formCurrency}</strong> (Stored & displayed exactly with 0 conversion).
                  </div>
                </div>
              )}

              {/* 6. Shipping Method */}
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">6. Shipping Method *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Delivery, Express Courier, Air Parcel"
                  value={formShippingMethod}
                  onChange={(e) => setFormShippingMethod(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* 7. Status */}
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">7. Status *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs font-bold"
                >
                  <option value="active" className="bg-stone-900">Active (Applied at Checkout)</option>
                  <option value="inactive" className="bg-stone-900">Inactive / Disabled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold rounded-xl shadow-lg cursor-pointer transition-all"
                >
                  {editingItem ? 'Save Shipping Rule' : 'Create Shipping Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Shipping Rule?</h3>
            </div>

            <p className="text-stone-300">
              Are you sure you want to delete the shipping rule for{' '}
              <span className="font-bold text-amber-300">"{deleteConfirmItem.country}"</span>?
              {deleteConfirmItem.state && ` (${deleteConfirmItem.state})`}
              {' '}This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer shadow-lg transition-all"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
