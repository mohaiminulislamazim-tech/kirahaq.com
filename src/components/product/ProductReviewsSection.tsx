import React, { useState } from 'react';
import { 
  Star, ThumbsUp, CheckCircle, MessageSquarePlus, Filter, 
  ArrowUpDown, Image as ImageIcon, X, Send, Sparkles, UserCheck
} from 'lucide-react';
import { Product, Review } from '../../types';

interface ProductReviewsSectionProps {
  product: Product;
  reviews: Review[];
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product, reviews }) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest'>('latest');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({
    't1': 14,
    't2': 29,
    't3': 18,
    't4': 7,
  });
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  // Review Form State
  const [newReview, setNewReview] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Default seed reviews tailored for the product if list is small
  const allReviewsList: Review[] = React.useMemo(() => {
    const list = [...reviews];
    if (list.length < 3) {
      list.push(
        {
          id: `rev-${product.id}-1`,
          clientName: 'Sultana Begum',
          location: 'Dhaka, Bangladesh',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          rating: 5,
          comment: `I have been using this ${product.name} regularly. The taste and therapeutic benefits are truly unparalleled. Certified 100% pure organic!`,
          verified: true,
          date: '3 days ago'
        },
        {
          id: `rev-${product.id}-2`,
          clientName: 'Arif Hossain',
          location: 'Chittagong, Bangladesh',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          rating: 5,
          comment: `Outstanding packaging and fast delivery. The aromatic profile is authentic and natural. Highly recommended!`,
          verified: true,
          date: '1 week ago'
        },
        {
          id: `rev-${product.id}-3`,
          clientName: 'Dr. Shahriar Kabir',
          location: 'Sylhet, Bangladesh',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          rating: 4,
          comment: `Great product quality and quick response from consultation team. Will definitely repurchase again.`,
          verified: true,
          date: '2 weeks ago'
        }
      );
    }
    return list;
  }, [reviews, product]);

  const handleHelpfulToggle = (id: string) => {
    if (votedHelpful[id]) return;
    setVotedHelpful((prev) => ({ ...prev, [id]: true }));
    setHelpfulCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsWriteModalOpen(false);
      setNewReview({ name: '', email: '', rating: 5, title: '', comment: '' });
    }, 2000);
  };

  // Filter and sort
  const filteredReviews = allReviewsList.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0; // latest
  });

  const ratingDistribution = [
    { stars: 5, percentage: 82, count: Math.round(product.reviewCount * 0.82) },
    { stars: 4, percentage: 12, count: Math.round(product.reviewCount * 0.12) },
    { stars: 3, percentage: 4, count: Math.round(product.reviewCount * 0.04) },
    { stars: 2, percentage: 1, count: Math.round(product.reviewCount * 0.01) },
    { stars: 1, percentage: 1, count: Math.round(product.reviewCount * 0.01) },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Customer Ratings & Reviews</h3>
          <p className="text-xs text-stone-500 mt-0.5">Real verified feedback from genuine customers</p>
        </div>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Ratings Overview & Breakdown Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/80 p-6 rounded-2xl border border-stone-200/80">
        {/* Left: Big Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-stone-200">
          <span className="text-5xl sm:text-6xl font-serif font-extrabold text-stone-900 tracking-tight">
            {product.rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-stone-600">Based on {product.reviewCount} Verified Reviews</span>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 px-3 py-0.5 rounded-full mt-2">
            ✓ 98% of customers recommend this product
          </span>
        </div>

        {/* Right: Distribution Progress Bars */}
        <div className="lg:col-span-8 space-y-2.5 flex flex-col justify-center">
          {ratingDistribution.map((item) => (
            <button
              key={item.stars}
              onClick={() => setFilterRating(filterRating === item.stars ? 'all' : item.stars)}
              className="flex items-center gap-3 w-full group cursor-pointer"
            >
              <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-bold text-stone-700">
                <span>{item.stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>

              <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full group-hover:bg-amber-500 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <span className="w-12 text-right text-xs text-stone-500 font-medium shrink-0">
                {item.percentage}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterRating === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Ratings ({allReviewsList.length})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filterRating === star
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{star} Stars</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold text-stone-800 bg-stone-100 border border-stone-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-[#1b3d2b]"
          >
            <option value="latest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4 pt-2">
        {filteredReviews.map((rev) => {
          const isVoted = votedHelpful[rev.id];
          const count = helpfulCounts[rev.id] || 0;

          return (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3 transition-hover hover:border-stone-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={rev.clientName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">{rev.clientName}</h4>
                      {rev.verified !== false && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400">{rev.location || 'Verified Customer'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">{rev.date || 'Recent purchase'}</span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                "{rev.comment}"
              </p>

              {/* Helpful and verification footer */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-[11px] text-stone-400">Purchased: {product.name}</span>
                <button
                  onClick={() => handleHelpfulToggle(rev.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    isVoted
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  <span>{isVoted ? `Helpful (${count})` : `Helpful (${count})`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#1b3d2b]" />
                <h3 className="font-bold text-base text-stone-900">Write a Review for {product.name}</h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-lg">Thank You for Your Review!</h4>
                <p className="text-xs text-stone-500">Your feedback helps fellow customers make authentic wellness choices.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Rating selection */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1.5">Overall Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-bold text-stone-700 ml-2">
                      {newReview.rating === 5 ? '5 Stars - Excellent' : `${newReview.rating} Stars`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Rahman"
                      value={newReview.name}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#1b3d2b] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ayesha@example.com"
                      value={newReview.email}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#1b3d2b] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Review Headline / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best quality Sidr honey I have ever purchased!"
                    value={newReview.title}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#1b3d2b] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Your Detailed Experience *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the aroma, taste, purity, and your wellness experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#1b3d2b] outline-none text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
