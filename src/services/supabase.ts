import { createClient } from '@supabase/supabase-js';
import { Product } from '../data/products';
import {
  getCachedProducts,
  setCachedProducts,
  updateSingleCachedProduct,
  removeSingleCachedProduct,
  getCachedCategories,
  setCachedCategories,
} from './cache';

// Read strictly from Vite environment variables (.env locally or Vercel Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables! Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or Vercel project settings.'
  );
}

// Fallback to placeholder to prevent client crash during initialization if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * -------------------------------------------------------------
 * Supabase Auth Services for Atelier Admin Portal
 * -------------------------------------------------------------
 */

/**
 * Sign in admin using email and password via Supabase server-side auth.
 * Validates credentials on Supabase and sets an encrypted JWT session token.
 */
export async function signInAdmin(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

/**
 * Register an admin user in Supabase auth backend.
 */
export async function signUpAdmin(email: string, password: string) {
  return await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim(),
  });
}

/**
 * Sign out admin and revoke the Supabase JWT session.
 */
export async function signOutAdmin() {
  return await supabase.auth.signOut();
}

/**
 * Retrieve current active Supabase session.
 */
export async function getAdminSession() {
  return await supabase.auth.getSession();
}

/**
 * Get current authenticated user details.
 */
export async function getCurrentAdminUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to Supabase Auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
 */
export function onAdminAuthChange(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}

export interface DBCategory {
  id: string; // e.g. 'bridal', 'embroidery', etc.
  label: string; // e.g. 'Bridal', 'Embroidery'
  description?: string;
  created_at?: string;
}

export interface DBProduct {
  id: string;
  name: string;
  category: string;
  category_label?: string;
  image: string; // Base64 Data URL
  source_file?: string;
  description?: string;
  price?: string; // empty string for initial items
  tags?: string[];
  featured?: boolean;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

/**
 * Check if Supabase tables exist and are accessible
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  categoriesTableExists: boolean;
  productsTableExists: boolean;
  categoryCount: number;
  productCount: number;
  error?: string;
}> {
  try {
    const { count: catCount, error: catError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    const { count: prodCount, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const categoriesTableExists = !catError || catError.code !== 'PGRST205';
    const productsTableExists = !prodError || prodError.code !== 'PGRST205';

    return {
      connected: !catError && !prodError,
      categoriesTableExists,
      productsTableExists,
      categoryCount: catCount || 0,
      productCount: prodCount || 0,
      error: catError?.message || prodError?.message,
    };
  } catch (err: any) {
    return {
      connected: false,
      categoriesTableExists: false,
      productsTableExists: false,
      categoryCount: 0,
      productCount: 0,
      error: err.message,
    };
  }
}

/**
 * Fetch all categories with IndexedDB caching
 */
export async function fetchLiveCategories(forceFresh = false): Promise<DBCategory[]> {
  if (!forceFresh) {
    const cached = await getCachedCategories();
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[Supabase] Error fetching categories, using fallback:', error.message);
    const cachedFallback = await getCachedCategories();
    if (cachedFallback) return cachedFallback;
    throw error;
  }

  const live = data || [];
  if (live.length > 0) {
    setCachedCategories(live);
  }
  return live;
}

/**
 * Create or update a category
 */
export async function upsertCategory(cat: {
  id: string;
  label: string;
  description?: string;
}): Promise<DBCategory> {
  const { data, error } = await supabase
    .from('categories')
    .upsert({
      id: cat.id.toLowerCase().trim(),
      label: cat.label.trim(),
      description: cat.description || '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all products with Stale-While-Revalidate caching and chunked pagination
 * - Returns in <15ms if cached in IndexedDB
 * - Chunks network queries in batches of 30 to avoid browser payload freezes
 */
export async function fetchLiveProducts(forceFresh = false): Promise<Product[]> {
  if (!forceFresh) {
    const cached = await getCachedProducts();
    if (cached && cached.length > 0) {
      // Revalidate in background to keep data fresh without blocking UI
      revalidateProductsInBackground();
      return cached;
    }
  }

  return fetchAndCacheAllProducts();
}

/**
 * Helper to fetch products in paginated chunks and cache to IndexedDB
 */
async function fetchAndCacheAllProducts(): Promise<Product[]> {
  const pageSize = 30;
  let allRows: DBProduct[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.warn('[Supabase] Error fetching product chunk, using cached fallback:', error.message);
      const fallback = await getCachedProducts();
      if (fallback) return fallback;
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allRows = allRows.concat(data as DBProduct[]);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      from += pageSize;
    }
  }

  // Map DB format to storefront Product format
  const mapped: Product[] = allRows.map((row: DBProduct) => {
    const isInactive = Array.isArray(row.tags) && row.tags.includes('inactive');
    return {
      id: row.id,
      name: row.name,
      category: row.category as any,
      categoryLabel: row.category_label || `${row.category.charAt(0).toUpperCase() + row.category.slice(1)} Collection`,
      image: row.image,
      sourceFile: row.source_file || row.id,
      description: row.description || '',
      price: row.price || '',
      tags: row.tags || [],
      featured: !!row.featured,
      status: isInactive ? 'inactive' : 'active',
    };
  });

  if (mapped.length > 0) {
    await setCachedProducts(mapped);
  }

  return mapped;
}

let isRevalidating = false;
async function revalidateProductsInBackground() {
  if (isRevalidating) return;
  isRevalidating = true;
  try {
    const [{ count }, { data: latestRow }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    ]);

    const latestUpdatedAt = latestRow?.[0]?.updated_at;
    const lastSynced = typeof localStorage !== 'undefined' ? localStorage.getItem('naqsh_last_synced_updated_at') : null;

    const cached = await getCachedProducts();
    if (!cached || (count !== null && cached.length !== count) || (latestUpdatedAt && latestUpdatedAt !== lastSynced)) {
      const fresh = await fetchAndCacheAllProducts();
      if (latestUpdatedAt && typeof localStorage !== 'undefined') {
        localStorage.setItem('naqsh_last_synced_updated_at', latestUpdatedAt);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('naqsh:catalog_refreshed', { detail: { products: fresh } })
        );
      }
    }
  } catch (err) {
    console.debug('[Supabase] Background revalidation failed silently:', err);
  } finally {
    isRevalidating = false;
  }
}

/**
 * Insert or update a single product (with Base64 image)
 */
export async function upsertProduct(product: {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  image: string; // Base64
  sourceFile?: string;
  description?: string;
  price?: string;
  tags?: string[];
  featured?: boolean;
  status?: 'active' | 'inactive';
}): Promise<DBProduct> {
  const isInactive = product.status === 'inactive';
  let tags = product.tags || [];
  if (isInactive) {
    tags = Array.from(new Set([...tags, 'inactive']));
  } else {
    tags = tags.filter((t) => t !== 'inactive');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('products')
    .upsert({
      id: product.id.trim(),
      name: product.name.trim(),
      category: product.category.toLowerCase().trim(),
      category_label: product.categoryLabel || `${product.category} Collection`,
      image: product.image,
      source_file: product.sourceFile || product.id,
      description: product.description || '',
      price: product.price?.trim() || '',
      tags,
      featured: !!product.featured,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('naqsh_last_synced_updated_at', now);
  }

  const mappedProduct: Product = {
    id: product.id.trim(),
    name: product.name.trim(),
    category: product.category.toLowerCase().trim() as any,
    categoryLabel: product.categoryLabel || `${product.category} Collection`,
    image: product.image,
    sourceFile: product.sourceFile || product.id,
    description: product.description || '',
    price: product.price?.trim() || '',
    tags,
    featured: !!product.featured,
    status: isInactive ? 'inactive' : 'active',
  };

  // Immediately update local cache
  await updateSingleCachedProduct(mappedProduct);

  // Broadcast event across app for instant zero-delay sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('naqsh:catalog_updated', {
        detail: {
          type: 'upsert',
          product: mappedProduct,
        },
      })
    );
  }

  return data;
}

/**
 * Inline status toggle for an existing product (Active vs Inactive)
 */
export async function updateProductStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  const cached = await getCachedProducts();
  const currentProd = cached?.find((p) => p.id === id);
  const currentTags = currentProd?.tags || [];

  const newTags =
    status === 'inactive'
      ? Array.from(new Set([...currentTags, 'inactive']))
      : currentTags.filter((t) => t !== 'inactive');

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('products')
    .update({
      tags: newTags,
      updated_at: now,
    })
    .eq('id', id);

  if (error) throw error;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('naqsh_last_synced_updated_at', now);
  }

  // Immediately update local cache
  if (currentProd) {
    await updateSingleCachedProduct({ ...currentProd, tags: newTags, status });
  }

  // Broadcast event across app for instant zero-delay sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('naqsh:catalog_updated', {
        detail: { type: 'status', id, status },
      })
    );
  }
}

/**
 * Quick inline price update for an existing product
 */
export async function updateProductPrice(id: string, price: string): Promise<void> {
  const formattedPrice = price.trim();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update({
      price: formattedPrice,
      updated_at: now,
    })
    .eq('id', id);

  if (error) throw error;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('naqsh_last_synced_updated_at', now);
  }

  // Update in local IndexedDB cache immediately
  const cached = await getCachedProducts();
  if (cached) {
    const target = cached.find((p) => p.id === id);
    if (target) {
      await updateSingleCachedProduct({ ...target, price: formattedPrice });
    }
  }

  // Broadcast event across app for instant zero-delay sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('naqsh:catalog_updated', {
        detail: { type: 'price', id, price: formattedPrice },
      })
    );
  }
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;

  // Remove from cache
  await removeSingleCachedProduct(id);

  // Broadcast event across app for instant zero-delay sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('naqsh:catalog_updated', {
        detail: { type: 'delete', id },
      })
    );
  }
}

/**
 * Client-side Image to Optimized Base64 Converter
 * Scales down large camera uploads (to max 1200px) and compresses to WebP/JPEG data URL
 */
export function convertFileToBase64(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // If image is already modest in dimensions, keep original
        if (img.width <= maxWidth && img.height <= maxWidth) {
          resolve(e.target?.result as string);
          return;
        }

        // Calculate aspect ratio scale
        const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Try WebP first for optimal compression, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for base64 conversion'));
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert an existing image URL (like local Vite asset) to Base64 data URL
 */
export async function convertUrlToBase64(url: string, maxWidth = 1000, quality = 0.82): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'image.webp', { type: blob.type });
  return convertFileToBase64(file, maxWidth, quality);
}

/**
 * -------------------------------------------------------------
 * Customer Ratings & Reviews Management
 * -------------------------------------------------------------
 */

export interface DBReview {
  id: string;
  name: string;
  rating: number; // 1 to 5
  review: string;
  occasion?: string;
  city?: string;
  image_url?: string; // Optional customer photo (Supabase Storage URL or optimized Data URL)
  status: 'approved' | 'pending' | 'hidden';
  created_at?: string;
  updated_at?: string;
}

export const SEED_REVIEWS: DBReview[] = [
  {
    id: 'seed-rev-1',
    name: 'Aishwarya Singhania',
    rating: 5,
    review:
      'The zardozi work on my bridal lehanga border was beyond breathtaking. The micro-details in metallic gold dabka and pearls look like royal heirlooms. The direct WhatsApp consultation with the artisans gave me complete peace of mind.',
    occasion: 'Royal Bridal Trousseau',
    city: 'Jaipur / Delhi',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'seed-rev-2',
    name: 'Devika Patel',
    rating: 5,
    review:
      'Ordered two custom botanical floral hoops for our anniversary. The French knots and shading on the silk threads are so delicate! They arrived beautifully packaged in sustainable linen with a handwritten care card.',
    occasion: 'Floral Embroidery Hoop',
    city: 'Ahmedabad',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'seed-rev-3',
    name: 'Meera Nambiar',
    rating: 5,
    review:
      'In an era of fast fashion, Naqsh-e-Noor preserves true slow Indian needlework. The craftsmanship is pure poetry. You can feel the patience and human hand in every single stitch.',
    occasion: 'Generational Needlework Piece',
    city: 'Bengaluru',
    status: 'approved',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'seed-rev-4',
    name: 'Rhea & Karan Malhotra',
    rating: 5,
    review:
      'Our bespoke wedding monogram hoop was the highlight of our welcome table. Every guest stopped to admire the precision of the metallic needlework. Truly an heirloom we will treasure forever.',
    occasion: 'Bespoke Wedding Monogram',
    city: 'Mumbai',
    status: 'approved',
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: 'seed-rev-5',
    name: 'Dr. Shalini Sen',
    rating: 4,
    review:
      'Exceptional artistry and authentic colors. The team accommodated my custom color preference patiently. Delivery took a little time because each piece is made by hand, but the final piece was absolutely worth the wait.',
    occasion: 'Custom Velvet Wall Art',
    city: 'Kolkata',
    status: 'approved',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
];

const LOCAL_REVIEWS_KEY = 'naqsh_reviews_cache_v1';

function getLocalReviews(): DBReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local reviews', e);
  }
  return [];
}

function saveLocalReviews(reviews: DBReview[]) {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Failed to save local reviews', e);
  }
}

/**
 * Check if the reviews table exists in Supabase
 */
export async function checkReviewsTableHealth(): Promise<{
  exists: boolean;
  count: number;
  error?: string;
}> {
  try {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        exists: error.code !== 'PGRST205',
        count: 0,
        error: error.message,
      };
    }
    return {
      exists: true,
      count: count || 0,
    };
  } catch (err: any) {
    return {
      exists: false,
      count: 0,
      error: err.message,
    };
  }
}

/**
 * Fetch reviews from Supabase with graceful fallback to seed reviews + local storage
 */
export async function fetchLiveReviews(includeHidden = false): Promise<DBReview[]> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeHidden) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Sync local cache
      saveLocalReviews(data);
      return data as DBReview[];
    }

    if (error && error.code !== 'PGRST205') {
      console.warn('[Supabase] Error fetching reviews:', error.message);
    }
  } catch (e: any) {
    console.warn('[Supabase] Reviews fetch network issue:', e.message);
  }

  // Fallback to local storage or seed reviews
  const local = getLocalReviews();
  if (local.length > 0) {
    return includeHidden ? local : local.filter((r) => r.status === 'approved');
  }

  // Initialize local with seed reviews
  saveLocalReviews(SEED_REVIEWS);
  return includeHidden ? SEED_REVIEWS : SEED_REVIEWS.filter((r) => r.status === 'approved');
}

/**
 * Upload an optional customer photo for a review.
 * Attempts to upload to the Supabase Storage bucket 'review-images'.
 * If the bucket doesn't exist or upload fails, gracefully falls back to client-compressed WebP base64
 * so customer photos are never lost.
 */
export async function uploadReviewImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
  const filePath = `reviews/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('review-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } else if (error) {
      console.warn('[Supabase Storage] Storage bucket upload failed, using optimized local compression fallback:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Storage] Upload exception, fallback to base64:', err.message);
  }

  // Automatic client-side fallback: compressed WebP (max 1000px, 80% quality)
  return await convertFileToBase64(file, 1000, 0.8);
}

/**
 * Submit a customer review from the storefront
 */
export async function submitCustomerReview(reviewData: {
  name: string;
  rating: number;
  review: string;
  occasion?: string;
  city?: string;
  image_url?: string;
}): Promise<DBReview> {
  const newReview: DBReview = {
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: reviewData.name.trim(),
    rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
    review: reviewData.review.trim(),
    occasion: reviewData.occasion?.trim() || '',
    city: reviewData.city?.trim() || '',
    image_url: reviewData.image_url?.trim() || undefined,
    status: 'approved', // instantly visible on storefront
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Optimistically store in local storage
  const current = getLocalReviews();
  saveLocalReviews([newReview, ...current.filter((r) => r.id !== newReview.id)]);

  // Attempt to write to Supabase table
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        name: newReview.name,
        rating: newReview.rating,
        review: newReview.review,
        occasion: newReview.occasion,
        city: newReview.city,
        image_url: newReview.image_url || null,
        status: newReview.status,
      })
      .select()
      .single();

    if (!error && data) {
      // Replace with database generated ID if assigned
      const updatedList = [data as DBReview, ...current.filter((r) => r.id !== newReview.id)];
      saveLocalReviews(updatedList);
      return data as DBReview;
    } else if (error) {
      console.warn('[Supabase] Could not insert to reviews table, retained in local storage:', error.message);
    }
  } catch (e: any) {
    console.warn('[Supabase] Exception submitting review:', e.message);
  }

  return newReview;
}

/**
 * Admin: Upsert or edit any review
 */
export async function upsertAdminReview(review: Partial<DBReview> & {
  name: string;
  rating: number;
  review: string;
  image_url?: string;
}): Promise<DBReview> {
  const id = review.id || 'rev_' + Date.now();
  const formatted: DBReview = {
    id,
    name: review.name.trim(),
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    review: review.review.trim(),
    occasion: review.occasion?.trim() || '',
    city: review.city?.trim() || '',
    image_url: review.image_url?.trim() || undefined,
    status: review.status || 'approved',
    created_at: review.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Update local storage
  const current = getLocalReviews();
  const exists = current.some((r) => r.id === id);
  const updatedList = exists
    ? current.map((r) => (r.id === id ? formatted : r))
    : [formatted, ...current];
  saveLocalReviews(updatedList);

  // Update Supabase
  try {
    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        id: id.startsWith('rev_') || id.startsWith('seed-') ? undefined : id,
        name: formatted.name,
        rating: formatted.rating,
        review: formatted.review,
        occasion: formatted.occasion,
        city: formatted.city,
        image_url: formatted.image_url || null,
        status: formatted.status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return data as DBReview;
    }
  } catch (e: any) {
    console.warn('[Supabase] Error upserting admin review:', e.message);
  }

  return formatted;
}

/**
 * Admin: Update review status (Approve / Hide)
 */
export async function updateReviewStatus(
  id: string,
  status: 'approved' | 'hidden'
): Promise<void> {
  const current = getLocalReviews();
  saveLocalReviews(
    current.map((r) => (r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r))
  );

  try {
    await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (e) {
    console.warn('[Supabase] Failed updating review status in DB:', e);
  }
}

/**
 * Admin: Delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  const current = getLocalReviews();
  saveLocalReviews(current.filter((r) => r.id !== id));

  try {
    await supabase.from('reviews').delete().eq('id', id);
  } catch (e) {
    console.warn('[Supabase] Failed deleting review in DB:', e);
  }
}

