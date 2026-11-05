import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Sparkles,
  CheckCircle,
  Plus,
  X,
  Quote,
  Filter,
  Check,
  Camera,
  UploadCloud,
  Maximize2,
} from 'lucide-react';
import {
  DBReview,
  fetchLiveReviews,
  submitCustomerReview,
  uploadReviewImage,
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Modal for customer photo viewing
  const [lightboxData, setLightboxData] = useState<{
    url: string;
    name: string;
    occasion?: string;
    city?: string;
  } | null>(null);

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

  // Lock scroll when any modal is open
  useEffect(() => {
    if (isModalOpen || lightboxData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, lightboxData]);

  // Handle image upload change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    setFormError('');
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAuthorName('');
    setStarRating(5);
    setReviewText('');
    setOccasion('');
    setCity('');
    handleRemoveImage();
    setFormError('');
  };

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

  // Seamless loop marquee list
  const marqueeList = useMemo(() => {
    if (filteredReviews.length === 0) return [];
    const multiplier = Math.max(1, Math.ceil(5 / filteredReviews.length));
    const half: DBReview[] = [];
    for (let i = 0; i < multiplier; i++) {
      half.push(...filteredReviews);
    }
    return [...half, ...half];
  }, [filteredReviews]);

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
      let uploadedImageUrl: string | undefined = undefined;

      // Upload image to Supabase if provided (with automatic client base64 fallback)
      if (imageFile) {
        uploadedImageUrl = await uploadReviewImage(imageFile);
      }

      const created = await submitCustomerReview({
        name: authorName.trim(),
        rating: starRating,
        review: reviewText.trim(),
        occasion: occasion.trim(),
        city: city.trim(),
        image_url: uploadedImageUrl,
      });

      // Optimistically prepend to state
      setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setSubmitting(false);
      handleCloseModal();

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
            Every piece is hand-embroidered slowly and purposefully. Here are reflections and photos shared by brides, art lovers, and patrons who welcomed Naqsh-e-Noor into their cherished celebrations.
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
                Share your handcrafted story &amp; photos with us
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

        {/* Continuous Single-Line Infinite Marquee Animation (Right to Left) */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Subtle Luxury Gradient Edge Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-28 bg-gradient-to-r from-warm-ivory via-warm-ivory/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-28 bg-gradient-to-l from-warm-ivory via-warm-ivory/80 to-transparent z-10" />

          {/* Marquee Track (Smooth, Continuous Right-to-Left Animation with Pause on Hover) */}
          <div className="animate-reviews-marquee gap-4 sm:gap-6 flex py-3 cursor-grab active:cursor-grabbing">
            {marqueeList.map((item, index) => {
              const initials = item.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="w-[300px] xs:w-[340px] sm:w-[390px] h-[270px] sm:h-[285px] shrink-0 p-5 sm:p-6 rounded-2xl bg-cream border border-champagne/80 shadow-xs hover:shadow-luxury hover:border-gold/60 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden select-none"
                >
                  {/* Subtle Watermark Quote Mark */}
                  <Quote className="absolute -bottom-2 -right-2 w-16 h-16 text-champagne/20 pointer-events-none transform rotate-180" />

                  <div>
                    {/* Top Row: User Avatar & Stars */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar Medallion */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-champagne/40 border border-gold/40 flex items-center justify-center font-serif font-bold text-xs text-espresso shrink-0 shadow-xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif text-sm sm:text-base font-bold text-espresso leading-snug truncate max-w-[140px] sm:max-w-[170px]">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] text-sage font-semibold uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3 text-sage inline shrink-0" />
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
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded bg-warm-ivory text-[10px] sm:text-[10.5px] font-medium text-gold border border-champagne/60 truncate max-w-full">
                          {item.occasion}
                        </span>
                      </div>
                    )}

                    {/* Review Text */}
                    <p className={`text-xs sm:text-[13px] text-espresso/85 leading-relaxed font-normal ${
                      item.image_url ? 'line-clamp-2 sm:line-clamp-3' : 'line-clamp-4'
                    }`}>
                      "{item.review}"
                    </p>

                    {/* Optional Customer Photo Thumbnail with Lightbox trigger */}
                    {item.image_url && (
                      <div className="mt-2.5 flex items-center gap-2.5 pt-2 border-t border-champagne/40">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxData({
                              url: item.image_url!,
                              name: item.name,
                              occasion: item.occasion,
                              city: item.city,
                            });
                          }}
                          className="relative group/thumb overflow-hidden rounded-xl border border-gold/40 shadow-xs focus:outline-none shrink-0"
                          title="Click to view full photo"
                        >
                          <img
                            src={item.image_url}
                            alt={`${item.name}'s craft`}
                            className="w-11 h-11 sm:w-12 sm:h-12 object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-espresso/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-3.5 h-3.5 text-warm-ivory" />
                          </div>
                        </button>
                        <div className="min-w-0">
                          <span className="text-[10.5px] sm:text-[11px] font-semibold text-espresso flex items-center gap-1">
                            <Camera className="w-3 h-3 text-gold" />
                            Customer Photo
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxData({
                                url: item.image_url!,
                                name: item.name,
                                occasion: item.occasion,
                                city: item.city,
                              });
                            }}
                            className="text-[10px] text-gold hover:underline font-medium block"
                          >
                            View full craft photo ↗
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: City & Date */}
                  <div className="pt-2.5 mt-2 border-t border-champagne/40 flex items-center justify-between text-[11px] text-muted-brown">
                    <span className="truncate max-w-[140px]">{item.city || 'Atelier Patron'}</span>
                    <span className="shrink-0">
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

          {/* Pause hint */}
          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-muted-brown/75 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70 animate-pulse" />
              <span>Hover over any review card to pause and read</span>
            </span>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-espresso text-warm-ivory px-4 py-3 rounded-xl shadow-2xl border border-gold/40 flex items-center gap-3 animate-bounce">
            <Check className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Thank You!</p>
              <p className="text-xs text-warm-ivory/90">Your review and photo have been shared and are now live.</p>
            </div>
          </div>
        )}

        {/* Lightbox: View Full Customer Photo */}
        {lightboxData && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-espresso-dark/80 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={() => setLightboxData(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-warm-ivory rounded-2xl overflow-hidden shadow-2xl border border-champagne my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="px-5 py-4 bg-cream border-b border-champagne flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gold" />
                  <h3 className="font-serif text-base font-bold text-espresso">
                    {lightboxData.name}
                    {lightboxData.occasion ? ` — ${lightboxData.occasion}` : ''}
                  </h3>
                </div>
                <button
                  onClick={() => setLightboxData(null)}
                  className="p-1.5 text-espresso/70 hover:text-espresso hover:bg-champagne/40 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High-Res Image Display */}
              <div className="p-4 bg-warm-ivory flex items-center justify-center max-h-[70vh]">
                <img
                  src={lightboxData.url}
                  alt={lightboxData.name}
                  className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-luxury border border-champagne/60"
                />
              </div>

              {/* Lightbox Footer */}
              <div className="px-5 py-3 bg-cream border-t border-champagne text-xs text-muted-brown flex items-center justify-between">
                <span>
                  {lightboxData.city ? `Patron from ${lightboxData.city}` : 'Handcrafted Heirloom by Naqsh-e-Noor'}
                </span>
                <button
                  onClick={() => setLightboxData(null)}
                  className="px-4 py-1.5 rounded-lg bg-espresso text-warm-ivory text-xs font-semibold hover:bg-espresso-dark transition-colors"
                >
                  Close
                </button>
              </div>
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
                    Your words and photos inspire our artisans and preserve generational needlework.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
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

                {/* Optional Customer Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-gold" />
                      <span>Attach Photo of Your Piece (Optional)</span>
                    </span>
                    <span className="text-[10px] text-muted-brown font-normal lowercase tracking-normal">max 5mb</span>
                  </label>

                  {!imagePreview ? (
                    <label className="border-2 border-dashed border-champagne hover:border-gold rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer bg-cream/50 hover:bg-cream transition-all group">
                      <UploadCloud className="w-6 h-6 text-muted-brown group-hover:text-gold transition-colors mb-1" />
                      <span className="text-xs font-medium text-espresso group-hover:text-gold transition-colors">
                        Click or drag a craft photo here
                      </span>
                      <span className="text-[10px] text-muted-brown mt-0.5">
                        Showcase your bridal lehanga, hoop, or embroidery art
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl border border-champagne">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-champagne bg-warm-ivory shrink-0">
                        <img
                          src={imagePreview}
                          alt="Review preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-espresso truncate">
                          {imageFile?.name || 'Customer craft photo'}
                        </p>
                        <p className="text-[10.5px] text-muted-brown">
                          {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : 'Image ready'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 rounded-lg text-espresso/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-espresso/70 hover:bg-champagne/30 transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow transition-all focus:outline-none flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Post Review</span>
                    )}
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
