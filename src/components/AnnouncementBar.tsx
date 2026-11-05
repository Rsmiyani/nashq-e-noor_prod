import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { WHATSAPP_DISPLAY_PHONE, WHATSAPP_PHONE } from '../data/products';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-espresso text-warm-ivory text-xs sm:text-sm py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          <span className="font-light tracking-wide text-champagne">
            Handcrafted with Love <span className="text-gold mx-1.5">·</span> Inspired by Heritage
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-1.5 text-warm-ivory/90 hover:text-gold transition-colors"
            title="Inquire directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-gold" />
            <span>Inquire on WhatsApp: {WHATSAPP_DISPLAY_PHONE}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

