export type Currency = 
  | 'USD' 
  | 'BDT' 
  | 'EUR' 
  | 'GBP' 
  | 'SAR' 
  | 'AED' 
  | 'CAD' 
  | 'AUD' 
  | 'MYR' 
  | 'INR' 
  | 'QAR' 
  | 'KWD' 
  | 'OMR' 
  | 'BHD' 
  | 'SGD' 
  | 'JPY' 
  | 'PKR';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  flag: string;
  rateFromUsd: number;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rateFromUsd: 1 },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', rateFromUsd: 120 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦', rateFromUsd: 3.75 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', rateFromUsd: 3.67 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateFromUsd: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rateFromUsd: 0.78 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', rateFromUsd: 1.37 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺', rateFromUsd: 1.52 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', rateFromUsd: 4.70 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rateFromUsd: 83.5 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', rateFromUsd: 3.64 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', rateFromUsd: 0.31 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲', rateFromUsd: 0.38 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', flag: '🇧🇭', rateFromUsd: 0.37 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rateFromUsd: 1.34 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rateFromUsd: 155.0 },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', rateFromUsd: 278.0 },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export function getCurrencyForCountry(countryName: string): CurrencyInfo {
  const name = countryName.toLowerCase().trim();
  if (name.includes('bangladesh')) return CURRENCIES.BDT;
  if (name.includes('states') || name.includes('usa') || name === 'us' || name.includes('america')) return CURRENCIES.USD;
  if (name.includes('malaysia')) return CURRENCIES.MYR;
  if (name.includes('saudi')) return CURRENCIES.SAR;
  if (name.includes('emirates') || name.includes('uae') || name.includes('dubai')) return CURRENCIES.AED;
  if (name.includes('kingdom') || name.includes('uk') || name.includes('britain') || name.includes('england')) return CURRENCIES.GBP;
  if (name.includes('singapore')) return CURRENCIES.SGD;
  if (name.includes('canada')) return CURRENCIES.CAD;
  if (name.includes('australia')) return CURRENCIES.AUD;
  if (name.includes('india')) return CURRENCIES.INR;
  if (name.includes('qatar')) return CURRENCIES.QAR;
  if (name.includes('kuwait')) return CURRENCIES.KWD;
  if (name.includes('oman')) return CURRENCIES.OMR;
  if (name.includes('bahrain')) return CURRENCIES.BHD;
  if (name.includes('japan')) return CURRENCIES.JPY;
  if (name.includes('pakistan')) return CURRENCIES.PKR;

  const eurozone = ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "finland", "greece", "ireland", "portugal", "slovakia", "slovenia", "estonia", "latvia", "lithuania", "luxembourg", "malta", "cyprus"];
  if (eurozone.some(c => name.includes(c))) return CURRENCIES.EUR;

  if (name.includes('worldwide') || name.includes('other')) return CURRENCIES.USD;

  return CURRENCIES.USD;
}

export function formatCurrencyAmount(amount: number, currency: Currency): string {
  const info = CURRENCIES[currency] || CURRENCIES.BDT;
  if (currency === 'BDT') {
    return `৳ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  if (currency === 'MYR') {
    return `RM ${amount.toFixed(2)}`;
  }
  if (currency === 'JPY' || currency === 'PKR') {
    return `${info.symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'KWD' || currency === 'OMR' || currency === 'BHD') {
    return `${info.symbol} ${amount.toFixed(3)}`;
  }
  return `${info.symbol} ${amount.toFixed(2)}`;
}

export function formatPrice(usdAmount: number, currency: Currency): string {
  const info = CURRENCIES[currency] || CURRENCIES.USD;
  const amount = usdAmount * info.rateFromUsd;
  
  if (currency === 'BDT' || currency === 'JPY' || currency === 'PKR') {
    return `${info.symbol} ${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
  
  if (currency === 'MYR') {
    return `${info.symbol} ${amount.toFixed(2)}`;
  }

  if (currency === 'KWD' || currency === 'OMR' || currency === 'BHD') {
    return `${info.symbol} ${amount.toFixed(3)}`;
  }

  return `${info.symbol} ${amount.toFixed(2)}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  customRates?: Partial<Record<Currency, number>>
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = customRates?.[fromCurrency] ?? CURRENCIES[fromCurrency]?.rateFromUsd ?? 1;
  const toRate = customRates?.[toCurrency] ?? CURRENCIES[toCurrency]?.rateFromUsd ?? 1;
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / fromRate;
  const targetAmount = toCurrency === 'USD' ? usdAmount : usdAmount * toRate;
  return targetAmount;
}

export function formatSubtotal(
  product: Product | { 
    priceUsd: number; 
    priceBdt: number; 
    priceMyr?: number; 
    originalPriceUsd?: number; 
    originalPriceBdt?: number; 
    originalPriceMyr?: number; 
    discountType?: 'percentage' | 'flat'; 
    discountPercentage?: number; 
    discountAmountUsd?: number; 
    discountAmountBdt?: number; 
    discountAmountMyr?: number; 
    isDiscountActive?: boolean; 
    selectedWeightVariant?: ProductWeightVariant;
  },
  quantity: number,
  currency: Currency
): string {
  const priceInfo = getProductPriceInfo(product as Product, currency);
  const safeQty = Math.max(1, quantity || 1);
  const totalBdt = priceInfo.currentPriceBdt * safeQty;
  const totalUsd = priceInfo.currentPriceUsd * safeQty;
  const totalMyr = priceInfo.currentPriceMyr * safeQty;

  if (currency === 'BDT') {
    return `৳ ${Math.round(totalBdt).toLocaleString()}`;
  }
  if (currency === 'MYR') {
    return `RM ${totalMyr.toFixed(2)}`;
  }
  if (currency === 'USD') {
    return `$${totalUsd.toFixed(2)}`;
  }
  return formatPrice(totalUsd, currency);
}

export function formatProductPrice(product: { priceUsd: number; priceBdt: number; priceMyr?: number; discountPercentage?: number; discountAmountBdt?: number; discountAmountUsd?: number; discountAmountMyr?: number; discountType?: 'percentage' | 'flat'; originalPriceBdt?: number; originalPriceUsd?: number; originalPriceMyr?: number; isDiscountActive?: boolean; selectedWeightVariant?: ProductWeightVariant }, currency: Currency): string {
  const info = getProductPriceInfo(product as Product, currency);
  return info.currentPriceFormatted;
}

export interface ProductPriceInfo {
  hasDiscount: boolean;
  discountType: 'percentage' | 'flat';
  discountPercentage: number;
  discountAmountUsd: number;
  discountAmountBdt: number;
  discountAmountMyr: number;
  discountLabel: string;
  badgeLabel: string;
  regularPriceUsd: number;
  regularPriceBdt: number;
  regularPriceMyr: number;
  currentPriceUsd: number;
  currentPriceBdt: number;
  currentPriceMyr: number;
  savingsUsd: number;
  savingsBdt: number;
  savingsMyr: number;
  regularPriceFormatted: string;
  currentPriceFormatted: string;
  savingsFormatted: string;
}

export interface ProductWeightVariant {
  id: string;
  weight: string; // e.g. "250g Jar", "500g Jar", "1kg Family Pack", "250ml Bottle", "1 Litre"
  priceBdt: number;
  priceUsd: number;
  priceMyr?: number;
  originalPriceBdt?: number;
  originalPriceUsd?: number;
  originalPriceMyr?: number;
  discountType?: 'percentage' | 'flat';
  discountPercentage?: number;
  discountAmountBdt?: number;
  discountAmountUsd?: number;
  discountAmountMyr?: number;
  isDiscountActive?: boolean;
  stock?: number;
  inStock?: boolean;
  badge?: string; // e.g. "BEST VALUE", "POPULAR", "SAMPLER", "SPECIAL DEAL"
  dealText?: string; // e.g. "Special ৳250 OFF", "Save 20%"
  costMyr?: number;
  costBdt?: number;
  costUsd?: number;
}

// Helper function to resolve regular & current prices and maximum discount for an item (product or variant)
export const computeItemPricing = (item: {
  priceUsd: number;
  priceBdt: number;
  priceMyr?: number;
  originalPriceUsd?: number;
  originalPriceBdt?: number;
  originalPriceMyr?: number;
  discountType?: 'percentage' | 'flat';
  discountPercentage?: number;
  discountAmountUsd?: number;
  discountAmountBdt?: number;
  discountAmountMyr?: number;
  isDiscountActive?: boolean;
}) => {
  const myrRate = CURRENCIES.MYR.rateFromUsd; // 4.70
  const baseUsd = item.priceUsd || (item.priceBdt ? item.priceBdt / 120 : (item.priceMyr ? item.priceMyr / myrRate : 0));
  const baseBdt = item.priceBdt || (item.priceUsd ? Math.round(item.priceUsd * 120) : (item.priceMyr ? Math.round((item.priceMyr / myrRate) * 120) : 0));
  const baseMyr = item.priceMyr ?? (item.priceUsd ? parseFloat((item.priceUsd * myrRate).toFixed(2)) : (item.priceBdt ? parseFloat(((item.priceBdt / 120) * myrRate).toFixed(2)) : 0));

  const hasOrig = Boolean(
    (item.originalPriceMyr && item.originalPriceMyr > 0) ||
    (item.originalPriceBdt && item.originalPriceBdt > 0) ||
    (item.originalPriceUsd && item.originalPriceUsd > 0)
  );

  let regMyr = hasOrig
    ? (item.originalPriceMyr || (item.originalPriceUsd ? parseFloat((item.originalPriceUsd * myrRate).toFixed(2)) : parseFloat(((item.originalPriceBdt! / 120) * myrRate).toFixed(2))))
    : baseMyr;
  let regBdt = hasOrig
    ? (item.originalPriceBdt || Math.round((regMyr / myrRate) * 120))
    : baseBdt;
  let regUsd = hasOrig
    ? (item.originalPriceUsd || parseFloat((regMyr / myrRate).toFixed(2)))
    : baseUsd;

  // Check discounts
  const pct = item.discountPercentage || 0;
  const flatMyr = item.discountAmountMyr || (item.discountAmountBdt ? parseFloat(((item.discountAmountBdt / 120) * myrRate).toFixed(2)) : (item.discountAmountUsd ? parseFloat((item.discountAmountUsd * myrRate).toFixed(2)) : 0));
  const flatBdt = item.discountAmountBdt || (flatMyr > 0 ? Math.round((flatMyr / myrRate) * 120) : (item.discountAmountUsd ? Math.round(item.discountAmountUsd * 120) : 0));
  const flatUsd = item.discountAmountUsd || (flatMyr > 0 ? parseFloat((flatMyr / myrRate).toFixed(2)) : (item.discountAmountBdt ? parseFloat((item.discountAmountBdt / 120).toFixed(2)) : 0));

  // Calculate potential savings for Percentage vs Flat
  const pctSavingsBdt = pct > 0 ? Math.round(regBdt * (pct / 100)) : 0;
  const flatSavingsBdt = flatBdt;

  // Strictly respect the discountType configured by the admin
  let chosenType: 'percentage' | 'flat' = item.discountType || (pct > 0 ? 'percentage' : (flatSavingsBdt > 0 ? 'flat' : 'percentage'));
  if (item.discountType === 'percentage') {
    chosenType = 'percentage';
  } else if (item.discountType === 'flat') {
    chosenType = 'flat';
  } else if (pct > 0 && flatSavingsBdt > 0) {
    chosenType = flatSavingsBdt >= pctSavingsBdt ? 'flat' : 'percentage';
  } else if (flatSavingsBdt > 0) {
    chosenType = 'flat';
  } else if (pct > 0) {
    chosenType = 'percentage';
  }

  let curMyr = regMyr;
  let curBdt = regBdt;
  let curUsd = regUsd;

  const isActive = item.isDiscountActive !== false && (pct > 0 || flatSavingsBdt > 0 || regBdt > baseBdt || regMyr > baseMyr);

  if (isActive) {
    if (chosenType === 'percentage' && pct > 0) {
      curMyr = parseFloat((regMyr * (1 - pct / 100)).toFixed(2));
      curBdt = Math.round(regBdt * (1 - pct / 100));
      curUsd = parseFloat((regUsd * (1 - pct / 100)).toFixed(2));
    } else if (chosenType === 'flat' && (flatBdt > 0 || flatUsd > 0 || flatMyr > 0)) {
      curMyr = Math.max(0, parseFloat((regMyr - flatMyr).toFixed(2)));
      curBdt = Math.max(0, regBdt - flatBdt);
      curUsd = Math.max(0, parseFloat((regUsd - flatUsd).toFixed(2)));
    } else if (regBdt > baseBdt || regMyr > baseMyr) {
      curMyr = baseMyr;
      curBdt = baseBdt;
      curUsd = baseUsd;
    }
  } else {
    curMyr = baseMyr;
    curBdt = baseBdt;
    curUsd = baseUsd;
  }

  const savBdt = Math.max(0, regBdt - curBdt);
  const savUsd = Math.max(0, parseFloat((regUsd - curUsd).toFixed(2)));
  const savMyr = Math.max(0, parseFloat((regMyr - curMyr).toFixed(2)));

  return {
    regularMyr: regMyr,
    regularBdt: regBdt,
    regularUsd: regUsd,
    currentMyr: curMyr,
    currentBdt: curBdt,
    currentUsd: curUsd,
    savingsBdt: savBdt,
    savingsUsd: savUsd,
    savingsMyr: savMyr,
    effectiveDiscountType: chosenType,
    effectiveDiscountPct: pct > 0 ? pct : (regBdt > 0 && savBdt > 0 ? Math.round((savBdt / regBdt) * 100) : 0),
    effectiveFlatBdt: flatBdt,
    effectiveFlatUsd: flatUsd,
    effectiveFlatMyr: flatMyr,
    isDiscountActive: isActive && (savBdt > 0 || savUsd > 0 || savMyr > 0),
  };
};

export function getProductPriceInfo(
  product: Product | { 
    priceUsd: number; 
    priceBdt: number; 
    priceMyr?: number; 
    originalPriceUsd?: number; 
    originalPriceBdt?: number; 
    originalPriceMyr?: number; 
    discountType?: 'percentage' | 'flat'; 
    discountPercentage?: number; 
    discountAmountUsd?: number; 
    discountAmountBdt?: number; 
    discountAmountMyr?: number; 
    isDiscountActive?: boolean; 
    selectedWeightVariant?: ProductWeightVariant;
    weightVariants?: ProductWeightVariant[];
    badge?: string;
  }, 
  currency: Currency
): ProductPriceInfo {
  const myrRate = CURRENCIES.MYR.rateFromUsd; // 4.70

  let targetItem: {
    priceUsd: number;
    priceBdt: number;
    priceMyr?: number;
    originalPriceUsd?: number;
    originalPriceBdt?: number;
    originalPriceMyr?: number;
    discountType?: 'percentage' | 'flat';
    discountPercentage?: number;
    discountAmountUsd?: number;
    discountAmountBdt?: number;
    discountAmountMyr?: number;
    isDiscountActive?: boolean;
    dealText?: string;
  };

  const explicitVariant = ('selectedWeightVariant' in product && product.selectedWeightVariant) ? product.selectedWeightVariant : null;

  if (explicitVariant) {
    targetItem = explicitVariant;
  } else if (product.weightVariants && product.weightVariants.length > 0) {
    // If no variant is explicitly selected (e.g. on catalog/featured card),
    // find the variant that provides the HIGHEST DISCOUNT PERCENTAGE / SAVINGS
    let bestOption = product.weightVariants[0];
    let maxPct = -1;
    let maxSavings = -1;

    for (const v of product.weightVariants) {
      const computed = computeItemPricing(v);
      const savingsInCurrent = currency === 'BDT' ? computed.savingsBdt : (currency === 'MYR' ? computed.savingsMyr : computed.savingsUsd);
      const discountPct = computed.effectiveDiscountPct || (computed.regularBdt > 0 ? (computed.savingsBdt / computed.regularBdt) * 100 : 0);

      // Prioritize active discounts with higher percentage, or higher money savings
      if (computed.isDiscountActive) {
        if (discountPct > maxPct || (discountPct === maxPct && savingsInCurrent > maxSavings)) {
          maxPct = discountPct;
          maxSavings = savingsInCurrent;
          bestOption = v;
        }
      } else if (maxPct <= 0 && savingsInCurrent > maxSavings) {
        maxSavings = savingsInCurrent;
        bestOption = v;
      }
    }

    // Also compare with base product discount if applicable
    const baseComputed = computeItemPricing(product);
    const baseSavings = currency === 'BDT' ? baseComputed.savingsBdt : (currency === 'MYR' ? baseComputed.savingsMyr : baseComputed.savingsUsd);
    const basePct = baseComputed.effectiveDiscountPct || 0;

    if (baseComputed.isDiscountActive && (basePct > maxPct || (basePct === maxPct && baseSavings > maxSavings))) {
      targetItem = product;
    } else {
      targetItem = bestOption;
    }
  } else {
    targetItem = product;
  }

  const computed = computeItemPricing(targetItem);

  const regularPriceFormatted = currency === 'USD' 
    ? `$${computed.regularUsd.toFixed(2)}` 
    : currency === 'BDT' 
    ? `৳ ${Math.round(computed.regularBdt).toLocaleString()}` 
    : currency === 'MYR'
    ? `RM ${computed.regularMyr.toFixed(2)}`
    : formatPrice(computed.regularUsd, currency);

  const currentPriceFormatted = currency === 'USD' 
    ? `$${computed.currentUsd.toFixed(2)}` 
    : currency === 'BDT' 
    ? `৳ ${Math.round(computed.currentBdt).toLocaleString()}` 
    : currency === 'MYR'
    ? `RM ${computed.currentMyr.toFixed(2)}`
    : formatPrice(computed.currentUsd, currency);

  const savingsFormatted = currency === 'USD' 
    ? `$${computed.savingsUsd.toFixed(2)}` 
    : currency === 'BDT' 
    ? `৳ ${Math.round(computed.savingsBdt).toLocaleString()}` 
    : currency === 'MYR'
    ? `RM ${computed.savingsMyr.toFixed(2)}`
    : formatPrice(computed.savingsUsd, currency);

  let discountLabel = '';
  if (computed.effectiveDiscountType === 'flat') {
    discountLabel = currency === 'MYR' 
      ? `RM ${(computed.savingsMyr || computed.effectiveFlatMyr).toFixed(2)} OFF` 
      : currency === 'BDT' 
      ? `৳ ${computed.savingsBdt || computed.effectiveFlatBdt} OFF` 
      : `$${(computed.savingsUsd || computed.effectiveFlatUsd).toFixed(2)} OFF`;
  } else {
    const calcPct = computed.effectiveDiscountPct > 0 
      ? computed.effectiveDiscountPct 
      : (computed.regularBdt > 0 ? Math.round(((computed.regularBdt - computed.currentBdt) / computed.regularBdt) * 100) : 0);
    discountLabel = `${calcPct}% OFF`;
  }

  // The badgeLabel for discount tag badge should show the discount offer, NEVER duplicate the product badge
  const badgeLabel = ('dealText' in targetItem && targetItem.dealText) || discountLabel;

  return {
    hasDiscount: computed.isDiscountActive,
    discountType: computed.effectiveDiscountType,
    discountPercentage: computed.effectiveDiscountPct,
    discountAmountUsd: computed.effectiveFlatUsd,
    discountAmountBdt: computed.effectiveFlatBdt,
    discountAmountMyr: computed.effectiveFlatMyr,
    discountLabel,
    badgeLabel,
    regularPriceUsd: computed.regularUsd,
    regularPriceBdt: computed.regularBdt,
    regularPriceMyr: computed.regularMyr,
    currentPriceUsd: computed.currentUsd,
    currentPriceBdt: computed.currentBdt,
    currentPriceMyr: computed.currentMyr,
    savingsUsd: computed.savingsUsd,
    savingsBdt: computed.savingsBdt,
    savingsMyr: computed.savingsMyr,
    regularPriceFormatted,
    currentPriceFormatted,
    savingsFormatted,
  };
}

export type Category = 
  | 'All' 
  | 'Pure Honey' 
  | 'Natural Foods' 
  | 'Sunnah Products' 
  | 'Health Consultation'
  | 'Gift Packs'
  | string;

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  status?: 'Active' | 'Inactive';
}

export interface MenuSubItem {
  id: string;
  label: string;
  categoryFilter?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  pathView: AppView;
  categoryFilter?: string;
  dropdownType?: 'shop' | 'natural-foods' | 'sunnah-products' | 'custom' | 'none';
  subItems?: MenuSubItem[];
}

export type AdminTab = 
  | 'dashboard'
  | 'products' 
  | 'categories' 
  | 'orders' 
  | 'customers' 
  | 'reviews' 
  | 'blog' 
  | 'coupons' 
  | 'shipping'
  | 'consultations' 
  | 'subscribers' 
  | 'reports' 
  | 'settings'
  | 'contact'
  | 'inventory' 
  | 'branding' 
  | 'megamenu' 
  | 'account' 
  | 'managers'
  | 'moderators'
  | 'payments';

export const ALL_COUNTRIES = [
  "Bangladesh", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Worldwide (All Other Countries)"
];

export interface ShippingCharge {
  id: string;
  country: string;
  state?: string;
  city?: string;
  amount: number;
  currency: Currency;
  shippingMethod?: string;
  shippingChargeBdt?: number;
  shippingChargeUsd?: number;
  freeShipping: boolean;
  status: 'active' | 'inactive';
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function formatShippingRuleCharge(rule: Partial<ShippingCharge> | null | undefined): string {
  if (!rule) return '৳80.00 BDT';
  if (rule.freeShipping) return 'Free Shipping';
  
  const cur: Currency = rule.currency || (rule.shippingChargeBdt !== undefined && rule.shippingChargeUsd === 0 ? 'BDT' : 'USD');
  const amount = rule.amount !== undefined 
    ? rule.amount 
    : (cur === 'BDT' ? (rule.shippingChargeBdt || 0) : (rule.shippingChargeUsd || 0));
  
  const symbol = CURRENCIES[cur]?.symbol || '';
  return `${symbol}${amount.toFixed(2)} ${cur}`;
}

export type Permission = 
  | 'view_orders' | 'manage_orders'
  | 'view_products' | 'add_products' | 'edit_products' | 'delete_products'
  | 'view_customers' | 'manage_customers'
  | 'view_reviews' | 'approve_reviews'
  | 'manage_coupons'
  | 'manage_categories'
  | 'manage_inventory'
  | 'view_reports'
  | 'manage_blog'
  | 'manage_homepage'
  | 'manage_settings';

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleType?: 'admin' | 'moderator';
  roleTitle: string;
  passwordPin: string;
  allowedTabs?: AdminTab[];
  permissions?: Permission[];
  status: 'active' | 'suspended';
  createdAt: string;
  isSuperAdmin?: boolean;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  passwordPin: string;
  avatar?: string;
  lastLogin?: string;
  isSuperAdmin?: boolean;
  permissions?: AdminTab[];
}

export interface ContactSettings {
  phone: string;
  email: string;
  location: string;
  workTime: string;
  whatsapp?: string;
  messenger?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  minOrderAmount?: number;
  active: boolean;
  usageCount?: number;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district?: string;
  status: 'active' | 'suspended';
  ordersCount: number;
  totalSpentBdt: number;
  joinedDate: string;
  isVerified?: boolean;
}

export interface HeroButton {
  id: string;
  label: string;
  url: string;
}

export interface DiscountOffer {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor?: string;
  isVisible: boolean;
  targetCategoryId?: string;
  discountType?: 'percentage' | 'flat' | 'all';
  minDiscount?: number;
  maxDiscount?: number;
  minFlatDiscount?: number;
  maxFlatDiscount?: number;
}

export interface DiscountOfferFilter {
  min: number;
  max: number;
  discountType?: 'percentage' | 'flat' | 'all';
  minFlat?: number;
  maxFlat?: number;
  title: string;
  subtitle?: string;
  categoryId?: string;
}

export function parseOfferDiscountRange(offer: DiscountOffer): DiscountOfferFilter {
  const offerType: 'percentage' | 'flat' | 'all' = offer.discountType || 'percentage';

  if (offerType === 'flat') {
    return {
      min: 0,
      max: 100,
      discountType: 'flat',
      minFlat: typeof offer.minFlatDiscount === 'number' ? offer.minFlatDiscount : undefined,
      maxFlat: typeof offer.maxFlatDiscount === 'number' ? offer.maxFlatDiscount : undefined,
      title: offer.title,
      subtitle: offer.subtitle,
      categoryId: offer.targetCategoryId
    };
  }

  if (offerType === 'all') {
    return {
      min: typeof offer.minDiscount === 'number' ? offer.minDiscount : 1,
      max: typeof offer.maxDiscount === 'number' ? offer.maxDiscount : 100,
      discountType: 'all',
      title: offer.title,
      subtitle: offer.subtitle,
      categoryId: offer.targetCategoryId
    };
  }

  // percentage
  if (typeof offer.minDiscount === 'number' || typeof offer.maxDiscount === 'number') {
    return {
      min: typeof offer.minDiscount === 'number' ? offer.minDiscount : 1,
      max: typeof offer.maxDiscount === 'number' ? offer.maxDiscount : 100,
      discountType: 'percentage',
      title: offer.title,
      subtitle: offer.subtitle,
      categoryId: offer.targetCategoryId
    };
  }

  // Parse pattern like "25% - 75% OFF" or "25%-75%" or "25 to 75%"
  const combinedText = `${offer.title} ${offer.subtitle}`;
  const rangeMatch = combinedText.match(/(\d+)\s*%\s*(?:-|to)\s*(\d+)\s*%/i);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1], 10),
      max: parseInt(rangeMatch[2], 10),
      discountType: 'percentage',
      title: offer.title,
      subtitle: offer.subtitle,
      categoryId: offer.targetCategoryId
    };
  }

  // Parse single pattern like "50% OFF" or "UP TO 70% OFF"
  const singleMatch = combinedText.match(/(?:up to\s*)?(\d+)\s*%/i);
  if (singleMatch) {
    const pct = parseInt(singleMatch[1], 10);
    return {
      min: 1,
      max: pct,
      discountType: 'percentage',
      title: offer.title,
      subtitle: offer.subtitle,
      categoryId: offer.targetCategoryId
    };
  }

  // Fallback for general offers (shows any discounted product)
  return {
    min: 1,
    max: 100,
    discountType: 'percentage',
    title: offer.title,
    subtitle: offer.subtitle,
    categoryId: offer.targetCategoryId
  };
}

export function isProductEligibleForDiscountFilter(
  product: Product,
  currency: Currency,
  minDiscount: number = 1,
  maxDiscount: number = 100,
  filterDiscountType: 'percentage' | 'flat' | 'all' = 'percentage',
  minFlat?: number,
  maxFlat?: number
): boolean {
  // If filtering for FLAT discount only:
  if (filterDiscountType === 'flat') {
    // Check main product
    const mainPricing = computeItemPricing(product);
    if (mainPricing.isDiscountActive && mainPricing.effectiveDiscountType === 'flat') {
      const savings = currency === 'BDT' ? mainPricing.savingsBdt : (currency === 'MYR' ? mainPricing.savingsMyr : mainPricing.savingsUsd);
      if (savings > 0) {
        if (typeof minFlat === 'number' && savings < minFlat) return false;
        if (typeof maxFlat === 'number' && savings > maxFlat) return false;
        return true;
      }
    }

    // Direct product flat checks
    if (product.isDiscountActive !== false && product.discountType === 'flat') {
      if (product.discountAmountMyr || product.discountAmountBdt || product.discountAmountUsd) {
        return true;
      }
    }

    // Check variants
    if (product.weightVariants && product.weightVariants.length > 0) {
      for (const variant of product.weightVariants) {
        const varPricing = computeItemPricing(variant);
        if (varPricing.isDiscountActive && varPricing.effectiveDiscountType === 'flat') {
          const savings = currency === 'BDT' ? varPricing.savingsBdt : (currency === 'MYR' ? varPricing.savingsMyr : varPricing.savingsUsd);
          if (savings > 0) {
            if (typeof minFlat === 'number' && savings < minFlat) continue;
            if (typeof maxFlat === 'number' && savings > maxFlat) continue;
            return true;
          }
        }
        if (variant.isDiscountActive !== false && variant.discountType === 'flat') {
          if (variant.discountAmountMyr || variant.discountAmountBdt || variant.discountAmountUsd) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // If filtering for PERCENTAGE discount:
  if (filterDiscountType === 'percentage') {
    // Check main product pricing info
    const mainPricing = computeItemPricing(product);
    if (mainPricing.isDiscountActive && mainPricing.effectiveDiscountType === 'percentage') {
      const pct = mainPricing.effectiveDiscountPct;
      if (pct >= minDiscount && pct <= maxDiscount) {
        return true;
      }
    }

    // Check base product direct fields
    if (product.isDiscountActive !== false && product.discountType !== 'flat') {
      if (typeof product.discountPercentage === 'number' && product.discountPercentage >= minDiscount && product.discountPercentage <= maxDiscount) {
        return true;
      }
      if (product.originalPriceBdt && product.originalPriceBdt > product.priceBdt) {
        const pct = Math.round(((product.originalPriceBdt - product.priceBdt) / product.originalPriceBdt) * 100);
        if (pct >= minDiscount && pct <= maxDiscount) return true;
      }
      if (product.originalPriceMyr && product.originalPriceMyr > (product.priceMyr || 0)) {
        const pct = Math.round(((product.originalPriceMyr - (product.priceMyr || 0)) / product.originalPriceMyr) * 100);
        if (pct >= minDiscount && pct <= maxDiscount) return true;
      }
      if (product.originalPriceUsd && product.originalPriceUsd > product.priceUsd) {
        const pct = Math.round(((product.originalPriceUsd - product.priceUsd) / product.originalPriceUsd) * 100);
        if (pct >= minDiscount && pct <= maxDiscount) return true;
      }
    }

    // Check all weight variants of the product (e.g. 250g Jar 33% OFF)
    if (product.weightVariants && product.weightVariants.length > 0) {
      for (const variant of product.weightVariants) {
        if (variant.isDiscountActive !== false && variant.discountType !== 'flat') {
          // Direct discount percentage on variant
          if (typeof variant.discountPercentage === 'number' && variant.discountPercentage >= minDiscount && variant.discountPercentage <= maxDiscount) {
            return true;
          }

          // Computed pricing for this specific variant
          const varPricing = computeItemPricing(variant);
          if (varPricing.isDiscountActive && varPricing.effectiveDiscountType === 'percentage' && varPricing.effectiveDiscountPct >= minDiscount && varPricing.effectiveDiscountPct <= maxDiscount) {
            return true;
          }

          // Regular price vs Selling price on variant
          if (variant.originalPriceBdt && variant.originalPriceBdt > variant.priceBdt) {
            const pct = Math.round(((variant.originalPriceBdt - variant.priceBdt) / variant.originalPriceBdt) * 100);
            if (pct >= minDiscount && pct <= maxDiscount) return true;
          }
          if (variant.originalPriceMyr && variant.originalPriceMyr > (variant.priceMyr || 0)) {
            const pct = Math.round(((variant.originalPriceMyr - (variant.priceMyr || 0)) / variant.originalPriceMyr) * 100);
            if (pct >= minDiscount && pct <= maxDiscount) return true;
          }
          if (variant.originalPriceUsd && variant.originalPriceUsd > variant.priceUsd) {
            const pct = Math.round(((variant.originalPriceUsd - variant.priceUsd) / variant.originalPriceUsd) * 100);
            if (pct >= minDiscount && pct <= maxDiscount) return true;
          }
        }
      }
    }

    return false;
  }

  // If filterDiscountType === 'all'
  const mainInfo = getProductPriceInfo(product, currency);
  if (mainInfo.hasDiscount) {
    return true;
  }
  if (product.weightVariants && product.weightVariants.length > 0) {
    for (const variant of product.weightVariants) {
      const varPricing = computeItemPricing(variant);
      if (varPricing.isDiscountActive && varPricing.savingsBdt > 0) {
        return true;
      }
    }
  }

  return false;
}

export interface FooterLink {
  id: string;
  label: string;
  target: string;
}

export interface HomepageSection {
  id: string;
  name: string;
  isVisible: boolean;
}

export type SectionVisibility = HomepageSection[];

export interface PaymentGatewaySettings {
  bkashAppKey?: string;
  bkashAppSecret?: string;
  bkashUsername?: string;
  bkashPassword?: string;
  bkashBaseUrl?: string;
  nagadMerchantId?: string;
  nagadPublicKey?: string;
  nagadPrivateKey?: string;
  cardGatewayId?: string;
  cardGatewaySecret?: string;
}

export interface SiteSettings {
  logoUrl?: string;
  announcementText: string;
  announcementMode?: 'running' | 'still';
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroButtons: HeroButton[];
  discountOffers: DiscountOffer[];
  shopCtaText?: string;
  language?: 'English' | 'Bangla' | 'Arabic';
  defaultProductCurrency?: Currency;
  customExchangeRates?: Record<string, number>;
  contactInfo?: ContactSettings;
  menuItems?: MenuItem[];
  adminAccount?: AdminAccount;
  managers?: ManagerAccount[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  footerAboutText?: string;
  copyrightText?: string;
  enabledPaymentMethods?: string[];
  paymentLogos?: Record<string, string>;
  paymentGatewaySettings?: PaymentGatewaySettings;
  footerQuickLinks?: FooterLink[];
  footerProductLinks?: FooterLink[];
  playStoreEnabled?: boolean;
  playStoreUrl?: string;
  appStoreEnabled?: boolean;
  appStoreUrl?: string;
  sectionVisibilityMobile?: SectionVisibility;
  sectionVisibilityDesktop?: SectionVisibility;
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', label: 'Home', pathView: 'home', dropdownType: 'none' },
  { 
    id: 'm2', 
    label: 'Shop', 
    pathView: 'products', 
    categoryFilter: 'All', 
    dropdownType: 'shop',
    subItems: [
      { id: 's1', label: 'All Products', categoryFilter: 'All' },
      { id: 's2', label: 'Pure Honey', categoryFilter: 'Pure Honey' },
      { id: 's3', label: 'Natural Foods', categoryFilter: 'Natural Foods' },
      { id: 's4', label: 'Sunnah Products', categoryFilter: 'Sunnah Products' },
      { id: 's5', label: 'Gift Packs', categoryFilter: 'Gift Packs' },
    ]
  },
  { 
    id: 'm3', 
    label: 'Natural Foods', 
    pathView: 'products', 
    categoryFilter: 'Natural Foods', 
    dropdownType: 'natural-foods',
    subItems: [
      { id: 'nf1', label: 'All Natural Foods', categoryFilter: 'Natural Foods' },
      { id: 'nf2', label: 'Pure Honey & Sidr Nectar', categoryFilter: 'Pure Honey' },
      { id: 'nf3', label: 'Black Seed Oil & Seeds', categoryFilter: 'Natural Foods' },
      { id: 'nf4', label: 'Organic Dates & Nuts', categoryFilter: 'Natural Foods' },
      { id: 'nf5', label: 'Pure Ghee & Cold Pressed Oils', categoryFilter: 'Natural Foods' },
    ]
  },
  { 
    id: 'm4', 
    label: 'Sunnah Products', 
    pathView: 'products', 
    categoryFilter: 'Sunnah Products', 
    dropdownType: 'sunnah-products',
    subItems: [
      { id: 'sp1', label: 'All Sunnah Products', categoryFilter: 'Sunnah Products' },
      { id: 'sp2', label: 'Ajwa & Premium Dates', categoryFilter: 'Sunnah Products' },
      { id: 'sp3', label: 'Sidr Royal Honey', categoryFilter: 'Pure Honey' },
      { id: 'sp4', label: 'Zamzam Water & Herbs', categoryFilter: 'Sunnah Products' },
      { id: 'sp5', label: 'Sunnah Oils & Scents', categoryFilter: 'Sunnah Products' },
    ]
  },
  { id: 'm5', label: 'Health Consultation', pathView: 'consultation', dropdownType: 'none' },
  { id: 'm6', label: 'Blog', pathView: 'blog', dropdownType: 'none' },
  { id: 'm7', label: 'About Us', pathView: 'about', dropdownType: 'none' },
  { id: 'm8', label: 'Contact', pathView: 'contact', dropdownType: 'none' },
];

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  phone: '+60 17-4505868',
  email: 'info@kirahaq.com',
  location: 'House 12, Road 5, Dhanmondi, Dhaka-1205, Bangladesh',
  workTime: 'Saturday - Thursday: 9:00 AM - 10:00 PM',
  whatsapp: '+60 17-4505868',
  messenger: 'https://m.me/your-facebook-page-id'
};

export const DEFAULT_ADMIN_ACCOUNT: AdminAccount = {
  id: 'admin_101',
  name: 'Kira Haq Admin',
  email: 'kirahaq.official@gmail.com',
  phone: '+880 1700-000000',
  role: 'Super Admin / Store Owner',
  passwordPin: 'official@502K',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  lastLogin: 'Active Session',
  isSuperAdmin: true,
  permissions: ['inventory', 'branding', 'megamenu', 'account', 'orders', 'consultations', 'managers']
};

export const DEFAULT_MANAGERS: ManagerAccount[] = [
  {
    id: 'mgr_01',
    name: 'Rahim Chowdhury',
    email: 'rahim.inventory@kirahaq.com',
    phone: '+880 1711-223344',
    roleType: 'moderator',
    roleTitle: 'Inventory & Catalogue Manager',
    passwordPin: '112233',
    allowedTabs: ['dashboard', 'products', 'inventory', 'categories'],
    permissions: ['manage_inventory', 'manage_orders', 'view_products', 'add_products', 'edit_products'],
    status: 'active',
    createdAt: '2026-07-20'
  },
  {
    id: 'mgr_02',
    name: 'Sumaiya Akter',
    email: 'sumaiya.orders@kirahaq.com',
    phone: '+880 1811-556677',
    roleType: 'moderator',
    roleTitle: 'Order Fulfillment Staff',
    passwordPin: '445566',
    allowedTabs: ['dashboard', 'orders', 'customers', 'consultations'],
    permissions: ['view_orders', 'manage_orders', 'view_customers'],
    status: 'active',
    createdAt: '2026-07-22'
  }
];

export interface NotificationRequest {
  id: string;
  email: string;
  productId: string;
  productName: string;
  createdAt: string;
  status: 'pending' | 'notified';
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  priceMyr?: number;
  priceUsd: number;
  priceBdt: number;
  originalPriceMyr?: number;
  originalPriceUsd?: number;
  originalPriceBdt?: number;
  discountPercentage?: number;
  discountAmountMyr?: number;
  discountAmountBdt?: number;
  discountAmountUsd?: number;
  discountType?: 'percentage' | 'flat';
  isDiscountActive?: boolean;
  costMyr?: number;
  costUsd?: number;
  costBdt?: number;
  baseCurrency?: Currency;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  benefits: string[];
  ingredients: string;
  inStock: boolean;
  stock: number;
  badge?: string;
  sunnahFact?: string;
  weight?: string;
  weightVariants?: ProductWeightVariant[];
  selectedWeightVariant?: ProductWeightVariant;
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId?: string;
  selectedVariantWeight?: string;
}

export interface Review {
  id: string;
  clientName: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  verified?: boolean;
  productName?: string;
  date?: string;
  status?: 'approved' | 'pending' | 'hidden' | 'rejected';
  adminReply?: string;
  replyDate?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  summary?: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  status?: 'published' | 'draft' | 'featured' | 'archived';
  featured?: boolean;
  viewsCount?: number;
}

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district?: string;
  avatar?: string;
  joinedDate?: string;
  ordersCount?: number;
  isVerified?: boolean;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type PaymentProviderType = 'bkash' | 'nagad' | 'card' | 'cod' | 'manual';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  provider: PaymentProviderType;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  providerPaymentId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  errorMessage?: string;
  refundStatus?: 'NONE' | 'REQUESTED' | 'REFUNDED' | 'FAILED';
  refundAmount?: number;
  refundTransactionId?: string;
  refundReason?: string;
  metadata?: Record<string, any>;
}

export interface OrderDetails {
  orderId: string;
  items: CartItem[];
  customerName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  country: string;
  paymentMethod: string;
  totalUsd: number;
  totalBdt: number;
  currency: Currency;
  status: string;
  orderDate: string;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  paymentProvider?: PaymentProviderType | string;
  paidAt?: string;
  refundStatus?: 'NONE' | 'REQUESTED' | 'REFUNDED' | 'FAILED';
  refundAmount?: number;
  refundTransactionId?: string;
  paymentMetadata?: Record<string, any>;
}

export type Order = OrderDetails;

export interface ConsultationBooking {
  serviceId?: string;
  serviceTitle?: string;
  service?: string;
  practitioner?: string;
  patientName: string;
  phone: string;
  email: string;
  date?: string;
  timeSlot?: string;
  preferredDate?: string;
  preferredTime?: string;
  type?: string;
  notes?: string;
  [key: string]: any;
}

export type AppView = 
  | 'home'
  | 'products'
  | 'product-detail'
  | 'categories'
  | 'about'
  | 'blog'
  | 'consultation'
  | 'checkout'
  | 'account'
  | 'verify-email'
  | 'contact'
  | 'admin';


