import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, allProducts as fallbackProducts, collections as fallbackCollections } from '../data/products';
import { fetchLiveProducts, fetchLiveCategories, checkDatabaseHealth, DBCategory } from '../services/supabase';

export interface CategoryInfo {
  key: string;
  label: string;
  count: number;
  description?: string;
}

interface CatalogContextType {
  products: Product[];
  categories: CategoryInfo[];
  loading: boolean;
  isDbConnected: boolean;
  refreshCatalog: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const health = await checkDatabaseHealth();
      setIsDbConnected(health.connected);

      if (health.connected && health.productsTableExists && health.productCount > 0) {
        const [liveProds, liveCats] = await Promise.all([
          fetchLiveProducts().catch(() => []),
          fetchLiveCategories().catch(() => []),
        ]);

        if (liveProds.length > 0) {
          setProducts(liveProds);
        }
        if (liveCats.length > 0) {
          setDbCategories(liveCats);
        }
      } else {
        // Fallback to static catalog if DB not populated yet
        setProducts(fallbackProducts);
      }
    } catch (err) {
      console.warn('[CatalogContext] Using fallback local catalog:', err);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Compute dynamic category info with counts
  const categories: CategoryInfo[] = React.useMemo(() => {
    const countsByCategory: Record<string, number> = {};
    products.forEach((p) => {
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
  }, [products, dbCategories]);

  return (
    <CatalogContext.Provider
      value={{
        products,
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
