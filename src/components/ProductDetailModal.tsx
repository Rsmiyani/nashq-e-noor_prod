import React, { useEffect, useState, useRef } from 'react';
import { X, MessageCircle, Share2, ZoomIn, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Product, allProducts } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInquire: (product: Product) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInquire,
  onSelectRelated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      // Reset zoom
      setIsZoomed(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  // Find 4 related products in same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-espresso-dark/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="relative bg-cream rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-modal border border-champagne text-espresso flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close & Share */}
        <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm px-6 py-4 border-b border-champagne/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-gold/15 text-gold-dark text-xs font-semibold tracking-wider">
              {product.id}
            </span>
            <span className="text-xs text-muted-brown capitalize">
              {product.category} Collection
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="p-2 text-espresso/70 hover:text-gold hover:bg-champagne/30 rounded-full transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-medium"
              title="Copy direct product link"
              aria-label="Copy direct product link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-espresso/70 hover:text-espresso hover:bg-champagne/30 rounded-full transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2-Column Editorial Layout */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Product Image Inspection */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <div
              ref={imageContainerRef}
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZoomed(false)}
              className="relative aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-champagne-light border border-champagne/70 cursor-zoom-in group select-none shadow-sm"
              title="Click or hover to inspect embroidery stitches"
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'group-hover:scale-105'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Zoom hint overlay */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-espresso-dark/70 text-warm-ivory text-[11px] font-medium backdrop-blur-sm pointer-events-none flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-gold" />
                <span>{isZoomed ? 'Zoomed' : 'Hover / Tap to Zoom'}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-brown text-center">
              Original studio capture · Reference: {product.sourceFile}
            </p>
          </div>

          {/* Right Column: Product Narrative & WhatsApp Action */}
          <div className="md:col-span-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Handcrafted Studio Piece
                </span>
                <h2
                  id="modal-product-title"
                  className="font-serif text-2xl sm:text-3xl font-bold text-espresso mt-1 leading-snug"
                >
                  {product.name}
                </h2>
              </div>

              {/* Price indication */}
              <div className="p-3.5 rounded-lg bg-warm-ivory border border-champagne/60">
                <span className="text-xs uppercase tracking-wider text-muted-brown font-semibold block mb-0.5">
                  Investment &amp; Pricing
                </span>
                <span className="font-serif text-lg text-espresso italic font-bold">
                  {product.price}
                </span>
                <p className="text-[11px] text-muted-brown mt-1">
                  Custom sizes, color variations, and personalized motifs can be tailored upon inquiry.
                </p>
              </div>

              {/* Craftsmanship Narrative */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-espresso font-semibold mb-1.5">
                  Artisan Details
                </h4>
                <p className="text-sm text-espresso/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-champagne/40 text-espresso text-[11px] font-medium border border-champagne/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Inquire on WhatsApp CTA */}
            <div className="pt-4 border-t border-champagne/60 space-y-3">
              <button
                onClick={() => onInquire(product)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gold hover:bg-gold-dark text-warm-ivory text-sm font-semibold tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </button>
              <p className="text-center text-xs text-muted-brown">
                Opens pre-filled message with design ID &amp; your specifications
              </p>
            </div>

          </div>

        </div>

        {/* Related Creations in this Collection */}
        {relatedProducts.length > 0 && (
          <div className="p-6 sm:p-8 bg-warm-ivory/60 border-t border-champagne/60">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif text-lg font-bold text-espresso">
                More from {product.categoryLabel}
              </h4>
              <span className="text-xs text-muted-brown">Similar handcrafted designs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="group bg-cream rounded-lg overflow-hidden border border-champagne/60 hover:border-gold cursor-pointer transition-all p-2"
                >
                  <div className="aspect-square rounded overflow-hidden bg-champagne-light mb-2">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-brown">
                    <span className="font-semibold text-espresso">{rel.id}</span>
                    <ArrowRight className="w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-serif text-xs text-espresso truncate font-medium mt-0.5">
                    {rel.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

