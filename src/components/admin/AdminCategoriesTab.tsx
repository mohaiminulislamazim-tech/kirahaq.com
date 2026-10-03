import React, { useState, useEffect } from 'react';
import { Product, CategoryItem } from '../../types';
import { 
  Layers, Plus, Edit3, Trash2, Package, Save, X, Search, 
  CheckCircle2, Image as ImageIcon, AlertCircle, Eye, EyeOff, Sparkles, Upload 
} from 'lucide-react';

interface AdminCategoriesTabProps {
  products: Product[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat_1',
    name: 'Pure Honey',
    description: 'Raw, bioactive Sidr & Mustard honey harvested directly from pristine organic bee farms.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    status: 'Active'
  },
  {
    id: 'cat_2',
    name: 'Natural Foods',
    description: 'Organic Ghee, cold-pressed mustard oil, chia seeds, and wholesome nutrient-dense superfoods.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
    status: 'Active'
  },
  {
    id: 'cat_3',
    name: 'Sunnah Products',
    description: 'Ajwa dates, Black seeds (Kalonji), Zamzam water, Olive oil, and authentic Prophetic remedies.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400',
    status: 'Active'
  },
  {
    id: 'cat_4',
    name: 'Herbal & Wellness',
    description: 'Natural herbal powders, organic detox teas, immune boosters, and natural supplement remedies.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    status: 'Active'
  },
  {
    id: 'cat_5',
    name: 'Gift Packs',
    description: 'Curated Sunnah luxury gift sets and premium hampers for family, friends, and special occasions.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400',
    status: 'Active'
  },
];

const PRESET_IMAGES = [
  { label: 'Honey & Nectar', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400' },
  { label: 'Organic Ghee & Oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400' },
  { label: 'Dates & Sunnah Items', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400' },
  { label: 'Herbal Remedies', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
  { label: 'Gift Sets', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400' }
];

export function AdminCategoriesTab({ products }: AdminCategoriesTabProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading categories from localStorage:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryItem | null>(null);
  
  // Form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catStatus, setCatStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showToast('error', 'Image too large! Please choose an image smaller than 500KB.');
        return;
      }
      
      // Clear current image to show loading state if needed
      setCatImage('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCatImage(result);
        }
      };
      reader.onerror = () => {
        showToast('error', 'Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Feedback Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync to localStorage
  const saveCategoriesToStorage = (updated: CategoryItem[]) => {
    setCategories(updated);
    try {
      localStorage.setItem('kirahaq_categories', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        showToast('error', 'Storage limit exceeded! Cannot save custom images.');
      } else {
        showToast('error', 'Failed to save changes.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImage(PRESET_IMAGES[0].url);
    setCatStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatImage(cat.image || PRESET_IMAGES[0].url);
    setCatStatus(cat.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    if (editingCategory) {
      // Edit mode
      const updated = categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: catName.trim(), description: catDesc.trim(), image: catImage.trim(), status: catStatus } 
          : c
      );
      saveCategoriesToStorage(updated);
      showToast('success', `Category "${catName.trim()}" updated successfully!`);
    } else {
      // Add mode
      const newCat: CategoryItem = {
        id: `cat_${Date.now()}`,
        name: catName.trim(),
        description: catDesc.trim() || 'Organic Sunnah collection',
        image: catImage.trim() || PRESET_IMAGES[0].url,
        status: catStatus
      };
      const updated = [newCat, ...categories];
      saveCategoriesToStorage(updated);
      showToast('success', `New category "${catName.trim()}" added successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    const updated = categories.filter(c => c.id !== cat.id);
    saveCategoriesToStorage(updated);
    setDeleteConfirmCat(null);
    showToast('success', `Category "${cat.name}" deleted successfully.`);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Category Management</span>
                <span className="px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold rounded-full">
                  {categories.length} Total
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Create, edit, and organize product categories displayed on the store front.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-amber-400 outline-none font-medium"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        </div>
      </div>

      {/* Category Grid Cards */}
      {filteredCategories.length === 0 ? (
        <div className="bg-stone-900 p-12 text-center rounded-3xl border border-stone-800 space-y-3">
          <Layers className="w-12 h-12 text-stone-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Categories Found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            No category matched your search criteria. Try adding a new category or clearing search filter.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const productCount = products.filter(p => p.category === cat.name).length;
            const isActive = cat.status !== 'Inactive';

            return (
              <div 
                key={cat.id} 
                className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-md flex flex-col justify-between transition-all hover:border-amber-400/40 hover:shadow-xl group"
              >
                {/* Category Header Image */}
                <div className="relative h-36 bg-stone-950 overflow-hidden">
                  <img
                    src={cat.image || PRESET_IMAGES[0].url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                      isActive 
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' 
                        : 'bg-stone-800/90 text-stone-400 border-stone-700'
                    }`}>
                      {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </span>
                  </div>

                  {/* Product Count Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-amber-400/90 text-stone-950 text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                      <Package className="w-3.5 h-3.5" />
                      <span>{productCount} Products</span>
                    </span>
                  </div>
                </div>

                {/* Category Details Body */}
                <div className="p-5 space-y-2 flex-1">
                  <h4 className="text-base font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-4 bg-stone-950/60 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-500">
                    ID: {cat.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(cat)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCat(cat)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT CATEGORY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4">
              
              {/* Category Name Input */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Honey & Nectar"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what products belong in this category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium resize-none"
                />
              </div>

              {/* Category Image Upload & Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1 flex justify-between items-center">
                  <span>Category Image</span>
                  <span className="text-[10px] text-amber-400 font-medium">Upload file or choose preset</span>
                </label>
                <div className="space-y-3">
                  {/* File Upload Button & Preview */}
                  <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800">
                    {/* Preview Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-stone-900 border border-stone-700 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                      {catImage ? (
                        <img src={catImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <label className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-2 transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Category Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleCategoryImageUpload} 
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-stone-400">
                        Upload image directly from device (PNG, JPG, WEBP)
                      </p>
                    </div>
                  </div>

                  {/* Preset Sample Images */}
                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block mb-1">Or choose a preset sample image:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCatImage(preset.url)}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border shrink-0 cursor-pointer transition-all ${
                            catImage === preset.url 
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

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Visibility Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCatStatus('Active')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      catStatus === 'Active'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Active (Visible)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatStatus('Inactive')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      catStatus === 'Inactive'
                        ? 'bg-rose-950 border-rose-600 text-rose-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Inactive (Hidden)</span>
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
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
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Category?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete category <strong className="text-amber-400">"{deleteConfirmCat.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteConfirmCat)}
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
