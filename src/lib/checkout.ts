import { 
  CartItem, 
  Currency, 
  Product, 
  getProductPriceInfo, 
  formatCurrencyAmount, 
  ShippingCharge,
  CURRENCIES 
} from '../types';

export interface MatchedShippingInfo {
  rule: ShippingCharge | null;
  amount: number;
  currency: Currency;
  shippingMethod: string;
  isFreeShipping: boolean;
  formattedCharge: string; // e.g. "৳80.00 BDT", "RM15.00 MYR", "$10.00 USD"
  isCurrencyMismatch: boolean;
  mismatchWarning?: string;
}

export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  shippingCurrency: Currency;
  tax: number;
  total: number;
  currency: Currency;
  formattedSubtotal: string;
  formattedShipping: string; // e.g. "৳80.00 BDT", "RM15.00 MYR", "$10.00 USD", or "Free Shipping"
  formattedCouponDiscount: string;
  formattedTotal: string;
  isShippingCurrencyMismatch: boolean;
  shippingMismatchNotice?: string;
}

/**
 * Returns the exact final unit price for a product in the given currency after applying any product discount.
 * If a discount exists, this ALWAYS returns the discounted price, never the original crossed-out price.
 */
export function getProductFinalUnitPrice(product: Product, currency: Currency): number {
  if (!product) return 0;
  const info = getProductPriceInfo(product, currency);
  if (currency === 'BDT') return info.currentPriceBdt;
  if (currency === 'USD') return info.currentPriceUsd;
  if (currency === 'MYR') return info.currentPriceMyr;
  return info.currentPriceUsd;
}

/**
 * Calculates the line total for a cart item = (final discounted unit price * quantity).
 */
export function getCartItemLineTotal(item: CartItem, currency: Currency): number {
  if (!item || !item.product) return 0;
  const unitPrice = getProductFinalUnitPrice(item.product, currency);
  return Number((unitPrice * (item.quantity || 1)).toFixed(2));
}

/**
 * Helper to check country name matching
 */
function isCountryMatch(ruleCountry: string, targetCountry: string): boolean {
  if (!ruleCountry || !targetCountry) return false;
  const r = ruleCountry.trim().toLowerCase();
  const t = targetCountry.trim().toLowerCase();
  if (r === t) return true;
  if (r.includes(t) || t.includes(r)) return true;
  if (t.includes('bangladesh') && (r.includes('bangladesh') || r.includes('bd'))) return true;
  if (t.includes('malaysia') && (r.includes('malaysia') || r.includes('my'))) return true;
  if (t.includes('united states') && (r.includes('united states') || r.includes('usa') || r.includes('us'))) return true;
  return false;
}

/**
 * Matches shipping rules in priority order:
 * 1. Exact Country + State + City match
 * 2. Exact Country + State match
 * 3. Exact Country match
 * 4. General / Worldwide / All fallback rule
 */
export function matchShippingRule(rules: any[], country: string, state: string = '', city: string = ''): ShippingCharge | null {
  if (!rules || rules.length === 0) return null;
  const activeRules = rules.filter(r => r.active !== false && r.status !== 'inactive');

  const cleanState = (state || '').trim().toLowerCase();
  const cleanCity = (city || '').trim().toLowerCase();

  // 1. Specific District/City
  if (cleanCity) {
    const cityRule = activeRules.find(c =>
      isCountryMatch(c.country, country) &&
      ((c.city && c.city.toLowerCase().trim() === cleanCity) || (c.district && c.district.toLowerCase().trim() === cleanCity))
    );
    if (cityRule) return cityRule;
  }

  // 2. Specific Division/State
  if (cleanState) {
    const stateRule = activeRules.find(c =>
      isCountryMatch(c.country, country) &&
      ((c.state && c.state.toLowerCase().trim() === cleanState) || (c.division && c.division.toLowerCase().trim() === cleanState))
    );
    if (stateRule) return stateRule;
  }

  // 3. Country match without district/division constraint
  const countryRule = activeRules.find(c =>
    isCountryMatch(c.country, country) && !c.city && !c.district && !c.state && !c.division
  );
  if (countryRule) return countryRule;

  // 4. Any country match
  const anyCountryRule = activeRules.find(c => isCountryMatch(c.country, country));
  if (anyCountryRule) return anyCountryRule;

  // 5. Worldwide / Default fallback
  return activeRules.find(c => {
    const cCountry = (c.country || '').trim().toLowerCase();
    return cCountry.includes('worldwide') || cCountry.includes('other') || cCountry.includes('all');
  }) || null;
}

/**
 * Returns exact matched shipping rule info without performing ANY currency conversion.
 * The rule's configured amount and currency are preserved as the absolute single source of truth.
 */
export function getMatchedShippingInfo(
  rules: any[],
  country: string,
  state: string = '',
  city: string = '',
  cartCurrency: Currency = 'BDT'
): MatchedShippingInfo {
  const rule = matchShippingRule(rules, country, state, city);

  if (!rule) {
    const isBd = (country || '').toLowerCase().includes('bangladesh');
    const defaultCurrency: Currency = isBd ? 'BDT' : 'USD';
    const defaultAmount = isBd ? 80 : 10;
    const isMismatch = defaultCurrency !== cartCurrency;
    const symbol = CURRENCIES[defaultCurrency]?.symbol || '';

    return {
      rule: null,
      amount: defaultAmount,
      currency: defaultCurrency,
      shippingMethod: 'Standard Delivery',
      isFreeShipping: false,
      formattedCharge: `${symbol}${defaultAmount.toFixed(2)} ${defaultCurrency}`,
      isCurrencyMismatch: isMismatch,
      mismatchWarning: isMismatch
        ? `Shipping charge is configured in ${defaultCurrency}, while your payment currency is ${cartCurrency}. Automatic conversion is disabled to ensure rate accuracy.`
        : undefined
    };
  }

  const isFree = Boolean(rule.freeShipping);
  // Read exact configured currency from the rule (fallback to legacy fields if needed)
  const ruleCurrency: Currency = rule.currency || (rule.shippingChargeBdt !== undefined && (rule.shippingChargeUsd === 0 || !rule.shippingChargeUsd) ? 'BDT' : 'USD');
  
  // Read exact configured amount from the rule without conversion
  const amount = isFree ? 0 : (
    rule.amount !== undefined 
      ? Number(rule.amount) 
      : (ruleCurrency === 'BDT' ? Number(rule.shippingChargeBdt || 0) : Number(rule.shippingChargeUsd || 0))
  );

  const shippingMethod = rule.shippingMethod || 'Standard Delivery';
  const symbol = CURRENCIES[ruleCurrency]?.symbol || '';
  const formattedCharge = isFree ? 'Free Shipping' : `${symbol}${amount.toFixed(2)} ${ruleCurrency}`;
  const isMismatch = !isFree && ruleCurrency !== cartCurrency;

  return {
    rule,
    amount,
    currency: ruleCurrency,
    shippingMethod,
    isFreeShipping: isFree,
    formattedCharge,
    isCurrencyMismatch: isMismatch,
    mismatchWarning: isMismatch
      ? `Configured shipping currency (${ruleCurrency}) differs from your active cart currency (${cartCurrency}). Please match your currency or contact support.`
      : undefined
  };
}

/**
 * Backward compatible shipping fee getter (returns exact configured amount without currency conversion)
 */
export function calculateShippingCharge(
  rules: any[],
  country: string,
  state: string = '',
  city: string = '',
  currency: Currency = 'BDT'
): number {
  const info = getMatchedShippingInfo(rules, country, state, city, currency);
  return info.isFreeShipping ? 0 : info.amount;
}

/**
 * Centralized Single Source of Truth for Checkout Calculations.
 *
 * Rules:
 * 1. Subtotal = Sum of (Final Discounted Unit Price * Quantity) for all cart items.
 * 2. Coupon Discount is subtracted from subtotal.
 * 3. Delivery charge uses the rule's EXACT configured amount and currency without conversion.
 * 4. Total = Subtotal - Coupon Discount + (Shipping if same currency) + Tax.
 */
export function calculateCheckoutTotals(
  cartItems: CartItem[],
  shipping: number | MatchedShippingInfo,
  cartCurrency: Currency,
  couponDiscount: number = 0,
  explicitShippingCurrency?: Currency
): CheckoutTotals {
  const subtotal = (cartItems || []).reduce((acc, item) => {
    if (!item || !item.product) return acc;
    const finalUnitPrice = getProductFinalUnitPrice(item.product, cartCurrency);
    const lineTotal = finalUnitPrice * (item.quantity || 1);
    return acc + lineTotal;
  }, 0);

  const roundedSubtotal = Number(subtotal.toFixed(2));
  const roundedCouponDiscount = Number(Math.max(0, couponDiscount).toFixed(2));

  let shippingAmount = 0;
  let shippingCurrency: Currency = cartCurrency;
  let isFreeShipping = false;
  let formattedShipping = '';
  let isMismatch = false;
  let shippingMismatchNotice: string | undefined = undefined;

  if (typeof shipping === 'object' && shipping !== null) {
    shippingAmount = shipping.amount;
    shippingCurrency = shipping.currency;
    isFreeShipping = shipping.isFreeShipping;
    formattedShipping = shipping.formattedCharge;
    isMismatch = shipping.isCurrencyMismatch;
    shippingMismatchNotice = shipping.mismatchWarning;
  } else {
    shippingAmount = Number(shipping) || 0;
    shippingCurrency = explicitShippingCurrency || cartCurrency;
    isFreeShipping = shippingAmount === 0;
    const symbol = CURRENCIES[shippingCurrency]?.symbol || '';
    formattedShipping = isFreeShipping 
      ? 'Free Shipping' 
      : `${symbol}${shippingAmount.toFixed(2)} ${shippingCurrency}`;
    isMismatch = !isFreeShipping && shippingCurrency !== cartCurrency;
    if (isMismatch) {
      shippingMismatchNotice = `Shipping charge (${symbol}${shippingAmount.toFixed(2)} ${shippingCurrency}) differs from cart currency (${cartCurrency}).`;
    }
  }

  const roundedShipping = isFreeShipping ? 0 : Number(Math.max(0, shippingAmount).toFixed(2));
  const tax = 0;

  // When currency matches (or shipping is free), calculate total directly.
  // When currencies differ, DO NOT silently convert! Total is subtotal - couponDiscount (+ shipping if same currency)
  const total = Math.max(0, roundedSubtotal - roundedCouponDiscount + (isMismatch ? 0 : roundedShipping) + tax);
  const roundedTotal = Number(total.toFixed(2));

  return {
    subtotal: roundedSubtotal,
    discount: 0,
    couponDiscount: roundedCouponDiscount,
    shipping: roundedShipping,
    shippingCurrency,
    tax,
    total: roundedTotal,
    currency: cartCurrency,
    formattedSubtotal: formatCurrencyAmount(roundedSubtotal, cartCurrency),
    formattedShipping,
    formattedCouponDiscount: formatCurrencyAmount(roundedCouponDiscount, cartCurrency),
    formattedTotal: formatCurrencyAmount(roundedTotal, cartCurrency),
    isShippingCurrencyMismatch: isMismatch,
    shippingMismatchNotice,
  };
}
