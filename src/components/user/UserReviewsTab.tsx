import React, { useState, useEffect } from 'react';
import { Star, Plus, CheckCircle2, ShieldCheck, Trash2, Clock, AlertCircle, EyeOff, ShieldAlert } from 'lucide-react';
import { Product, Review, UserAccount } from '../../types';

interface UserReviewsTabProps {
  products: Product[];
  currentUser?: UserAccount;
}

const DEFAULT_USER_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    clientName: 'Ayesha Rahman',
    location: 'Dhaka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    productName: 'Pure Sidr Royal Honey (500g)',
    rating: 5,
    comment: 'Mashallah, extraordinary quality! The thickness and natural aroma of Sidr honey is 100% authentic.',
    date: 'July 20, 2026',
    verified: true,
    status: 'approved',
  },
  {
    id: 'rev_2',
    clientName: 'Tanvir Hossain',
    location: 'Chittagong',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    productName: 'Ajwa Dates Premium Grade A (1kg)',
    rating: 5,
    comment: 'Very fresh and soft Madinah Ajwa dates. Delivered quickly within 24 hours in Dhaka.',
    date: 'July 16, 2026',
    verified: true,
    status: 'approved',
  },
];

export const UserReviewsTab: React.FC<UserReviewsTabProps> = ({ products, currentUser }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER_REVIEWS;
  });

  // Sync with local storage when reviews change elsewhere
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

  const [isWriting, setIsWriting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveToStorage = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    try {
      localStorage.setItem('kirahaq_reviews', JSON.stringify(updatedReviews));
      window.dispatchEvent(new Event('kirahaq_reviews_updated'));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  const confirmDeleteReview = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    saveToStorage(updated);
    setDeletingId(null);
    setSuccessMsg('Review deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please enter your review comment.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId) || products[0];

    // Check Auto-Approve setting (defaults to true)
    let isAutoApprove = true;
    try {
      const autoApproveVal = localStorage.getItem('kirahaq_auto_approve_reviews');
      if (autoApproveVal !== null) {
        isAutoApprove = autoApproveVal === 'true';
      }
    } catch (e) {
      isAutoApprove = true;
    }

    const initialStatus: 'approved' | 'pending' = isAutoApprove ? 'approved' : 'pending';

    const newRev: Review = {
      id: 'rev_' + Date.now(),
      clientName: currentUser?.name || 'Customer',
      location: currentUser?.district || 'Dhaka, Bangladesh',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      productName: prod ? prod.name : 'Sunnah Organic Product',
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      verified: true,
      status: initialStatus,
    };

    const updated = [newRev, ...reviews];
    saveToStorage(updated);

    setComment('');
    setIsWriting(false);
    setSuccessMsg(
      isAutoApprove 
        ? 'Jazakallah! Your product review has been submitted and automatically approved!' 
        : 'Jazakallah! Your product review has been submitted and is pending admin approval.'
    );
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Product Reviews ({reviews.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Share your genuine feedback on purchased organic products to help the Ummah.
            </p>
          </div>

          <button
            onClick={() => setIsWriting(!isWriting)}
            className="px-4 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isWriting ? 'Cancel Review' : 'Write Product Review'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Write Review Form */}
        {isWriting && (
          <form onSubmit={handleSubmitReview} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Submit Review for Organic Product</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl outline-none font-medium text-stone-900"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Star Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-700 ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Feedback *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe product taste, purity, packaging, and health benefits experienced..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl outline-none font-medium leading-relaxed"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Your review will be saved with status <strong>Pending</strong> and published upon admin verification.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Submit Product Review</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-2">
            <Star className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500 font-semibold">No reviews submitted yet.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={rev.clientName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm">{rev.productName || 'Organic Product'}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>

                      {/* Status Badges */}
                      {(rev.status === 'pending') && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>Pending Admin Approval</span>
                        </span>
                      )}
                      {(rev.status === 'approved' || !rev.status) && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Approved & Published</span>
                        </span>
                      )}
                      {rev.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>Rejected</span>
                        </span>
                      )}
                      {rev.status === 'hidden' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-700 font-extrabold px-2.5 py-0.5 rounded-full">
                          <EyeOff className="w-3 h-3 text-stone-500" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-stone-400 mr-1">{rev.date}</span>
                  {deletingId === rev.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-fade-in">
                      <button
                        onClick={() => confirmDeleteReview(rev.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 bg-stone-200 text-stone-700 font-bold text-[10px] rounded-lg hover:bg-stone-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(rev.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[11px] font-semibold text-rose-600 sm:hidden">Delete</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed font-medium pl-1">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
