import React, { useState } from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickInquire: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onQuickInquire,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-cream rounded-lg overflow-hidden border border-champagne/70 hover:border-gold/60 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col h-full">
      {/* Image Container with 4:5 or 1:1 Aspect Ratio */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-champagne-light cursor-pointer select-none"
        onClick={() => onViewDetails(product)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(product);
          }
        }}
      >
        {/* Skeleton Shimmer when loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-champagne/30 animate-pulse flex items-center justify-center">
            <span className="text-xs text-muted-brown/60 tracking-wider font-serif italic">Naqsh-e-Noor</span>
          </div>
        )}

        {/* Product Image */}
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-champagne-light text-muted-brown">
            <span className="font-serif text-sm">Image unavailable</span>
            <span className="text-xs text-muted-brown/70 mt-1">{product.id}</span>
          </div>
        )}

        {/* Top Badges: Category & ID */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-warm-ivory/90 backdrop-blur-sm text-[9.5px] sm:text-[11px] font-semibold tracking-wider text-espresso shadow-xs border border-champagne/60">
            {product.id}
          </span>
          {product.featured && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded bg-gold text-warm-ivory text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Curated
            </span>
          )}
        </div>

        {/* Hover Overlay Button to View Details */}
        <div className="absolute inset-0 bg-espresso-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-warm-ivory hover:bg-cream text-espresso text-[11px] sm:text-xs font-semibold tracking-wider uppercase rounded shadow-md transition-transform transform translate-y-2 group-hover:translate-y-0 duration-200 flex items-center gap-1.5 focus:outline-none"
            aria-label={`Inspect ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5 text-gold" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 xs:p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-brown mb-1 sm:mb-1.5">
            <span className="capitalize tracking-wider text-[9.5px] sm:text-[11px] font-semibold text-sage truncate max-w-[65%]">
              {product.category}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-brown font-medium">
              {product.sourceFile}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="font-serif text-sm xs:text-base sm:text-xl font-semibold text-espresso hover:text-gold transition-colors cursor-pointer line-clamp-1 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-espresso/80 font-normal mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed hidden xs:block">
            {product.description}
          </p>
        </div>

        {/* Bottom Price & Inquiry CTA */}
        <div className="pt-2 sm:pt-4 mt-2 sm:mt-3 border-t border-champagne/40 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-brown font-semibold leading-tight">
              Inquiry
            </span>
            <span className="text-[11px] sm:text-xs font-serif italic text-espresso font-semibold leading-snug truncate max-w-[120px]">
              {product.price && product.price.trim() !== '' ? product.price : 'Price upon request'}
            </span>
          </div>

          <button
            onClick={() => onQuickInquire(product)}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-champagne hover:bg-gold text-espresso hover:text-warm-ivory text-[10px] sm:text-xs font-semibold tracking-wider uppercase rounded transition-colors duration-200 focus:outline-none"
            title={`Inquire about ${product.id} on WhatsApp`}
            aria-label={`Inquire about ${product.id} on WhatsApp`}
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold group-hover:text-warm-ivory" />
            <span>Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};

