import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { allProducts, INSTAGRAM_URL, INSTAGRAM_HANDLE, Product } from '../data/products';

interface InstagramShowcaseProps {
  onSelectProduct: (product: Product) => void;
}

export const InstagramShowcase: React.FC<InstagramShowcaseProps> = ({ onSelectProduct }) => {
  // Select 6 stunning authentic products across categories
  const instagramMosaic: Product[] = [
    allProducts.find((p) => p.id === 'BRD-003') || allProducts[0],
    allProducts.find((p) => p.id === 'EMB-005') || allProducts[15],
    allProducts.find((p) => p.id === 'FLR-012') || allProducts[40],
    allProducts.find((p) => p.id === 'HOP-007') || allProducts[80],
    allProducts.find((p) => p.id === 'HUE-011') || allProducts[100],
    allProducts.find((p) => p.id === 'FLR-028') || allProducts[55],
  ];

  return (
    <section className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-warm-ivory border-t border-champagne/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-espresso leading-tight">
            Follow Our <span className="font-bold italic text-gold">Creative Journey</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-3" />
          <p className="text-sm sm:text-base text-espresso/80 font-medium">
            Discover more handcrafted details, fresh designs, and creative inspiration on Instagram.
          </p>
        </div>

        {/* 6-Image Mosaic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {instagramMosaic.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectProduct(item)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-champagne-light border border-champagne/70 shadow-sm hover:shadow-luxury transition-all duration-300"
              role="button"
              tabIndex={0}
              aria-label={`View ${item.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct(item);
                }
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Mobile permanent touch badge (Since touch screens don't have hover) */}
              <div className="sm:hidden absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-espresso-dark/80 text-champagne text-[8.5px] font-semibold tracking-wider uppercase backdrop-blur-xs">
                {item.id}
              </div>

              {/* Hover overlay with Instagram icon & design ID */}
              <div className="absolute inset-0 bg-espresso-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-2 text-center text-warm-ivory">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-gold mb-1 sm:mb-1.5" />
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-champagne">
                  {item.id}
                </span>
                <span className="text-[9.5px] sm:text-[10px] text-warm-ivory/80 font-serif italic truncate max-w-[90%]">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram CTA Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-espresso hover:bg-espresso-dark text-warm-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-lg border border-champagne hover:border-gold transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            <Instagram className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
            <span>Follow {INSTAGRAM_HANDLE}</span>
            <ArrowUpRight className="w-4 h-4 text-champagne transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <p className="text-xs text-muted-brown mt-2.5">
            Join our community of embroidery art enthusiasts and connoisseurs
          </p>
        </div>

      </div>
    </section>
  );
};

