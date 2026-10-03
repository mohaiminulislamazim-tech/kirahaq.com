import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Truck, CreditCard, Phone, MapPin, User, Mail, Sparkles } from 'lucide-react';
import { CartItem, Currency, OrderDetails, formatPrice, getProductPriceInfo, formatCurrencyAmount } from '../types';
import { calculateCheckoutTotals } from '../lib/checkout';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onClearCart
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+880 ');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash on Delivery' | 'Credit Card'>('Cash on Delivery');
  const [placedOrder, setPlacedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

  const totals = calculateCheckoutTotals(items, 0, currency);
  const totalUsd = currency === 'BDT' ? (totals.total / 120) : totals.total;
  const totalBdt = currency === 'BDT' ? totals.total : (totals.total * 120);

  const districts = [
    'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 
    'Barishal', 'Rangpur', 'Mymensingh', 'International Shipping'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Please fill in all required shipping details.');
      return;
    }

    const orderId = 'KH-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: OrderDetails = {
      orderId,
      items,
      customerName: name,
      email,
      phone,
      address,
      district,
      country: district === 'International Shipping' ? 'International' : 'Bangladesh',
      paymentMethod,
      totalUsd,
      totalBdt,
      currency,
      status: 'Confirmed',
      orderDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setPlacedOrder(newOrder);
    onClearCart();
    
    // Purchase event should ideally be fired after server-side payment verification
    // Here we fire a simplified version as a placeholder
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {placedOrder ? (
          /* Order Confirmation Screen */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-700" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                JazakAllah Khair! Order Confirmed
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1b3d2b] mt-1">
                Order #{placedOrder.orderId}
              </h2>
              <p className="text-stone-600 text-xs mt-1">
                We have received your order. Our team will verify and dispatch your Sunnah products shortly.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-left space-y-2 text-xs text-stone-700">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-900">Customer:</span>
                <span>{placedOrder.customerName} ({placedOrder.phone})</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-900">Delivery Address:</span>
                <span>{placedOrder.address}, {placedOrder.district}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-900">Payment Method:</span>
                <span className="font-bold text-emerald-800">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-[#1b3d2b]">
                <span>Total Paid:</span>
                <span>{totals.formattedTotal} {currency}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#1b3d2b] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                SAFE & SECURE CHECKOUT
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1b3d2b]">
                Shipping & Payment Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ayesha Rahman"
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ayesha@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District / Region *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Apartment #, Road #, Area, Thana..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'Cash on Delivery', label: 'Cash on Delivery', sub: 'COD in BD' },
                    { id: 'bKash', label: 'bKash', sub: 'Mobile Banking' },
                    { id: 'Nagad', label: 'Nagad', sub: 'Mobile Banking' },
                    { id: 'Credit Card', label: 'Card / VISA', sub: 'International' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-emerald-50 border-[#1b3d2b] text-[#1b3d2b] font-bold shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block text-xs leading-snug">{m.label}</span>
                      <span className="block text-[10px] text-stone-500 font-normal">{m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Amount Summary */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-700 block">Total Payable:</span>
                  <span className="text-xs text-stone-500">Includes all taxes & packaging</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#1b3d2b] block">
                    {totals.formattedTotal} {currency}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all"
              >
                Confirm & Place Order
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
