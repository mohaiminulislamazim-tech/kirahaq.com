import React, { useState } from 'react';
import { 
  X, Plus, Edit3, Trash2, Package, DollarSign, Image, 
  CheckCircle, Sparkles, Tag, Layers, FileText, ShieldAlert, Check, Scale
} from 'lucide-react';
import { Product, Category, Currency, formatPrice, getProductPriceInfo, ProductWeightVariant } from '../types';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  currency: Currency;
}

const PRESET_IMAGES = [
  { name: 'Honey Jar', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
  { name: 'Black Seed Oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800' },
  { name: 'Olive Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800' },
  { name: 'Ajwa Dates', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Organic Herbal', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800' },
  { name: 'Saffron Box', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800' },
];

export function AdminProductModal({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  currency,
}: AdminProductModalProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Pure Honey');
  const [priceUsd, setPriceUsd] = useState<number>(19.99);
  const [priceBdt, setPriceBdt] = useState<number>(2390);
  const [weight, setWeight] = useState('500g Jar');
  const [badge, setBadge] = useState('ORGANIC');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('100% Pure & Organic, Boosts Natural Immunity, Rich in Nutrients');
  const [ingredients, setIngredients] = useState('100% Pure Natural Extract');
  const [sunnahFact, setSunnahFact] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stock, setStock] = useState<number>(0);

  // Weight Variants State
  const [hasWeightVariants, setHasWeightVariants] = useState(false);
  const [weightVariants, setWeightVariants] = useState<ProductWeightVariant[]>([]);

  // Discount System State
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountAmountBdt, setDiscountAmountBdt] = useState<string>('');
  const [discountAmountUsd, setDiscountAmountUsd] = useState<string>('');
  const [originalPriceUsd, setOriginalPriceUsd] = useState<string>('');
  const [originalPriceBdt, setOriginalPriceBdt] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUsdChange = (usdVal: number) => {
    setPriceUsd(usdVal);
    // Auto convert to BDT @ ~120
    setPriceBdt(Math.round(usdVal * 120));
  };

  const handleAddWeightVariant = (presetWeight?: string) => {
    const newId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const defaultWeight = presetWeight || '500g Jar';
    const baseUsd = Number(priceUsd) || 20;
    const baseBdt = Number(priceBdt) || Math.round(baseUsd * 120);

    const newVariant: ProductWeightVariant = {
      id: newId,
      weight: defaultWeight,
      priceUsd: baseUsd,
      priceBdt: baseBdt,
      priceMyr: parseFloat((baseUsd * 4.7).toFixed(2)),
      stock: Number(stock) || 15,
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

  const handleRemoveWeightVariant = (index: number) => {
    setWeightVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoFillStandardVariants = () => {
    const baseUsd = Number(priceUsd) || 20;
    const baseBdt = Number(priceBdt) || 2400;

    const presets: ProductWeightVariant[] = [
      {
        id: `var_${Date.now()}_250g`,
        weight: '250g Jar',
        priceUsd: parseFloat((baseUsd * 0.55).toFixed(2)),
        priceBdt: Math.round(baseBdt * 0.55),
        priceMyr: parseFloat((baseUsd * 0.55 * 4.7).toFixed(2)),
        stock: 20,
        inStock: true,
        badge: 'SAMPLER',
      },
      {
        id: `var_${Date.now()}_500g`,
        weight: '500g Jar',
        priceUsd: baseUsd,
        priceBdt: baseBdt,
        priceMyr: parseFloat((baseUsd * 4.7).toFixed(2)),
        stock: 35,
        inStock: true,
        badge: 'BEST VALUE',
      },
      {
        id: `var_${Date.now()}_1kg`,
        weight: '1000g / 1kg',
        priceUsd: parseFloat((baseUsd * 1.85).toFixed(2)),
        priceBdt: Math.round(baseBdt * 1.85),
        priceMyr: parseFloat((baseUsd * 1.85 * 4.7).toFixed(2)),
        stock: 15,
        inStock: true,
        badge: 'FAMILY PACK',
      },
    ];
    setWeightVariants(presets);
    setHasWeightVariants(true);
  };

  const resetForm = () => {
    setName('');
    setCategory('Pure Honey');
    setPriceUsd(19.99);
    setPriceBdt(2390);
    setWeight('500g Jar');
    setBadge('ORGANIC');
    setImage(PRESET_IMAGES[0].url);
    setDescription('');
    setBenefits('100% Pure & Organic, Boosts Natural Immunity, Rich in Nutrients');
    setIngredients('100% Pure Natural Extract');
    setSunnahFact('');
    setInStock(true);
    setStock(0);
    setHasWeightVariants(false);
    setWeightVariants([]);
    setIsDiscountActive(false);
    setDiscountType('percentage');
    setDiscountPercentage(0);
    setDiscountAmountBdt('');
    setDiscountAmountUsd('');
    setOriginalPriceUsd('');
    setOriginalPriceBdt('');
    setEditingProduct(null);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPriceUsd(prod.priceUsd);
    setPriceBdt(prod.priceBdt);
    setWeight(prod.weight || '');
    setBadge(prod.badge || '');
    setImage(prod.image);
    setDescription(prod.description);
    setBenefits(prod.benefits.join(', '));
    setIngredients(prod.ingredients);
    setSunnahFact(prod.sunnahFact || '');
    setInStock(prod.inStock);
    setStock(prod.stock ?? 0);
    if (prod.weightVariants && prod.weightVariants.length > 0) {
      setHasWeightVariants(true);
      setWeightVariants(prod.weightVariants);
    } else {
      setHasWeightVariants(false);
      setWeightVariants([]);
    }
    setStock(prod.stock ?? 0);
    setIsDiscountActive(Boolean(prod.isDiscountActive));
    setDiscountType(prod.discountType || (prod.discountAmountBdt ? 'flat' : 'percentage'));
    setDiscountPercentage(prod.discountPercentage ?? 0);
    setDiscountAmountBdt(prod.discountAmountBdt ? prod.discountAmountBdt.toString() : '');
    setDiscountAmountUsd(prod.discountAmountUsd ? prod.discountAmountUsd.toString() : '');
    setOriginalPriceUsd(prod.originalPriceUsd ? prod.originalPriceUsd.toString() : '');
    setOriginalPriceBdt(prod.originalPriceBdt ? prod.originalPriceBdt.toString() : '');
    setActiveTab('add');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Please fill out product title and description.');
      return;
    }

    const benefitsArray = benefits
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const parsedDiscountPct = Number(discountPercentage) || 0;
    const parsedDiscountAmtBdt = parseFloat(discountAmountBdt) || 0;
    const parsedDiscountAmtUsd = parseFloat(discountAmountUsd) || 0;
    const parsedOrigUsd = parseFloat(originalPriceUsd) || undefined;
    const parsedOrigBdt = parseFloat(originalPriceBdt) || undefined;

    let finalOrigUsd = parsedOrigUsd;
    let finalOrigBdt = parsedOrigBdt;

    if (isDiscountActive) {
      if (discountType === 'percentage' && parsedDiscountPct > 0) {
        if (!finalOrigUsd) finalOrigUsd = Number(priceUsd);
        if (!finalOrigBdt) finalOrigBdt = Number(priceBdt);
      } else if (discountType === 'flat') {
        if (!finalOrigBdt && parsedDiscountAmtBdt > 0) finalOrigBdt = Number(priceBdt);
        if (!finalOrigUsd && parsedDiscountAmtUsd > 0) finalOrigUsd = Number(priceUsd);
      }
    }

    const hasValidDiscount = isDiscountActive && (
      (discountType === 'percentage' && parsedDiscountPct > 0) ||
      (discountType === 'flat' && (parsedDiscountAmtBdt > 0 || parsedDiscountAmtUsd > 0 || (finalOrigBdt && finalOrigBdt > Number(priceBdt))))
    );

    const sanitizedVariants: ProductWeightVariant[] | undefined = hasWeightVariants && weightVariants.length > 0
      ? weightVariants
          .filter((v) => v.weight.trim().length > 0)
          .map((v) => ({
            id: v.id || `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            weight: v.weight.trim(),
            priceBdt: Number(v.priceBdt) || 0,
            priceUsd: Number(v.priceUsd) || 0,
            priceMyr: typeof v.priceMyr === 'number' ? v.priceMyr : parseFloat(((Number(v.priceUsd) || 0) * 4.7).toFixed(2)),
            stock: typeof v.stock === 'number' ? v.stock : Number(stock),
            inStock: v.inStock !== false,
            badge: v.badge?.trim() || undefined,
          }))
      : undefined;

    const primaryWeight = sanitizedVariants && sanitizedVariants.length > 0
      ? sanitizedVariants[0].weight
      : (weight.trim() || '500g');

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name,
        category,
        priceUsd: Number(priceUsd),
        priceBdt: Number(priceBdt),
        priceMyr: parseFloat((Number(priceUsd) * 4.7).toFixed(2)),
        originalPriceUsd: hasValidDiscount ? finalOrigUsd : undefined,
        originalPriceBdt: hasValidDiscount ? finalOrigBdt : undefined,
        discountPercentage: hasValidDiscount && discountType === 'percentage' ? parsedDiscountPct : undefined,
        discountAmountBdt: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtBdt : undefined,
        discountAmountUsd: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtUsd : undefined,
        discountType: hasValidDiscount ? discountType : undefined,
        isDiscountActive: hasValidDiscount,
        weight: primaryWeight,
        weightVariants: sanitizedVariants,
        badge,
        image,
        description,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['100% Pure & Certified'],
        ingredients,
        sunnahFact,
        inStock: Number(stock) > 0,
        stock: Number(stock),
      };
      onUpdateProduct(updated);
      showNotice('Product updated successfully!');
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        name,
        category,
        priceUsd: Number(priceUsd),
        priceBdt: Number(priceBdt),
        priceMyr: parseFloat((Number(priceUsd) * 4.7).toFixed(2)),
        originalPriceUsd: hasValidDiscount ? finalOrigUsd : undefined,
        originalPriceBdt: hasValidDiscount ? finalOrigBdt : undefined,
        discountPercentage: hasValidDiscount && discountType === 'percentage' ? parsedDiscountPct : undefined,
        discountAmountBdt: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtBdt : undefined,
        discountAmountUsd: hasValidDiscount && discountType === 'flat' ? parsedDiscountAmtUsd : undefined,
        discountType: hasValidDiscount ? discountType : undefined,
        isDiscountActive: hasValidDiscount,
        rating: 5.0,
        reviewCount: 1,
        weight: primaryWeight,
        weightVariants: sanitizedVariants,
        badge,
        image,
        description,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['100% Pure & Certified'],
        ingredients,
        sunnahFact,
        inStock: Number(stock) > 0,
        stock: Number(stock),
      };
      onAddProduct(newProd);
      showNotice('New Product uploaded and added to live store!');
    }

    resetForm();
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1b3d2b] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Product Panel</h2>
              <p className="text-xs text-emerald-200">Upload new products, set prices, titles, images & manage live inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-900/50 text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert */}
        {notification && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-3 gap-3">
          <button
            onClick={() => {
              setActiveTab('add');
            }}
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'add'
                ? 'border-[#1b3d2b] text-[#1b3d2b]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingProduct ? 'Edit Product' : 'Upload New Product'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'manage'
                ? 'border-[#1b3d2b] text-[#1b3d2b]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Live Products ({products.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {editingProduct && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
                  <span>Editing: <strong>{editingProduct.name}</strong></span>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="text-amber-800 underline font-semibold hover:text-amber-950 cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Sidr Honey (Special Grade)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] focus:border-transparent outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] focus:border-transparent outline-none font-medium bg-white"
                  >
                    <option value="Pure Honey">Pure Honey</option>
                    <option value="Natural Foods">Natural Foods</option>
                    <option value="Sunnah Products">Sunnah Products</option>
                    <option value="Health Consultation">Health Consultation</option>
                    <option value="Gift Packs">Gift Packs</option>
                  </select>
                </div>
              </div>

              {/* Price USD & Price BDT & Weight Variants */}
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Price in USD ($) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={priceUsd}
                        onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Price in BDT (৳) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">৳</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={priceBdt}
                        onChange={(e) => setPriceBdt(parseInt(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight / Volume & Multi-Variant Pricing Box */}
                <div className="pt-2 border-t border-amber-200/60 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-bold text-stone-800">
                        Weight / Volume Options (Individual Variant Pricing)
                      </span>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <input
                        type="checkbox"
                        checked={hasWeightVariants}
                        onChange={(e) => {
                          setHasWeightVariants(e.target.checked);
                          if (e.target.checked && weightVariants.length === 0) {
                            handleAutoFillStandardVariants();
                          }
                        }}
                        className="rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Enable Different Prices per Weight</span>
                    </label>
                  </div>

                  {!hasWeightVariants ? (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Base Package Weight / Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 500g Jar, 250ml Bottle"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {['250g Jar', '500g Jar', '1000g / 1kg', '2kg Pack', '250ml', '500ml'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddWeightVariant(preset)}
                            className="px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 text-[11px] font-bold border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-emerald-700" />
                            <span>{preset}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {weightVariants.map((v, idx) => (
                          <div key={v.id || idx} className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  placeholder="Weight / Volume (e.g. 500g Jar)"
                                  value={v.weight}
                                  onChange={(e) => handleUpdateWeightVariant(idx, { weight: e.target.value })}
                                  className="border border-stone-300 rounded px-2 py-1 text-xs font-bold text-stone-900 w-44"
                                />
                                <input
                                  type="text"
                                  placeholder="Badge (e.g. BEST VALUE)"
                                  value={v.badge || ''}
                                  onChange={(e) => handleUpdateWeightVariant(idx, { badge: e.target.value })}
                                  className="border border-stone-200 rounded px-2 py-1 text-[11px] text-amber-800 w-32"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveWeightVariant(idx)}
                                className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Price ৳ (BDT)</label>
                                <input
                                  type="number"
                                  value={v.priceBdt ?? ''}
                                  onChange={(e) => handleUpdateWeightVariant(idx, { priceBdt: parseInt(e.target.value) || 0 })}
                                  className="w-full border border-stone-300 rounded px-2 py-1 text-xs font-bold text-stone-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Price $ (USD)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={v.priceUsd ?? ''}
                                  onChange={(e) => handleUpdateWeightVariant(idx, { priceUsd: parseFloat(e.target.value) || 0 })}
                                  className="w-full border border-stone-300 rounded px-2 py-1 text-xs font-bold text-stone-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Stock Units</label>
                                <input
                                  type="number"
                                  value={v.stock ?? ''}
                                  onChange={(e) => handleUpdateWeightVariant(idx, { stock: parseInt(e.target.value) || 0 })}
                                  className="w-full border border-stone-300 rounded px-2 py-1 text-xs font-medium text-stone-900"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Discount Controls */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-rose-100 text-rose-700">
                      <Tag className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-rose-950">Special Product Discount / Offer</h4>
                      <p className="text-[11px] text-stone-500">Enable Percentage (%) or Fixed Flat (৳ / $) discount</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDiscountActive}
                      onChange={(e) => {
                        setIsDiscountActive(e.target.checked);
                        if (e.target.checked) {
                          if (discountType === 'percentage' && (!discountPercentage || discountPercentage === 0)) {
                            setDiscountPercentage(15);
                          } else if (discountType === 'flat' && !discountAmountBdt) {
                            setDiscountAmountBdt('200');
                            setDiscountAmountUsd('2.00');
                          }
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {isDiscountActive && (
                  <div className="pt-2 border-t border-rose-200/60 space-y-3">
                    {/* Discount Type Picker */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Discount Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('percentage');
                            if (!discountPercentage || discountPercentage === 0) setDiscountPercentage(15);
                          }}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            discountType === 'percentage'
                              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <span>% Percentage Discount</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('flat');
                            if (!discountAmountBdt) setDiscountAmountBdt('200');
                            if (!discountAmountUsd) setDiscountAmountUsd('2.00');
                          }}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            discountType === 'flat'
                              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <span>৳ / $ Fixed Flat Discount</span>
                        </button>
                      </div>
                    </div>

                    {discountType === 'percentage' ? (
                      <div>
                          <label className="block text-[11px] font-bold text-rose-900 mb-1">Discount %</label>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            placeholder="15"
                            value={discountPercentage || ''}
                            onChange={(e) => {
                              const pct = Number(e.target.value) || 0;
                              setDiscountPercentage(pct);
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-bold bg-white"
                          />
                        </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-rose-900 mb-1">Flat Discount (৳ BDT)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 200"
                            value={discountAmountBdt}
                            onChange={(e) => {
                              const amt = e.target.value;
                              setDiscountAmountBdt(amt);
                              // No longer modifying priceBdt or priceUsd here.
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-bold bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">Flat Discount ($ USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            placeholder="e.g. 2.00"
                            value={discountAmountUsd}
                            onChange={(e) => {
                              const amt = e.target.value;
                              setDiscountAmountUsd(amt);
                              // No longer modifying priceUsd here.
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Preview Bar */}
                    {(() => {
                      const baseBdt = Number(priceBdt) || 0;
                      const baseUsd = Number(priceUsd) || 0;
                      const flatBdt = Number(discountAmountBdt) || 0;
                      const flatUsd = Number(discountAmountUsd) || 0;
                      const pct = Number(discountPercentage) || 0;

                      let liveBdt = baseBdt;
                      let liveUsd = baseUsd;
                      let hasDiscount = false;

                      if (discountType === 'percentage' && pct > 0) {
                        liveBdt = Math.round(baseBdt * (1 - pct / 100));
                        liveUsd = Number((baseUsd * (1 - pct / 100)).toFixed(2));
                        hasDiscount = true;
                      } else if (discountType === 'flat' && (flatBdt > 0 || flatUsd > 0)) {
                        liveBdt = Math.max(0, baseBdt - flatBdt);
                        liveUsd = Math.max(0, Number((baseUsd - flatUsd).toFixed(2)));
                        hasDiscount = true;
                      }

                      return (
                        <div className="p-2.5 bg-rose-100/70 rounded-lg text-xs flex items-center justify-between text-stone-800">
                          <span className="font-semibold text-rose-950 text-[11px]">Live Customer View:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#1b3d2b] font-bold text-xs">
                              {currency === 'BDT' ? `৳ ${liveBdt.toLocaleString()}` : `$${liveUsd.toFixed(2)}`}
                            </span>
                            {hasDiscount && (
                              <span className="text-stone-400 line-through text-[11px]">
                                {currency === 'BDT' ? `৳ ${baseBdt.toLocaleString()}` : `$${baseUsd.toFixed(2)}`}
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                {discountType === 'percentage' 
                                  ? `-${pct}% OFF` 
                                  : currency === 'BDT' 
                                    ? `-৳${flatBdt} OFF` 
                                    : `-$${flatUsd.toFixed(2)} OFF`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Image URL & Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Product Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-mono"
                  />
                </div>

                {/* Preset image selector */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">Quick Stock Image Presets:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        type="button"
                        key={img.name}
                        onClick={() => setImage(img.url)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border font-medium cursor-pointer transition-all shrink-0 ${
                          image === img.url ? 'bg-[#1b3d2b] text-white border-[#1b3d2b]' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <Image className="w-3 h-3" />
                        <span>{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Product Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the product history, quality, taste profile, and source..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                />
              </div>

              {/* Benefits & Ingredients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Key Benefits (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Boosts Immunity, Improves Digestion, Pure Natural"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ingredients</label>
                  <input
                    type="text"
                    placeholder="100% Pure Organic Cold-Pressed Extract"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Sunnah Fact & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Sunnah / Prophetic Quote (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sahih al-Bukhari reference or Quran verse"
                    value={sunnahFact}
                    onChange={(e) => setSunnahFact(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. BESTSELLER, NEW"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1b3d2b] outline-none font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Stock Status</label>
                    <button
                      type="button"
                      onClick={() => setInStock(!inStock)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        inStock ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${inStock ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#1b3d2b] hover:bg-emerald-900 text-white shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Live Product' : 'Upload & Publish Product'}</span>
                </button>
              </div>

            </form>
          ) : (
            /* Manage Live Products Table */
            <div className="space-y-3">
              <div className="text-xs text-stone-500 font-semibold mb-2">
                Click "Edit" on any product below to update its title, description, or price in real time:
              </div>

              <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white">
                {products.map((prod) => (
                  <div key={prod.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-stone-900">{prod.name}</h4>
                          {prod.badge && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>{prod.category}</span>
                          <span>•</span>
                          <span className="font-bold text-amber-800">${prod.priceUsd.toFixed(2)} USD</span>
                          <span>/</span>
                          <span className="font-bold text-emerald-800">৳ {prod.priceBdt.toLocaleString()} BDT</span>
                          {(() => {
                            const priceInfo = getProductPriceInfo(prod, currency);
                            if (!priceInfo.hasDiscount) return null;
                            return (
                              <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                {priceInfo.badgeLabel}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(prod)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-[#1b3d2b] text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          onDeleteProduct(prod.id);
                          showNotice('Product removed from store.');
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
