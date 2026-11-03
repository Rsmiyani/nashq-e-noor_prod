import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle,
  EyeOff,
  Eye,
  Trash2,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  X,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  DBReview,
  fetchLiveReviews,
  upsertAdminReview,
  updateReviewStatus,
  deleteReview,
  checkReviewsTableHealth,
} from '../../services/supabase';

const SUPABASE_REVIEWS_SQL = `-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  occasion TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'approved', -- 'approved' or 'hidden'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved reviews
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

-- Allow public to submit new reviews from the landing page
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Allow admin full manage capability
DROP POLICY IF EXISTS "Public Manage Reviews" ON public.reviews;
CREATE POLICY "Public Manage Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
`;

export const AdminReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<DBReview | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formReview, setFormReview] = useState('');
  const [formOccasion, setFormOccasion] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formStatus, setFormStatus] = useState<'approved' | 'hidden'>('approved');
  const [formSaving, setFormSaving] = useState(false);

  // Load reviews & check health
  const loadData = async () => {
    setLoading(true);
    try {
      const [health, data] = await Promise.all([
        checkReviewsTableHealth(),
        fetchLiveReviews(true), // include hidden reviews for admin
      ]);
      setTableExists(health.exists);
      setReviews(data);
    } catch (e: any) {
      console.warn('Failed loading reviews in admin', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const copySqlSnippet = () => {
    navigator.clipboard.writeText(SUPABASE_REVIEWS_SQL);
    setCopiedSql(true);
    showNotification('Supabase SQL copied to clipboard! Paste in Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: DBReview) => {
    setEditingReview(item);
    setFormName(item.name);
    setFormRating(item.rating);
    setFormReview(item.review);
    setFormOccasion(item.occasion || '');
    setFormCity(item.city || '');
    setFormStatus(item.status === 'hidden' ? 'hidden' : 'approved');
  };

  // Reset Form
  const resetForm = () => {
    setEditingReview(null);
    setFormName('');
    setFormRating(5);
    setFormReview('');
    setFormOccasion('');
    setFormCity('');
    setFormStatus('approved');
  };

  // Save Add / Edit
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReview.trim()) {
      showNotification('Name and Review content are required', 'error');
      return;
    }

    setFormSaving(true);
    try {
      const saved = await upsertAdminReview({
        id: editingReview ? editingReview.id : undefined,
        name: formName.trim(),
        rating: formRating,
        review: formReview.trim(),
        occasion: formOccasion.trim(),
        city: formCity.trim(),
        status: formStatus,
      });

      if (editingReview) {
        setReviews((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        showNotification(`Updated review by "${saved.name}"`);
      } else {
        setReviews((prev) => [saved, ...prev]);
        showNotification(`Added new review by "${saved.name}"`);
      }

      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      showNotification('Failed to save review: ' + err.message, 'error');
    } finally {
      setFormSaving(false);
    }
  };

  // Toggle Approved / Hidden
  const handleToggleStatus = async (item: DBReview) => {
    const nextStatus = item.status === 'approved' ? 'hidden' : 'approved';
    try {
      await updateReviewStatus(item.id, nextStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: nextStatus } : r))
      );
      showNotification(
        `Review by "${item.name}" is now ${nextStatus === 'approved' ? 'Visible (Approved)' : 'Hidden'}`
      );
    } catch (e: any) {
      showNotification('Could not update status: ' + e.message, 'error');
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeletingId(null);
      showNotification('Review deleted successfully');
    } catch (e: any) {
      showNotification('Failed to delete review: ' + e.message, 'error');
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, average: 5.0, fiveStar: 0, approved: 0, hidden: 0 };
    let sum = 0;
    let fiveStar = 0;
    let approved = 0;
    let hidden = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      if (r.rating === 5) fiveStar++;
      if (r.status === 'approved') approved++;
      else hidden++;
    });

    const average = (sum / total).toFixed(1);
    return { total, average: parseFloat(average), fiveStar, approved, hidden };
  }, [reviews]);

  // Filtered List
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.city && r.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.occasion && r.occasion.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStar = starFilter === 'all' || r.rating === starFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchSearch && matchStar && matchStatus;
    });
  }, [reviews, searchQuery, starFilter, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:opacity-75 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Supabase SQL Setup Banner (shows if table not yet created) */}
      {tableExists === false && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-espresso space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-espresso">
                  Supabase `reviews` Table Setup
                </h4>
                <p className="text-xs text-muted-brown">
                  To persist customer reviews permanently in your cloud database, execute this SQL script in your Supabase SQL editor.
                </p>
              </div>
            </div>

            <button
              onClick={copySqlSnippet}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0 focus:outline-none"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-warm-ivory text-espresso-dark font-mono text-[10.5px] overflow-x-auto max-h-32 border border-champagne/60">
            {SUPABASE_REVIEWS_SQL}
          </pre>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-cream border border-champagne/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-brown text-xs mb-1">
            <span className="font-medium">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-gold" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-espresso">
            {stats.total}
          </div>
          <span className="text-[10px] text-muted-brown">Client testimonials</span>
        </div>

        <div className="p-4 rounded-xl bg-cream border border-champagne/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-brown text-xs mb-1">
            <span className="font-medium">Average Rating</span>
            <Star className="w-4 h-4 text-gold fill-gold" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-espresso flex items-center gap-1.5">
            <span>{stats.average}</span>
            <span className="text-xs font-sans text-muted-brown font-normal">/ 5.0</span>
          </div>
          <span className="text-[10px] text-sage font-semibold">Verified satisfaction</span>
        </div>

        <div className="p-4 rounded-xl bg-cream border border-champagne/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-brown text-xs mb-1">
            <span className="font-medium">5-Star Masterpieces</span>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-espresso">
            {stats.fiveStar}
          </div>
          <span className="text-[10px] text-gold font-semibold">
            {stats.total > 0 ? `${Math.round((stats.fiveStar / stats.total) * 100)}% 5-star` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-cream border border-champagne/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-brown text-xs mb-1">
            <span className="font-medium">Live on Storefront</span>
            <CheckCircle className="w-4 h-4 text-sage" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-espresso">
            {stats.approved}
          </div>
          <span className="text-[10px] text-muted-brown">
            {stats.hidden} hidden from public
          </span>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Add Review CTA */}
      <div className="p-4 rounded-2xl bg-cream border border-champagne/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-brown/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, review text, or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-warm-ivory border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-brown/60 hover:text-espresso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-between md:justify-end">
          {/* Star Filter */}
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-warm-ivory border border-champagne text-xs text-espresso focus:outline-none focus:border-gold"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-warm-ivory border border-champagne text-xs text-espresso focus:outline-none focus:border-gold"
          >
            <option value="all">All Status</option>
            <option value="approved">Visible (Approved)</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-warm-ivory border border-champagne hover:border-gold text-espresso/80 transition-colors focus:outline-none"
            title="Refresh reviews"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Review Button */}
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:shadow transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Reviews Content: Responsive Card View for Mobile & Tablet, Table for Large Desktop */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-cream border border-champagne/70 space-y-3">
            <Star className="w-8 h-8 text-gold/60 mx-auto" />
            <h4 className="font-serif text-base font-bold text-espresso">No reviews found</h4>
            <p className="text-xs text-muted-brown max-w-sm mx-auto">
              {searchQuery || starFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Click "Add Review" to add authentic client testimonials.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl bg-cream border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                  item.status === 'hidden'
                    ? 'border-gray-300 opacity-70 bg-gray-50/60'
                    : 'border-champagne/80 hover:border-gold/60 hover:shadow-luxury'
                }`}
              >
                <div>
                  {/* Top Bar: Name, Stars & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-espresso leading-snug">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-brown mt-0.5">
                        {item.city && <span>{item.city}</span>}
                        {item.occasion && (
                          <>
                            <span>•</span>
                            <span className="text-gold font-medium">{item.occasion}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[9.5px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {item.status === 'approved' ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1 my-2">
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
                    <span className="text-[11px] font-bold text-espresso ml-1">
                      {item.rating}.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-espresso/80 leading-relaxed font-normal line-clamp-4 mt-2">
                    "{item.review}"
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3.5 mt-3.5 border-t border-champagne/50 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-brown">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Atelier Record'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.status === 'approved'
                          ? 'text-muted-brown hover:text-amber-700 hover:bg-amber-100/50'
                          : 'text-emerald-700 hover:bg-emerald-100/50'
                      }`}
                      title={item.status === 'approved' ? 'Hide from storefront' : 'Make live on storefront'}
                      aria-label="Toggle visibility"
                    >
                      {item.status === 'approved' ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-espresso/70 hover:text-gold hover:bg-champagne/30 transition-colors"
                      title="Edit review"
                      aria-label="Edit review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg text-espresso/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete review"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Review */}
      {(isAddModalOpen || editingReview) && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-espresso-dark/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-warm-ivory rounded-2xl shadow-2xl border border-champagne overflow-hidden my-8">
            <div className="px-6 py-5 bg-cream border-b border-champagne flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-espresso">
                  {editingReview ? 'Edit Review & Rating' : 'Add Client Review'}
                </h3>
                <p className="text-xs text-muted-brown mt-0.5">
                  Manage reviewer name, rating stars, content, and visibility.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-espresso/70 hover:text-espresso hover:bg-champagne/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 text-xs">
              {/* Reviewer Name */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                  Customer / Reviewer Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Radhika Deshmukh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-champagne text-xs sm:text-sm text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-espresso mb-1.5">
                  Rating (1 to 5 Stars) <span className="text-gold">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-cream px-3 py-2 rounded-xl border border-champagne">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formRating
                              ? 'text-gold fill-gold'
                              : 'text-champagne/60 fill-champagne/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gold">
                    {formRating} Star{formRating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                  Review Text <span className="text-gold">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  placeholder="The delicate silk stitches and metallic embroidery was exquisite..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-champagne text-xs sm:text-sm text-espresso focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Occasion & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                    Occasion / Product
                  </label>
                  <input
                    type="text"
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value)}
                    placeholder="e.g. Bridal Trousseau / Hoop"
                    className="w-full px-3 py-2 rounded-xl bg-cream border border-champagne text-xs text-espresso focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-3 py-2 rounded-xl bg-cream border border-champagne text-xs text-espresso focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                  Storefront Visibility Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-champagne text-xs text-espresso focus:outline-none focus:border-gold"
                >
                  <option value="approved">Approved &amp; Live on Landing Page</option>
                  <option value="hidden">Hidden from Public View</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-champagne/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-espresso/70 hover:bg-champagne/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow transition-all"
                >
                  {formSaving ? 'Saving...' : editingReview ? 'Save Changes' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-espresso-dark/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-warm-ivory rounded-2xl shadow-2xl border border-champagne p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso">
                Delete Review?
              </h3>
              <p className="text-xs text-muted-brown mt-1">
                Are you sure you want to permanently remove this review? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-cream border border-champagne text-xs font-semibold text-espresso hover:bg-champagne/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

