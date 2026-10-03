import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Plus, Minus, Percent } from 'lucide-react';
import { CartItem, Currency, formatPrice, formatProductPrice, getProductPriceInfo, formatCurrencyAmount } from '../types';
import { calculateCheckoutTotals, getProductFinalUnitPrice } from '../lib/checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // percentage
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  // Calculate using single source of truth checkout totals
  const rawTotals = calculateCheckoutTotals(items, 0, currency);
  const promoDiscountAmount = Number(((rawTotals.subtotal * discount)).toFixed(2));
  const totals = calculateCheckoutTotals(items, 0, currency, promoDiscountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SUNNAH10' || promoCode.trim().toUpperCase() === 'KIRA10' || promoCode.trim().toUpperCase() === 'RSTDX') {
      setDiscount(0.10);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try SUNNAH10 for 10% off!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-[#1b3d2b] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-lg">Your Shopping Bag ({items.length})</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-emerald-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl">
                  🍯
                </div>
                <p className="text-stone-700 font-serif font-semibold text-base">Your shopping bag is empty</p>
                <p className="text-stone-500 text-xs max-w-xs mx-auto">
                  Explore our pure honey, black seed oil, and Sunnah wellness collection.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1b3d2b] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const priceInfo = getProductPriceInfo(item.product, currency);
                return (
                  <div 
                    key={item.product.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover border border-stone-200"
                      />
                      {priceInfo.hasDiscount && (
                        <span className="absolute -top-1.5 -left-1.5 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shadow-xs">
                          {priceInfo.badgeLabel}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-amber-800 font-bold">
                          {priceInfo.currentPriceFormatted}
                        </span>
                        {priceInfo.hasDiscount && (
                          <span className="text-[10px] text-stone-400 line-through">
                            {priceInfo.regularPriceFormatted}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-stone-300 rounded-md bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= (item.product.stock ?? 0)}
                            className={`px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs ${item.quantity >= (item.product.stock ?? 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-stone-900 text-xs block">
                        {formatCurrencyAmount(getProductFinalUnitPrice(item.product, currency) * item.quantity, currency)}
                      </span>
                      {priceInfo.hasDiscount && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Save {formatCurrencyAmount((currency === 'BDT' ? priceInfo.savingsBdt : priceInfo.savingsUsd) * item.quantity, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4">
              
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. SUNNAH10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-stone-900 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  10% Sunnah Extra Promo Applied!
                </p>
              )}

              <div className="space-y-1.5 pt-2 border-t border-stone-200 text-xs">
                <div className="flex justify-between text-stone-700 font-medium">
                  <span>Product Subtotal</span>
                  <span>{totals.formattedSubtotal} {currency}</span>
                </div>
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Code ({discount * 100}%)</span>
                    <span>-{totals.formattedCouponDiscount} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-semibold">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1b3d2b] pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span>{totals.formattedTotal} {currency}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
