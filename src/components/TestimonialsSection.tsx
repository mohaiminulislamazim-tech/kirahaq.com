import React, { useState } from 'react';
import { Star, Plus, CheckCircle2, Upload, Camera, X, MessageSquareQuote, ShieldCheck, Sparkles } from 'lucide-react';
import { Review } from '../types';

interface TestimonialsSectionProps {
  testimonials: Review[];
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  // Only show approved reviews on the public section
  const approvedTestimonials = testimonials.filter(r => (r.status || 'approved') === 'approved');

  // Review submission modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // File photo upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      alert('Please enter your review text.');
      return;
    }

    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      clientName: clientName.trim(),
      location: location.trim() || 'Bangladesh',
      avatar: avatar || PRESET_AVATARS[0],
      rating,
      comment: comment.trim(),
      verified: true,
      productName: 'Kira Haq Sunnah Organic Food',
      date: todayDate,
      status: initialStatus,
    };

    // Save to localStorage & notify system
    try {
      const existingStr = localStorage.getItem('kirahaq_reviews');
      let existingList: Review[] = existingStr ? JSON.parse(existingStr) : testimonials;
      if (!Array.isArray(existingList)) existingList = testimonials;

      const updated = [newReview, ...existingList];
      localStorage.setItem('kirahaq_reviews', JSON.stringify(updated));
      window.dispatchEvent(new Event('kirahaq_reviews_updated'));
    } catch (err) {
      console.error('Failed to save review:', err);
    }

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setIsSubmitModalOpen(false);
      setClientName('');
      setLocation('Dhaka, Bangladesh');
      setComment('');
      setRating(5);
    }, 3500);
  };

  return (
    <section className="py-14 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Write Review CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              WHAT OUR CLIENTS SAY
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b3d2b]">
              Trusted By Thousands
            </h2>
          </div>

            <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedTestimonials.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
              <MessageSquareQuote className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-600">No client reviews published yet.</p>
              <p className="text-xs text-stone-400 mt-1">Be the first to share your experience with Kira Haq!</p>
            </div>
          ) : (
            approvedTestimonials.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-stone-700 text-xs italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                {/* Client Profile & Date */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.clientName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">{review.clientName}</h4>
                      <p className="text-[11px] text-stone-500">{review.location}</p>
                    </div>
                  </div>
                  {review.date && (
                    <span className="text-[10px] text-stone-400 font-medium shrink-0">
                      {review.date}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Review Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Jazakallah Khair!</h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Your review has been submitted successfully! It is now saved with an automatic <strong className="text-emerald-700 font-bold uppercase">Approved</strong> status and visible on our client section.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Client Testimonial</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1b3d2b] mt-1">
                    Submit Your Review
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Share your experience with Kira Haq organic Sunnah products & consultation.
                  </p>
                </div>

                {/* Rating Selection */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-center">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            (hoverRating !== null ? star <= hoverRating : star <= rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 block mt-1">
                    {rating === 5 ? '5 Stars - Excellent' : `${rating} Stars`}
                  </span>
                </div>

                {/* Photo Upload & Avatar selection */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Profile Photo
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img
                        src={avatar}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <label 
                        htmlFor="testimonial-avatar-upload"
                        className="px-3 py-1.5 bg-[#1b3d2b] hover:bg-[#132c1e] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Photo</span>
                        <input
                          id="testimonial-avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-stone-500 block">Or pick a preset avatar below:</span>
                      
                      <div className="flex items-center gap-2">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setAvatar(url)}
                            className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              avatar === url ? 'border-[#1b3d2b] scale-105 ring-2 ring-amber-400/50' : 'border-stone-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ayesha Rahman"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1b3d2b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Location / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dhaka, Bangladesh"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1b3d2b]"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Review / Testimonial *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your experience with Kira Haq products..."
                    className="w-full bg-white border border-stone-300 rounded-2xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#1b3d2b] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1b3d2b] hover:bg-[#132c1e] text-amber-300 font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Submit Review</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
