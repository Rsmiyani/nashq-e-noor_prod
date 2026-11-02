import { createClient } from '@supabase/supabase-js';
import { Product } from '../data/products';

// Read from Vite env or localStorage override if admin entered them in the browser
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('naqsh_supabase_url') ||
  'https://pjfkocskpqeopentiqsj.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('naqsh_supabase_anon_key') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZmtvY3NrcHFlb3BlbnRpcXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTYxMjAsImV4cCI6MjEwOTE5MjEyMH0.qlPPo7ya9G1Kun8wugxI5yhT0yuoSJRpRS91ptX_Vaw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DBCategory {
  id: string; // e.g. 'bridal', 'embroidery', etc.
  label: string; // e.g. 'Bridal', 'Embroidery'
  description?: string;
  display_order?: number;
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
  display_order?: number;
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
 * Fetch all categories from Supabase
 */
export async function fetchLiveCategories(): Promise<DBCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.warn('[Supabase] Error fetching categories, using fallback:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Create or update a category
 */
export async function upsertCategory(cat: {
  id: string;
  label: string;
  description?: string;
  display_order?: number;
}): Promise<DBCategory> {
  const { data, error } = await supabase
    .from('categories')
    .upsert({
      id: cat.id.toLowerCase().trim(),
      label: cat.label.trim(),
      description: cat.description || '',
      display_order: cat.display_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all products from Supabase
 */
export async function fetchLiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.warn('[Supabase] Error fetching products, using fallback:', error.message);
    throw error;
  }

  // Map DB format to storefront Product format
  return (data || []).map((row: DBProduct) => ({
    id: row.id,
    name: row.name,
    category: row.category as any,
    categoryLabel: row.category_label || `${row.category.charAt(0).toUpperCase() + row.category.slice(1)} Collection`,
    image: row.image,
    sourceFile: row.source_file || row.id,
    description: row.description || '',
    price: row.price || '', // empty if not set
    tags: row.tags || [],
    featured: !!row.featured,
  }));
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
}): Promise<DBProduct> {
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
      tags: product.tags || [],
      featured: !!product.featured,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Quick inline price update for an existing product
 */
export async function updateProductPrice(id: string, price: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      price: price.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
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
