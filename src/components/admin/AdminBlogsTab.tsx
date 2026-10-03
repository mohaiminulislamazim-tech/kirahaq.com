import React, { useState } from 'react';
import { BlogPost, Product } from '../../types';
import { blogs as initialBlogs } from '../../data/blogs';
import { 
  FileText, Plus, Edit3, Trash2, Calendar, User, Clock, Save, X, 
  Sparkles, Eye, Search, Filter, CheckCircle2, AlertCircle, Star, 
  BookOpen, ExternalLink, RefreshCw, ChevronRight, Tag
} from 'lucide-react';

interface AdminBlogsTabProps {
  products?: Product[];
}

const DEFAULT_COVER_IMAGES = [
  { label: 'Sidr Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
  { label: 'Black Seed Oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800' },
  { label: 'Olive Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800' },
  { label: 'Organic Dates', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { label: 'Herbal Tea', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800' },
];

const PRESET_CATEGORIES = [
  'Pure Honey',
  'Sunnah Products',
  'Prophetic Medicine',
  'Natural Foods',
  'Health & Nutrition',
  'Wellness Guide'
];

const PRESET_AUTHORS = [
  'Dr. Shahbaz Alam',
  'Hakeem Imran Khan',
  'Kira Haq Health Expert',
  'Dr. Ayesha Siddiqua'
];

export function AdminBlogsTab({ products = [] }: AdminBlogsTabProps) {
  // Load initial blogs from localStorage or fallback to defaults
  const [blogsList, setBlogsList] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_blogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error parsing kirahaq_blogs:', e);
    }
    return initialBlogs.map(b => ({
      ...b,
      status: b.status || (b.id === 'b1' ? 'featured' : 'published'),
      featured: b.featured ?? (b.id === 'b1'),
      viewsCount: b.viewsCount || Math.floor(Math.random() * 400) + 120
    }));
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'views'>('newest');

  // Modal / Editor states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState<BlogPost | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState(PRESET_AUTHORS[0]);
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'published' | 'draft' | 'featured'>('published');
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState(DEFAULT_COVER_IMAGES[0].url);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Persist Helper
  const saveBlogs = (updatedList: BlogPost[]) => {
    setBlogsList(updatedList);
    try {
      localStorage.setItem('kirahaq_blogs', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('kirahaq_blogs_updated'));
    } catch (e) {
      console.error('Failed to save kirahaq_blogs:', e);
    }
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setCategory(PRESET_CATEGORIES[0]);
    setCustomCategory('');
    setAuthor(PRESET_AUTHORS[0]);
    setReadTime('5 min read');
    setStatus('published');
    setFeatured(false);
    setImage(DEFAULT_COVER_IMAGES[0].url);
    setSummary('');
    setContent('');
    setPublishDate(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
    setEditingBlog(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingBlog(post);
    setTitle(post.title);
    
    if (PRESET_CATEGORIES.includes(post.category)) {
      setCategory(post.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(post.category);
    }

    setAuthor(post.author || PRESET_AUTHORS[0]);
    setReadTime(post.readTime || '5 min read');
    setStatus(post.status === 'featured' ? 'featured' : (post.status || 'published'));
    setFeatured(post.featured || post.status === 'featured');
    setImage(post.image || DEFAULT_COVER_IMAGES[0].url);
    setSummary(post.summary || post.excerpt || '');
    setContent(post.content || '');
    setPublishDate(post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
    setIsFormOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('error', 'Please enter article title.');
      return;
    }
    if (!summary.trim()) {
      showToast('error', 'Please provide a short summary/excerpt.');
      return;
    }
    if (!content.trim()) {
      showToast('error', 'Please provide full article content.');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Health & Wellness') : category;
    const finalStatus = status;
    const isFeatured = featured || status === 'featured';

    if (editingBlog) {
      const updatedList = blogsList.map(b => {
        if (b.id === editingBlog.id) {
          return {
            ...b,
            title: title.trim(),
            category: finalCategory,
            author: author.trim(),
            readTime: readTime.trim() || '5 min read',
            status: finalStatus,
            featured: isFeatured,
            image: image.trim() || DEFAULT_COVER_IMAGES[0].url,
            summary: summary.trim(),
            excerpt: summary.trim(),
            content: content.trim(),
            date: publishDate || b.date
          };
        }
        return b;
      });

      saveBlogs(updatedList);
      showToast('success', `Article "${title.trim()}" updated successfully!`);
    } else {
      const newPost: BlogPost = {
        id: `blog_${Date.now()}`,
        title: title.trim(),
        category: finalCategory,
        author: author.trim(),
        readTime: readTime.trim() || '5 min read',
        status: finalStatus,
        featured: isFeatured,
        image: image.trim() || DEFAULT_COVER_IMAGES[0].url,
        summary: summary.trim(),
        excerpt: summary.trim(),
        content: content.trim(),
        date: publishDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        viewsCount: 1
      };

      saveBlogs([newPost, ...blogsList]);
      showToast('success', `New article "${title.trim()}" published successfully!`);
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Quick Status Toggle
  const handleToggleStatus = (id: string, newStatus: 'published' | 'draft' | 'featured') => {
    const updatedList = blogsList.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: newStatus,
          featured: newStatus === 'featured' ? true : b.featured
        };
      }
      return b;
    });
    saveBlogs(updatedList);
    showToast('success', `Article status set to "${newStatus.toUpperCase()}"`);
  };

  // Quick Toggle Featured
  const handleToggleFeatured = (id: string) => {
    const updatedList = blogsList.map(b => {
      if (b.id === id) {
        const nextFeatured = !b.featured;
        return {
          ...b,
          featured: nextFeatured,
          status: nextFeatured ? 'featured' : (b.status === 'featured' ? 'published' : b.status)
        };
      }
      return b;
    });
    saveBlogs(updatedList);
    showToast('success', `Featured status updated!`);
  };

  // Delete Blog
  const handleDeleteConfirm = () => {
    if (deleteConfirmBlog) {
      const updatedList = blogsList.filter(b => b.id !== deleteConfirmBlog.id);
      saveBlogs(updatedList);
      showToast('success', `Article "${deleteConfirmBlog.title}" deleted.`);
      setDeleteConfirmBlog(null);
    }
  };

  // KPI Statistics
  const totalCount = blogsList.length;
  const publishedCount = blogsList.filter(b => b.status === 'published' || b.status === 'featured' || !b.status).length;
  const draftCount = blogsList.filter(b => b.status === 'draft').length;
  const featuredCount = blogsList.filter(b => b.featured || b.status === 'featured').length;

  // Filter Logic
  const filteredBlogs = blogsList.filter(b => {
    const currentStatus = b.status || 'published';
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'featured' ? (b.featured || currentStatus === 'featured') : currentStatus === statusFilter);

    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;

    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.summary && b.summary.toLowerCase().includes(q)) ||
      b.content.toLowerCase().includes(q);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Sort Logic
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
    return 0; // Default order
  });

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(blogsList.map(b => b.category)));

  return (
    <div className="space-y-6">

      {/* Toast Banner */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Articles</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Islamic & Sunnah Guides</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Published</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{publishedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Live on website</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-300">Featured Posts</div>
          <div className="text-xl font-serif font-bold text-amber-300 mt-1 flex items-center gap-1">
            <span>{featuredCount}</span>
            <Sparkles className="w-4 h-4 text-amber-300 inline" />
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Highlighted on homepage</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Drafts</div>
          <div className="text-xl font-serif font-bold text-stone-400 mt-1">{draftCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">In progress articles</div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Health & Sunnah Blog Management ({blogsList.length} Articles)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Create, edit, and publish research articles on Tibb-e-Nabawi, Sidr honey, Black Seed oil, and holistic Islamic wellness.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNew}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>+ Write / Add New Blog</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search articles by title, author, category, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            {(['all', 'published', 'featured', 'draft'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Default Order</option>
            <option value="views">Sort: Most Popular</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>

        </div>
      </div>

      {/* Blog Cards Grid */}
      {sortedBlogs.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-stone-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Articles Found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            No blog articles match your search or filter parameters. Try clearing filters or create a new blog.
          </p>
          <button
            type="button"
            onClick={handleStartAddNew}
            className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compose New Article</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBlogs.map((post) => {
            const currentStatus = post.status || 'published';

            return (
              <div 
                key={post.id} 
                className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden flex flex-col justify-between shadow-xl group hover:border-stone-700 transition-all relative"
              >
                {/* Image Cover & Badges */}
                <div className="relative aspect-16/9 overflow-hidden bg-stone-950">
                  <img 
                    src={post.image || DEFAULT_COVER_IMAGES[0].url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-stone-950/90 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold rounded-lg backdrop-blur-sm">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="px-2.5 py-1 bg-amber-400 text-stone-950 text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-stone-950" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {currentStatus === 'published' && (
                      <span className="px-2.5 py-1 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-bold rounded-full">
                        Published
                      </span>
                    )}
                    {currentStatus === 'draft' && (
                      <span className="px-2.5 py-1 bg-stone-950/90 border border-stone-700 text-stone-400 text-[10px] font-bold rounded-full">
                        Draft
                      </span>
                    )}
                    {currentStatus === 'featured' && (
                      <span className="px-2.5 py-1 bg-amber-950/90 border border-amber-800 text-amber-300 text-[10px] font-bold rounded-full">
                        Featured Post
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-400" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h4>

                  <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                    {post.summary || post.excerpt || post.content.substring(0, 120)}
                  </p>
                </div>

                {/* Card Footer & Action Controls */}
                <div className="p-4 pt-3 border-t border-stone-800 flex items-center justify-between gap-2 text-xs bg-stone-950/50">
                  <span className="text-[10px] text-stone-500 font-medium">{post.date}</span>

                  <div className="flex items-center gap-1.5">
                    
                    {/* Quick Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewBlog(post)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg cursor-pointer transition-colors"
                      title="Preview Article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Feature Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(post.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                        post.featured 
                          ? 'bg-amber-400 text-stone-950 border-amber-300' 
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-amber-300'
                      }`}
                      title={post.featured ? 'Unmark Featured' : 'Mark Featured'}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(post)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-blue-400 border border-stone-700 rounded-lg cursor-pointer transition-colors"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmBlog(post)}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg cursor-pointer transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT BLOG MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingBlog ? 'Edit Sunnah Wellness Article' : 'Compose New Sunnah Article'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBlog} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Article Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Therapeutic Secrets of Pure Sidr Honey & Nigella Sativa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>

              {/* Category & Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Custom">+ Enter Custom Category</option>
                  </select>
                </div>

                {category === 'Custom' ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Custom Category Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hijama Therapy"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Author Name / Title
                    </label>
                    <input
                      type="text"
                      list="authors-list"
                      placeholder="e.g. Dr. Shahbaz Alam"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <datalist id="authors-list">
                      {PRESET_AUTHORS.map(a => <option key={a} value={a} />)}
                    </datalist>
                  </div>
                )}
              </div>

              {/* Read time & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="featured">Published & Featured</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Publish Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. May 15, 2024"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image & Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Header Cover Image URL
                </label>
                <div className="flex items-center gap-3">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-16 h-10 rounded-xl object-cover border border-amber-400/40 shrink-0" 
                  />
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                {/* Image Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] text-stone-500 font-bold">Preset Photos:</span>
                  {DEFAULT_COVER_IMAGES.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(item.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        image === item.url 
                          ? 'bg-amber-400 text-stone-950 border-amber-300' 
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Short Excerpt / Teaser Summary <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="A concise 1-2 sentence teaser summary displayed on blog cards..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Content Body */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-stone-300">
                    Full Article Content <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-stone-500">Supports multi-paragraph formatting</span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder="Write the complete research article here... Double enter for new paragraphs."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBlog ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= ARTICLE PREVIEW MODAL ================= */}
      {previewBlog && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Article Reader Preview
              </span>
              <button 
                type="button" 
                onClick={() => setPreviewBlog(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full">
                {previewBlog.category}
              </span>
              <h2 className="text-2xl font-serif font-bold text-white">
                {previewBlog.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span>By {previewBlog.author}</span>
                <span>•</span>
                <span>{previewBlog.date}</span>
                <span>•</span>
                <span>{previewBlog.readTime}</span>
              </div>
            </div>

            <img 
              src={previewBlog.image} 
              alt={previewBlog.title} 
              className="w-full h-56 object-cover rounded-2xl border border-stone-800" 
            />

            <div className="text-xs text-stone-300 space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2">
              {previewBlog.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewBlog(null)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmBlog && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Article?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete <strong className="text-amber-400">"{deleteConfirmBlog.title}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBlog(null)}
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
