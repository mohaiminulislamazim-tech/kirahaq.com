import React, { useState, useEffect } from 'react';
import { Product, Category, Currency, CURRENCIES, getProductPriceInfo, formatProductPrice, SiteSettings, ProductWeightVariant } from '../../types';
import { 
  Package, Plus, Edit3, Trash2, Search, Filter, Save, X, 
  CheckCircle2, AlertCircle, Eye, EyeOff, Image as ImageIcon, Sparkles, Upload,
  RefreshCw, SlidersHorizontal, ArrowRightLeft, Info, DollarSign, Scale, Layers, Tag,
  ChevronDown, ChevronUp, Percent, Gift, TrendingUp
} from 'lucide-react';

interface AdminProductsTabProps {
  products: Product[];
  currency: Currency;
  siteSettings: SiteSettings;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const PRESET_PRODUCT_IMAGES = [
  { label: 'Sidr Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
  { label: 'Organic Ghee', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800' },
  { label: 'Ajwa Dates', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Kalonji Oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800' },
  { label: 'Herbal Tea', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
  { label: 'Gift Hamper', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800' }
];

const DEFAULT_RATES = {
  MYR: 4.70,
  BDT: 120.0,
  USD: 1.0,
  SAR: 3.75,
  AED: 3.67,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.35,
  INR: 83.5
};

export function AdminProductsTab({
  products,
  currency: storeCurrency,
  siteSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: AdminProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewCurrency, setViewCurrency] = useState<Currency>('MYR'); // Default to Malaysian Ringgit
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProd, setDeleteConfirmProd] = useState<Product | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Exchange Rates State
  const [rates, setRates] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_exchange_rates');
      if (saved) return { ...DEFAULT_RATES, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_RATES;
  });

  const saveRates = (newRates: Record<string, number>) => {
    setRates(newRates);
    try {
      localStorage.setItem('kirahaq_exchange_rates', JSON.stringify(newRates));
    } catch (e) {
      console.error(e);
    }
  };

  // Currency Selection for Add/Edit
  const [inputBaseCurrency, setInputBaseCurrency] = useState<Currency>('MYR');
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [showMultiCurrencyManual, setShowMultiCurrencyManual] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Pure Honey');

  // Selling Prices in multiple currencies
  const [priceMyr, setPriceMyr] = useState('117.50');
  const [priceBdt, setPriceBdt] = useState('3000');
  const [priceUsd, setPriceUsd] = useState('25.00');

  // Cost Prices
  const [costMyr, setCostMyr] = useState('58.75');
  const [costBdt, setCostBdt] = useState('1400');
  const [costUsd, setCostUsd] = useState('12.00');

  const [image, setImage] = useState(PRESET_PRODUCT_IMAGES[0].url);
  const [images, setImages] = useState<string[]>([PRESET_PRODUCT_IMAGES[0].url]);
  const [description, setDescription] = useState('');
  const [benefitsText, setBenefitsText] = useState('100% Pure, Unfiltered, Bio-active');
  const [ingredients, setIngredients] = useState('100% Pure Sidr Nectar');
  const [badge, setBadge] = useState('PURE GRADE');
  const [weight, setWeight] = useState('500g Jar');
  const [videoUrl, setVideoUrl] = useState('');
  const [stock, setStock] = useState('0');
  const [inStock, setInStock] = useState(true);

  // Multi-Weight & Volume Variant State
  const [hasWeightVariants, setHasWeightVariants] = useState(false);
  const [weightVariants, setWeightVariants] = useState<ProductWeightVariant[]>([]);
  const [variantDiscountMode, setVariantDiscountMode] = useState<'uniform' | 'per_variant'>('uniform');
  const [expandedVariantOffer, setExpandedVariantOffer] = useState<number | null>(null);

  // Discount System State
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [discountAmountMyr, setDiscountAmountMyr] = useState('');
  const [discountAmountBdt, setDiscountAmountBdt] = useState('');
  const [discountAmountUsd, setDiscountAmountUsd] = useState('');
  const [originalPriceMyr, setOriginalPriceMyr] = useState('');
  const [originalPriceUsd, setOriginalPriceUsd] = useState('');
  const [originalPriceBdt, setOriginalPriceBdt] = useState('');

  // Toast notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Convert helpers based on rates
  const myrRate = rates.MYR || 4.70;
  const bdtRate = rates.BDT || 120.0;

  const handlePriceMyrChange = (val: string) => {
    setPriceMyr(val);
    if (isAutoSync) {
      if (val === '') {
        setPriceUsd('');
        setPriceBdt('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        const usdVal = num / myrRate;
        setPriceUsd(usdVal.toFixed(2));
        setPriceBdt(Math.round(usdVal * bdtRate).toString());
      }
    }
  };

  const handlePriceBdtChange = (val: string) => {
    setPriceBdt(val);
    if (isAutoSync) {
      if (val === '') {
        setPriceUsd('');
        setPriceMyr('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        const usdVal = num / bdtRate;
        setPriceUsd(usdVal.toFixed(2));
        setPriceMyr((usdVal * myrRate).toFixed(2));
      }
    }
  };

  const handlePriceUsdChange = (val: string) => {
    setPriceUsd(val);
    if (isAutoSync) {
      if (val === '') {
        setPriceMyr('');
        setPriceBdt('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        setPriceMyr((num * myrRate).toFixed(2));
        setPriceBdt(Math.round(num * bdtRate).toString());
      }
    }
  };

  const handleCostMyrChange = (val: string) => {
    setCostMyr(val);
    if (isAutoSync) {
      if (val === '') {
        setCostUsd('');
        setCostBdt('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        const usdVal = num / myrRate;
        setCostUsd(usdVal.toFixed(2));
        setCostBdt(Math.round(usdVal * bdtRate).toString());
      }
    }
  };

  const handleCostBdtChange = (val: string) => {
    setCostBdt(val);
    if (isAutoSync) {
      if (val === '') {
        setCostUsd('');
        setCostMyr('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        const usdVal = num / bdtRate;
        setCostUsd(usdVal.toFixed(2));
        setCostMyr((usdVal * myrRate).toFixed(2));
      }
    }
  };

  const handleCostUsdChange = (val: string) => {
    setCostUsd(val);
    if (isAutoSync) {
      if (val === '') {
        setCostMyr('');
        setCostBdt('');
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        setCostMyr((num * myrRate).toFixed(2));
        setCostBdt(Math.round(num * bdtRate).toString());
      }
    }
  };


  // Dynamically load available categories from localStorage + default list
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    const defaults = ['Pure Honey', 'Natural Foods', 'Sunnah Products', 'Herbal & Wellness', 'Gift Packs'];
    try {
      const saved = localStorage.getItem('kirahaq_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((c: any) => c.name);
          const combined = Array.from(new Set([...defaults, ...names]));
          setAvailableCategories(combined);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAvailableCategories(defaults);
  }, [isModalOpen]);

  const resetForm = () => {
    setName('');
    setCategory(availableCategories[0] || 'Pure Honey');
    setInputBaseCurrency('MYR');
    setIsAutoSync(true);
    setShowMultiCurrencyManual(false);
    setPriceMyr('117.50');
    setPriceBdt('3000');
    setPriceUsd('25.00');
    setCostMyr('58.75');
    setCostBdt('1400');
    setCostUsd('12.00');
    setImage(PRESET_PRODUCT_IMAGES[0].url);
    setImages([PRESET_PRODUCT_IMAGES[0].url]);
    setDescription('');
    setBenefitsText('100% Pure, Unfiltered, Bio-active');
    setIngredients('100% Pure Sidr Nectar');
    setBadge('PURE GRADE');
    setWeight('500g Jar');
    setVideoUrl('');
    setStock('0');
    setInStock(true);
    setHasWeightVariants(false);
    setWeightVariants([]);
    setVariantDiscountMode('uniform');
    setExpandedVariantOffer(null);
    setIsDiscountActive(false);
    setDiscountType('percentage');
    setDiscountPercentage('0');
    setDiscountAmountMyr('');
    setDiscountAmountBdt('');
    setDiscountAmountUsd('');
    setOriginalPriceMyr('');
    setOriginalPriceUsd('');
    setOriginalPriceBdt('');
    setEditingProduct(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleAddWeightVariant = (presetWeight?: string) => {
    const newId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const defaultWeight = presetWeight || '500g Jar';
    
    const baseMyrNum = parseFloat(priceMyr) || 100;
    const baseUsdNum = parseFloat(priceUsd) || (baseMyrNum / myrRate);
    const baseBdtNum = parseFloat(priceBdt) || Math.round(baseUsdNum * bdtRate);

    const baseCostMyrNum = parseFloat(costMyr) || (baseMyrNum * 0.5);
    const baseCostUsdNum = parseFloat(costUsd) || (baseCostMyrNum / myrRate);
    const baseCostBdtNum = parseFloat(costBdt) || Math.round(baseCostUsdNum * bdtRate);

    const newVariant: ProductWeightVariant = {
      id: newId,
      weight: defaultWeight,
      priceMyr: baseMyrNum,
      priceUsd: parseFloat(baseUsdNum.toFixed(2)),
      priceBdt: Math.round(baseBdtNum),
      costMyr: parseFloat(baseCostMyrNum.toFixed(2)),
      costUsd: parseFloat(baseCostUsdNum.toFixed(2)),
      costBdt: Math.round(baseCostBdtNum),
      stock: parseInt(stock) || 15,
      inStock: true,
    };
    setWeightVariants((prev) => [...prev, newVariant]);
    setHasWeightVariants(true);
  };

  const handleUpdateWeightVariant = (index: number, updates: Partial<ProductWeightVariant>) => {
    setWeightVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleVariantPriceMyrChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { priceMyr: undefined, priceUsd: undefined, priceBdt: undefined, originalPriceMyr: undefined, originalPriceUsd: undefined, originalPriceBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / myrRate).toFixed(2));
      const calcBdt = Math.round(calcUsd * bdtRate);
      handleUpdateWeightVariant(idx, {
        priceMyr: num,
        priceUsd: calcUsd,
        priceBdt: calcBdt,
        originalPriceMyr: num,
        originalPriceUsd: calcUsd,
        originalPriceBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { priceMyr: parseFloat(val) || undefined });
    }
  };

  const handleVariantPriceBdtChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { priceMyr: undefined, priceUsd: undefined, priceBdt: undefined, originalPriceMyr: undefined, originalPriceUsd: undefined, originalPriceBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / bdtRate).toFixed(2));
      const calcMyr = parseFloat((calcUsd * myrRate).toFixed(2));
      handleUpdateWeightVariant(idx, {
        priceBdt: Math.round(num),
        priceUsd: calcUsd,
        priceMyr: calcMyr,
        originalPriceBdt: Math.round(num),
        originalPriceUsd: calcUsd,
        originalPriceMyr: calcMyr,
      });
    } else {
      handleUpdateWeightVariant(idx, { priceBdt: parseInt(val) || undefined });
    }
  };

  const handleVariantPriceUsdChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { priceMyr: undefined, priceUsd: undefined, priceBdt: undefined, originalPriceMyr: undefined, originalPriceUsd: undefined, originalPriceBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcMyr = parseFloat((num * myrRate).toFixed(2));
      const calcBdt = Math.round(num * bdtRate);
      handleUpdateWeightVariant(idx, {
        priceUsd: num,
        priceMyr: calcMyr,
        priceBdt: calcBdt,
        originalPriceUsd: num,
        originalPriceMyr: calcMyr,
        originalPriceBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { priceUsd: parseFloat(val) || undefined });
    }
  };

  const handleVariantCostMyrChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { costMyr: undefined, costUsd: undefined, costBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / myrRate).toFixed(2));
      const calcBdt = Math.round(calcUsd * bdtRate);
      handleUpdateWeightVariant(idx, {
        costMyr: num,
        costUsd: calcUsd,
        costBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { costMyr: parseFloat(val) || undefined });
    }
  };

  const handleVariantCostBdtChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { costMyr: undefined, costUsd: undefined, costBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / bdtRate).toFixed(2));
      const calcMyr = parseFloat((calcUsd * myrRate).toFixed(2));
      handleUpdateWeightVariant(idx, {
        costBdt: Math.round(num),
        costUsd: calcUsd,
        costMyr: calcMyr,
      });
    } else {
      handleUpdateWeightVariant(idx, { costBdt: parseInt(val) || undefined });
    }
  };

  const handleVariantCostUsdChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, { costMyr: undefined, costUsd: undefined, costBdt: undefined });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcMyr = parseFloat((num * myrRate).toFixed(2));
      const calcBdt = Math.round(num * bdtRate);
      handleUpdateWeightVariant(idx, {
        costUsd: num,
        costMyr: calcMyr,
        costBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { costUsd: parseFloat(val) || undefined });
    }
  };

  // Discount Percentage Handler - stores discount only, NEVER alters selling price
  const handleVariantDiscountPercentageChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        discountPercentage: undefined,
        isDiscountActive: false,
      });
      return;
    }
    const pct = parseFloat(val);
    if (!isNaN(pct) && pct >= 0) {
      handleUpdateWeightVariant(idx, {
        discountPercentage: pct,
        discountType: 'percentage',
        isDiscountActive: pct > 0,
      });
    } else {
      handleUpdateWeightVariant(idx, { discountPercentage: parseFloat(val) || undefined });
    }
  };

  // Flat Discount Handlers - stores discount only, auto-converts across currencies, NEVER alters selling price
  const handleVariantDiscountAmountMyrChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        discountAmountMyr: undefined,
        discountAmountUsd: undefined,
        discountAmountBdt: undefined,
        isDiscountActive: false,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / myrRate).toFixed(2));
      const calcBdt = Math.round(calcUsd * bdtRate);
      handleUpdateWeightVariant(idx, {
        discountAmountMyr: num,
        discountAmountUsd: calcUsd,
        discountAmountBdt: calcBdt,
        discountType: 'flat',
        isDiscountActive: num > 0,
      });
    } else {
      handleUpdateWeightVariant(idx, { discountAmountMyr: parseFloat(val) || undefined });
    }
  };

  const handleVariantDiscountAmountBdtChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        discountAmountMyr: undefined,
        discountAmountUsd: undefined,
        discountAmountBdt: undefined,
        isDiscountActive: false,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / bdtRate).toFixed(2));
      const calcMyr = parseFloat((calcUsd * myrRate).toFixed(2));
      handleUpdateWeightVariant(idx, {
        discountAmountBdt: Math.round(num),
        discountAmountUsd: calcUsd,
        discountAmountMyr: calcMyr,
        discountType: 'flat',
        isDiscountActive: num > 0,
      });
    } else {
      handleUpdateWeightVariant(idx, { discountAmountBdt: parseInt(val) || undefined });
    }
  };

  const handleVariantDiscountAmountUsdChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        discountAmountMyr: undefined,
        discountAmountUsd: undefined,
        discountAmountBdt: undefined,
        isDiscountActive: false,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcMyr = parseFloat((num * myrRate).toFixed(2));
      const calcBdt = Math.round(num * bdtRate);
      handleUpdateWeightVariant(idx, {
        discountAmountUsd: num,
        discountAmountMyr: calcMyr,
        discountAmountBdt: calcBdt,
        discountType: 'flat',
        isDiscountActive: num > 0,
      });
    } else {
      handleUpdateWeightVariant(idx, { discountAmountUsd: parseFloat(val) || undefined });
    }
  };

  const handleVariantOriginalPriceMyrChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        originalPriceMyr: undefined,
        originalPriceUsd: undefined,
        originalPriceBdt: undefined,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / myrRate).toFixed(2));
      const calcBdt = Math.round(calcUsd * bdtRate);
      handleUpdateWeightVariant(idx, {
        originalPriceMyr: num,
        originalPriceUsd: calcUsd,
        originalPriceBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { originalPriceMyr: parseFloat(val) || undefined });
    }
  };

  const handleVariantOriginalPriceBdtChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        originalPriceMyr: undefined,
        originalPriceUsd: undefined,
        originalPriceBdt: undefined,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcUsd = parseFloat((num / bdtRate).toFixed(2));
      const calcMyr = parseFloat((calcUsd * myrRate).toFixed(2));
      handleUpdateWeightVariant(idx, {
        originalPriceBdt: Math.round(num),
        originalPriceUsd: calcUsd,
        originalPriceMyr: calcMyr,
      });
    } else {
      handleUpdateWeightVariant(idx, { originalPriceBdt: parseInt(val) || undefined });
    }
  };

  const handleVariantOriginalPriceUsdChange = (idx: number, val: string) => {
    if (val === '') {
      handleUpdateWeightVariant(idx, {
        originalPriceMyr: undefined,
        originalPriceUsd: undefined,
        originalPriceBdt: undefined,
      });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const calcMyr = parseFloat((num * myrRate).toFixed(2));
      const calcBdt = Math.round(num * bdtRate);
      handleUpdateWeightVariant(idx, {
        originalPriceUsd: num,
        originalPriceMyr: calcMyr,
        originalPriceBdt: calcBdt,
      });
    } else {
      handleUpdateWeightVariant(idx, { originalPriceUsd: parseFloat(val) || undefined });
    }
  };

  const handleRemoveWeightVariant = (index: number) => {
    setWeightVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoFillStandardVariants = () => {
    const baseMyrNum = parseFloat(priceMyr) || 100;
    const baseUsdNum = parseFloat(priceUsd) || (baseMyrNum / myrRate);
    const baseBdtNum = parseFloat(priceBdt) || Math.round(baseUsdNum * bdtRate);

    const baseCostMyrNum = parseFloat(costMyr) || (baseMyrNum * 0.5);
    const baseCostUsdNum = parseFloat(costUsd) || (baseCostMyrNum / myrRate);
    const baseCostBdtNum = parseFloat(costBdt) || Math.round(baseCostUsdNum * bdtRate);

    const presets: ProductWeightVariant[] = [
      {
        id: `var_${Date.now()}_250g`,
        weight: '250g Jar',
        priceMyr: parseFloat((baseMyrNum * 0.55).toFixed(2)),
        priceUsd: parseFloat((baseUsdNum * 0.55).toFixed(2)),
        priceBdt: Math.round(baseBdtNum * 0.55),
        costMyr: parseFloat((baseCostMyrNum * 0.55).toFixed(2)),
        costUsd: parseFloat((baseCostUsdNum * 0.55).toFixed(2)),
        costBdt: Math.round(baseCostBdtNum * 0.55),
        originalPriceMyr: parseFloat((baseMyrNum * 0.65).toFixed(2)),
        originalPriceUsd: parseFloat((baseUsdNum * 0.65).toFixed(2)),
        originalPriceBdt: Math.round(baseBdtNum * 0.65),
        stock: 20,
        inStock: true,
        badge: 'SAMPLER',
      },
      {
        id: `var_${Date.now()}_500g`,
        weight: '500g Jar',
        priceMyr: baseMyrNum,
        priceUsd: parseFloat(baseUsdNum.toFixed(2)),
        priceBdt: Math.round(baseBdtNum),
        costMyr: parseFloat(baseCostMyrNum.toFixed(2)),
        costUsd: parseFloat(baseCostUsdNum.toFixed(2)),
        costBdt: Math.round(baseCostBdtNum),
        originalPriceMyr: parseFloat((baseMyrNum * 1.15).toFixed(2)),
        originalPriceUsd: parseFloat((baseUsdNum * 1.15).toFixed(2)),
        originalPriceBdt: Math.round(baseBdtNum * 1.15),
        stock: 35,
        inStock: true,
        badge: 'BEST VALUE',
      },
      {
        id: `var_${Date.now()}_1kg`,
        weight: '1000g / 1kg',
        priceMyr: parseFloat((baseMyrNum * 1.85).toFixed(2)),
        priceUsd: parseFloat((baseUsdNum * 1.85).toFixed(2)),
        priceBdt: Math.round(baseBdtNum * 1.85),
        costMyr: parseFloat((baseCostMyrNum * 1.85).toFixed(2)),
        costUsd: parseFloat((baseCostUsdNum * 1.85).toFixed(2)),
        costBdt: Math.round(baseCostBdtNum * 1.85),
        originalPriceMyr: parseFloat((baseMyrNum * 2.10).toFixed(2)),
        originalPriceUsd: parseFloat((baseUsdNum * 2.10).toFixed(2)),
        originalPriceBdt: Math.round(baseBdtNum * 2.10),
        stock: 15,
        inStock: true,
        badge: 'FAMILY PACK',
      },
    ];
    setWeightVariants(presets);
    setHasWeightVariants(true);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setInputBaseCurrency(p.baseCurrency || 'MYR');
    
    // Set prices
    const calcMyr = p.priceMyr ? p.priceMyr.toString() : (p.priceUsd * myrRate).toFixed(2);
    setPriceMyr(calcMyr);
    setPriceUsd(p.priceUsd.toString());
    setPriceBdt(p.priceBdt.toString());

    // Set costs
    const calcCostUsd = p.costUsd ?? (p.priceUsd * 0.5);
    const calcCostBdt = p.costBdt ?? (p.priceBdt * 0.5);
    const calcCostMyr = p.costMyr ? p.costMyr.toString() : (calcCostUsd * myrRate).toFixed(2);
    setCostMyr(calcCostMyr);
    setCostUsd(calcCostUsd.toString());
    setCostBdt(calcCostBdt.toString());

    setImage(p.image);
    setImages(p.images || [p.image]);
    setDescription(p.description || '');
    setBenefitsText(p.benefits ? p.benefits.join(', ') : '');
    setIngredients(p.ingredients || '');
    setBadge(p.badge || '');
    setWeight(p.weight || '');
    setVideoUrl(p.videoUrl || '');
    setStock((p.stock ?? 0).toString());
    setInStock(p.inStock);

    // Multi-Weight Variants
    if (p.weightVariants && p.weightVariants.length > 0) {
      setHasWeightVariants(true);
      setWeightVariants(p.weightVariants);
      const hasPerVariantDiscounts = p.weightVariants.some(
        (v) => v.isDiscountActive || (v.discountPercentage && v.discountPercentage > 0) || (v.discountAmountBdt && v.discountAmountBdt > 0) || (v.originalPriceBdt && v.originalPriceBdt > v.priceBdt)
      );
      setVariantDiscountMode(hasPerVariantDiscounts ? 'per_variant' : 'uniform');
    } else {
      setHasWeightVariants(false);
      setWeightVariants([]);
      setVariantDiscountMode('uniform');
    }
    setExpandedVariantOffer(null);

    // Discounts
    setIsDiscountActive(Boolean(p.isDiscountActive));
    setDiscountType(p.discountType || (p.discountAmountBdt || p.discountAmountMyr ? 'flat' : 'percentage'));
    setDiscountPercentage((p.discountPercentage ?? 0).toString());
    setDiscountAmountMyr(p.discountAmountMyr ? p.discountAmountMyr.toString() : '');
    setDiscountAmountBdt(p.discountAmountBdt ? p.discountAmountBdt.toString() : '');
    setDiscountAmountUsd(p.discountAmountUsd ? p.discountAmountUsd.toString() : '');
    setOriginalPriceMyr(p.originalPriceMyr ? p.originalPriceMyr.toString() : '');
    setOriginalPriceUsd(p.originalPriceUsd ? p.originalPriceUsd.toString() : '');
    setOriginalPriceBdt(p.originalPriceBdt ? p.originalPriceBdt.toString() : '');

    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Please enter a product name.');
      return;
    }

    if (hasWeightVariants && weightVariants.length === 0) {
      showToast('error', 'Please add at least one Weight / Volume variant, or turn off Multiple Weight Variants.');
      return;
    }

    const firstVar = hasWeightVariants && weightVariants.length > 0 ? weightVariants[0] : null;

    let parsedPriceMyr = parseFloat(priceMyr);
    let parsedPriceUsd = parseFloat(priceUsd);
    let parsedPriceBdt = parseFloat(priceBdt);

    if (firstVar) {
      const vMyr = typeof firstVar.priceMyr === 'number' ? firstVar.priceMyr : (firstVar.priceUsd ? parseFloat((firstVar.priceUsd * myrRate).toFixed(2)) : 0);
      const vBdt = typeof firstVar.priceBdt === 'number' ? firstVar.priceBdt : (firstVar.priceUsd ? Math.round(firstVar.priceUsd * bdtRate) : 0);
      const vUsd = typeof firstVar.priceUsd === 'number' ? firstVar.priceUsd : (vMyr > 0 ? parseFloat((vMyr / myrRate).toFixed(2)) : 0);

      if (isNaN(parsedPriceMyr) || parsedPriceMyr <= 0) parsedPriceMyr = vMyr;
      if (isNaN(parsedPriceUsd) || parsedPriceUsd <= 0) parsedPriceUsd = vUsd;
      if (isNaN(parsedPriceBdt) || parsedPriceBdt <= 0) parsedPriceBdt = vBdt;
    }

    if (isNaN(parsedPriceMyr) || parsedPriceMyr < 0) {
      showToast('error', 'Please enter a valid price in Malaysian Ringgit (MYR).');
      return;
    }
    if (isNaN(parsedPriceUsd) || parsedPriceUsd < 0) {
      showToast('error', 'Please enter a valid price in USD.');
      return;
    }
    if (isNaN(parsedPriceBdt) || parsedPriceBdt < 0) {
      showToast('error', 'Please enter a valid price in BDT.');
      return;
    }

    const benefits = benefitsText.split(',').map((b) => b.trim()).filter(Boolean);

    let parsedCostMyr = parseFloat(costMyr);
    let parsedCostUsd = parseFloat(costUsd);
    let parsedCostBdt = parseFloat(costBdt);

    if (firstVar) {
      if (isNaN(parsedCostMyr) || parsedCostMyr < 0) {
        parsedCostMyr = typeof firstVar.costMyr === 'number' ? firstVar.costMyr : (firstVar.costUsd ? parseFloat((firstVar.costUsd * myrRate).toFixed(2)) : (parsedPriceMyr * 0.5));
      }
      if (isNaN(parsedCostUsd) || parsedCostUsd < 0) {
        parsedCostUsd = typeof firstVar.costUsd === 'number' ? firstVar.costUsd : (parsedCostMyr ? parseFloat((parsedCostMyr / myrRate).toFixed(2)) : (parsedPriceUsd * 0.5));
      }
      if (isNaN(parsedCostBdt) || parsedCostBdt < 0) {
        parsedCostBdt = typeof firstVar.costBdt === 'number' ? firstVar.costBdt : (parsedCostUsd ? Math.round(parsedCostUsd * bdtRate) : (parsedPriceBdt * 0.5));
      }
    } else {
      if (isNaN(parsedCostMyr) || parsedCostMyr < 0) parsedCostMyr = parsedPriceMyr * 0.5;
      if (isNaN(parsedCostUsd) || parsedCostUsd < 0) parsedCostUsd = parsedPriceUsd * 0.5;
      if (isNaN(parsedCostBdt) || parsedCostBdt < 0) parsedCostBdt = parsedPriceBdt * 0.5;
    }

    const totalVariantStock = hasWeightVariants && weightVariants.length > 0
      ? weightVariants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 0), 0)
      : undefined;

    const parsedStock = totalVariantStock !== undefined ? totalVariantStock : (parseInt(stock) || 0);
    const finalInStock = hasWeightVariants && weightVariants.length > 0
      ? weightVariants.some((v) => v.inStock !== false && (v.stock === undefined || v.stock > 0))
      : (inStock && parsedStock > 0);

    const parsedDiscountPct = parseFloat(discountPercentage) || 0;
    const parsedDiscountAmtMyr = parseFloat(discountAmountMyr) || 0;
    const parsedDiscountAmtBdt = parseFloat(discountAmountBdt) || 0;
    const parsedDiscountAmtUsd = parseFloat(discountAmountUsd) || 0;

    let finalOrigMyr = parseFloat(originalPriceMyr) || undefined;
    let finalOrigUsd = parseFloat(originalPriceUsd) || undefined;
    let finalOrigBdt = parseFloat(originalPriceBdt) || undefined;

    if (isDiscountActive && !hasWeightVariants) {
      if (discountType === 'percentage' && parsedDiscountPct > 0) {
        if (!finalOrigMyr) finalOrigMyr = parsedPriceMyr;
        if (!finalOrigUsd) finalOrigUsd = parsedPriceUsd;
        if (!finalOrigBdt) finalOrigBdt = parsedPriceBdt;
      } else if (discountType === 'flat') {
        if (!finalOrigMyr && parsedDiscountAmtMyr > 0) finalOrigMyr = parsedPriceMyr;
        if (!finalOrigBdt && parsedDiscountAmtBdt > 0) finalOrigBdt = parsedPriceBdt;
        if (!finalOrigUsd && parsedDiscountAmtUsd > 0) finalOrigUsd = parsedPriceUsd;
      }
    }

    const hasValidDiscount = !hasWeightVariants && isDiscountActive && (
      (discountType === 'percentage' && parsedDiscountPct > 0) ||
      (discountType === 'flat' && (parsedDiscountAmtMyr > 0 || parsedDiscountAmtBdt > 0 || parsedDiscountAmtUsd > 0 || (finalOrigMyr && finalOrigMyr > parsedPriceMyr)))
    );

    // Sanitize weight variants if active
    const sanitizedVariants: ProductWeightVariant[] | undefined = hasWeightVariants && weightVariants.length > 0
      ? weightVariants
          .filter((v) => v.weight.trim().length > 0)
          .map((v) => {
            const isPct = v.discountType === 'percentage';
            const isFlat = v.discountType === 'flat';
            const validPct = isPct && typeof v.discountPercentage === 'number' && v.discountPercentage > 0 ? v.discountPercentage : undefined;
            const validFlatMyr = isFlat && typeof v.discountAmountMyr === 'number' && v.discountAmountMyr > 0 ? v.discountAmountMyr : undefined;
            const validFlatBdt = isFlat && typeof v.discountAmountBdt === 'number' && v.discountAmountBdt > 0 ? v.discountAmountBdt : undefined;
            const validFlatUsd = isFlat && typeof v.discountAmountUsd === 'number' && v.discountAmountUsd > 0 ? v.discountAmountUsd : undefined;
            const hasVariantDiscount = Boolean(v.isDiscountActive && (validPct || validFlatMyr || validFlatBdt || validFlatUsd || (v.originalPriceMyr && v.originalPriceMyr > (v.priceMyr || 0))));

            return {
              id: v.id || `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              weight: v.weight.trim(),
              priceBdt: Number(v.priceBdt) || 0,
              priceUsd: Number(v.priceUsd) || 0,
              priceMyr: typeof v.priceMyr === 'number' ? v.priceMyr : parseFloat(((Number(v.priceUsd) || 0) * myrRate).toFixed(2)),
              originalPriceBdt: v.originalPriceBdt ? Number(v.originalPriceBdt) : undefined,
              originalPriceUsd: v.originalPriceUsd ? Number(v.originalPriceUsd) : undefined,
              originalPriceMyr: v.originalPriceMyr ? Number(v.originalPriceMyr) : undefined,
              discountType: hasVariantDiscount ? (v.discountType || 'percentage') : undefined,
              discountPercentage: hasVariantDiscount && isPct ? validPct : undefined,
              discountAmountBdt: hasVariantDiscount && isFlat ? validFlatBdt : undefined,
              discountAmountUsd: hasVariantDiscount && isFlat ? validFlatUsd : undefined,
              discountAmountMyr: hasVariantDiscount && isFlat ? validFlatMyr : undefined,
              isDiscountActive: hasVariantDiscount,
              costMyr: typeof v.costMyr === 'number' ? v.costMyr : (typeof v.costUsd === 'number' ? parseFloat((v.costUsd * myrRate).toFixed(2)) : undefined),
              costBdt: typeof v.costBdt === 'number' ? v.costBdt : (typeof v.costUsd === 'number' ? Math.round(v.costUsd * bdtRate) : undefined),
              costUsd: typeof v.costUsd === 'number' ? v.costUsd : (typeof v.costMyr === 'number' ? parseFloat((v.costMyr / myrRate).toFixed(2)) : undefined),
              stock: typeof v.stock === 'number' ? v.stock : parsedStock,
              inStock: v.inStock !== false,
              badge: v.badge?.trim() || undefined,
              dealText: v.dealText?.trim() || undefined,
            };
          })
      : undefined;

    const primaryWeight = sanitizedVariants && sanitizedVariants.length > 0
      ? sanitizedVariants[0].weight
      : (weight.trim() || '500g');

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: name.trim(),
        category: category as Category,
        priceMyr: parsedPriceMyr,
        priceUsd: parsedPriceUsd,
        priceBdt: parsedPriceBdt,
        originalPriceMyr: hasValidDiscount ? finalOrigMyr : undefined,
        originalPriceUsd: hasValidDiscount ? finalOrigUsd : undefined,
        originalPriceBdt: hasValidDiscount ? finalOrigBdt : undefined,
        discountPercentage: hasValidDiscount && discountType === 'percentage' ? parsedDiscountPct : undefined,
        discountAmountMyr: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtMyr : undefined,
        discountAmountBdt: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtBdt : undefined,
        discountAmountUsd: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtUsd : undefined,
        discountType: hasValidDiscount ? discountType : undefined,
        isDiscountActive: hasValidDiscount,
        costMyr: parsedCostMyr,
        costUsd: parsedCostUsd,
        costBdt: parsedCostBdt,
        baseCurrency: inputBaseCurrency,
        image: image.trim() || PRESET_PRODUCT_IMAGES[0].url,
        images: images.length > 0 ? images : [image.trim() || PRESET_PRODUCT_IMAGES[0].url],
        description: description.trim() || 'Premium unadulterated organic product by Kira Haq.',
        benefits,
        ingredients: ingredients.trim(),
        badge: badge.trim(),
        weight: primaryWeight,
        weightVariants: sanitizedVariants,
        videoUrl: videoUrl.trim(),
        inStock: finalInStock,
        stock: parsedStock,
      };
      onUpdateProduct(updated);
      showToast('success', `Product "${updated.name}" updated with RM ${parsedPriceMyr.toFixed(2)} price!`);
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        name: name.trim(),
        category: category as Category,
        priceMyr: parsedPriceMyr,
        priceUsd: parsedPriceUsd,
        priceBdt: parsedPriceBdt,
        originalPriceMyr: hasValidDiscount ? finalOrigMyr : undefined,
        originalPriceUsd: hasValidDiscount ? finalOrigUsd : undefined,
        originalPriceBdt: hasValidDiscount ? finalOrigBdt : undefined,
        discountPercentage: hasValidDiscount && discountType === 'percentage' ? parsedDiscountPct : undefined,
        discountAmountMyr: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtMyr : undefined,
        discountAmountBdt: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtBdt : undefined,
        discountAmountUsd: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtUsd : undefined,
        discountType: hasValidDiscount ? discountType : undefined,
        isDiscountActive: hasValidDiscount,
        costMyr: parsedCostMyr,
        costUsd: parsedCostUsd,
        costBdt: parsedCostBdt,
        baseCurrency: inputBaseCurrency,
        rating: 5.0,
        reviewCount: 1,
        image: image.trim() || PRESET_PRODUCT_IMAGES[0].url,
        images: images.length > 0 ? images : [image.trim() || PRESET_PRODUCT_IMAGES[0].url],
        description: description.trim() || 'Premium unadulterated organic product by Kira Haq.',
        benefits: benefits.length > 0 ? benefits : ['100% Pure Organic Grade'],
        ingredients: ingredients.trim() || '100% Organic Ingredients',
        badge: badge.trim() || 'NEW',
        weight: primaryWeight,
        weightVariants: sanitizedVariants,
        videoUrl: videoUrl.trim(),
        inStock: finalInStock,
        stock: parsedStock,
      };
      onAddProduct(newProd);
      showToast('success', `Product "${newProd.name}" added successfully (RM ${parsedPriceMyr.toFixed(2)})!`);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmProd) {
      onDeleteProduct(deleteConfirmProd.id);
      showToast('success', `Product "${deleteConfirmProd.name}" deleted successfully.`);
      setDeleteConfirmProd(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Action Header with Currency Configuration Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Product Catalogue & Pricing ({products.length})</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
              🇲🇾 MYR Default Pricing
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Default pricing in Malaysian Ringgit (RM) with live multi-currency auto-conversion (৳ BDT, $ USD).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsExchangeModalOpen(true)}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-2 transition-colors cursor-pointer"
            title="Configure Currency Exchange Rates"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Currency Exchange Rates</span>
          </button>

          <button
            type="button"
            onClick={handleStartAddNew}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter, Search Bar & Live Catalogue Currency Switcher */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Table Display Currency Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <span className="text-[11px] font-bold text-stone-400 px-2">Show Prices:</span>
            <button
              type="button"
              onClick={() => setViewCurrency('MYR')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewCurrency === 'MYR' 
                  ? 'bg-amber-400 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🇲🇾 MYR (RM)
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency('BDT')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewCurrency === 'BDT' 
                  ? 'bg-amber-400 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🇧🇩 BDT (৳)
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency('USD')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewCurrency === 'USD' 
                  ? 'bg-amber-400 text-stone-950 shadow-xs' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🇺🇸 USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-base text-white">Live Product Catalogue ({filteredProducts.length})</h4>
            <p className="text-[11px] text-stone-400">
              Prices displayed in <strong className="text-amber-400">{viewCurrency} ({CURRENCIES[viewCurrency]?.symbol})</strong>. Profits and margins are calculated per unit.
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-stone-600 mx-auto" />
            <h5 className="text-sm font-bold text-white">No Products Found</h5>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              No products match your search or category filter. Click below to add a new product.
            </p>
            <button
              type="button"
              onClick={handleStartAddNew}
              className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Selling Price ({CURRENCIES[viewCurrency]?.symbol})</th>
                  <th className="p-4">Cost Price ({CURRENCIES[viewCurrency]?.symbol})</th>
                  <th className="p-4">Profit / Unit</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 text-stone-300">
                {filteredProducts.map((p) => {
                  const priceInfo = getProductPriceInfo(p, viewCurrency);
                  
                  // Calculate cost in viewCurrency
                  let costInView = 0;
                  if (viewCurrency === 'MYR') {
                    costInView = p.costMyr ?? ((p.costUsd ?? (p.priceUsd * 0.5)) * myrRate);
                  } else if (viewCurrency === 'BDT') {
                    costInView = p.costBdt ?? ((p.costUsd ?? (p.priceUsd * 0.5)) * bdtRate);
                  } else {
                    costInView = p.costUsd ?? (p.priceUsd * 0.5);
                  }

                  const sellingInView = viewCurrency === 'MYR' 
                    ? priceInfo.currentPriceMyr 
                    : viewCurrency === 'BDT' 
                    ? priceInfo.currentPriceBdt 
                    : priceInfo.currentPriceUsd;
                  const profit = sellingInView - costInView;
                  const margin = sellingInView > 0 ? ((profit / sellingInView) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-11 h-11 object-cover rounded-xl border border-stone-800 shrink-0" 
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{p.name}</div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1.5 flex-wrap">
                              {p.weightVariants && p.weightVariants.length > 0 ? (
                                <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-[9px] font-bold">
                                  {p.weightVariants.length} Sizes / Weights
                                </span>
                              ) : (
                                <span>{p.weight || 'Standard Size'}</span>
                              )}
                              {p.baseCurrency && (
                                <span className="px-1.5 py-0.2 bg-stone-800 text-amber-300 rounded text-[9px] font-bold">
                                  Base: {p.baseCurrency}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-[10px] text-amber-300 font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-amber-400 text-sm">
                          {priceInfo.currentPriceFormatted}
                        </div>
                        {priceInfo.hasDiscount && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-stone-500 line-through">
                              {priceInfo.regularPriceFormatted}
                            </span>
                            <span className="text-[9px] bg-rose-900/80 text-rose-300 font-extrabold px-1.5 py-0.2 rounded border border-rose-800">
                              {priceInfo.badgeLabel}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-stone-400 font-medium">
                        {viewCurrency === 'MYR' ? `RM ${costInView.toFixed(2)}` : viewCurrency === 'BDT' ? `৳${Math.round(costInView)}` : `$${costInView.toFixed(2)}`}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {viewCurrency === 'MYR' ? `+RM ${profit.toFixed(2)}` : viewCurrency === 'BDT' ? `+৳${Math.round(profit)}` : `+$${profit.toFixed(2)}`}
                        </span>
                        <span className="ml-1 text-[10px] text-stone-500">({margin}%)</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ (p.stock ?? (p.inStock ? 1 : 0)) > 0 ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-rose-950/80 border-rose-800 text-rose-400'}`}>
                            {(p.stock ?? (p.inStock ? 1 : 0)) > 0 ? `In Stock (${p.stock ?? (p.inStock ? 1 : 0)})` : 'Out of Stock'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProd(p)}
                            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Pricing defaults to Malaysian Ringgit (MYR - RM) with customizable multi-currency settings.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Product Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sidr Honey Premium Grade"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Weight / Volume & Multi-Variant Pricing Engine */}
                <div className="sm:col-span-2 bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Scale className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                          <span>Weight / Volume & Variant Pricing</span>
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                            Custom Weight / Volume Pricing
                          </span>
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          Set single package weight or create multiple sizes/volumes (250g, 500g, 1kg) with individual prices.
                        </p>
                      </div>
                    </div>

                    {/* Toggle multi-variant pricing */}
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 hover:border-amber-500/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasWeightVariants}
                        onChange={(e) => {
                          setHasWeightVariants(e.target.checked);
                          if (e.target.checked && weightVariants.length === 0) {
                            handleAutoFillStandardVariants();
                          }
                        }}
                        className="rounded border-amber-600 text-amber-500 focus:ring-amber-400"
                      />
                      <span>Multiple Weight / Volume Pricing</span>
                    </label>
                  </div>

                  {/* Standard Base Weight Input (When multi-variants is not enabled) */}
                  {!hasWeightVariants ? (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-stone-300 mb-1">
                        Base Weight / Volume / Package Size
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500g Jar / 250ml Bottle / 1kg Pack"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                      />
                    </div>
                  ) : (
                    /* Multi-Variant Management Box */
                    <div className="pt-2 border-t border-stone-800/80 space-y-3 animate-in fade-in duration-150">
                      {/* Preset Quick Add Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-stone-400 block">
                          Quick Add Weight / Volume Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            '250g Jar',
                            '500g Jar',
                            '1000g / 1kg',
                            '2kg Family Pack',
                            '100ml Bottle',
                            '250ml Bottle',
                            '500ml Bottle',
                            '1 Litre Bottle',
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleAddWeightVariant(preset)}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-[11px] font-bold border border-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-amber-400" />
                              <span>{preset}</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddWeightVariant('Custom Option')}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Custom Option</span>
                          </button>
                        </div>
                      </div>

                      {/* List of Configured Weight Variants */}
                      <div className="space-y-2.5">
                        {weightVariants.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-stone-800 text-center space-y-2 bg-stone-900/50">
                            <p className="text-xs text-stone-400">No weight variants added yet.</p>
                            <button
                              type="button"
                              onClick={handleAutoFillStandardVariants}
                              className="px-4 py-1.5 bg-amber-400 text-stone-950 text-xs font-bold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
                            >
                              Auto-generate 3 Standard Sizes (250g, 500g, 1kg)
                            </button>
                          </div>
                        ) : (
                          weightVariants.map((v, idx) => {
                            const isOfferOpen = expandedVariantOffer === idx;
                            const vHasCustomDiscount = Boolean(v.isDiscountActive || (v.discountPercentage && v.discountPercentage > 0) || (v.discountAmountMyr && v.discountAmountMyr > 0) || (v.discountAmountBdt && v.discountAmountBdt > 0) || (v.originalPriceMyr && v.originalPriceMyr > (v.priceMyr || 0)) || (v.originalPriceBdt && v.originalPriceBdt > (v.priceBdt || 0)));
                            const vDiscType = v.discountType || (v.discountAmountMyr || v.discountAmountBdt || v.discountAmountUsd ? 'flat' : 'percentage');

                            // Base regular price
                            const vOrigMyr = typeof v.originalPriceMyr === 'number' && v.originalPriceMyr > 0
                              ? v.originalPriceMyr
                              : (typeof v.priceMyr === 'number' ? v.priceMyr : (typeof v.priceUsd === 'number' ? parseFloat((v.priceUsd * myrRate).toFixed(2)) : 0));
                            const vOrigBdt = typeof v.originalPriceBdt === 'number' && v.originalPriceBdt > 0
                              ? v.originalPriceBdt
                              : Math.round((vOrigMyr / myrRate) * bdtRate);
                            const vOrigUsd = typeof v.originalPriceUsd === 'number' && v.originalPriceUsd > 0
                              ? v.originalPriceUsd
                              : (vOrigMyr > 0 ? parseFloat((vOrigMyr / myrRate).toFixed(2)) : 0);

                            const vPct = v.discountPercentage || 0;
                            const vFlatMyr = typeof v.discountAmountMyr === 'number' ? v.discountAmountMyr : (typeof v.discountAmountBdt === 'number' ? parseFloat(((v.discountAmountBdt / bdtRate) * myrRate).toFixed(2)) : (typeof v.discountAmountUsd === 'number' ? parseFloat((v.discountAmountUsd * myrRate).toFixed(2)) : 0));
                            const vFlatBdt = typeof v.discountAmountBdt === 'number' ? v.discountAmountBdt : (vFlatMyr > 0 ? Math.round((vFlatMyr / myrRate) * bdtRate) : 0);
                            const vFlatUsd = typeof v.discountAmountUsd === 'number' ? v.discountAmountUsd : (vFlatMyr > 0 ? parseFloat((vFlatMyr / myrRate).toFixed(2)) : 0);

                            let vFinalMyr = typeof v.priceMyr === 'number' ? v.priceMyr : vOrigMyr;
                            let vFinalBdt = typeof v.priceBdt === 'number' ? v.priceBdt : vOrigBdt;
                            let vFinalUsd = typeof v.priceUsd === 'number' ? v.priceUsd : vOrigUsd;

                            if (v.isDiscountActive) {
                              if (vDiscType === 'percentage' && vPct > 0) {
                                vFinalMyr = parseFloat((vOrigMyr * (1 - vPct / 100)).toFixed(2));
                                vFinalBdt = Math.round(vOrigBdt * (1 - vPct / 100));
                                vFinalUsd = parseFloat((vOrigUsd * (1 - vPct / 100)).toFixed(2));
                              } else if (vDiscType === 'flat' && (vFlatMyr > 0 || vFlatBdt > 0 || vFlatUsd > 0)) {
                                vFinalMyr = Math.max(0, parseFloat((vOrigMyr - vFlatMyr).toFixed(2)));
                                vFinalBdt = Math.max(0, vOrigBdt - vFlatBdt);
                                vFinalUsd = Math.max(0, parseFloat((vOrigUsd - vFlatUsd).toFixed(2)));
                              }
                            }

                            return (
                              <div
                                key={v.id || idx}
                                className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                                  vHasCustomDiscount 
                                    ? 'bg-rose-950/20 border-rose-800/60 shadow-sm' 
                                    : 'bg-stone-900/90 border-stone-800'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                                  <div className="flex items-center gap-2 flex-wrap flex-1">
                                    <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-extrabold flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g., 500g Jar / 250ml"
                                      value={v.weight}
                                      onChange={(e) => handleUpdateWeightVariant(idx, { weight: e.target.value })}
                                      className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-amber-400 focus:outline-none w-36 sm:w-52"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Badge (e.g. BEST VALUE)"
                                      value={v.badge || ''}
                                      onChange={(e) => handleUpdateWeightVariant(idx, { badge: e.target.value })}
                                      className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-[11px] text-amber-300 focus:border-amber-400 focus:outline-none w-28 sm:w-36"
                                    />
                                    {vHasCustomDiscount && (
                                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        <span>OFFER ACTIVE</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-stone-400 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={v.inStock !== false}
                                        onChange={(e) => handleUpdateWeightVariant(idx, { inStock: e.target.checked })}
                                        className="rounded border-stone-700 text-emerald-500"
                                      />
                                      <span>In Stock</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveWeightVariant(idx)}
                                      className="p-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Remove Variant"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Price and Cost Inputs for this Weight Variant */}
                                <div className="space-y-2">
                                  {/* Selling Prices Row */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                                        <span>💰 Selling Prices</span>
                                      </span>
                                      <span className="text-[9px] text-stone-400">Auto-converts across all currencies</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-amber-300 mb-0.5">
                                          🇲🇾 Price (RM MYR)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          required
                                          placeholder="100.00"
                                          value={v.priceMyr ?? ''}
                                          onChange={(e) => handleVariantPriceMyrChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-emerald-400 mb-0.5">
                                          🇧🇩 Price (৳ BDT)
                                        </label>
                                        <input
                                          type="number"
                                          required
                                          placeholder="2500"
                                          value={v.priceBdt ?? ''}
                                          onChange={(e) => handleVariantPriceBdtChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-emerald-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-blue-400 mb-0.5">
                                          🇺🇸 Price ($ USD)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          required
                                          placeholder="22.00"
                                          value={v.priceUsd ?? ''}
                                          onChange={(e) => handleVariantPriceUsdChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:border-blue-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-stone-300 mb-0.5">
                                          Stock Units
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="20"
                                          value={v.stock ?? ''}
                                          onChange={(e) => handleUpdateWeightVariant(idx, { stock: parseInt(e.target.value) || 0 })}
                                          className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:border-amber-400 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Cost Prices Row */}
                                  <div className="pt-1 border-t border-stone-800/60">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                                        <span>🏷️ Cost Prices</span>
                                      </span>
                                      {/* Variant Profit Pill */}
                                      {typeof v.priceMyr === 'number' && typeof v.costMyr === 'number' && v.priceMyr > 0 && (
                                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                                          Profit: RM {(v.priceMyr - v.costMyr).toFixed(2)} ({(((v.priceMyr - v.costMyr) / v.priceMyr) * 100).toFixed(0)}% margin)
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                          🇲🇾 Cost (RM MYR)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="50.00"
                                          value={v.costMyr ?? ''}
                                          onChange={(e) => handleVariantCostMyrChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 focus:border-amber-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                          🇧🇩 Cost (৳ BDT)
                                        </label>
                                        <input
                                          type="number"
                                          placeholder="1250"
                                          value={v.costBdt ?? ''}
                                          onChange={(e) => handleVariantCostBdtChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 focus:border-emerald-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                          🇺🇸 Cost ($ USD)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="11.00"
                                          value={v.costUsd ?? ''}
                                          onChange={(e) => handleVariantCostUsdChange(idx, e.target.value)}
                                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 focus:border-blue-400 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Per-Variant Individual Discount & Special Offer Toggle */}
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedVariantOffer(isOfferOpen ? null : idx)}
                                    className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                      vHasCustomDiscount
                                        ? 'bg-rose-950/40 border-rose-800/80 text-rose-300 hover:bg-rose-900/40'
                                        : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-950'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <Gift className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Variant Discount & Deal</span>
                                      {vHasCustomDiscount && (
                                        <span className="text-[10px] text-rose-300 bg-rose-900/60 border border-rose-700/60 px-1.5 py-0.2 rounded font-extrabold ml-1">
                                          {vDiscType === 'percentage'
                                            ? `${vPct}% OFF`
                                            : `RM ${vFlatMyr > 0 ? vFlatMyr.toFixed(2) : ((vFlatBdt / bdtRate) * myrRate).toFixed(2)} OFF`}
                                        </span>
                                      )}
                                    </div>
                                    {isOfferOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>

                                  {isOfferOpen && (
                                    <div className="mt-2 p-3.5 bg-stone-950/90 rounded-xl border border-rose-900/50 space-y-3 animate-in fade-in duration-150">
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-rose-300 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(v.isDiscountActive)}
                                            onChange={(e) => {
                                              const active = e.target.checked;
                                              handleUpdateWeightVariant(idx, {
                                                isDiscountActive: active,
                                                discountType: v.discountType || 'percentage',
                                                discountPercentage: active && (!v.discountPercentage) ? 15 : v.discountPercentage,
                                              });
                                            }}
                                            className="rounded border-stone-700 text-rose-500 focus:ring-rose-400"
                                          />
                                          <span>Enable Discount for {v.weight || `Size #${idx + 1}`}</span>
                                        </label>

                                        {v.isDiscountActive && (
                                          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleUpdateWeightVariant(idx, {
                                                  discountType: 'percentage',
                                                  discountAmountMyr: undefined,
                                                  discountAmountBdt: undefined,
                                                  discountAmountUsd: undefined,
                                                  discountPercentage: typeof v.discountPercentage === 'number' && v.discountPercentage > 0 ? v.discountPercentage : 15,
                                                  isDiscountActive: true,
                                                });
                                              }}
                                              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${
                                                vDiscType === 'percentage'
                                                  ? 'bg-rose-600 text-white shadow-xs'
                                                  : 'text-stone-400 hover:text-stone-200'
                                              }`}
                                            >
                                              <span>% Percent</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const defaultMyr = 10;
                                                const defaultUsd = parseFloat((defaultMyr / myrRate).toFixed(2));
                                                const defaultBdt = Math.round(defaultUsd * bdtRate);
                                                handleUpdateWeightVariant(idx, {
                                                  discountType: 'flat',
                                                  discountPercentage: undefined,
                                                  discountAmountMyr: typeof v.discountAmountMyr === 'number' && v.discountAmountMyr > 0 ? v.discountAmountMyr : defaultMyr,
                                                  discountAmountUsd: typeof v.discountAmountUsd === 'number' && v.discountAmountUsd > 0 ? v.discountAmountUsd : defaultUsd,
                                                  discountAmountBdt: typeof v.discountAmountBdt === 'number' && v.discountAmountBdt > 0 ? v.discountAmountBdt : defaultBdt,
                                                  isDiscountActive: true,
                                                });
                                              }}
                                              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${
                                                vDiscType === 'flat'
                                                  ? 'bg-rose-600 text-white shadow-xs'
                                                  : 'text-stone-400 hover:text-stone-200'
                                              }`}
                                            >
                                              <span>Fix / Flat</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {v.isDiscountActive && (
                                        <div className="space-y-3">
                                          {/* Discount Value Inputs */}
                                          {vDiscType === 'percentage' ? (
                                            <div className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-xl">
                                              <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-bold text-rose-300">
                                                  Discount Percentage (%)
                                                </label>
                                                <span className="text-[9px] text-stone-400">Calculates regular price automatically</span>
                                              </div>
                                              <div className="relative max-w-xs">
                                                <input
                                                  type="number"
                                                  min="1"
                                                  max="90"
                                                  placeholder="15"
                                                  value={v.discountPercentage ?? ''}
                                                  onChange={(e) => handleVariantDiscountPercentageChange(idx, e.target.value)}
                                                  className="w-full bg-stone-900 border border-rose-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white font-bold focus:border-rose-400 focus:outline-none"
                                                />
                                                <span className="absolute right-3 top-1.5 text-rose-400 font-extrabold text-xs">%</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="space-y-1.5 bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-xl">
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider">
                                                  Flat Discount Amount
                                                </span>
                                                <span className="text-[9px] text-stone-400">Auto-converts between currencies</span>
                                              </div>
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                {/* MYR Flat Discount */}
                                                <div>
                                                  <label className="block text-[10px] font-bold text-amber-300 mb-0.5">
                                                    🇲🇾 Discount (RM MYR)
                                                  </label>
                                                  <div className="relative">
                                                    <span className="absolute left-2.5 top-1 text-stone-400 font-bold text-[10px]">RM</span>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      placeholder="15.00"
                                                      value={v.discountAmountMyr ?? ''}
                                                      onChange={(e) => handleVariantDiscountAmountMyrChange(idx, e.target.value)}
                                                      className="w-full bg-stone-900 border border-amber-600/60 rounded-lg pl-8 pr-2 py-1 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                                                    />
                                                  </div>
                                                </div>

                                                {/* BDT Flat Discount */}
                                                <div>
                                                  <label className="block text-[10px] font-bold text-emerald-400 mb-0.5">
                                                    🇧🇩 Discount (৳ BDT)
                                                  </label>
                                                  <div className="relative">
                                                    <span className="absolute left-2.5 top-1 text-stone-400 font-bold text-[10px]">৳</span>
                                                    <input
                                                      type="number"
                                                      placeholder="350"
                                                      value={v.discountAmountBdt ?? ''}
                                                      onChange={(e) => handleVariantDiscountAmountBdtChange(idx, e.target.value)}
                                                      className="w-full bg-stone-900 border border-emerald-700/60 rounded-lg pl-6 pr-2 py-1 text-xs text-white font-bold focus:border-emerald-400 focus:outline-none"
                                                    />
                                                  </div>
                                                </div>

                                                {/* USD Flat Discount */}
                                                <div>
                                                  <label className="block text-[10px] font-bold text-blue-400 mb-0.5">
                                                    🇺🇸 Discount ($ USD)
                                                  </label>
                                                  <div className="relative">
                                                    <span className="absolute left-2.5 top-1 text-stone-400 font-bold text-[10px]">$</span>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      placeholder="3.20"
                                                      value={v.discountAmountUsd ?? ''}
                                                      onChange={(e) => handleVariantDiscountAmountUsdChange(idx, e.target.value)}
                                                      className="w-full bg-stone-900 border border-blue-700/60 rounded-lg pl-6 pr-2 py-1 text-xs text-white font-bold focus:border-blue-400 focus:outline-none"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {/* Regular / Strikethrough Prices Section */}
                                          <div className="space-y-1.5 pt-2 border-t border-stone-800">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                                                Regular Price (Original strikethrough price)
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                              {/* Regular MYR */}
                                              <div>
                                                <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                                  🇲🇾 Regular (RM MYR)
                                                </label>
                                                <div className="relative">
                                                  <span className="absolute left-2.5 top-1 text-stone-500 font-bold text-[10px]">RM</span>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="120.00"
                                                    value={v.originalPriceMyr ?? ''}
                                                    onChange={(e) => handleVariantOriginalPriceMyrChange(idx, e.target.value)}
                                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-8 pr-2 py-1 text-xs text-stone-200 font-medium focus:border-amber-400 focus:outline-none"
                                                  />
                                                </div>
                                              </div>

                                              {/* Regular BDT */}
                                              <div>
                                                <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                                  🇧🇩 Regular (৳ BDT)
                                                </label>
                                                <div className="relative">
                                                  <span className="absolute left-2.5 top-1 text-stone-500 font-bold text-[10px]">৳</span>
                                                  <input
                                                    type="number"
                                                    placeholder="2800"
                                                    value={v.originalPriceBdt ?? ''}
                                                    onChange={(e) => handleVariantOriginalPriceBdtChange(idx, e.target.value)}
                                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-6 pr-2 py-1 text-xs text-stone-200 font-medium focus:border-emerald-400 focus:outline-none"
                                                  />
                                                </div>
                                              </div>

                                              {/* Regular USD */}
                                              <div>
                                                <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                                                  🇺🇸 Regular ($ USD)
                                                </label>
                                                <div className="relative">
                                                  <span className="absolute left-2.5 top-1 text-stone-500 font-bold text-[10px]">$</span>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="25.00"
                                                    value={v.originalPriceUsd ?? ''}
                                                    onChange={(e) => handleVariantOriginalPriceUsdChange(idx, e.target.value)}
                                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-6 pr-2 py-1 text-xs text-stone-200 font-medium focus:border-blue-400 focus:outline-none"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Deal Badge / Text */}
                                          <div>
                                            <label className="block text-[10px] font-bold text-stone-300 mb-0.5">
                                              Special Deal Badge (e.g. RM 20 OFF / RAMADAN DEAL)
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="e.g. 20% OFF / RM 15 OFF / RAMADAN SPECIAL"
                                              value={v.dealText ?? v.badge ?? ''}
                                              onChange={(e) => handleUpdateWeightVariant(idx, { dealText: e.target.value, badge: e.target.value })}
                                              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                                            />
                                          </div>

                                          {/* Live Variant Pricing & Savings Preview Bar */}
                                          <div className="p-3 bg-stone-900/95 rounded-xl border border-stone-800 text-[11px] flex flex-wrap items-center justify-between gap-2 text-stone-300">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-amber-400 font-bold">Offer Preview:</span>
                                              <span className="text-amber-300 font-extrabold text-xs">
                                                🇲🇾 RM {vFinalMyr.toFixed(2)} | 🇧🇩 ৳ {vFinalBdt.toLocaleString()} | 🇺🇸 ${vFinalUsd.toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {vOrigMyr > vFinalMyr && (
                                                <span className="text-stone-500 line-through text-[11px] font-semibold">
                                                  RM {vOrigMyr.toFixed(2)} (৳ {vOrigBdt.toLocaleString()})
                                                </span>
                                              )}
                                              <span className="bg-rose-900/90 border border-rose-700/60 text-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                                {vDiscType === 'percentage'
                                                  ? `${vPct}% OFF`
                                                  : `RM ${(vOrigMyr - vFinalMyr > 0 ? (vOrigMyr - vFinalMyr) : vFlatMyr).toFixed(2)} OFF`}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Product Video URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Product Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* ================= PRICING & COST ENGINE (FOR SINGLE PRODUCTS WITHOUT VARIANTS) ================= */}
              {!hasWeightVariants && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Product Pricing & Cost Engine</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                            🇲🇾 MYR Default Active
                          </span>
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          Entering price or cost in any currency automatically converts across all currencies (1 USD ≈ {rates.MYR || 4.70} MYR ≈ {rates.BDT || 120} BDT).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 cursor-pointer bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/50">
                        <input
                          type="checkbox"
                          checked={isAutoSync}
                          onChange={(e) => setIsAutoSync(e.target.checked)}
                          className="rounded border-amber-600 text-amber-500 focus:ring-amber-400"
                        />
                        <span>⚡ Real-time Currency Sync</span>
                      </label>
                    </div>
                  </div>

                  {/* Selling Prices Across 3 Currencies */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <span>💰 Selling Price <span className="text-rose-400">*</span></span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">Type in any currency to auto-convert</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* MYR Selling */}
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center justify-between">
                          <span>🇲🇾 Price (RM MYR)</span>
                          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                            Default
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">RM</span>
                          <input
                            type="number"
                            step="0.01"
                            required={!hasWeightVariants}
                            placeholder="117.50"
                            value={priceMyr}
                            onChange={(e) => handlePriceMyrChange(e.target.value)}
                            className="w-full bg-stone-950 border border-amber-500/60 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      {/* BDT Selling */}
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                          🇧🇩 Price (৳ BDT)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">৳</span>
                          <input
                            type="number"
                            required={!hasWeightVariants}
                            placeholder="3000"
                            value={priceBdt}
                            onChange={(e) => handlePriceBdtChange(e.target.value)}
                            className="w-full bg-stone-950 border border-emerald-600/50 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      {/* USD Selling */}
                      <div>
                        <label className="block text-[11px] font-bold text-blue-400 mb-1">
                          🇺🇸 Price ($ USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            required={!hasWeightVariants}
                            placeholder="25.00"
                            value={priceUsd}
                            onChange={(e) => handlePriceUsdChange(e.target.value)}
                            className="w-full bg-stone-950 border border-blue-600/50 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Prices Across 3 Currencies */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1">
                        <span>🏷️ Cost Price</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">Used for Profit & COGS reporting</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* MYR Cost */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          🇲🇾 Cost (RM MYR)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-500 font-bold text-xs">RM</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="58.75"
                            value={costMyr}
                            onChange={(e) => handleCostMyrChange(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      {/* BDT Cost */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          🇧🇩 Cost (৳ BDT)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-500 font-bold text-xs">৳</span>
                          <input
                            type="number"
                            placeholder="1400"
                            value={costBdt}
                            onChange={(e) => handleCostBdtChange(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      {/* USD Cost */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          🇺🇸 Cost ($ USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-stone-500 font-bold text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="12.00"
                            value={costUsd}
                            onChange={(e) => handleCostUsdChange(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profit & Margin Live Overview Bar */}
                  {parseFloat(priceMyr) > 0 && parseFloat(costMyr) >= 0 && (
                    <div className="p-3 bg-stone-950/90 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-stone-400 font-medium">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Estimated Profit:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-bold">
                        <div className="px-2.5 py-1 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-300 text-[11px]">
                          🇲🇾 RM {(parseFloat(priceMyr) - (parseFloat(costMyr) || 0)).toFixed(2)}
                          <span className="text-emerald-400 font-normal ml-1">
                            ({(((parseFloat(priceMyr) - (parseFloat(costMyr) || 0)) / parseFloat(priceMyr)) * 100).toFixed(1)}% margin)
                          </span>
                        </div>
                        <div className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 text-[11px]">
                          🇧🇩 ৳ {Math.round((parseFloat(priceBdt) || 0) - (parseFloat(costBdt) || 0)).toLocaleString()}
                        </div>
                        <div className="px-2.5 py-1 bg-blue-950/40 border border-blue-800/40 rounded-lg text-blue-300 text-[11px]">
                          🇺🇸 ${((parseFloat(priceUsd) || 0) - (parseFloat(costUsd) || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stock & Availability Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tag / Badge */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PURE GRADE, BESTSELLER"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>

                {/* Stock Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center justify-between">
                    <span>Stock Quantity</span>
                    {hasWeightVariants && (
                      <span className="text-[10px] text-amber-400 font-normal">
                        Total from variants: {weightVariants.reduce((s, v) => s + (typeof v.stock === 'number' ? v.stock : 0), 0)}
                      </span>
                    )}
                  </label>
                  {hasWeightVariants ? (
                    <div className="w-full bg-stone-950/60 border border-stone-800/60 rounded-xl px-4 py-2 text-xs text-stone-400 font-medium">
                      Managed per variant ({weightVariants.reduce((s, v) => s + (typeof v.stock === 'number' ? v.stock : 0), 0)} units total)
                    </div>
                  ) : (
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                    />
                  )}
                </div>

                {/* Stock Status */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Availability
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInStock(true)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        inStock 
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300' 
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>In Stock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInStock(false)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        !inStock 
                          ? 'bg-rose-950 border-rose-600 text-rose-300' 
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Discount System Section (FOR SINGLE PRODUCTS WITHOUT VARIANTS) */}
              {!hasWeightVariants && (
                <div className="bg-rose-950/20 border border-rose-800/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">Product Discount & Special Offer Deal</h4>
                        <p className="text-[10px] text-stone-400">Support both Percentage (%) and Fixed Flat (RM / ৳ / $) discounts</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDiscountActive}
                        onChange={(e) => {
                          setIsDiscountActive(e.target.checked);
                          if (e.target.checked) {
                            if (discountType === 'percentage' && (!discountPercentage || discountPercentage === '0')) {
                              setDiscountPercentage('15');
                            } else if (discountType === 'flat' && !discountAmountMyr) {
                              setDiscountAmountMyr('10.00');
                              setDiscountAmountBdt('250');
                              setDiscountAmountUsd('2.00');
                            }
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {isDiscountActive && (
                    <div className="pt-2 border-t border-rose-900/40 space-y-3 animate-in fade-in duration-200">
                      {/* Discount Type Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 mb-1.5">Discount Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDiscountType('percentage');
                              setDiscountAmountMyr('');
                              setDiscountAmountBdt('');
                              setDiscountAmountUsd('');
                              if (!discountPercentage || discountPercentage === '0') setDiscountPercentage('15');
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              discountType === 'percentage'
                                ? 'bg-rose-900/70 border-rose-500 text-white shadow-xs'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <span>% Percentage Discount</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDiscountType('flat');
                              setDiscountPercentage('');
                              if (!discountAmountMyr) setDiscountAmountMyr('10.00');
                              if (!discountAmountBdt) setDiscountAmountBdt('250');
                              if (!discountAmountUsd) setDiscountAmountUsd('2.00');
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              discountType === 'flat'
                                ? 'bg-rose-900/70 border-rose-500 text-white shadow-xs'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <span>RM / ৳ / $ Fixed Flat Discount</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs depending on discount type */}
                      {discountType === 'percentage' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-rose-300 mb-1">
                              Discount % (e.g. 15%)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              placeholder="15"
                              value={discountPercentage}
                              onChange={(e) => {
                                const pct = e.target.value;
                                setDiscountPercentage(pct);
                                const numPct = parseFloat(pct) || 0;
                                setIsDiscountActive(numPct > 0);
                              }}
                              className="w-full bg-stone-950 border border-rose-900/80 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-400 focus:outline-none font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-300 mb-1">
                              Regular Price (RM MYR)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Regular base RM"
                              value={originalPriceMyr}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOriginalPriceMyr(val);
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 0) {
                                  const usdVal = num / myrRate;
                                  const bdtVal = Math.round(usdVal * bdtRate);
                                  setOriginalPriceUsd(usdVal.toFixed(2));
                                  setOriginalPriceBdt(bdtVal.toString());
                                }
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-300 mb-1">
                              Regular Price (৳ BDT)
                            </label>
                            <input
                              type="number"
                              placeholder="Regular base ৳"
                              value={originalPriceBdt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOriginalPriceBdt(val);
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 0) {
                                  const usdVal = num / bdtRate;
                                  const myrVal = usdVal * myrRate;
                                  setOriginalPriceUsd(usdVal.toFixed(2));
                                  setOriginalPriceMyr(myrVal.toFixed(2));
                                }
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-rose-300 mb-1">
                              Flat Discount (RM MYR)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.1"
                              placeholder="e.g. 10.00"
                              value={discountAmountMyr}
                              onChange={(e) => {
                                const amt = e.target.value;
                                setDiscountAmountMyr(amt);
                                const numAmt = parseFloat(amt) || 0;
                                if (numAmt > 0) {
                                  const calcUsd = parseFloat((numAmt / myrRate).toFixed(2));
                                  const calcBdt = Math.round(calcUsd * bdtRate);
                                  setDiscountAmountUsd(calcUsd.toFixed(2));
                                  setDiscountAmountBdt(calcBdt.toString());
                                  setIsDiscountActive(true);
                                } else {
                                  setDiscountAmountUsd('');
                                  setDiscountAmountBdt('');
                                }
                              }}
                              className="w-full bg-stone-950 border border-rose-900/80 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-400 focus:outline-none font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-300 mb-1">
                              Flat Discount (৳ BDT)
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 250"
                              value={discountAmountBdt}
                              onChange={(e) => {
                                const amt = e.target.value;
                                setDiscountAmountBdt(amt);
                                const numAmt = parseFloat(amt) || 0;
                                if (numAmt > 0) {
                                  const calcUsd = parseFloat((numAmt / bdtRate).toFixed(2));
                                  const calcMyr = parseFloat((calcUsd * myrRate).toFixed(2));
                                  setDiscountAmountUsd(calcUsd.toFixed(2));
                                  setDiscountAmountMyr(calcMyr.toFixed(2));
                                  setIsDiscountActive(true);
                                } else {
                                  setDiscountAmountUsd('');
                                  setDiscountAmountMyr('');
                                }
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-300 mb-1">
                              Regular Price (RM MYR)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Regular base RM"
                              value={originalPriceMyr}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOriginalPriceMyr(val);
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 0) {
                                  const usdVal = num / myrRate;
                                  const bdtVal = Math.round(usdVal * bdtRate);
                                  setOriginalPriceUsd(usdVal.toFixed(2));
                                  setOriginalPriceBdt(bdtVal.toString());
                                }
                              }}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      )}

                      {/* Live Preview Bar */}
                      {(() => {
                        const baseSellingMyr = parseFloat(priceMyr) || 0;
                        const baseSellingBdt = parseFloat(priceBdt) || Math.round(baseSellingMyr * bdtRate / myrRate);
                        const baseSellingUsd = parseFloat(priceUsd) || (baseSellingMyr / myrRate);

                        const flatMyr = parseFloat(discountAmountMyr) || 0;
                        const flatBdt = parseFloat(discountAmountBdt) || Math.round(flatMyr * bdtRate / myrRate);
                        const flatUsd = parseFloat(discountAmountUsd) || (flatMyr / myrRate);
                        const pct = parseFloat(discountPercentage) || 0;
                        
                        let offerPriceMyr = baseSellingMyr;
                        let offerPriceBdt = baseSellingBdt;
                        let offerPriceUsd = baseSellingUsd;
                        let hasDiscount = false;

                        if (isDiscountActive) {
                          if (discountType === 'percentage' && pct > 0) {
                            offerPriceMyr = Math.max(0, parseFloat((baseSellingMyr * (1 - pct / 100)).toFixed(2)));
                            offerPriceBdt = Math.max(0, Math.round(baseSellingBdt * (1 - pct / 100)));
                            offerPriceUsd = Math.max(0, parseFloat((baseSellingUsd * (1 - pct / 100)).toFixed(2)));
                            hasDiscount = true;
                          } else if (discountType === 'flat' && (flatMyr > 0 || flatBdt > 0 || flatUsd > 0)) {
                            offerPriceMyr = Math.max(0, parseFloat((baseSellingMyr - flatMyr).toFixed(2)));
                            offerPriceBdt = Math.max(0, Math.round(baseSellingBdt - flatBdt));
                            offerPriceUsd = Math.max(0, parseFloat((baseSellingUsd - flatUsd).toFixed(2)));
                            hasDiscount = true;
                          }
                        }

                        return (
                          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] flex flex-wrap items-center justify-between gap-2 text-stone-300">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-amber-400">Offer Preview:</span>
                              <span className="text-amber-300 font-extrabold text-xs">
                                🇲🇾 RM {offerPriceMyr.toFixed(2)} | 🇧🇩 ৳ {offerPriceBdt.toLocaleString()} | 🇺🇸 ${offerPriceUsd.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasDiscount && (
                                <span className="text-stone-500 line-through text-[11px] font-semibold">
                                  RM {baseSellingMyr.toFixed(2)} (৳ {baseSellingBdt.toLocaleString()})
                                </span>
                              )}
                              {hasDiscount && (
                                <span className="bg-rose-900/90 border border-rose-700/60 text-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                  {discountType === 'percentage' 
                                    ? `${pct}% OFF` 
                                    : `RM ${flatMyr.toFixed(2)} (৳ ${flatBdt}) OFF`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Product Image Upload & Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1 flex justify-between items-center">
                  <span>Product Image</span>
                  <span className="text-[10px] text-amber-400 font-medium">Upload file or choose preset</span>
                </label>
                <div className="space-y-3">
                  {/* File Upload Button & Preview */}
                  <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800">
                    {/* Preview Thumbnails (Up to 3) */}
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <label key={i} className="w-16 h-16 rounded-xl bg-stone-900 border border-stone-700 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner cursor-pointer hover:border-amber-500">
                          {images[i] ? (
                            <>
                              <img src={images[i]} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const newImages = [...images];
                                  newImages.splice(i, 1);
                                  setImages(newImages);
                                }}
                                className="absolute top-0 right-0 p-0.5 bg-rose-950 text-white rounded-bl"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <ImageIcon className="w-6 h-6 text-stone-600" />
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  if (result) {
                                    const newImages = [...images];
                                    newImages[i] = result;
                                    setImages(newImages);
                                    if (i === 0) setImage(result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      ))}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-stone-400">
                        Upload up to 3 images (PNG, JPG, WEBP) by clicking the boxes above.
                      </p>
                    </div>
                  </div>

                  {/* Preset Sample Images */}
                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block mb-1">Or choose a preset sample image:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border shrink-0 cursor-pointer transition-all ${
                            image === preset.url 
                              ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105' 
                              : 'border-stone-800 opacity-60 hover:opacity-100'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed product highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none font-medium"
                />
              </div>

              {/* Benefits (comma separated) */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Key Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 100% Organic, Immune Booster, Cold Pressed"
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Ingredients
                </label>
                <input
                  type="text"
                  placeholder="e.g., 100% Raw Sidr Nectar"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Save Product (RM)'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= EXCHANGE RATES SETTINGS MODAL ================= */}
      {isExchangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Currency Exchange Rates</h4>
                  <p className="text-[10px] text-stone-400">Set conversion rates against 1 USD ($)</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsExchangeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
                <div className="flex justify-between font-bold text-amber-300">
                  <span>Current Live Base:</span>
                  <span>1 USD = {rates.MYR || 4.70} MYR = {rates.BDT || 120.0} BDT</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  1 MYR (Malaysian Ringgit) = {((rates.BDT || 120) / (rates.MYR || 4.7)).toFixed(2)} BDT (Bangladeshi Taka)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    🇲🇾 MYR per 1 USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.MYR ?? 4.70}
                    onChange={(e) => setRates(prev => ({ ...prev, MYR: parseFloat(e.target.value) || 4.70 }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    🇧🇩 BDT per 1 USD
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rates.BDT ?? 120.0}
                    onChange={(e) => setRates(prev => ({ ...prev, BDT: parseFloat(e.target.value) || 120.0 }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    🇸🇦 SAR per 1 USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.SAR ?? 3.75}
                    onChange={(e) => setRates(prev => ({ ...prev, SAR: parseFloat(e.target.value) || 3.75 }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    🇦🇪 AED per 1 USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.AED ?? 3.67}
                    onChange={(e) => setRates(prev => ({ ...prev, AED: parseFloat(e.target.value) || 3.67 }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setRates(DEFAULT_RATES);
                  saveRates(DEFAULT_RATES);
                  showToast('success', 'Exchange rates reset to default.');
                }}
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveRates(rates);
                    setIsExchangeModalOpen(false);
                    showToast('success', 'Exchange rates updated successfully!');
                  }}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Save Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmProd && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Product?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete product <strong className="text-amber-400">"{deleteConfirmProd.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProd(null)}
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
