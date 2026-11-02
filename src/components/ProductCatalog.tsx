import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, RefreshCw, Shuffle } from 'lucide-react';
import { allProducts, Product, CategoryKey } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  onViewProduct: (product: Product) => void;
  onInquireProduct: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  selectedCategory,
  onSelectCategory,
  onViewProduct,
  onInquireProduct,
  searchQuery,
  onSearchChange,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'id-asc' | 'id-desc'>('default');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [showAllInAllTab, setShowAllInAllTab] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Check if we are in curated random preview mode for "All Designs"
  const isCuratedAllMode = selectedCategory === 'all' && !searchQuery.trim() && !showAllInAllTab;

  // Stable curated random selection across all categories (12 pieces: balanced representation across all 5 categories)
  const curatedRandomProducts = useMemo(() => {
    const categories: CategoryKey[] = ['bridal', 'embroidery', 'floral', 'hoop', 'hues'];
    const poolByCategory: Record<string, Product[]> = {};

    categories.forEach((cat) => {
      poolByCategory[cat] = [...allProducts.filter((p) => p.category === cat)].sort(() => Math.random() - 0.5);
    });

    const selected: Product[] = [];
    let catIndex = 0;

    // Round-robin selection across all 5 categories up to 12 items (guarantees every category is represented)
    while (selected.length < 12) {
      const cat = categories[catIndex % categories.length];
      const pool = poolByCategory[cat];
      if (pool && pool.length > 0) {
        selected.push(pool.pop()!);
      }
      catIndex++;
      if (Object.values(poolByCategory).every((p) => p.length === 0)) break;
    }

    // Interleave and randomize the final display order
    return selected.sort(() => Math.random() - 0.5);
  }, [shuffleSeed]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    // If in Curated "All Designs" mode without search
    if (isCuratedAllMode) {
      let result = [...curatedRandomProducts];
      if (sortBy === 'id-asc') {
        result.sort((a, b) => a.id.localeCompare(b.id));
      } else if (sortBy === 'id-desc') {
        result.sort((a, b) => b.id.localeCompare(a.id));
      }
      return result;
    }

    let result = allProducts;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sourceFile.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'id-asc') {
      result = [...result].sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'id-desc') {
      result = [...result].sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy, isCuratedAllMode, curatedRandomProducts]);

  const displayedProducts = useMemo(() => {
    if (isCuratedAllMode) {
      return filteredProducts;
    }
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount, isCuratedAllMode]);

  // Category filters with dynamic counts
  const categoryFilters: { key: CategoryKey; label: string; count: number }[] = [
    {
      key: 'all',
      label: 'All Designs',
      count: isCuratedAllMode ? 12 : (searchQuery.trim() ? filteredProducts.length : allProducts.length),
    },
    { key: 'bridal', label: 'Bridal', count: allProducts.filter((p) => p.category === 'bridal').length },
    { key: 'embroidery', label: 'Embroidery', count: allProducts.filter((p) => p.category === 'embroidery').length },
    { key: 'floral', label: 'Floral', count: allProducts.filter((p) => p.category === 'floral').length },
    { key: 'hoop', label: 'Hoop Art', count: allProducts.filter((p) => p.category === 'hoop').length },
    { key: 'hues', label: 'Hues', count: allProducts.filter((p) => p.category === 'hues').length },
  ];

  const handleClearFilters = () => {
    onSelectCategory('all');
    onSearchChange('');
    setShowAllInAllTab(false);
    setVisibleCount(24);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 24, filteredProducts.length));
  };

  const handleShowAll = () => {
    setVisibleCount(filteredProducts.length);
  };

  return (
    <section id="catalog" className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-warm-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-espresso leading-tight">
            The Complete <span className="font-bold italic text-gold">Catalog</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-3" />
          <p className="text-sm sm:text-base text-espresso/80 font-medium">
            {isCuratedAllMode
              ? 'A curated cross-category spotlight across our collections. Select any collection tab below to explore full archives.'
              : selectedCategory === 'all'
              ? `Browse our full archive of ${allProducts.length} handcrafted creations. Inquire directly about any piece on WhatsApp.`
              : `Explore our collection of handcrafted ${
                  selectedCategory === 'bridal'
                    ? 'bridal heirlooms'
                    : selectedCategory === 'embroidery'
                    ? 'embroidery artistry'
                    : selectedCategory === 'floral'
                    ? 'floral botanicals'
                    : selectedCategory === 'hoop'
                    ? 'artisan hoop frames'
                    : 'tonal hue compositions'
                }. Inquire directly on WhatsApp.`}
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-cream p-4 sm:p-6 rounded-xl border border-champagne/80 shadow-sm mb-10 space-y-4">
          
          {/* Top row: Search and Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Search Input (16px base on mobile avoids iOS safari zoom) */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-espresso/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setVisibleCount(24);
                }}
                placeholder="Search by ID (e.g. BRD-001) or collection..."
                className="w-full pl-10 pr-9 py-2.5 bg-warm-ivory/60 border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:bg-warm-ivory focus:border-gold focus:outline-none transition-colors"
                aria-label="Search catalog"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/50 hover:text-espresso p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Shuffle Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 justify-between sm:justify-end w-full sm:w-auto">
              {isCuratedAllMode && (
                <button
                  onClick={() => setShuffleSeed((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-warm-ivory border border-champagne hover:border-gold hover:text-gold text-espresso text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
                  title="Shuffle random creations across all categories"
                >
                  <Shuffle className="w-3.5 h-3.5 text-gold" />
                  <span>Shuffle Mix</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                <span className="text-xs uppercase tracking-wider text-muted-brown font-medium flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="py-2 px-2.5 sm:px-3 bg-warm-ivory/80 border border-champagne rounded-lg text-xs font-medium text-espresso focus:outline-none focus:border-gold"
                  aria-label="Sort products"
                >
                  <option value="default">Curated</option>
                  <option value="id-asc">ID (Asc)</option>
                  <option value="id-desc">ID (Desc)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom row: Category Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none touch-pan-x" role="tablist" aria-label="Category filters">
            {categoryFilters.map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    onSelectCategory(tab.key);
                    setShowAllInAllTab(false);
                    setVisibleCount(24);
                  }}
                  className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 sm:gap-2 focus:outline-none ${
                    isActive
                      ? 'bg-gold text-warm-ivory shadow-sm'
                      : 'bg-warm-ivory hover:bg-champagne/40 text-espresso/80 border border-champagne/60'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9.5px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-warm-ivory/25 text-warm-ivory' : 'bg-champagne/60 text-espresso/70'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Status & Active Search Indicators */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center justify-between pt-2 border-t border-champagne/40 text-xs text-muted-brown">
              <div className="flex items-center gap-2">
                <span>Showing {filteredProducts.length} matching pieces</span>
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-champagne text-espresso font-medium">
                    Search: "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-gold hover:text-gold-dark font-medium underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewProduct}
                  onQuickInquire={onInquireProduct}
                />
              ))}
            </div>

            {/* Standard Pagination Controls for specific categories */}
            {!isCuratedAllMode && visibleCount < filteredProducts.length && (
              <div className="mt-14 text-center space-y-4">
                <p className="text-xs text-muted-brown">
                  Showing <span className="font-bold text-espresso">{visibleCount}</span> of{' '}
                  <span className="font-bold text-espresso">{filteredProducts.length}</span> handcrafted creations
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-champagne hover:bg-gold text-espresso hover:text-warm-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded transition-colors shadow-sm focus:outline-none"
                  >
                    Load Next 24 Designs
                  </button>
                  <button
                    onClick={handleShowAll}
                    className="px-5 py-3 bg-transparent hover:bg-champagne/30 text-espresso text-xs sm:text-sm font-semibold tracking-wider uppercase rounded border border-champagne transition-colors focus:outline-none"
                  >
                    Show All ({filteredProducts.length})
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 bg-cream rounded-xl border border-champagne/70 p-8">
            <p className="font-serif text-2xl text-espresso mb-2">No creations found</p>
            <p className="text-sm text-muted-brown max-w-md mx-auto mb-6">
              We couldn't find any designs matching "{searchQuery}". Try searching for product identifiers like{' '}
              <span className="font-mono font-medium text-espresso">BRD-001</span>, or browse by collection.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs uppercase tracking-wider font-semibold rounded shadow-sm focus:outline-none"
            >
              Reset Filters &amp; View All
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

