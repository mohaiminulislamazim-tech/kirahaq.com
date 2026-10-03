import React, { useState, useEffect } from 'react';
import { Review, Product } from '../../types';
import { testimonials as initialTestimonials } from '../../data/testimonials';
import { 
  Sparkles, Star, Plus, Edit3, Trash2, CheckCircle2, Save, X, 
  MessageSquare, ShieldCheck, ShieldAlert, Search, Eye, EyeOff,
  CornerDownRight, Filter, AlertCircle, RefreshCw, ThumbsUp, UserCheck
} from 'lucide-react';

interface AdminReviewsTabProps {
  products?: Product[];
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

export function AdminReviewsTab({ products = [] }: AdminReviewsTabProps) {
  // Load initial reviews from localStorage or fallback
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading kirahaq_reviews from localStorage:', e);
    }
    // Default fallback with enriched status
    return initialTestimonials.map(t => ({
      ...t,
      verified: t.verified ?? true,
      productName: t.productName || 'Pure Organic Sidr Honey',
      status: t.status || 'approved',
      adminReply: t.adminReply || (t.id === 't1' ? 'Jazakallah Khair for your trust in Kira Haq! We are delighted to hear about your health improvements.' : undefined),
      replyDate: t.replyDate || (t.id === 't1' ? '14 May 2024' : undefined)
    }));
  });

  // Sync reviews when updated anywhere in the app
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setReviews(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_reviews_updated', handleSync);
    return () => window.removeEventListener('kirahaq_reviews_updated', handleSync);
  }, []);

  // Auto approve setting state (default true: automatic approval on submit)
  const [autoApprove, setAutoApprove] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('kirahaq_auto_approve_reviews');
      return val !== null ? val === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const handleToggleAutoApprove = (enabled: boolean) => {
    setAutoApprove(enabled);
    try {
      localStorage.setItem('kirahaq_auto_approve_reviews', String(enabled));
      window.dispatchEvent(new Event('kirahaq_auto_approve_updated'));
    } catch (e) {
      console.error(e);
    }
    showToast(
      'success',
      enabled 
        ? 'Auto-Approve Enabled: New reviews will be automatically approved with tick mark!' 
        : 'Auto-Approve Disabled: New reviews will be saved as Pending for manual approval.'
    );
  };

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'hidden' | 'rejected'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating_high' | 'rating_low' | 'name'>('newest');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<Review | null>(null);

  // Form states for Add / Edit
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [verified, setVerified] = useState(true);
  const [status, setStatus] = useState<'approved' | 'pending' | 'hidden' | 'rejected'>('approved');
  const [reviewDate, setReviewDate] = useState('');

  // Form state for Reply Modal
  const [replyText, setReplyText] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to persist state
  const saveReviews = (updatedList: Review[]) => {
    setReviews(updatedList);
    try {
      localStorage.setItem('kirahaq_reviews', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('kirahaq_reviews_updated'));
    } catch (e) {
      console.error('Failed to save kirahaq_reviews:', e);
    }
  };

  // Reset Add/Edit Form
  const resetForm = () => {
    setClientName('');
    setLocation('Dhaka, Bangladesh');
    setRating(5);
    setComment('');
    setProductName(products[0]?.name || 'Pure Organic Sidr Honey');
    setAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
    setVerified(true);
    setStatus('approved');
    setReviewDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    setEditingReview(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (rev: Review) => {
    setEditingReview(rev);
    setClientName(rev.clientName);
    setLocation(rev.location);
    setRating(rev.rating);
    setComment(rev.comment);
    setProductName(rev.productName || (products[0]?.name || 'Pure Organic Sidr Honey'));
    setAvatar(rev.avatar || DEFAULT_AVATARS[0]);
    setVerified(rev.verified ?? true);
    setStatus(rev.status || 'approved');
    setReviewDate(rev.date || 'Jul 2026');
    setIsFormOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showToast('error', 'Please enter customer name.');
      return;
    }
    if (!comment.trim()) {
      showToast('error', 'Please enter review comment text.');
      return;
    }

    if (editingReview) {
      const updatedList = reviews.map(r => {
        if (r.id === editingReview.id) {
          return {
            ...r,
            clientName: clientName.trim(),
            location: location.trim() || 'Bangladesh',
            rating,
            comment: comment.trim(),
            productName: productName.trim() || 'Pure Organic Product',
            avatar: avatar.trim() || DEFAULT_AVATARS[0],
            verified,
            status,
            date: reviewDate || r.date
          };
        }
        return r;
      });

      saveReviews(updatedList);
      showToast('success', `Review from "${clientName.trim()}" updated successfully!`);
    } else {
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        clientName: clientName.trim(),
        location: location.trim() || 'Dhaka, Bangladesh',
        avatar: avatar.trim() || DEFAULT_AVATARS[0],
        rating,
        comment: comment.trim(),
        verified,
        productName: productName.trim() || 'Pure Organic Product',
        status,
        date: reviewDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      saveReviews([newReview, ...reviews]);
      showToast('success', `New customer review added successfully!`);
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Quick Status Toggle (Approved / Pending / Hidden / Rejected)
  const handleToggleStatus = (id: string, newStatus: 'approved' | 'pending' | 'hidden' | 'rejected') => {
    const updatedList = reviews.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReviews(updatedList);
    showToast('success', `Review status updated to "${newStatus.toUpperCase()}"`);
  };

  // Quick Toggle Verified Buyer
  const handleToggleVerified = (id: string) => {
    const updatedList = reviews.map(r => r.id === id ? { ...r, verified: !r.verified } : r);
    saveReviews(updatedList);
    showToast('success', `Verified Buyer status updated!`);
  };

  // Reply Handling
  const handleStartReply = (rev: Review) => {
    setReplyingReview(rev);
    setReplyText(rev.adminReply || '');
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    const updatedList = reviews.map(r => {
      if (r.id === replyingReview.id) {
        return {
          ...r,
          adminReply: replyText.trim() || undefined,
          replyDate: replyText.trim() ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined
        };
      }
      return r;
    });

    saveReviews(updatedList);
    showToast('success', replyText.trim() ? 'Official admin reply published!' : 'Admin reply removed.');
    setReplyingReview(null);
    setReplyText('');
  };

  const handleDeleteReply = (id: string) => {
    const updatedList = reviews.map(r => r.id === id ? { ...r, adminReply: undefined, replyDate: undefined } : r);
    saveReviews(updatedList);
    showToast('success', 'Admin response removed.');
  };

  // Delete Review
  const handleDeleteConfirm = () => {
    if (deleteConfirmReview) {
      const updatedList = reviews.filter(r => r.id !== deleteConfirmReview.id);
      saveReviews(updatedList);
      showToast('success', `Review from "${deleteConfirmReview.clientName}" deleted.`);
      setDeleteConfirmReview(null);
    }
  };

  // KPI Metrics
  const totalReviewsCount = reviews.length;
  const approvedCount = reviews.filter(r => (r.status || 'approved') === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const hiddenCount = reviews.filter(r => r.status === 'hidden').length;
  const avgRating = totalReviewsCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  // Filter & Search Logic
  const filteredReviews = reviews.filter(r => {
    const currentStatus = r.status || 'approved';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    const matchesRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      r.clientName.toLowerCase().includes(searchLower) ||
      r.comment.toLowerCase().includes(searchLower) ||
      r.location.toLowerCase().includes(searchLower) ||
      (r.productName && r.productName.toLowerCase().includes(searchLower)) ||
      (r.adminReply && r.adminReply.toLowerCase().includes(searchLower));

    return matchesStatus && matchesRating && matchesSearch;
  });

  // Sort Logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'rating_high') return b.rating - a.rating;
    if (sortBy === 'rating_low') return a.rating - b.rating;
    if (sortBy === 'name') return a.clientName.localeCompare(b.clientName);
    return 0; // Default order
  });

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Feedback</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalReviewsCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Customer Testimonials</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Average Satisfaction</div>
          <div className="text-xl font-serif font-bold text-amber-400 mt-1 flex items-center gap-1">
            <span>{avgRating}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Based on star ratings</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Published / Approved</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Visible on store</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-300">Pending / Hidden</div>
          <div className="text-xl font-serif font-bold text-amber-300 mt-1">{pendingCount + hiddenCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Requires moderation</div>
        </div>
      </div>

      {/* Auto-Approve Setting Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-emerald-500/30 p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all ${autoApprove ? 'bg-emerald-950 border-emerald-600/50 text-emerald-400' : 'bg-stone-800 border-stone-700 text-stone-400'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Automatic Review Approval</h4>
              {autoApprove ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                </span>
              ) : (
                <span className="bg-stone-800 text-stone-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-stone-700">
                  MANUAL
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {autoApprove 
                ? 'All new reviews will be automatically approved and published live on the website.' 
                : 'New submitted reviews will remain Pending and require manual approval from the admin panel.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <label className="relative inline-flex items-center cursor-pointer select-none bg-stone-950 px-4 py-2.5 rounded-2xl border border-stone-800 hover:border-emerald-500/40 transition-all">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => handleToggleAutoApprove(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[18px] sm:after:top-[12px] sm:after:left-[18px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-xs font-bold text-stone-200">
              {autoApprove ? 'Auto-Approve ON' : 'Auto-Approve OFF'}
            </span>
          </label>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Product & Consultation Reviews ({reviews.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Moderate verified customer testimonials, publish official admin replies, manage star ratings, and feature reviews on the store homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNew}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>+ Add Customer Review</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search reviews by customer name, product, comment, location, or response..."
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
            {(['all', 'approved', 'pending', 'hidden'] as const).map((st) => (
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

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value={5}>5 Stars (★★★★★)</option>
            <option value={4}>4 Stars (★★★★☆)</option>
            <option value={3}>3 Stars (★★★☆☆)</option>
            <option value={2}>2 Stars (★★☆☆☆)</option>
            <option value={1}>1 Star (★☆☆☆☆)</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-bold cursor-pointer"
          >
            <option value="newest">Sort: Default Order</option>
            <option value="rating_high">Sort: Highest Rating</option>
            <option value="rating_low">Sort: Lowest Rating</option>
            <option value="name">Sort: Customer Name</option>
          </select>
        </div>
      </div>

      {/* Review Cards Grid */}
      {sortedReviews.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-stone-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Customer Reviews Found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            No review records match your filter criteria. Try adjusting the search term or status filter.
          </p>
          <button
            type="button"
            onClick={handleStartAddNew}
            className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedReviews.map((r) => {
            const currentStatus = r.status || 'approved';

            return (
              <div 
                key={r.id} 
                className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-stone-700 transition-all"
              >
                {/* Top Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={r.avatar || DEFAULT_AVATARS[0]} 
                        alt={r.clientName} 
                        className="w-11 h-11 rounded-2xl object-cover border border-amber-400/40 shrink-0" 
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{r.clientName}</span>
                          {r.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold" title="Verified Buyer">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">{r.location}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {currentStatus === 'approved' && (
                        <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {currentStatus === 'pending' && (
                        <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {currentStatus === 'rejected' && (
                        <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {currentStatus === 'hidden' && (
                        <span className="px-2.5 py-1 bg-stone-950 border border-stone-700 text-stone-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars & Product Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
                    <div className="flex items-center text-amber-400 gap-0.5 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} 
                        />
                      ))}
                      <span className="ml-1 text-[11px] font-bold text-amber-300">({r.rating}/5)</span>
                    </div>

                    <span className="px-2.5 py-0.5 bg-stone-950 border border-stone-800 text-stone-300 rounded-lg text-[10px] font-semibold truncate max-w-[200px]">
                      {r.productName || 'Pure Sunnah Product'}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-stone-200 italic leading-relaxed bg-stone-950/50 p-3.5 rounded-2xl border border-stone-800/80">
                    "{r.comment}"
                  </p>

                  {/* Admin Reply Section if exists */}
                  {r.adminReply && (
                    <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-2xl space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3" /> Official Response from Kira Haq
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-stone-400">{r.replyDate || 'Recently'}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(r.id)}
                            className="text-stone-400 hover:text-rose-400 text-[10px] font-bold cursor-pointer"
                            title="Delete Response"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-amber-200 font-medium">
                        "{r.adminReply}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer & Action Controls */}
                <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Interactive Approved Tick Mark Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 hover:border-emerald-600/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={currentStatus === 'approved'}
                      onChange={(e) => handleToggleStatus(r.id, e.target.checked ? 'approved' : 'pending')}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      currentStatus === 'approved' ? 'text-emerald-400' : 'text-stone-400'
                    }`}>
                      {currentStatus === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-stone-500" />
                          <span>Not Approved</span>
                        </>
                      )}
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-stone-500 font-medium mr-1">{r.date || 'Jul 2026'}</span>
                    
                    {/* Quick Status Switches */}
                    {currentStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id, 'approved')}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                        title="Approve & Publish Review"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Approve</span>
                      </button>
                    )}

                    {currentStatus !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id, 'rejected')}
                        className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                        title="Reject Review"
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Reject</span>
                      </button>
                    )}

                    {currentStatus !== 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id, 'pending')}
                        className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        title="Mark as Pending Moderation"
                      >
                        Pend
                      </button>
                    )}

                    {currentStatus !== 'hidden' && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(r.id, 'hidden')}
                        className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-stone-400 border border-stone-800 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        title="Hide from Store"
                      >
                        Hide
                      </button>
                    )}

                    {/* Admin Reply Button */}
                    <button
                      type="button"
                      onClick={() => handleStartReply(r)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                      title={r.adminReply ? 'Edit Official Response' : 'Add Official Response'}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Review */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(r)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-blue-400 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                      title="Edit Review Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Review */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmReview(r)}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl cursor-pointer transition-colors"
                      title="Delete Customer Review"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT REVIEW MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingReview ? 'Edit Customer Review' : 'Add New Customer Review'}
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
            <form onSubmit={handleSaveReview} className="space-y-4">
              
              {/* Customer Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Customer Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Rahman"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Select & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Product / Service Reviewed
                  </label>
                  <input
                    type="text"
                    list="products-list"
                    placeholder="Select or type product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <datalist id="products-list">
                    {products.map(p => (
                      <option key={p.id} value={p.name} />
                    ))}
                    <option value="Prophetic Health Consultation" />
                    <option value="Sunnah Organic Gift Pack" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 Stars (★★★★★ Excellent)</option>
                    <option value={4}>4 Stars (★★★★☆ Very Good)</option>
                    <option value={3}>3 Stars (★★★☆☆ Average)</option>
                    <option value={2}>2 Stars (★★☆☆☆ Fair)</option>
                    <option value={1}>1 Star (★☆☆☆☆ Poor)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Customer Profile Avatar Image
                </label>
                <div className="flex items-center gap-3">
                  <img 
                    src={avatar} 
                    alt="Preview" 
                    className="w-10 h-10 rounded-xl object-cover border border-amber-400 shrink-0" 
                  />
                  <input
                    type="url"
                    placeholder="Image URL (or pick preset below)"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-stone-500 font-bold">Presets:</span>
                  {DEFAULT_AVATARS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(imgUrl)}
                      className={`w-6 h-6 rounded-full overflow-hidden border transition-all cursor-pointer ${
                        avatar === imgUrl ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Verified */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="approved">Approved & Published</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="hidden">Hidden from Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Verified Buyer Badge
                  </label>
                  <button
                    type="button"
                    onClick={() => setVerified(!verified)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      verified
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{verified ? 'Verified Buyer Enabled' : 'Not Verified'}</span>
                  </button>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Customer Review Feedback <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter genuine customer testimonial..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none font-medium"
                />
              </div>

              {/* Form Actions */}
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
                  <span>{editingReview ? 'Update Review' : 'Save Review'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= ADMIN REPLY MODAL ================= */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Respond to {replyingReview.clientName}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setReplyingReview(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs space-y-1">
              <div className="text-stone-400">Customer Feedback:</div>
              <div className="text-stone-200 italic">"{replyingReview.comment}"</div>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Official Response from Kira Haq
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Jazakallah Khair for your kind words! We are delighted that you enjoyed our pure organic Sidr honey."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                {replyingReview.adminReply ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteReply(replyingReview.id)}
                    className="text-xs text-rose-400 hover:underline font-bold cursor-pointer"
                  >
                    Delete Existing Response
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Response</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmReview && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Customer Review?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to delete review by <strong className="text-amber-400">"{deleteConfirmReview.clientName}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReview(null)}
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
