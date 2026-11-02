import React from 'react';
import { brandAssets } from '../data/products';
import { Award, ShieldCheck, HeartHandshake } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section id="story" className="py-20 sm:py-28 bg-champagne-light/40 border-t border-champagne/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-espresso leading-tight">
            The Beauty of <span className="font-bold italic text-gold">Handcrafted Artistry</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-3" />
          <p className="text-sm sm:text-base text-espresso/80 font-medium max-w-2xl mx-auto">
            At Naqsh-e-Noor, every creation celebrates the charm of handcrafted details. Inspired by
            traditional artistry and delicate patterns, our collections bring together creativity,
            care, and timeless elegance.
          </p>
        </div>

        {/* Editorial Fashion Spread (Two Staggered Photographs + Deep Narrative) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Dual Editorial Images */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 relative">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden shadow-luxury border border-champagne image-zoom-container bg-cream aspect-[4/5]">
                <img
                  src={brandAssets.detail}
                  alt="Fine embroidery stitches closeup"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-cream rounded-lg border border-champagne/60 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold block">
                  Intricate Needlework
                </span>
                <span className="text-xs text-muted-brown font-serif italic">
                  Pure silk threads &amp; metallic zardozi
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-8 sm:pt-12">
              <div className="rounded-xl overflow-hidden shadow-luxury border border-champagne image-zoom-container bg-cream aspect-[4/5]">
                <img
                  src={brandAssets.teal}
                  alt="Teal handcrafted floral embroidery art"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-cream rounded-lg border border-champagne/60 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold block">
                  Botanical Harmony
                </span>
                <span className="text-xs text-muted-brown font-serif italic">
                  Inspired by blooming Indian gardens
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-4xl text-espresso font-semibold leading-snug">
                Where Patience Meets <span className="italic text-gold font-bold">Perfection</span>
              </h3>
              
              <p className="text-sm sm:text-base text-espresso/85 leading-relaxed font-medium">
                Unlike mass-manufactured textiles, hand embroidery is an art that refuses to be rushed.
                Each leaf, petal, and ornamental motif is guided by the artisan's hand—yielding subtle
                nuances that make every finished piece truly one of a kind.
              </p>

              <p className="text-sm sm:text-base text-espresso/80 leading-relaxed font-normal">
                Whether creating bespoke bridal pieces that commemorate sacred vows or botanical hoop
                art that transforms modern living spaces, Naqsh-e-Noor bridges the reverence of
                generational heritage with contemporary elegance.
              </p>
            </div>

            {/* Core Values list */}
            <div className="space-y-4 pt-4 border-t border-champagne/60 text-left">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-champagne/60 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-espresso">
                    Uncompromising Craftsmanship
                  </h4>
                  <p className="text-xs text-espresso/80 font-medium mt-0.5">
                    Carefully selected threads, durable base fabrics, and museum-grade finishes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-champagne/60 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-espresso">
                    Authentic Original Designs
                  </h4>
                  <p className="text-xs text-espresso/80 font-medium mt-0.5">
                    Every piece showcased is an authentic original creation photographed in our studio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-champagne/60 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-espresso">
                    Personalized Client Connection
                  </h4>
                  <p className="text-xs text-espresso/80 font-medium mt-0.5">
                    Direct conversation with our studio via WhatsApp to ensure your wishes are heard.
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

