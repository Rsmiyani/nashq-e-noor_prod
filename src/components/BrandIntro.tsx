import React from 'react';
import { brandAssets } from '../data/products';
import { Sparkles, Heart, Feather, ArrowRight } from 'lucide-react';

interface BrandIntroProps {
  onExploreClick: () => void;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onExploreClick }) => {
  return (
    <section
      id="about"
      className="py-6 sm:py-8 lg:py-10 bg-warm-ivory relative overflow-hidden flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left Column: Text & Editorial Statement */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-3.5 text-center lg:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-espresso leading-tight">
              Welcome to <span className="font-bold italic text-gold">Naqsh-e-Noor</span>
            </h2>

            {/* Antique Gold Divider Line */}
            <div className="flex items-center justify-center lg:justify-start gap-3 py-0.5">
              <div className="w-10 h-px bg-gold" />
              <div className="w-1.5 h-1.5 rotate-45 border border-gold bg-warm-ivory" />
              <div className="w-10 h-px bg-gold" />
            </div>

            <p className="text-xs sm:text-sm lg:text-base text-espresso/90 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Where thoughtful design meets the beauty of handcrafted embroidery. Explore creations
              shaped by delicate details, traditional inspiration, and a love for timeless artistry.
            </p>

            <p className="text-xs sm:text-xs text-espresso/80 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Each piece is created slowly and purposefully—blending ancestral Indian needlework
              traditions with contemporary aesthetic sensibilities. From heirloom bridal adornments to
              nature-inspired decorative hoops, our creations are woven to be treasured.
            </p>

            {/* Value Pillars - Compact cards fitting 100% zoom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-left">
              <div className="p-2.5 sm:p-3 rounded-lg bg-cream/80 border border-champagne/60 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-champagne/50 flex items-center justify-center text-gold mb-1.5">
                  <Feather className="w-3 h-3" />
                </div>
                <h3 className="font-serif text-xs sm:text-sm font-bold text-espresso">Slow Handcraft</h3>
                <p className="text-[10.5px] text-muted-brown font-medium mt-0.5 leading-snug">
                  Individual stitches worked with devotion, precision, and patient artistry.
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-cream/80 border border-champagne/60 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-champagne/50 flex items-center justify-center text-gold mb-1.5">
                  <Heart className="w-3 h-3" />
                </div>
                <h3 className="font-serif text-xs sm:text-sm font-bold text-espresso">Bespoke Inquiries</h3>
                <p className="text-[10.5px] text-muted-brown font-medium mt-0.5 leading-snug">
                  Customized dimensions, tailored palettes, and direct artisan dialogue.
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-cream/80 border border-champagne/60 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-champagne/50 flex items-center justify-center text-gold mb-1.5">
                  <Sparkles className="w-3 h-3" />
                </div>
                <h3 className="font-serif text-xs sm:text-sm font-bold text-espresso">Timeless Heirlooms</h3>
                <p className="text-[10.5px] text-muted-brown font-medium mt-0.5 leading-snug">
                  Crafted to preserve life’s most cherished celebrations and memories.
                </p>
              </div>
            </div>

            {/* Collections Link CTA */}
            <div className="pt-1.5">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-espresso hover:text-gold transition-colors group focus:outline-none"
              >
                <span>Discover All Five Collections</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Craftsmanship Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Outer decorative gold frame */}
              <div className="absolute -inset-2 rounded-xl border border-gold/40 transform rotate-1 hidden sm:block pointer-events-none" />
              
              <div className="relative rounded-lg overflow-hidden shadow-luxury bg-cream border border-champagne image-zoom-container">
                <img
                  src={brandAssets.detail}
                  alt="Naqsh-e-Noor Handcrafted Embroidery Detail"
                  className="w-full h-[220px] sm:h-[280px] lg:h-[330px] object-cover object-center"
                  loading="lazy"
                />
                
                {/* Floating caption badge */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded bg-warm-ivory/95 backdrop-blur-sm border border-champagne shadow-xs">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-gold">
                    Atelier Spotlight
                  </p>
                  <p className="font-serif text-xs text-espresso font-medium mt-0.5">
                    "Intricacy in every knot, elegance in every shade."
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
