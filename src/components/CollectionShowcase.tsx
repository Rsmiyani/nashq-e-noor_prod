import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { allProducts, CategoryKey } from '../data/products';

interface CollectionShowcaseProps {
  onSelectCollection: (category: CategoryKey) => void;
}

interface ShowcaseCardProps {
  categoryKey: CategoryKey;
  title: string;
  itemCountLabel: string;
  microSubtitle: string;
  images: string[];
  intervalMs: number;
  isFeatured?: boolean;
  onSelect: (key: CategoryKey) => void;
}

// Reusable card that automatically cycles through its category photos with a smooth crossfade
const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  categoryKey,
  title,
  itemCountLabel,
  microSubtitle,
  images,
  intervalMs,
  isFeatured = false,
  onSelect,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Automatically cycle photos every intervalMs
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images, intervalMs]);

  return (
    <div
      onClick={() => onSelect(categoryKey)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-espresso-dark border border-champagne/70 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-end ${
        isFeatured
          ? 'lg:col-span-5 min-h-[460px] lg:min-h-full'
          : 'min-h-[290px] sm:min-h-[280px]'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(categoryKey);
        }
      }}
      aria-label={`Explore ${title} (${itemCountLabel})`}
    >
      {/* Auto-cycling Category Photography with Smooth Crossfade */}
      <div className="absolute inset-0 bg-espresso-dark overflow-hidden">
        {images.map((imgUrl, idx) => {
          const isVisible = idx === currentIdx;
          return (
            <img
              key={imgUrl}
              src={imgUrl}
              alt={`${title} handcrafted design`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                isVisible
                  ? 'opacity-90 group-hover:opacity-100 scale-100 group-hover:scale-105'
                  : 'opacity-0 scale-100 pointer-events-none'
              } transition-transform duration-700`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          );
        })}

        {/* Cinematic Gradient: Darker at bottom for text readability, clear at top to showcase the embroidery */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-dark via-espresso-dark/45 to-transparent pointer-events-none" />
      </div>

      {/* Floating Micro Badge: Count on Top Right */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-espresso-dark/75 backdrop-blur-md border border-champagne/35 text-[10.5px] text-champagne font-semibold tracking-wider shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        <span>{itemCountLabel}</span>
      </div>

      {/* Reduced, Clean Bottom Content Overlay */}
      <div className="relative z-10 p-5 sm:p-6 lg:p-7 text-warm-ivory mt-auto">
        {isFeatured && (
          <div className="inline-block px-2.5 py-0.5 rounded bg-gold text-warm-ivory text-[10.5px] font-bold uppercase tracking-wider mb-2 shadow-xs">
            Featured Atelier
          </div>
        )}

        {/* Clean Title - 'Collection' removed */}
        <h3
          className={`font-serif font-bold text-warm-ivory tracking-wide group-hover:text-champagne transition-colors ${
            isFeatured
              ? 'text-3xl sm:text-4xl lg:text-[2.6rem] mb-1.5 leading-tight'
              : 'text-2xl sm:text-2xl mb-1 leading-snug'
          }`}
        >
          {title}
        </h3>

        {/* Reduced Text: Crisp single micro-phrase without truncation or ellipses */}
        <p className="text-xs text-champagne/90 font-medium mb-3.5 line-clamp-1 leading-snug">
          {microSubtitle}
        </p>

        {/* Clear Action Link */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold group-hover:text-warm-ivory transition-colors">
          <span>{isFeatured ? 'Explore Pieces' : 'View Pieces'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
};

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  onSelectCollection,
}) => {
  // Pre-filter authentic category images from the catalog (curating up to 10 photos per card)
  const categoryImages = useMemo(() => {
    return {
      bridal: allProducts.filter((p) => p.category === 'bridal').map((p) => p.image).slice(0, 10),
      embroidery: allProducts.filter((p) => p.category === 'embroidery').map((p) => p.image).slice(0, 10),
      floral: allProducts.filter((p) => p.category === 'floral').map((p) => p.image).slice(0, 10),
      hoop: allProducts.filter((p) => p.category === 'hoop').map((p) => p.image).slice(0, 10),
      hues: allProducts.filter((p) => p.category === 'hues').map((p) => p.image).slice(0, 10),
    };
  }, []);

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
          
          {/* Featured Large Card: Bridal (Auto-cycling through bridal pieces) */}
          <ShowcaseCard
            categoryKey="bridal"
            title="Bridal"
            itemCountLabel="14 Curated Pieces"
            microSubtitle="Heirloom zardozi, rich velvet & metallic dabka"
            images={categoryImages.bridal}
            intervalMs={4500}
            isFeatured={true}
            onSelect={onSelectCollection}
          />

          {/* 4 Complementary Collection Cards in a 2x2 Grid (Each auto-cycling through its category photos) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ShowcaseCard
              categoryKey="embroidery"
              title="Embroidery"
              itemCountLabel="27 Designs"
              microSubtitle="Generational stitches & pure silk threadwork"
              images={categoryImages.embroidery}
              intervalMs={3900}
              onSelect={onSelectCollection}
            />

            <ShowcaseCard
              categoryKey="floral"
              title="Floral"
              itemCountLabel="35 Designs"
              microSubtitle="Blooming botanical tapestries & garden motifs"
              images={categoryImages.floral}
              intervalMs={4700}
              onSelect={onSelectCollection}
            />

            <ShowcaseCard
              categoryKey="hoop"
              title="Hoops"
              itemCountLabel="18 Designs"
              microSubtitle="Artisan circular wall hoops & linen frames"
              images={categoryImages.hoop}
              intervalMs={4200}
              onSelect={onSelectCollection}
            />

            <ShowcaseCard
              categoryKey="hues"
              title="Hues"
              itemCountLabel="24 Designs"
              microSubtitle="Harmonious chromatic gradients & tonal blends"
              images={categoryImages.hues}
              intervalMs={4400}
              onSelect={onSelectCollection}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
