import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Plus,
  X,
  Heart,
  Quote,
  Filter,
  Check,
} from 'lucide-react';
import {
  DBReview,
  fetchLiveReviews,
  submitCustomerReview,
} from '../services/supabase';

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional Masterpiece',
  4: 'Wonderful Craftsmanship',
  3: 'Good Quality & Artistry',
  2: 'Fair Experience',
  1: 'Disappointing',
};

export const RatingsSection: React.FC = () => {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [occasion, setOccasion] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // Load reviews on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchLiveReviews(false);
        if (isMounted) {
          setReviews(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 5.0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const rate = Math.max(1, Math.min(5, r.rating || 5));
      counts[rate] = (counts[rate] || 0) + 1;
      sum += rate;
    });
    const average = (sum / reviews.length).toFixed(1);
    return { average: parseFloat(average), total: reviews.length, counts };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (filterRating === 'all') return reviews;
    return reviews.filter((r) => r.rating === filterRating);
  }, [reviews, filterRating]);

  // Handle form submit
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!reviewText.trim()) {
      setFormError('Please write a brief review about your experience');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const created = await submitCustomerReview({
        name: authorName.trim(),
        rating: starRating,
        review: reviewText.trim(),
        occasion: occasion.trim(),
        city: city.trim(),
      });

      // Optimistically prepend to state
      setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setSubmitting(false);
      setIsModalOpen(false);

      // Reset form
      setAuthorName('');
      setStarRating(5);
      setReviewText('');
      setOccasion('');
      setCity('');

      // Show success toast
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err: any) {
      setSubmitting(false);
      setFormError('Failed to submit review. Please try again.');
    }
  };

  return (
    <section
      id="reviews"
      className="py-12 sm:py-16 lg:py-20 bg-warm-ivory relative overflow-hidden border-t border-champagne/40"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-champagne/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/50 border border-gold/40 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Echoes of Fine Artistry</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-espresso leading-tight">
            Words of Appreciation &amp; <span className="font-bold italic text-gold">Love</span>
          </h2>

          <div className="flex items-center justify-center gap-3 py-3">
            <div className="w-12 h-px bg-gold" />
            <div className="w-2 h-2 rotate-45 border border-gold bg-warm-ivory" />
            <div className="w-12 h-px bg-gold" />
          </div>

          <p className="text-xs sm:text-sm lg:text-base text-espresso/80 font-normal leading-relaxed max-w-2xl mx-auto">
            Every piece is hand-embroidered slowly and purposefully. Here are reflections shared by brides, art lovers, and patrons who welcomed Naqsh-e-Noor into their cherished celebrations.
          </p>
        </div>

        {/* Rating Overview & CTA Banner */}
        <div className="mb-10 p-5 sm:p-8 rounded-2xl bg-cream border border-champagne/80 shadow-luxury">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Overall Score Medallion */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-champagne/60 pb-6 md:pb-0 md:pr-6">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-espresso">
                  {stats.average}
                </span>
                <span className="text-muted-brown text-sm font-semibold">/ 5.0</span>
              </div>

              {/* Gold Stars */}
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      star <= Math.round(stats.average)
                        ? 'text-gold fill-gold'
                        : 'text-champagne/80 fill-champagne/30'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-brown font-medium">
                Based on <span className="font-bold text-espresso">{stats.total}</span> handcrafted atelier reviews
              </p>
            </div>

            {/* Middle: Star Breakdown Bars */}
            <div className="md:col-span-5 space-y-1.5 text-xs text-muted-brown">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = stats.counts[s] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterRating(filterRating === s ? 'all' : s)}
                    className="w-full flex items-center gap-2 group hover:text-espresso transition-colors text-left"
                  >
                    <span className="w-12 shrink-0 font-medium">{s} Stars</span>
                    <div className="flex-1 h-2 rounded-full bg-champagne-light overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-500 group-hover:bg-gold-dark"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right shrink-0 text-[11px] font-semibold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Write a Review CTA Button */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center pt-2 md:pt-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-gold hover:bg-gold-dark text-warm-ivory text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Write a Review</span>
              </button>
              <p className="text-[11px] text-muted-brown mt-2">
                Share your handcrafted story with us
              </p>
            </div>

          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-brown mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>

            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterRating === 'all'
                  ? 'bg-espresso text-warm-ivory shadow-xs'
                  : 'bg-cream text-espresso/80 border border-champagne hover:border-gold'
              }`}
            >
              All ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                  filterRating === star
                    ? 'bg-gold text-warm-ivory shadow-xs'
                    : 'bg-cream text-espresso/80 border border-champagne hover:border-gold'
                }`}
              >
                <span>{star} ★</span>
                <span className="text-[10px] opacity-80">({stats.counts[star] || 0})</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-brown">
            Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReviews.map((item) => {
            const initials = item.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-xl bg-cream border border-champagne/70 shadow-xs hover:shadow-luxury hover:border-gold/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle Watermark Quote Mark */}
                <Quote className="absolute -bottom-2 -right-2 w-16 h-16 text-champagne/25 pointer-events-none transform rotate-180" />

                <div>
                  {/* Top Row: User Avatar & Stars */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar Medallion */}
                      <div className="w-10 h-10 rounded-full bg-champagne/40 border border-gold/40 flex items-center justify-center font-serif font-bold text-xs text-espresso shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-espresso leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-sage font-semibold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-sage inline" />
                          <span>Verified Patron</span>
                        </div>
                      </div>
                    </div>

                    {/* Gold Star Display */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'text-gold fill-gold'
                              : 'text-champagne/60 fill-champagne/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Occasion / Collection Tag */}
                  {item.occasion && (
                    <div className="mb-2.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-warm-ivory text-[10.5px] font-medium text-gold border border-champagne/60">
                        {item.occasion}
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-espresso/85 leading-relaxed font-normal">
                    "{item.review}"
                  </p>
                </div>

                {/* Footer: City & Date */}
                <div className="pt-4 mt-4 border-t border-champagne/40 flex items-center justify-between text-[11px] text-muted-brown">
                  <span>{item.city || 'Atelier Client'}</span>
                  <span>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent Order'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-espresso text-warm-ivory px-4 py-3 rounded-xl shadow-2xl border border-gold/40 flex items-center gap-3 animate-bounce">
            <Check className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Thank You!</p>
              <p className="text-xs text-warm-ivory/90">Your review has been shared and is now live.</p>
            </div>
          </div>
        )}

        {/* Modal: Write a Review */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-espresso-dark/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg bg-warm-ivory rounded-2xl shadow-2xl border border-champagne overflow-hidden my-8">
              
              {/* Modal Header */}
              <div className="px-6 py-5 bg-cream border-b border-champagne flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-espresso">
                    Share Your Atelier Experience
                  </h3>
                  <p className="text-xs text-muted-brown mt-0.5">
                    Your words inspire our artisans and preserve generational needlework.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-espresso/70 hover:text-espresso hover:bg-champagne/30 rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {formError}
                  </div>
                )}

                {/* Rating Stars Selector */}
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-2">
                    Overall Experience Rating <span className="text-gold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-cream px-3 py-2 rounded-xl border border-champagne">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeLevel = hoverRating !== null ? hoverRating : starRating;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setStarRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125"
                            aria-label={`${star} Stars`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= activeLevel
                                  ? 'text-gold fill-gold'
                                  : 'text-champagne/60 fill-champagne/20'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-gold">
                      {RATING_LABELS[hoverRating !== null ? hoverRating : starRating]}
                    </span>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5">
                    Your Full Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Radhika Deshmukh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-champagne text-xs sm:text-sm text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5">
                    Your Words &amp; Experience <span className="text-gold">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts on the embroidery finesse, fabric feel, personalized consultation, and packaging..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-champagne text-xs sm:text-sm text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                {/* Two-Column: Occasion & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-espresso uppercase tracking-wider mb-1">
                      Creation / Occasion (Optional)
                    </label>
                    <input
                      type="text"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      placeholder="e.g. Bridal Lehanga / Floral Hoop"
                      className="w-full px-3 py-2 rounded-xl bg-cream border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-espresso uppercase tracking-wider mb-1">
                      City / Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, India"
                      className="w-full px-3 py-2 rounded-xl bg-cream border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-champagne/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-espresso/70 hover:bg-champagne/30 transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow transition-all focus:outline-none"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
