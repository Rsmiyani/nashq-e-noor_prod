import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { collections, CategoryKey } from '../data/products';

interface CollectionShowcaseProps {
  onSelectCollection: (category: CategoryKey) => void;
}

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  onSelectCollection,
}) => {
  const featured = collections[0]; // Bridal
  const others = collections.slice(1);

  return (
    <section id="collections" className="pt-8 sm:pt-12 pb-16 sm:pb-20 bg-champagne-light/50 border-y border-champagne/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-espresso leading-tight">
            Explore Our <span className="font-bold italic text-gold">Collections</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-3" />
          <p className="text-sm sm:text-base text-espresso/80 font-medium">
            Discover handcrafted artistry in every detail. Five distinct worlds of slow needlework.
          </p>
        </div>

        {/* Editorial Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Featured Large Card (Bridal Collection) */}
          <div
            onClick={() => onSelectCollection(featured.key)}
            className="lg:col-span-5 group relative rounded-xl overflow-hidden cursor-pointer bg-cream border border-champagne/80 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-end min-h-[460px] lg:min-h-full"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCollection(featured.key);
              }
            }}
            aria-label={`Explore ${featured.title} (${featured.itemCount} designs)`}
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 image-zoom-container bg-espresso-dark">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-dark via-espresso-dark/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-6 sm:p-8 text-warm-ivory mt-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-gold text-warm-ivory text-xs font-semibold uppercase tracking-wider">
                  Featured Atelier
                </span>
                <span className="text-xs text-champagne font-medium tracking-wide">
                  {featured.itemCount} Curated Pieces
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-warm-ivory mb-2 group-hover:text-champagne transition-colors">
                {featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-champagne/90 mb-5 line-clamp-2 leading-relaxed font-normal">
                {featured.description}
              </p>

              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-warm-ivory group-hover:text-gold transition-colors">
                <span>Explore Collection</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* 4 Complementary Collection Cards in a 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {others.map((col) => (
              <div
                key={col.key}
                onClick={() => onSelectCollection(col.key)}
                className="group relative rounded-xl overflow-hidden cursor-pointer bg-cream border border-champagne/70 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col justify-end min-h-[300px] sm:min-h-[280px]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCollection(col.key);
                  }
                }}
                aria-label={`Explore ${col.title} (${col.itemCount} designs)`}
              >
                <div className="absolute inset-0 image-zoom-container bg-espresso-dark">
                  <img
                    src={col.coverImage}
                    alt={col.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-dark via-espresso-dark/50 to-transparent" />
                </div>

                <div className="relative z-10 p-5 sm:p-6 text-warm-ivory mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-gold">
                      Collection
                    </span>
                    <span className="text-[11px] text-champagne/80 font-medium">
                      {col.itemCount} Designs
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-warm-ivory mb-1.5 group-hover:text-champagne transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-champagne/90 line-clamp-2 leading-relaxed mb-4 font-normal">
                    {col.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-warm-ivory group-hover:text-gold transition-colors">
                    <span>View Pieces</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

