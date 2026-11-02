import React from 'react';
import { MessageCircle, Instagram, Heart, ArrowUp } from 'lucide-react';
import {
  brandAssets,
  collections,
  WHATSAPP_DISPLAY_PHONE,
  WHATSAPP_PHONE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  CategoryKey,
} from '../data/products';

interface FooterProps {
  onNavigate: (sectionId: string, category?: CategoryKey) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-espresso text-warm-ivory/80 pt-16 pb-12 border-t border-gold/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-champagne/20">

          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <button
              onClick={() => onNavigate('hero')}
              className="focus:outline-none flex items-center gap-3 group text-left"
              aria-label="Naqsh-e-Noor Home"
            >
              <div className="w-12 h-12 rounded-full bg-cream border-2 border-gold/80 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                <img
                  src={brandAssets.logo}
                  alt="Naqsh-e-Noor"
                  className="w-full h-full object-contain mix-blend-multiply scale-[1.18]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-[0.16em] uppercase text-warm-ivory group-hover:text-gold transition-colors">
                  Naqsh-e-Noor
                </span>
                <span className="text-[9.5px] font-sans tracking-[0.28em] uppercase text-gold font-bold mt-0.5">
                  Handcrafted Atelier
                </span>
              </div>
            </button>

            <p className="font-serif italic text-base text-champagne font-medium max-w-sm">
              "Timeless Artistry, Thoughtfully Handcrafted."
            </p>

            <p className="text-xs text-warm-ivory/80 leading-relaxed max-w-sm font-normal">
              A boutique atelier specializing in handcrafted embroidery, bridal artistry, botanical
              hoops, and heirloom creations woven with love and heritage.
            </p>

            {/* Social / WhatsApp Pills */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-champagne/10 hover:bg-gold text-champagne hover:text-warm-ivory transition-colors"
                aria-label="WhatsApp Contact"
                title={`WhatsApp: ${WHATSAPP_DISPLAY_PHONE}`}
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-champagne/10 hover:bg-gold text-champagne hover:text-warm-ivory transition-colors"
                aria-label="Instagram Profile"
                title={`Follow ${INSTAGRAM_HANDLE}`}
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Collections Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-champagne">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              {collections.map((col) => (
                <li key={col.key}>
                  <button
                    onClick={() => onNavigate('catalog', col.key)}
                    className="hover:text-gold transition-colors text-left focus:outline-none flex items-center justify-between w-full max-w-[200px]"
                  >
                    <span>{col.title}</span>
                    <span className="text-[10px] text-warm-ivory/40">({col.itemCount})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-champagne">
              Atelier
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-gold transition-colors focus:outline-none"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collections')}
                  className="hover:text-gold transition-colors focus:outline-none"
                >
                  Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-gold transition-colors focus:outline-none"
                >
                  Product Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('story')}
                  className="hover:text-gold transition-colors focus:outline-none"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-gold transition-colors focus:outline-none"
                >
                  Contact Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-champagne">
              Inquiries
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-warm-ivory/50 block text-[11px]">Direct WhatsApp</span>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-ivory hover:text-gold font-medium"
                >
                  {WHATSAPP_DISPLAY_PHONE}
                </a>
              </div>

              <div>
                <span className="text-warm-ivory/50 block text-[11px]">Instagram</span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-ivory hover:text-gold font-medium"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </div>

              <div>
                <span className="text-warm-ivory/50 block text-[11px]">Inquiry Policy</span>
                <span className="text-warm-ivory/80">Orders placed by direct artisan consultation</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-warm-ivory/50 gap-4">
          <p>
            &copy; {currentYear} Naqsh-e-Noor. All rights reserved. Handcrafted with reverence.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-warm-ivory/60">
            <span>Preserving Indian Heritage Embroidery</span>
            <Heart className="w-3.5 h-3.5 text-gold inline fill-gold" />
          </p>
        </div>

      </div>
    </footer>
  );
};

