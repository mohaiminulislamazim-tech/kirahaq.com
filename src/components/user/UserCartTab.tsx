import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { CartItem, Currency, formatProductPrice, formatPrice, Coupon, getProductPriceInfo, formatCurrencyAmount } from '../../types';
import { calculateCheckoutTotals, getProductFinalUnitPrice } from '../../lib/checkout';

interface UserCartTabProps {
  cartItems: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const UserCartTab: React.FC<UserCartTabProps> = ({
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onExploreProducts,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponDiscountAmount, setCouponDiscountAmount] = useState<number>(0);

  const rawTotals = calculateCheckoutTotals(cartItems, 0, currency);
  const totals = calculateCheckoutTotals(cartItems, 0, currency, couponDiscountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.toUpperCase().trim();
    if (!cleanCode) return;

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

    const found = availableCoupons.find(c => c.code === cleanCode && c.active);

    if (found) {
      if (found.minOrderAmount) {
        const minInCurrency = currency === 'BDT' ? found.minOrderAmount : (found.minOrderAmount / 120);
        if (rawTotals.subtotal < minInCurrency) {
          setCouponMsg(`Min order spend of ${formatCurrencyAmount(minInCurrency, currency)} ${currency} required.`);
          setAppliedDiscount(0);
          setCouponDiscountAmount(0);
          return;
        }
      }

      if (found.discountType === 'percentage') {
        const perc = found.discountValue;
        setAppliedDiscount(perc);
        const disc = Number(((rawTotals.subtotal * perc) / 100).toFixed(2));
        setCouponDiscountAmount(disc);
        setCouponMsg(`Success! ${perc}% discount applied (${found.code}).`);
      } else {
        const fixed = currency === 'BDT' ? found.discountValue : (found.discountValue / 120);
        setAppliedDiscount(0);
        setCouponDiscountAmount(fixed);
        setCouponMsg(`Success! ${formatCurrencyAmount(fixed, currency)} discount applied (${found.code}).`);
      }
    } else {
      setCouponMsg('Invalid or inactive code');
      setAppliedDiscount(0);
      setCouponDiscountAmount(0);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-800" />
            <span>Active Shopping Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)} Items)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Review your pure organic products before proceeding to secure checkout.
          </p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-stone-50/70 rounded-3xl border border-dashed border-stone-300 space-y-3">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-800">Your Shopping Cart is Empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You don't have any items in your cart yet. Explore our Sunnah wellness products to add items.
          </p>
          <button
            onClick={onExploreProducts}
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Item List Column */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => {
              const priceInfo = getProductPriceInfo(item.product, currency);
              const finalUnit = getProductFinalUnitPrice(item.product, currency);
              return (
                <div
                  key={item.product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.product.category}
                      </span>
                      <h3 className="font-bold text-stone-900 text-sm mt-0.5">{item.product.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-semibold text-[#1b3d2b]">
                          {priceInfo.currentPriceFormatted} / unit
                        </span>
                        {priceInfo.hasDiscount && (
                          <span className="text-[10px] text-stone-400 line-through">
                            {priceInfo.regularPriceFormatted}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-bold">Total</span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        {formatCurrencyAmount(finalUnit * item.quantity, currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary & Coupon Side Panel */}
          <div className="space-y-4">
            
            {/* Promo Code Box */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Have a Promo Coupon?</span>
              </h3>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SUNNAH10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl outline-none font-mono uppercase font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-950 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-xs font-bold ${appliedDiscount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* Order Summary Box */}
            <div className="bg-[#1b3d2b] text-white p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-base text-amber-300 border-b border-emerald-800 pb-2">
                Cart Order Summary
              </h3>

              <div className="space-y-2 text-xs text-emerald-100">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">
                    {totals.formattedSubtotal} {currency}
                  </span>
                </div>

                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>Coupon Discount:</span>
                    <span>
                      -{totals.formattedCouponDiscount} {currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-amber-400">Calculated at Checkout</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white border-t border-emerald-800 pt-3">
                  <span>Total Amount:</span>
                  <span className="text-amber-300 font-serif">
                    {totals.formattedTotal} {currency}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-300 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
