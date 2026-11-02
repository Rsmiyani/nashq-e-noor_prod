import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, collections as fallbackCollections } from '../data/products';
import {
  fetchLiveProducts,
  fetchLiveCategories,
  checkDatabaseHealth,
  supabase,
  DBCategory,
  DBProduct,
} from '../services/supabase';
import { getCachedProducts, updateSingleCachedProduct, removeSingleCachedProduct } from '../services/cache';

export interface CategoryInfo {
  key: string;
  label: string;
  count: number;
  description?: string;
}

interface CatalogContextType {
  products: Product[]; // Active products for the public storefront
  allProducts: Product[]; // All products including inactive
  categories: CategoryInfo[];
  loading: boolean;
  isDbConnected: boolean;
  refreshCatalog: (forceFresh?: boolean) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  const refreshCatalog = useCallback(async (forceFresh = false) => {
    try {
      setLoading(true);
      const health = await checkDatabaseHealth();
      setIsDbConnected(health.connected);

      if (health.connected && health.productsTableExists && health.productCount > 0) {
        const [liveProds, liveCats] = await Promise.all([
          fetchLiveProducts(forceFresh).catch(() => []),
          fetchLiveCategories(forceFresh).catch(() => []),
        ]);

        if (liveProds.length > 0) {
          setProducts(liveProds);
        }
        if (liveCats.length > 0) {
          setDbCategories(liveCats);
        }
      }
    } catch (err) {
      console.warn('[CatalogContext] Error loading Supabase products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Initial Load: Read from client cache immediately (<10ms) then fetch live from Supabase
  useEffect(() => {
    getCachedProducts().then((cached) => {
      if (cached && cached.length > 0) {
        setProducts(cached);
        setLoading(false);
      }
    });

    refreshCatalog();
  }, [refreshCatalog]);

  // 2. Real-Time In-App Event Listener (Instant UI update when admin changes price, status, or edits a product)
  useEffect(() => {
    const handleCatalogUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      if (detail.type === 'price') {
        const { id, price } = detail;
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, price } : p))
        );
      } else if (detail.type === 'status') {
        const { id, status } = detail;
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
      } else if (detail.type === 'upsert') {
        const { product } = detail;
        setProducts((prev) => {
          const index = prev.findIndex((p) => p.id === product.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = product;
            return updated;
          }
          return [product, ...prev];
        });
      } else if (detail.type === 'delete') {
        const { id } = detail;
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    };

    const handleCatalogRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.products?.length > 0) {
        setProducts(customEvent.detail.products);
      }
    };

    window.addEventListener('naqsh:catalog_updated', handleCatalogUpdate);
    window.addEventListener('naqsh:catalog_refreshed', handleCatalogRefreshed);

    return () => {
      window.removeEventListener('naqsh:catalog_updated', handleCatalogUpdate);
      window.removeEventListener('naqsh:catalog_refreshed', handleCatalogRefreshed);
    };
  }, []);

  // 3. Supabase Realtime Postgres Changes Listener (Multi-tab & cross-device instant sync)
  useEffect(() => {
    const channel = supabase
      .channel('public:products:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const row = payload.new as DBProduct;
            const isInactive = Array.isArray(row.tags) && row.tags.includes('inactive');
            const updated: Product = {
              id: row.id,
              name: row.name,
              category: row.category as any,
              categoryLabel: row.category_label || `${row.category} Collection`,
              image: row.image,
              sourceFile: row.source_file || row.id,
              description: row.description || '',
              price: row.price || '',
              tags: row.tags || [],
              featured: !!row.featured,
              status: isInactive ? 'inactive' : 'active',
            };
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            updateSingleCachedProduct(updated);
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            refreshCatalog(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshCatalog]);

  // Filter active products so public storefront only displays active creations
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'inactive');
  }, [products]);

  // Compute dynamic category info with counts based on active creations
  const categories: CategoryInfo[] = useMemo(() => {
    const countsByCategory: Record<string, number> = {};
    activeProducts.forEach((p) => {
      countsByCategory[p.category] = (countsByCategory[p.category] || 0) + 1;
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        key: c.id,
        label: c.label,
        count: countsByCategory[c.id] || 0,
        description: c.description,
      }));
    }

    // Default fallback categories
    return fallbackCollections.map((c) => ({
      key: c.key,
      label: c.title,
      count: countsByCategory[c.key] || 0,
      description: c.description,
    }));
  }, [activeProducts, dbCategories]);

  return (
    <CatalogContext.Provider
      value={{
        products: activeProducts,
        allProducts: products,
        categories,
        loading,
        isDbConnected,
        refreshCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};

