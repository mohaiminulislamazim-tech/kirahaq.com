import React, { useState } from 'react';
import { 
  ShoppingBag, Heart, ShoppingCart, Ticket, Truck, 
  Search, ShieldCheck, ArrowRight, FileText, Bell, CheckCircle2, User, MapPin
} from 'lucide-react';
import { UserAccount, OrderDetails, Currency, formatProductPrice } from '../../types';
import { UserTab } from './UserSidebar';

interface UserOverviewTabProps {
  currentUser: UserAccount | null;
  orders: OrderDetails[];
  wishlistCount: number;
  cartCount: number;
  currency: Currency;
  onNavigateTab: (tab: UserTab) => void;
  onOpenInvoice: (order: OrderDetails) => void;
}

export const UserOverviewTab: React.FC<UserOverviewTabProps> = ({
  currentUser,
  orders,
  wishlistCount,
  cartCount,
  currency,
  onNavigateTab,
  onOpenInvoice,
}) => {
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState<OrderDetails | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const displayOrders = orders.length > 0 ? orders : [
    {
      orderId: 'KH-2026-8921',
      items: [
        {
          product: {
            id: 'p1',
            name: 'Pure Sidr Royal Honey (500g)',
            category: 'Pure Honey',
            priceUsd: 32,
            priceBdt: 3840,
            rating: 4.9,
            reviewCount: 128,
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
            description: '100% pure raw Sidr honey.',
            benefits: [],
            ingredients: '',
            inStock: true
          },
          quantity: 1
        }
      ],
      customerName: currentUser?.name || 'Sabbir Rahman',
      email: currentUser?.email || 'sabbir@example.com',
      phone: currentUser?.phone || '+880 1711-223344',
      address: currentUser?.address || 'House 42, Road 11, Banani',
      district: 'Dhaka',
      country: 'Bangladesh',
      paymentMethod: 'bKash Online',
      totalUsd: 48,
      totalBdt: 5760,
      currency: 'BDT',
      status: 'Out for Delivery',
      orderDate: '2026-07-24'
    }
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanInput = trackInput.toLowerCase().replace('#', '').trim();
    if (!cleanInput) {
      setTrackResult(null);
      return;
    }
    const found = displayOrders.find((o) => {
      const cleanId = o.orderId.toLowerCase().replace('#', '').trim();
      return cleanId === cleanInput || cleanId.includes(cleanInput);
    });
    setTrackResult(found || null);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-[#1b3d2b] text-white p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/60">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wider border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Customer Dashboard</span>
          </span>
          <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
              Assalamu Alaikum, {currentUser?.name || 'Sabbir Rahman'}
            </h1>
            {currentUser?.isVerified !== false && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/30 text-amber-300 text-xs font-extrabold px-2.5 py-1 rounded-full border border-amber-400/40 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                <span>Verified Account</span>
              </span>
            )}
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            Welcome to your portal. Track active shipments, download invoices, manage saved delivery addresses, and explore organic Sunnah wellness foods.
          </p>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col items-center gap-2 bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
          />
          <span className="text-xs font-bold text-amber-300">VIP Member</span>
          <span className="text-[10px] text-emerald-200">Joined July 2026</span>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#1b3d2b] group-hover:text-amber-400 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900">{displayOrders.length}</p>
          <span className="text-[10px] text-emerald-800 font-bold block">View order history →</span>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Deliveries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-[#1b3d2b] group-hover:text-amber-400 transition-colors">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900">
            {displayOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
          </p>
          <span className="text-[10px] text-amber-700 font-bold block">Track live shipments →</span>
        </div>

        <div
          onClick={() => onNavigateTab('wishlist')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Wishlist</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-[#1b3d2b] group-hover:text-amber-400 transition-colors">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900">{wishlistCount}</p>
          <span className="text-[10px] text-rose-600 font-bold block">View saved items →</span>
        </div>

        <div
          onClick={() => onNavigateTab('tickets')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Support Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-[#1b3d2b] group-hover:text-amber-400 transition-colors">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900">1</p>
          <span className="text-[10px] text-blue-800 font-bold block">Open customer ticket →</span>
        </div>
      </div>

      {/* Quick Order Search & Tracking Box */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-800" />
          <span>Instant Order Delivery Tracker</span>
        </h2>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Order Number (e.g. KH-2026-8921)"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-mono"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-950 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Track Order</span>
          </button>
        </form>

        {hasSearched && (
          <div className="pt-2">
            {trackResult ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-950">Order ID: {trackResult.orderId}</span>
                  <span className="bg-amber-400 text-stone-950 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    Status: {trackResult.status}
                  </span>
                </div>
                <p className="text-stone-700">Delivery Address: {trackResult.address}, {trackResult.district}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onNavigateTab('orders')}
                    className="text-xs text-[#1b3d2b] font-bold underline cursor-pointer"
                  >
                    View Timeline Tracking Details →
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600 font-bold">
                Order "{trackInput}" not found. Check your order number or browse recent orders below.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <h2 className="text-base font-serif font-bold text-stone-900">Recent Placed Orders</h2>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
          >
            View All ({displayOrders.length}) →
          </button>
        </div>

        <div className="space-y-3">
          {displayOrders.map((ord) => (
            <div
              key={ord.orderId}
              className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{ord.orderId}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {ord.status}
                  </span>
                </div>
                <p className="text-stone-600">
                  {ord.items.map((i) => i.product.name).join(', ')} ({ord.orderDate})
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="font-serif font-extrabold text-stone-900 text-sm">
                  {currency === 'BDT' ? `৳ ${ord.totalBdt.toLocaleString()}` : `$${ord.totalUsd.toFixed(2)}`}
                </span>
                <button
                  onClick={() => onOpenInvoice(ord)}
                  className="px-3 py-1.5 bg-white border border-stone-300 text-stone-800 text-[11px] font-bold rounded-xl hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
