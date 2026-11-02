import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { brandAssets } from '../data/products';

interface HeroSlide {
  badge1: string;
  badge2: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  ctaText: string;
  image: string;
  imageAlt: string;
  objectPosition: string;
}

interface HeroSliderProps {
  onExploreCollections: () => void;
  onInquireWhatsApp: () => void;
}

// Automatically change slide every 7 seconds
const SLIDE_DURATION_MS = 7000;

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onExploreCollections,
  onInquireWhatsApp,
}) => {
  const slides: HeroSlide[] = [
    {
      badge1: 'HANDCRAFTED HERITAGE',
      badge2: 'TIMELESS ATELIER',
      eyebrow: 'PREMIUM EMBROIDERY ATELIER • BESPOKE CREATIONS',
      headlineLine1: 'EVERY THREAD.',
      headlineLine2: 'TELLS A STORY.',
      description:
        'Discover timeless embroidery, lovingly handcrafted with delicate silk threads, heirloom zardozi, and meticulous attention to every petal and stitch.',
      ctaText: 'Explore Collections',
      image: brandAssets.heroSlide1,
      imageAlt: 'Naqsh-e-Noor handcrafted embroidery atelier scene with model and floral hoop',
      // Pinned near top (0-2%) so the model's head is completely in frame and never cut off
      objectPosition: 'object-[80%_0%] sm:object-[84%_0%] lg:object-[86%_0%]',
    },
    {
      badge1: 'ROYAL BRIDAL ARTISTRY',
      badge2: 'ZARDOZI HEIRLOOMS',
      eyebrow: 'OPULENT BRIDAL WEAVES • METALLIC SILK DABKA',
      headlineLine1: 'CRAFTED WITH LOVE.',
      headlineLine2: 'WOVEN WITH HERITAGE.',
      description:
        'Thoughtful bridal artistry that weaves centuries of Indian textile heritage, rich crimson fabrics, and authentic metallic needlework for auspicious occasions.',
      ctaText: 'Discover Bridal Art',
      image: brandAssets.heroSlide2,
      imageAlt: 'Close-up luxurious bridal zardozi embroidery and crimson velvet lehenga craftsmanship',
      objectPosition: 'object-[78%_center] sm:object-[82%_center] lg:object-[86%_center]',
    },
    {
      badge1: 'BOTANICAL HOOPS',
      badge2: 'FLORAL NEEDLEWORK',
      eyebrow: 'NATURE-INSPIRED PETALS • 3D THREADWORK HOOPS',
      headlineLine1: 'A TOUCH OF ART.',
      headlineLine2: 'IN EVERY CREATION.',
      description:
        'Explore distinctive handcrafted wall hoops, dimensional floral tapestries, and serene nature-inspired motifs designed to elevate living spaces.',
      ctaText: 'Browse Wall Hoops',
      image: brandAssets.heroSlide3,
      imageAlt: 'Atelier arrangement of handcrafted wooden embroidery hoops with 3D floral petals',
      objectPosition: 'object-[78%_center] sm:object-[82%_center] lg:object-[86%_center]',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Automatic slide transition every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [nextSlide]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Mobile touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="hero"
      className="relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] min-h-[520px] max-h-[850px] bg-espresso-dark overflow-hidden flex items-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Naqsh-e-Noor Featured Hero Slider"
    >
      {/* Background Images with Crossfade & Custom Object Positioning */}
      {slides.map((slide, index) => {
        const isCurrent = index === currentSlide;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className={`w-full h-full object-cover ${slide.objectPosition} origin-top-right transition-transform duration-[7000ms] ease-out ${
                isCurrent ? 'scale-[1.02]' : 'scale-100'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Cinematic Gradient Overlays:
                Keeps left side dark for text readability while leaving the embroidery artwork on the right completely visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-espresso-dark/95 via-espresso-dark/80 to-transparent w-full sm:w-3/5 lg:w-[52%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-dark/85 via-transparent to-espresso-dark/30 pointer-events-none" />
          </div>
        );
      })}

      {/* Hero Content Overlay: Strictly Constrained to Left Column with Staggered Editorial Crossfade */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* CSS Grid Stacking: All 3 slides share the exact same grid cell for seamless crossfade and zero layout jump */}
        <div className="grid grid-cols-1 grid-rows-1 max-w-md sm:max-w-lg lg:max-w-xl">
          {slides.map((slide, index) => {
            const isCurrent = index === currentSlide;
            return (
              <div
                key={index}
                className={`col-start-1 row-start-1 transition-all duration-700 ease-out flex flex-col justify-center ${
                  isCurrent
                    ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                    : 'opacity-0 -translate-y-3 pointer-events-none z-0'
                }`}
              >
                {/* Badges row with staggered fade-in */}
                <div
                  className={`flex flex-wrap items-center gap-2 mb-3 transition-all duration-700 ease-out ${
                    isCurrent
                      ? 'opacity-100 translate-y-0 delay-[100ms]'
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gold text-warm-ivory text-xs font-semibold tracking-wider uppercase shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    {slide.badge1}
                  </span>
                  <span className="px-3 py-1 rounded bg-espresso-dark/70 text-champagne text-xs font-medium tracking-wider uppercase border border-champagne/30 backdrop-blur-sm">
                    {slide.badge2}
                  </span>
                </div>

                {/* Subtitle / Eyebrow */}
                <p
                  className={`text-[11px] sm:text-xs font-bold tracking-[0.2em] text-champagne uppercase mb-2 sm:mb-3 transition-all duration-700 ease-out ${
                    isCurrent
                      ? 'opacity-100 translate-y-0 delay-[200ms]'
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  {slide.eyebrow}
                </p>

                {/* Large Bold Editorial Headline - Staggered lines */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-bold tracking-tight text-warm-ivory leading-[1.1] mb-3.5">
                  <span
                    className={`block text-warm-ivory transition-all duration-700 ease-out ${
                      isCurrent
                        ? 'opacity-100 translate-y-0 delay-[300ms]'
                        : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.headlineLine1}
                  </span>
                  <span
                    className={`block text-champagne font-medium italic transition-all duration-700 ease-out ${
                      isCurrent
                        ? 'opacity-100 translate-y-0 delay-[400ms]'
                        : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.headlineLine2}
                  </span>
                </h1>

                {/* Refined Description */}
                <p
                  className={`text-xs sm:text-sm lg:text-base text-warm-ivory/90 font-medium leading-relaxed mb-6 max-w-lg transition-all duration-700 ease-out ${
                    isCurrent
                      ? 'opacity-100 translate-y-0 delay-[500ms]'
                      : 'opacity-0 translate-y-3'
                  }`}
                >
                  {slide.description}
                </p>

                {/* Dual Action Buttons */}
                <div
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all duration-700 ease-out ${
                    isCurrent
                      ? 'opacity-100 translate-y-0 delay-[600ms]'
                      : 'opacity-0 translate-y-3'
                  }`}
                >
                  {/* Primary Action Button */}
                  <button
                    onClick={onExploreCollections}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold hover:bg-gold-dark text-warm-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded transition-all duration-200 shadow-lg hover:shadow-xl hover:translate-y-[-1px] group focus:outline-none"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  {/* Secondary Action Button */}
                  <button
                    onClick={onInquireWhatsApp}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-espresso/70 hover:bg-espresso text-champagne hover:text-warm-ivory text-xs sm:text-sm font-medium tracking-wider uppercase rounded border border-champagne/40 hover:border-gold transition-all duration-200 backdrop-blur-sm focus:outline-none"
                  >
                    <MessageCircle className="w-4 h-4 text-gold" />
                    <span>Inquire on WhatsApp</span>
                  </button>
                </div>

                {/* Minimalist In-Column Slide Indicators (Clickable, expands gold active dash) */}
                <div className="flex items-center gap-2 pt-5">
                  {slides.map((_, dotIdx) => {
                    const isDotActive = dotIdx === currentSlide;
                    return (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentSlide(dotIdx)}
                        className="group py-2 focus:outline-none"
                        aria-label={`Switch to hero slide ${dotIdx + 1}`}
                      >
                        <div
                          className={`h-1 rounded-full transition-all duration-500 ${
                            isDotActive
                              ? 'w-8 bg-gold'
                              : 'w-2 bg-champagne/40 group-hover:bg-champagne/80 group-hover:w-4'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
