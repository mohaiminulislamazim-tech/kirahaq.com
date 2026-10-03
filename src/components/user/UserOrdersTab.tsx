import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Truck, Clock, CheckCircle2, RefreshCw, AlertCircle, XCircle,
  ChevronDown, ChevronUp, FileText, Package, MapPin, CreditCard, ShieldCheck, 
  HelpCircle, ExternalLink, ArrowRight, RotateCcw, DollarSign
} from 'lucide-react';
import { OrderDetails, Currency, formatProductPrice, getProductPriceInfo, formatCurrencyAmount } from '../../types';
import { calculateCheckoutTotals, getProductFinalUnitPrice } from '../../lib/checkout';

interface UserOrdersTabProps {
  orders: OrderDetails[];
  currency: Currency;
  onOpenInvoice: (order: OrderDetails) => void;
  onNavigate?: (tab: string) => void;
}

// Helper to format currency values cleanly without decimal bugs
const formatCurrency = (amount: number, cur: Currency): string => {
  return formatCurrencyAmount(amount, cur);
};

// Status theme styling configuration mapping
const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('pending')) {
    return {
      label: 'Pending',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      pillBg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
      barBg: 'bg-amber-500',
    };
  }
  if (s.includes('process') || s.includes('confirm')) {
    return {
      label: s.includes('confirm') ? 'Confirmed' : 'Processing',
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      pillBg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      icon: RefreshCw,
      barBg: 'bg-blue-500',
    };
  }
  if (s.includes('ship') || s.includes('out') || s.includes('dispatch')) {
    return {
      label: s.includes('out') ? 'Out for Delivery' : 'Shipped',
      badge: 'bg-purple-100 text-purple-900 border-purple-300',
      pillBg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
      icon: Truck,
      barBg: 'bg-purple-500',
    };
  }
  if (s.includes('deliver')) {
    return {
      label: 'Delivered',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      pillBg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      barBg: 'bg-emerald-500',
    };
  }
  if (s.includes('cancel')) {
    return {
      label: 'Cancelled',
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      pillBg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
      barBg: 'bg-rose-500',
    };
  }
  return {
    label: status,
    badge: 'bg-stone-100 text-stone-800 border-stone-300',
    pillBg: 'bg-stone-50',
    text: 'text-stone-800',
    border: 'border-stone-200',
    dot: 'bg-stone-500',
    icon: Clock,
    barBg: 'bg-stone-500',
  };
};

export const UserOrdersTab: React.FC<UserOrdersTabProps> = ({
  orders,
  currency,
  onOpenInvoice,
  onNavigate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<OrderDetails | null>(null);

  // Default sample orders if user has not placed orders yet
  const displayOrders = orders.length > 0 ? orders : [
    {
      orderId: 'KH-892104',
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
            description: '100% pure raw Sidr honey harvested from natural valleys.',
            benefits: ['Immunity Support', 'Digestive Health'],
            ingredients: 'Raw Sidr Nectar',
            inStock: true,
            weight: '500g'
          },
          quantity: 2
        },
        {
          product: {
            id: 'p2',
            name: 'Kalijira Oil Cold Pressed (250ml)',
            category: 'Natural Foods',
            priceUsd: 16,
            priceBdt: 1920,
            rating: 4.8,
            reviewCount: 95,
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
            description: '100% pure organic cold pressed black seed oil.',
            benefits: ['Immunity Booster', 'Heart Health'],
            ingredients: 'Black Seed (Nigella Sativa)',
            inStock: true,
            weight: '250ml'
          },
          quantity: 1
        }
      ],
      customerName: 'Sabbir Rahman',
      email: 'sabbir@example.com',
      phone: '+880 1711-223344',
      address: 'House 42, Road 11, Banani',
      district: 'Dhaka',
      country: 'Bangladesh',
      paymentMethod: 'bKash Online Payment',
      totalUsd: 80,
      totalBdt: 9600,
      currency: 'BDT',
      status: 'Out for Delivery',
      orderDate: 'Jul 25, 2026'
    },
    {
      orderId: 'KH-741029',
      items: [
        {
          product: {
            id: 'p3',
            name: 'Ajwa Dates Premium Grade A (1kg)',
            category: 'Sunnah Products',
            priceUsd: 25,
            priceBdt: 3000,
            rating: 5.0,
            reviewCount: 210,
            image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600',
            description: 'Authentic Madinah Ajwa dates rich in essential nutrients.',
            benefits: ['Heart Protection', 'Energy Source'],
            ingredients: 'Ajwa Dates',
            inStock: true,
            weight: '1kg'
          },
          quantity: 1
        }
      ],
      customerName: 'Sabbir Rahman',
      email: 'sabbir@example.com',
      phone: '+880 1711-223344',
      address: 'House 42, Road 11, Banani',
      district: 'Dhaka',
      country: 'Bangladesh',
      paymentMethod: 'Cash on Delivery',
      totalUsd: 25,
      totalBdt: 3000,
      currency: 'BDT',
      status: 'Delivered',
      orderDate: 'Jul 18, 2026'
    }
  ];

  // Filter logic for orders
  const filteredOrders = displayOrders.filter((ord) => {
    const s = ord.status.toLowerCase();
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Pending' && (s.includes('pending') || s.includes('confirm'))) ||
      (filterStatus === 'Processing' && (s.includes('process') || s.includes('confirm'))) ||
      (filterStatus === 'Shipped' && (s.includes('ship') || s.includes('out') || s.includes('dispatch'))) ||
      (filterStatus === 'Delivered' && s.includes('deliver')) ||
      (filterStatus === 'Cancelled' && s.includes('cancel'));
    
    const matchesQuery = !searchQuery.trim() || 
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some(i => i.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  // Calculate status counts for filter badges
  const statusCounts = {
    All: displayOrders.length,
    Pending: displayOrders.filter(o => o.status.toLowerCase().includes('pending') || o.status.toLowerCase().includes('confirm')).length,
    Processing: displayOrders.filter(o => o.status.toLowerCase().includes('process') || o.status.toLowerCase().includes('confirm')).length,
    Shipped: displayOrders.filter(o => o.status.toLowerCase().includes('ship') || o.status.toLowerCase().includes('out') || o.status.toLowerCase().includes('dispatch')).length,
    Delivered: displayOrders.filter(o => o.status.toLowerCase().includes('deliver')).length,
    Cancelled: displayOrders.filter(o => o.status.toLowerCase().includes('cancel')).length,
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6 max-w-full">
      
      {/* Search and Navigation Bar Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1b3d2b] flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                  My Orders & Live Tracking
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  View full order history, track live shipments, and access tax invoices.
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-stone-100 pt-4">
          {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => {
            const isActive = filterStatus === st;
            const count = statusCounts[st] || 0;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer text-xs ${
                  isActive
                    ? 'bg-[#1b3d2b] text-amber-400 shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <span>{st}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-200/80 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200/80 space-y-3">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No Orders Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any orders matching your criteria. Try adjusting your search query or filter state.
            </p>
            <button
              onClick={() => { setFilterStatus('All'); setSearchQuery(''); }}
              aria-label="Reset all search filters"
              className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isExpanded = expandedOrderId === ord.orderId;
            const statusConfig = getStatusConfig(ord.status);
            const StatusIcon = statusConfig.icon;

            // Compute exact itemized pricing
            const itemsSubtotal = ord.items.reduce((sum, item) => {
              const unitPrice = getProductFinalUnitPrice(item.product, currency);
              return sum + (unitPrice * item.quantity);
            }, 0);

            // Determine display grand total
            const grandTotal = currency === 'BDT'
              ? (ord.totalBdt || itemsSubtotal)
              : (ord.totalUsd || itemsSubtotal);

            // Standard estimated shipping fee
            const shippingFee = currency === 'BDT' ? 60 : 2.00;
            const tax = 0; // Included in prices
            const discount = Math.max(0, (itemsSubtotal + shippingFee) - grandTotal);

            return (
              <div
                key={ord.orderId}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? 'border-[#1b3d2b]/40 shadow-md ring-1 ring-[#1b3d2b]/20' 
                    : 'border-stone-200/90 shadow-xs hover:border-stone-300'
                }`}
              >
                {/* Header Bar */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">
                          Order #{ord.orderId}
                        </span>
                        <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusConfig.badge}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        • Placed on {ord.orderDate}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setTrackingModalOrder(ord)}
                        className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="View Live Courier Status"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Track Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenInvoice(ord)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Download Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#1b3d2b]" />
                        <span>Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpandOrder(ord.orderId)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                      >
                        <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-900" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-900" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Product Row & Total Amount */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Item Thumbnails Preview */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full scrollbar-none">
                      {ord.items.map((item, idx) => {
                        const priceInfo = getProductPriceInfo(item.product, currency);

                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/70 shrink-0"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                            />
                            <div className="text-xs pr-1">
                              <p className="font-bold text-stone-900 truncate max-w-40 sm:max-w-48">
                                {item.product.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                                <span>Qty: <strong className="text-stone-800">{item.quantity}</strong></span>
                                <span>•</span>
                                <span className="font-semibold text-[#1b3d2b]">
                                  {priceInfo.currentPriceFormatted}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Amount Summary */}
                    <div className="flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                      <span className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider">
                        Grand Total
                      </span>
                      <p className="text-lg sm:text-xl font-serif font-extrabold text-[#1b3d2b]">
                        {formatCurrency(grandTotal, currency)}
                      </p>
                    </div>

                  </div>

                  {/* ================= EXPANDED DETAILED BREAKDOWN ================= */}
                  {isExpanded && (
                    <div className="pt-6 border-t border-stone-200/80 space-y-6">
                      
                      {/* 1. Itemized Product Table */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#1b3d2b]" />
                          <span>Ordered Items ({ord.items.reduce((a, b) => a + b.quantity, 0)})</span>
                        </h4>

                        <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                              <tr>
                                <th className="py-3 px-4">Product Details</th>
                                <th className="py-3 px-4 text-center">Unit Price</th>
                                <th className="py-3 px-4 text-center">Quantity</th>
                                <th className="py-3 px-4 text-right">Line Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {ord.items.map((item, idx) => {
                                const priceInfo = getProductPriceInfo(item.product, currency);
                                const unitPrice = getProductFinalUnitPrice(item.product, currency);
                                const lineSubtotal = unitPrice * item.quantity;

                                return (
                                  <tr key={idx} className="hover:bg-stone-50/50">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={item.product.image}
                                          alt={item.product.name}
                                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                                        />
                                        <div>
                                          <div className="font-bold text-stone-900">{item.product.name}</div>
                                          <div className="text-[10px] text-stone-500">
                                            {item.product.category} {item.product.weight ? `• ${item.product.weight}` : ''}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-center font-medium text-stone-700">
                                      {priceInfo.currentPriceFormatted}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-stone-900">
                                      {item.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-[#1b3d2b]">
                                      {formatCurrency(lineSubtotal, currency)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. Three Column Information Cards: Delivery, Payment, Price Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Delivery Address Card */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200/80 pb-2">
                            <MapPin className="w-4 h-4 text-emerald-800" />
                            <span>Delivery Shipping Address</span>
                          </div>
                          <div className="space-y-1 text-stone-600 pt-1">
                            <p className="font-bold text-stone-900">{ord.customerName}</p>
                            <p>{ord.address}</p>
                            <p>{ord.district}, {ord.country || 'Bangladesh'}</p>
                            <p className="font-mono text-stone-800 pt-1">📞 {ord.phone}</p>
                            {ord.email && <p className="text-stone-500 truncate">✉️ {ord.email}</p>}
                          </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200/80 pb-2">
                            <CreditCard className="w-4 h-4 text-[#1b3d2b]" />
                            <span>Payment & Fulfillment</span>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500">Method:</span>
                              <span className="font-bold text-stone-900">{ord.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500">Currency:</span>
                              <span className="font-mono font-bold text-stone-900">{ord.currency || currency}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500">Payment Status:</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                PAID / CONFIRMED
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-stone-500">Order Status:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.badge}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price Breakdown Calculation Card */}
                        <div className="p-4 rounded-2xl bg-[#1b3d2b]/5 border border-[#1b3d2b]/20 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-[#1b3d2b] font-bold border-b border-stone-200 pb-2">
                            <DollarSign className="w-4 h-4 text-[#1b3d2b]" />
                            <span>Price Summary Breakdown</span>
                          </div>
                          <div className="space-y-1.5 pt-1 text-stone-700">
                            <div className="flex justify-between">
                              <span>Product Total:</span>
                              <span className="font-medium">{formatCurrency(itemsSubtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Standard Shipping:</span>
                              <span className="font-medium">{formatCurrency(shippingFee, currency)}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-medium">
                                <span>Discount / Promo:</span>
                                <span>-{formatCurrency(discount, currency)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-stone-500">
                              <span>Tax / VAT (0% Included):</span>
                              <span>{formatCurrency(tax, currency)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-stone-200/80 font-bold text-sm text-[#1b3d2b]">
                              <span>Grand Total:</span>
                              <span className="font-serif font-extrabold">{formatCurrency(grandTotal, currency)}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Footer Actions Inside Accordion */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Guaranteed 100% Pure & Authentic Sunnah Certified</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate ? onNavigate('products') : null}
                            className="px-4 py-2 bg-[#1b3d2b] hover:bg-[#122b1e] text-amber-400 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Buy Items Again</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Live Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">LIVE COURIER TRACKING</span>
                <h3 className="text-lg font-serif font-bold text-stone-900">Order #{trackingModalOrder.orderId}</h3>
                <p className="text-xs text-stone-500">Dispatched via Pathao Express / Steadfast Courier</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tracking Progress Timeline */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {(() => {
                const s = trackingModalOrder.status.toLowerCase();
                const isCancelled = s.includes('cancel');
                const isDelivered = s.includes('deliver');
                const isOut = isDelivered || s.includes('out');
                const isShipped = isOut || s.includes('ship') || s.includes('dispatch');
                const isProcessing = isShipped || s.includes('process') || s.includes('confirm') || s.includes('audit');
                
                if (isCancelled) {
                  return [
                    { step: 'Order Placed', desc: 'Received & Confirmed', done: true, time: trackingModalOrder.orderDate },
                    { step: 'Order Cancelled', desc: 'Order was cancelled as per customer/store request', done: true, isError: true, time: 'Cancelled' }
                  ].map((st, i) => (
                    <div key={i} className="flex items-start gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        st.isError ? 'bg-rose-600 text-white shadow-sm' : 'bg-[#1b3d2b] text-amber-400 shadow-sm'
                      }`}>
                        {st.isError ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${st.isError ? 'text-rose-700' : 'text-stone-900'}`}>{st.step}</h4>
                        <p className="text-[11px] text-stone-500">{st.desc}</p>
                        <span className="text-[10px] text-stone-500 font-mono font-medium">{st.time}</span>
                      </div>
                    </div>
                  ));
                }

                const steps = [
                  { 
                    step: 'Order Placed & Confirmed', 
                    desc: 'Order details verified & logged', 
                    done: true, 
                    time: trackingModalOrder.orderDate 
                  },
                  { 
                    step: 'Quality Audit & Packing', 
                    desc: 'Inspected for pure Sunnah standards', 
                    done: isProcessing, 
                    time: isProcessing ? `${trackingModalOrder.orderDate}, 10:30 AM` : 'Pending Quality Check' 
                  },
                  { 
                    step: 'Dispatched to Courier', 
                    desc: 'Handed over to delivery central hub', 
                    done: isShipped, 
                    time: isShipped ? `${trackingModalOrder.orderDate}, 04:15 PM` : 'Awaiting Dispatch' 
                  },
                  { 
                    step: 'Out for Delivery', 
                    desc: 'Delivery rider on the way to recipient address', 
                    done: isOut, 
                    time: isOut ? 'Today 09:00 AM' : 'Estimated Soon' 
                  },
                  { 
                    step: 'Delivered', 
                    desc: 'Package handed over successfully', 
                    done: isDelivered, 
                    time: isDelivered ? 'Delivered Successfully' : 'Estimated 1-2 Days' 
                  },
                ];

                return steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-4 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      st.done ? 'bg-[#1b3d2b] text-amber-400 shadow-sm' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {st.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{st.step}</h4>
                      <p className="text-[11px] text-stone-500">{st.desc}</p>
                      <span className={`text-[10px] font-mono font-medium ${st.done ? 'text-emerald-800 font-bold' : 'text-stone-400'}`}>
                        {st.time}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <p className="text-emerald-950 font-bold">Rider Contact: +880 1700-112233</p>
                <p className="text-[10px] text-emerald-800">Track Ref: PT-{trackingModalOrder.orderId}</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Rider contacted via SMS!')}
                className="px-3.5 py-1.5 bg-[#1b3d2b] text-white rounded-xl text-[11px] font-bold hover:bg-[#122b1e] transition-colors cursor-pointer"
              >
                Call Delivery Rider
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

