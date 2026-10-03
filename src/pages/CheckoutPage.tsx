import React, { useState, useEffect, useMemo } from 'react';
import { 
  CartItem, Currency, formatProductPrice, formatPrice, OrderDetails, Coupon, SiteSettings,
  ShippingCharge, ALL_COUNTRIES, getProductPriceInfo, convertCurrency, formatCurrencyAmount
} from '../types';
import { 
  calculateCheckoutTotals, 
  calculateShippingCharge, 
  matchShippingRule, 
  getMatchedShippingInfo,
  getProductFinalUnitPrice 
} from '../lib/checkout';
import { 
  ShoppingBag, Trash2, ArrowLeft, ShieldCheck, CheckCircle2, 
  MapPin, Phone, CreditCard, Sparkles, Truck, AlertCircle, Ticket, Tag, Loader2
} from 'lucide-react';
import { createPaymentSession, verifyPaymentSession } from '../services/paymentApi';

interface CheckoutPageProps {
  cartItems: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (orderDetails: OrderDetails) => boolean;
  onGoHome: () => void;
  onGoToProducts: () => void;
  siteSettings: SiteSettings;
}

const countries = [
  "Bangladesh", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const currencyToCountry: Record<Currency, string> = {
  'USD': 'United States',
  'BDT': 'Bangladesh',
  'EUR': 'Germany',
  'GBP': 'United Kingdom',
  'SAR': 'Saudi Arabia',
  'AED': 'United Arab Emirates',
  'CAD': 'Canada',
  'AUD': 'Australia',
  'MYR': 'Malaysia',
  'INR': 'India',
  'QAR': 'Qatar',
  'KWD': 'Kuwait',
  'OMR': 'Oman',
  'BHD': 'Bahrain',
  'SGD': 'Singapore',
  'JPY': 'Japan',
  'PKR': 'Pakistan',
};

export function CheckoutPage({
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onGoHome,
  onGoToProducts,
  siteSettings,
}: CheckoutPageProps) {
  // Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [stateDivision, setStateDivision] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  const [isPlaced, setIsPlaced] = useState<OrderDetails | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Dynamic Shipping Charges State
  const [shippingCharges, setShippingCharges] = useState<ShippingCharge[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_shipping_charges');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading kirahaq_shipping_charges:', e);
    }
    return [
      { id: 'sc_01', country: 'Bangladesh', state: 'Dhaka', city: 'Dhaka City', shippingChargeBdt: 0, shippingChargeUsd: 0, freeShipping: true, status: 'active' },
      { id: 'sc_02', country: 'Bangladesh', state: '', city: '', shippingChargeBdt: 80.4, shippingChargeUsd: 0.67, freeShipping: false, status: 'active' },
      { id: 'sc_03', country: 'Malaysia', state: '', city: '', shippingChargeBdt: 384, shippingChargeUsd: 3.20, freeShipping: false, status: 'active' },
      { id: 'sc_04', country: 'Singapore', state: '', city: '', shippingChargeBdt: 900, shippingChargeUsd: 7.50, freeShipping: false, status: 'active' },
      { id: 'sc_05', country: 'United States', state: '', city: '', shippingChargeBdt: 1800, shippingChargeUsd: 15.00, freeShipping: false, status: 'active' },
      { id: 'sc_06', country: 'United Kingdom', state: '', city: '', shippingChargeBdt: 1800, shippingChargeUsd: 15.00, freeShipping: false, status: 'active' },
      { id: 'sc_07', country: 'Saudi Arabia', state: '', city: '', shippingChargeBdt: 960, shippingChargeUsd: 8.00, freeShipping: false, status: 'active' },
      { id: 'sc_08', country: 'United Arab Emirates', state: '', city: '', shippingChargeBdt: 960, shippingChargeUsd: 8.00, freeShipping: false, status: 'active' },
      { id: 'sc_09', country: 'Worldwide (All Other Countries)', state: '', city: '', shippingChargeBdt: 2400, shippingChargeUsd: 20.00, freeShipping: false, status: 'active' }
    ];
  });

  // Sync shipping charges from localStorage on mount & update
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_shipping_charges');
        if (saved) setShippingCharges(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    handleSync();
    window.addEventListener('kirahaq_shipping_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('kirahaq_shipping_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    if (currencyToCountry[currency]) {
      setCountry(currencyToCountry[currency]);
    }
  }, [currency]);

  // Available Payment Methods
  const allPaymentMethods = [
    { id: 'Cash on Delivery', label: 'Cash on Delivery', sub: 'COD in BD', key: 'cod', activeClass: 'bg-emerald-50 border-[#1b3d2b] text-[#1b3d2b]' },
    { id: 'bKash', label: 'bKash', sub: 'Mobile Banking', key: 'bkash', activeClass: 'bg-pink-50 border-pink-600 text-pink-700' },
    { id: 'Nagad', label: 'Nagad', sub: 'Mobile Banking', key: 'nagad', activeClass: 'bg-orange-50 border-orange-600 text-orange-700' },
    { id: 'Rocket', label: 'Rocket', sub: 'DBBL', key: 'rocket', activeClass: 'bg-purple-50 border-purple-600 text-purple-700' },
    { id: 'Visa', label: 'Visa', sub: 'Card Payment', key: 'visa', activeClass: 'bg-blue-50 border-blue-600 text-blue-700' },
    { id: 'Mastercard', label: 'Mastercard', sub: 'Card Payment', key: 'mastercard', activeClass: 'bg-blue-50 border-blue-600 text-blue-700' },
    { id: 'American Express', label: 'Amex', sub: 'Card Payment', key: 'amex', activeClass: 'bg-blue-50 border-blue-600 text-blue-700' },
  ];

  const enabledMethods = allPaymentMethods.filter(m => 
    siteSettings.enabledPaymentMethods?.includes(m.key)
  );

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [discountBdt, setDiscountBdt] = useState(0);
  const [discountUsd, setDiscountUsd] = useState(0);

  // Dynamic Matching for Delivery Fee (Preserves exact admin currency & amount without conversion)
  const matchedShippingInfo = useMemo(() => {
    return getMatchedShippingInfo(shippingCharges, country, stateDivision, cityDistrict, currency);
  }, [shippingCharges, country, stateDivision, cityDistrict, currency]);

  const isFreeShipping = matchedShippingInfo.isFreeShipping;

  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const rawSubtotal = (cartItems || []).reduce((acc, item) => {
      const unit = getProductFinalUnitPrice(item.product, currency);
      return acc + unit * (item.quantity || 1);
    }, 0);

    if (appliedCoupon.discountType === 'percentage') {
      return Number(((rawSubtotal * appliedCoupon.discountValue) / 100).toFixed(2));
    } else {
      if (currency === 'BDT') return appliedCoupon.discountValue;
      if (currency === 'USD') return Number((appliedCoupon.discountValue / 120).toFixed(2));
      return Number((appliedCoupon.discountValue / 120).toFixed(2));
    }
  }, [appliedCoupon, cartItems, currency]);

  // Unified Checkout Totals Single Source of Truth
  const totals = useMemo(() => {
    return calculateCheckoutTotals(
      cartItems,
      matchedShippingInfo,
      currency,
      couponDiscountAmount
    );
  }, [cartItems, matchedShippingInfo, currency, couponDiscountAmount]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.toUpperCase().trim();
    if (!clean) return;

    let availableCoupons: Coupon[] = [];
    try {
      const saved = localStorage.getItem('kirahaq_coupons');
      if (saved) {
        availableCoupons = JSON.parse(saved);
      }
    } catch (err) {
      console.error(err);
    }

    if (!availableCoupons || availableCoupons.length === 0) {
      availableCoupons = [
        { id: 'c1', code: 'EID2026', discountType: 'percentage', discountValue: 15, expiryDate: '2026-12-31', minOrderAmount: 2000, active: true },
        { id: 'c2', code: 'SUNNAH500', discountType: 'fixed', discountValue: 500, expiryDate: '2026-08-31', minOrderAmount: 3000, active: true },
        { id: 'c3', code: 'SUNNAH10', discountType: 'percentage', discountValue: 10, expiryDate: '2026-11-30', minOrderAmount: 500, active: true },
        { id: 'c5', code: 'RSTDX', discountType: 'percentage', discountValue: 10, expiryDate: '2026-12-31', minOrderAmount: 0, active: true }
      ];
    }

    const found = availableCoupons.find(c => c.code === clean && c.active);

    if (found) {
      const rawSubtotal = (cartItems || []).reduce((acc, item) => {
        const unit = getProductFinalUnitPrice(item.product, currency);
        return acc + unit * (item.quantity || 1);
      }, 0);

      if (found.minOrderAmount) {
        const minInCurrency = currency === 'BDT' ? found.minOrderAmount : (found.minOrderAmount / 120);
        if (rawSubtotal < minInCurrency) {
          setCouponMsg({ type: 'error', text: `Min spend ${formatCurrencyAmount(minInCurrency, currency)} ${currency} required.` });
          setAppliedCoupon(null);
          return;
        }
      }

      setAppliedCoupon(found);
      if (found.discountType === 'percentage') {
        setCouponMsg({ type: 'success', text: `Coupon ${found.code} applied (${found.discountValue}% Off)` });
      } else {
        const fixedInCurrency = currency === 'BDT' ? found.discountValue : (found.discountValue / 120);
        setCouponMsg({ type: 'success', text: `Coupon ${found.code} applied (${formatCurrencyAmount(fixedInCurrency, currency)} Off)` });
      }
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid or inactive code' });
      setAppliedCoupon(null);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (!customerName || !phone || !address) {
      alert('Please fill out name, phone number, and delivery address.');
      return;
    }

    const orderId = `KH-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalBdt = currency === 'BDT' ? totals.total : Number((totals.total * 120).toFixed(2));
    const totalUsd = currency === 'USD' ? totals.total : Number((totals.total / 120).toFixed(2));

    const isCod = paymentMethod.toLowerCase().includes('cash') || paymentMethod.toLowerCase().includes('cod');

    if (isCod) {
      const newOrder: OrderDetails = {
        orderId,
        items: [...cartItems],
        customerName,
        email: email || 'customer@kira-haq.com',
        phone,
        address: `${address}${cityDistrict ? `, ${cityDistrict}` : ''}${stateDivision ? `, ${stateDivision}` : ''}`,
        district: stateDivision || cityDistrict || country,
        country,
        paymentMethod,
        paymentStatus: 'PENDING',
        paymentProvider: 'cod',
        totalUsd,
        totalBdt,
        currency,
        status: 'Processing',
        orderDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      const success = onPlaceOrder(newOrder);
      if (!success) {
        alert('Order failed: Some items are out of stock. Please update your cart.');
        return;
      }
      setIsPlaced(newOrder);
      return;
    }

    // Online Payment Handling (bKash, Nagad, Card, Rocket, Amex)
    setIsProcessingPayment(true);

    try {
      const paymentRes = await createPaymentSession({
        orderId,
        amount: totals.total,
        currency,
        method: paymentMethod,
        customerName,
        customerPhone: phone,
        customerEmail: email || undefined,
        callbackUrl: window.location.origin + '/api/payments/card/callback',
        cancelUrl: window.location.origin + '/api/payments/card/callback',
      });

      if (!paymentRes.success) {
        setPaymentError(paymentRes.error || 'Unable to connect to payment gateway. Please try again or select Cash on Delivery.');
        setIsProcessingPayment(false);
        return;
      }

      // If gateway returns external hosted payment URL, redirect
      if (paymentRes.redirectUrl && typeof window !== 'undefined') {
        window.location.href = paymentRes.redirectUrl;
        return;
      }

      // Complete & verify payment transaction
      const verifyRes = await verifyPaymentSession({
        paymentId: paymentRes.paymentId,
        orderId,
        providerPaymentId: paymentRes.providerPaymentId,
        transactionId: paymentRes.transactionId,
      });

      if (verifyRes.success && verifyRes.status === 'SUCCESS') {
        const verifiedOrder: OrderDetails = {
          orderId,
          items: [...cartItems],
          customerName,
          email: email || 'customer@kira-haq.com',
          phone,
          address: `${address}${cityDistrict ? `, ${cityDistrict}` : ''}${stateDivision ? `, ${stateDivision}` : ''}`,
          district: stateDivision || cityDistrict || country,
          country,
          paymentMethod,
          paymentStatus: 'SUCCESS',
          paymentId: paymentRes.paymentId,
          transactionId: verifyRes.transactionId || paymentRes.transactionId,
          paymentProvider: (paymentRes.metadata?.provider || paymentMethod) as any,
          paidAt: verifyRes.paidAt || new Date().toISOString(),
          totalUsd,
          totalBdt,
          currency,
          status: 'Processing',
          orderDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        const success = onPlaceOrder(verifiedOrder);
        if (!success) {
          alert('Order failed: Some items are out of stock. Please update your cart.');
          setIsProcessingPayment(false);
          return;
        }
        setIsPlaced(verifiedOrder);
      } else {
        setPaymentError(verifyRes.error || 'Payment verification failed. Please try again or select Cash on Delivery.');
      }
    } catch (err: any) {
      console.error('Payment execution error:', err);
      setPaymentError(err.message || 'Payment processing error. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isPlaced) {
    return (
      <div className="min-h-screen bg-stone-50/60 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Order Placed Successfully!
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Alhamdulillah!</h1>
            <p className="text-xs text-stone-600">
              Your order ID is <strong className="text-stone-900 text-sm font-mono">{isPlaced.orderId}</strong>.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 text-stone-700">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">Customer:</span>
              <span className="font-bold text-stone-900">{isPlaced.customerName} ({isPlaced.phone})</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">Delivery Address:</span>
              <span className="font-bold text-stone-900">{isPlaced.address}, {isPlaced.district}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">Payment Method:</span>
              <span className="font-bold text-stone-900">{isPlaced.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">Payment Status:</span>
              <span className={`font-bold ${isPlaced.paymentStatus === 'SUCCESS' ? 'text-emerald-700' : 'text-amber-800'}`}>
                {isPlaced.paymentStatus === 'SUCCESS' ? 'Paid (Verified Online)' : 'Pending (Cash on Delivery)'}
              </span>
            </div>
            {isPlaced.transactionId && (
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Transaction ID:</span>
                <span className="font-bold text-stone-900 font-mono">{isPlaced.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-extrabold text-[#1b3d2b]">
              <span>Total Payable Amount:</span>
              <span>
                {totals.formattedTotal} {currency}
              </span>
            </div>
          </div>

          {isPlaced.paymentStatus !== 'SUCCESS' && isPlaced.paymentMethod !== 'Cash on Delivery' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">Instructions for {isPlaced.paymentMethod}:</p>
              <p>Please send money to Merchant bKash/Nagad Number: <strong className="font-mono">01700-000000</strong> using reference <strong className="font-mono">{isPlaced.orderId}</strong>.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onGoHome}
              className="w-full py-3 bg-[#1b3d2b] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Return to Home Page
            </button>
            <button
              onClick={onGoToProducts}
              className="w-full py-3 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] flex items-center gap-1.5 text-xs font-bold text-stone-600 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Secure Checkout & Order Placement</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-900 mb-1">Your Shopping Cart is Empty</h2>
            <p className="text-xs text-stone-500 mb-6">Browse our pure Sidr honey and organic items to add products to your cart.</p>
            <button
              onClick={onGoToProducts}
              className="px-6 py-3 bg-[#1b3d2b] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Explore Products Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                
                {/* Section 1: Customer Info */}
                <div className="space-y-4">
                  <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                    <MapPin className="w-5 h-5 text-emerald-800" />
                    <span>1. Delivery Address & Customer Details</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mahfuz Rahman"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01700-000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                      />
                    </div>
                  </div>                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Select Country *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold text-stone-800"
                    >
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">State / Division (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dhaka, Selangor, California"
                        value={stateDivision}
                        onChange={(e) => setStateDivision(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">City / District (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dhaka City, Kuala Lumpur, New York"
                        value={cityDistrict}
                        onChange={(e) => setCityDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Delivery Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. House 45, Road 12, Block C, Gulshan-1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>

                  {/* Dynamic Shipping Charge Display */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 bg-[#1b3d2b] text-amber-300 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5 flex-wrap">
                          <span>Shipping to {country}</span>
                          {stateDivision && <span className="text-stone-500 font-normal">({stateDivision})</span>}
                          {matchedShippingInfo.shippingMethod && (
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                              {matchedShippingInfo.shippingMethod}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          {isFreeShipping 
                            ? "Special promotion active for your destination!" 
                            : "Exact delivery rate configured for this destination (No currency conversion applied)."}
                        </p>
                        {totals.isShippingCurrencyMismatch && totals.shippingMismatchNotice && (
                          <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{totals.shippingMismatchNotice}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 self-end sm:self-center">
                      {isFreeShipping ? (
                        <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full inline-flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Free Shipping
                        </span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-extrabold text-[#1b3d2b]">
                            {totals.formattedShipping}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            Delivery Rate
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Payment Method */}
                <div className="space-y-4 pt-2">
                  <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                    <CreditCard className="w-5 h-5 text-emerald-800" />
                    <span>2. Select Payment Method</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {enabledMethods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === m.id
                            ? m.activeClass
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className={m.id === 'bKash' ? 'text-pink-600 font-extrabold' : m.id === 'Nagad' ? 'text-orange-600 font-extrabold' : ''}>{m.label}</span>
                        <span className="text-[10px] text-stone-500">{m.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-300 font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                      <span>Connecting to Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Place Order Now</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Col: Cart Summary */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6 h-fit">
              <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-stone-500 font-sans font-bold">{cartItems.length} Items</span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const priceInfo = getProductPriceInfo(item.product, currency);
                  return (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-stone-900 truncate">{item.product.name}</h4>
                          {priceInfo.hasDiscount && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1 rounded">
                              {priceInfo.badgeLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-stone-800">{priceInfo.currentPriceFormatted}</span>
                          {priceInfo.hasDiscount && (
                            <span className="line-through text-stone-400 text-[10px]">{priceInfo.regularPriceFormatted}</span>
                          )}
                          <span>x {item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 cursor-pointer font-bold transition-colors"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold min-w-[18px] text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 cursor-pointer font-bold transition-colors"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Coupon Form */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-emerald-600 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-xl cursor-pointer transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {couponMsg && (
                  <p className={`text-[11px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Total Calculation */}
              <div className="space-y-2 pt-3 border-t border-stone-200 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-stone-900">
                    {totals.formattedSubtotal} {currency}
                  </span>
                </div>

                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount:</span>
                    <span>
                      -{totals.formattedCouponDiscount} {currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery Charge ({country}):</span>
                  {isFreeShipping ? (
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Free Shipping
                    </span>
                  ) : (
                    <span className="font-bold text-stone-900">
                      {totals.formattedShipping}
                    </span>
                  )}
                </div>

                {totals.isShippingCurrencyMismatch && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⚠️ Shipping ({totals.formattedShipping}) is billed in {totals.shippingCurrency}. Total payable above reflects cart products in {currency}.
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-[#1b3d2b] pt-2 border-t border-stone-200">
                  <span>Total Payable:</span>
                  <span>
                    {totals.formattedTotal} {currency}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
