import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../data/products';
import { useCatalog } from '../context/CatalogContext';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products: allProducts } = useCatalog();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allProducts
      .filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sourceFile.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 p-3 sm:p-6 flex items-start justify-center bg-espresso-dark/70 backdrop-blur-sm animate-fade-in pt-12 sm:pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick search"
    >
      <div
        className="bg-cream rounded-2xl max-w-2xl w-full overflow-hidden shadow-modal border border-champagne text-espresso flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-champagne flex items-center gap-3">
          <Search className="w-5 h-5 text-gold flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID (e.g. BRD-001, FLR-010) or collection..."
            className="w-full bg-transparent text-base sm:text-lg text-espresso placeholder:text-muted-brown/60 focus:outline-none"
            aria-label="Search"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-espresso/50 hover:text-espresso"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-espresso/60 hover:text-espresso rounded focus:outline-none"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-muted-brown">
              <Sparkles className="w-6 h-6 text-gold mx-auto mb-2 opacity-60" />
              <p className="text-sm font-serif">Search through our 118 handcrafted designs</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {['BRD-001', 'EMB-003', 'FLR-008', 'HOP-001', 'HUE-007'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded bg-warm-ivory text-xs font-mono text-espresso hover:bg-champagne/40 border border-champagne transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-brown uppercase tracking-wider font-semibold mb-2">
                Matching Creations ({results.length})
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-champagne/30 cursor-pointer border border-transparent hover:border-champagne/60 transition-colors group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover border border-champagne"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold">
                        {product.id}
                      </span>
                      <span className="text-[11px] text-muted-brown">
                        {product.categoryLabel}
                      </span>
                    </div>
                    <p className="font-serif text-sm font-semibold text-espresso truncate">
                      {product.name}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-espresso/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-brown">
              <p className="text-sm">No creations matched "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

