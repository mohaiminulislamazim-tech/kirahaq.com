import React, { useState, useEffect } from 'react';
import { Coupon, Currency } from '../../types';
import { 
  Percent, Plus, Edit3, Trash2, Calendar, Save, X, Ticket, 
  Check, AlertCircle, Copy, Search, Filter, CheckCircle2, DollarSign, RefreshCw
} from 'lucide-react';

interface AdminCouponsTabProps {
  currency: Currency;
}

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'EID2026',
    discountType: 'percentage',
    discountValue: 15,
    expiryDate: '2026-12-31',
    minOrderAmount: 2000,
    active: true,
    usageCount: 48
  },
  {
    id: 'c2',
    code: 'SUNNAH500',
    discountType: 'fixed',
    discountValue: 500,
    expiryDate: '2026-08-31',
    minOrderAmount: 3000,
    active: true,
    usageCount: 22
  },
  {
    id: 'c3',
    code: 'SUNNAH10',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: '2026-11-30',
    minOrderAmount: 500,
    active: true,
    usageCount: 89
  },
  {
    id: 'c4',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: '2026-10-15',
    minOrderAmount: 1000,
    active: false,
    usageCount: 105
  },
  {
    id: 'c5',
    code: 'RSTDX',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: '2026-12-31',
    minOrderAmount: 0,
    active: true,
    usageCount: 12
  }
];

export function AdminCouponsTab({ currency }: AdminCouponsTabProps) {
  // Load coupons from localStorage or defaults
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading kirahaq_coupons:', e);
    }
    return DEFAULT_COUPONS;
  });

  // Sync listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_coupons');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setCoupons(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_coupons_updated', handleSync);
    return () => window.removeEventListener('kirahaq_coupons_updated', handleSync);
  }, []);

  // Save helper
  const saveCoupons = (newList: Coupon[]) => {
    setCoupons(newList);
    try {
      localStorage.setItem('kirahaq_coupons', JSON.stringify(newList));
      window.dispatchEvent(new Event('kirahaq_coupons_updated'));
    } catch (e) {
      console.error('Failed to save kirahaq_coupons:', e);
    }
  };

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [minOrderAmount, setMinOrderAmount] = useState('1500');
  const [active, setActive] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('15');
    setExpiryDate('2026-12-31');
    setMinOrderAmount('1500');
    setActive(true);
    setEditingCoupon(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (cp: Coupon) => {
    setEditingCoupon(cp);
    setCode(cp.code);
    setDiscountType(cp.discountType);
    setDiscountValue(cp.discountValue.toString());
    setExpiryDate(cp.expiryDate);
    setMinOrderAmount((cp.minOrderAmount || 0).toString());
    setActive(cp.active);
    setIsFormOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) {
      showToast('error', 'Please enter a valid coupon promo code.');
      return;
    }

    const val = parseFloat(discountValue) || 0;
    const minVal = parseFloat(minOrderAmount) || 0;

    if (val <= 0) {
      showToast('error', 'Discount value must be greater than zero.');
      return;
    }

    if (editingCoupon) {
      const updatedList = coupons.map(c => {
        if (c.id === editingCoupon.id) {
          return {
            ...c,
            code: cleanCode,
            discountType,
            discountValue: val,
            expiryDate,
            minOrderAmount: minVal,
            active
          };
        }
        return c;
      });
      saveCoupons(updatedList);
      showToast('success', `Coupon "${cleanCode}" updated successfully!`);
    } else {
      // Check duplicate code
      if (coupons.some(c => c.code === cleanCode)) {
        showToast('error', `Coupon code "${cleanCode}" already exists!`);
        return;
      }

      const newCoupon: Coupon = {
        id: `cp_${Date.now()}`,
        code: cleanCode,
        discountType,
        discountValue: val,
        expiryDate,
        minOrderAmount: minVal,
        active,
        usageCount: 0
      };

      saveCoupons([newCoupon, ...coupons]);
      showToast('success', `New promo code "${cleanCode}" created successfully!`);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleToggleActive = (id: string) => {
    const updatedList = coupons.map(c => {
      if (c.id === id) {
        const nextActive = !c.active;
        showToast('success', `Coupon "${c.code}" ${nextActive ? 'activated' : 'disabled'}.`);
        return { ...c, active: nextActive };
      }
      return c;
    });
    saveCoupons(updatedList);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmCoupon) {
      const updatedList = coupons.filter(c => c.id !== deleteConfirmCoupon.id);
      saveCoupons(updatedList);
      showToast('success', `Coupon "${deleteConfirmCoupon.code}" deleted.`);
      setDeleteConfirmCoupon(null);
    }
  };

  const handleCopyCode = (cpCode: string) => {
    navigator.clipboard.writeText(cpCode);
    showToast('success', `Code "${cpCode}" copied to clipboard!`);
  };

  // KPI Statistics
  const totalCount = coupons.length;
  const activeCount = coupons.filter(c => c.active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const disabledCount = coupons.filter(c => !c.active).length;

  // Filtered Coupons
  const filteredCoupons = coupons.filter(c => {
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && c.active) || 
      (statusFilter === 'disabled' && !c.active);

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || c.code.toLowerCase().includes(q);

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
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Promo Codes</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Configured in store</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Active Coupons</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Usable at checkout</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-300">Total Redemptions</div>
          <div className="text-xl font-serif font-bold text-amber-300 mt-1 flex items-center gap-1">
            <span>{totalRedemptions}</span>
            <Ticket className="w-4 h-4 text-amber-300 inline" />
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Times used by customers</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Disabled Codes</div>
          <div className="text-xl font-serif font-bold text-stone-400 mt-1">{disabledCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Paused or expired</div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Discount Coupons & Promotional Offers ({coupons.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Create custom discount codes, configure percentage/fixed price drops, set minimum spend rules, and track customer redemptions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNew}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>+ Create New Coupon</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search coupon promo code (e.g. EID2026, SUNNAH)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none uppercase"
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

        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs shrink-0">
          {(['all', 'active', 'disabled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
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

      {/* Coupons Table */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Type & Amount</th>
                <th className="p-4">Min Spend Rule</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-stone-300">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-stone-400 space-y-2">
                    <Ticket className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="text-xs font-bold">No coupons found matching your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-800/40 transition-colors">
                    
                    {/* Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 font-mono font-bold text-sm">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          className="p-1 hover:bg-stone-800 text-stone-400 hover:text-amber-300 rounded cursor-pointer transition-colors"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="p-4 font-bold text-emerald-400">
                      {c.discountType === 'percentage' 
                        ? `${c.discountValue}% OFF Total` 
                        : `৳${c.discountValue.toLocaleString()} Flat Discount`}
                    </td>

                    {/* Min Spend */}
                    <td className="p-4 text-stone-300 font-medium">
                      {c.minOrderAmount && c.minOrderAmount > 0 
                        ? `Min Spend: ৳${c.minOrderAmount.toLocaleString()}` 
                        : 'No Min Requirement'}
                    </td>

                    {/* Expiry Date */}
                    <td className="p-4 text-stone-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{c.expiryDate}</span>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="p-4 text-stone-200 font-bold">
                      {c.usageCount || 0} uses
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {c.active ? (
                        <span className="px-3 py-1 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-full text-[10px] font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-stone-950 border border-stone-700 text-stone-400 rounded-full text-[10px] font-bold">
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors border ${
                            c.active
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-blue-400 border border-stone-700 rounded-lg cursor-pointer transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmCoupon(c)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg cursor-pointer transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE / EDIT MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingCoupon ? 'Edit Promo Coupon Code' : 'Create New Discount Code'}
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

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Promo Coupon Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUNNAH20, EIDSPECIAL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Price Cut (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Discount Value <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="15"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    {discountType === 'percentage' ? 'e.g. 15 = 15% Off Total' : 'e.g. 500 = ৳500 Off Total'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Expiry Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Min Order Spend (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs text-stone-300 font-bold cursor-pointer">
                  Enable coupon for immediate customer use at checkout
                </label>
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
                  <span>{editingCoupon ? 'Update Coupon' : 'Save & Publish Coupon'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM DIALOG ================= */}
      {deleteConfirmCoupon && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Coupon Code?</h4>
                <p className="text-xs text-stone-400">Customers will no longer be able to apply it.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete <strong className="text-amber-400">"{deleteConfirmCoupon.code}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCoupon(null)}
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
