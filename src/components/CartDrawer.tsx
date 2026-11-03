import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, WHATSAPP_PHONE, WHATSAPP_DISPLAY_PHONE } from '../data/products';

interface CartDrawerProps {
  onViewProduct?: (product: Product) => void;
  onExploreCatalog?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onViewProduct,
  onExploreCatalog,
}) => {
  const {
    items,
    totalCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Inquiry form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Calculate pricing breakdown
  const calculateTotalEstimate = () => {
    let numericTotal = 0;
    let hasPricedItems = false;
    let hasUnpricedItems = false;

    items.forEach((item) => {
      const priceStr = item.product.price || '';
      // Extract numbers from price string like "₹1,500" or "1500"
      const cleaned = priceStr.replace(/[^0-9]/g, '');
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0) {
        numericTotal += num * item.quantity;
        hasPricedItems = true;
      } else {
        hasUnpricedItems = true;
      }
    });

    return { numericTotal, hasPricedItems, hasUnpricedItems };
  };

  const { numericTotal, hasPricedItems, hasUnpricedItems } = calculateTotalEstimate();

  const handleSendWhatsAppInquiry = () => {
    if (!customerName.trim()) {
      setValidationError('Please enter your name for the artisan consultation');
      return;
    }
    setValidationError('');
    setIsSubmitting(true);

    // Format WhatsApp message
    const lines: string[] = [];
    lines.push('✨ *NAMASTE NAQSH-E-NOOR ATELIER* ✨');
    lines.push('');
    lines.push('I would like to place a bespoke inquiry for the following handcrafted creations:');
    lines.push('────────────────────────');

    items.forEach((item, index) => {
      const priceDisplay = item.product.price && item.product.price.trim() !== ''
        ? item.product.price
        : 'Price on request';

      lines.push(`${index + 1}. *${item.product.name}* (${item.product.id})`);
      lines.push(`   • Collection: ${item.product.categoryLabel || item.product.category}`);
      lines.push(`   • Quantity: ${item.quantity}`);
      lines.push(`   • Listed Price: ${priceDisplay}`);
      if (item.notes) {
        lines.push(`   • Item Notes: ${item.notes}`);
      }
      lines.push('');
    });

    lines.push('────────────────────────');
    lines.push(`*Total Items:* ${totalCount}`);
    if (hasPricedItems) {
      lines.push(`*Estimated Subtotal:* ₹${numericTotal.toLocaleString('en-IN')}`);
      if (hasUnpricedItems) {
        lines.push(`*(Plus bespoke creations quoted upon consultation)*`);
      }
    } else {
      lines.push(`*Pricing:* Bespoke quote upon artisan consultation`);
    }

    lines.push('');
    lines.push('*CLIENT DETAILS:*');
    lines.push(`• Name: ${customerName.trim()}`);
    if (customerPhone.trim()) {
      lines.push(`• Phone: ${customerPhone.trim()}`);
    }
    if (customNotes.trim()) {
      lines.push(`• Customization Request: ${customNotes.trim()}`);
    }

    lines.push('');
    lines.push('Could you please advise on availability, delivery timeframe, and bespoke options?');
    lines.push('Thank you!');

    const fullMessage = lines.join('\n');
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(fullMessage)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsSubmitting(false);
  };

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Inquiry Bag Drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-espresso-dark/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-warm-ivory text-espresso shadow-2xl flex flex-col border-l border-champagne/60">
          
          {/* Drawer Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-champagne/60 bg-cream flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-champagne/40 border border-gold/40 flex items-center justify-center text-gold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-espresso leading-tight">
                  Inquiry Bag
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-brown">
                  {totalCount === 0
                    ? 'No creations selected'
                    : `${totalCount} ${totalCount === 1 ? 'creation' : 'creations'} selected for consultation`}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-espresso/70 hover:text-espresso hover:bg-champagne/30 rounded-full transition-colors focus:outline-none"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {items.length === 0 ? (
              // Empty State
              <div className="py-14 sm:py-20 text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-champagne/30 border border-gold/30 mx-auto flex items-center justify-center text-gold/80">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-espresso">
                    Your Inquiry Bag is Empty
                  </h3>
                  <p className="text-xs text-muted-brown mt-1 max-w-xs mx-auto leading-relaxed">
                    Explore our curated handcrafted collections and select designs you wish to inquire about with our master artisans.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    if (onExploreCatalog) onExploreCatalog();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {/* List of Cart Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-brown border-b border-champagne/40 pb-2">
                    <span className="uppercase tracking-wider font-semibold text-[10px] text-gold">
                      Selected Pieces
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-muted-brown hover:text-red-600 transition-colors flex items-center gap-1 focus:outline-none"
                      title="Remove all items"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-lg bg-cream border border-champagne/70 shadow-xs flex gap-3 sm:gap-4 items-center group transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div
                        onClick={() => {
                          if (onViewProduct) {
                            closeCart();
                            onViewProduct(item.product);
                          }
                        }}
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden bg-champagne-light border border-champagne/80 shrink-0 cursor-pointer"
                        title="Click to view details"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-warm-ivory text-[9px] font-semibold tracking-wider text-gold border border-champagne/60">
                            {item.product.id}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-brown/60 hover:text-red-600 p-1 rounded transition-colors"
                            aria-label={`Remove ${item.product.name}`}
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4
                          onClick={() => {
                            if (onViewProduct) {
                              closeCart();
                              onViewProduct(item.product);
                            }
                          }}
                          className="font-serif text-sm sm:text-base font-semibold text-espresso hover:text-gold transition-colors truncate cursor-pointer mt-1"
                          title={item.product.name}
                        >
                          {item.product.name}
                        </h4>

                        <span className="text-[10px] text-sage font-semibold uppercase tracking-wider block">
                          {item.product.categoryLabel || item.product.category}
                        </span>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-champagne/40">
                          <span className="text-xs font-serif italic text-espresso font-semibold">
                            {item.product.price && item.product.price.trim() !== ''
                              ? item.product.price
                              : 'Price upon request'}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-warm-ivory border border-champagne/70 rounded px-1.5 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-0.5 text-espresso/70 hover:text-gold transition-colors"
                              aria-label="Decrease quantity"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold px-1 text-espresso min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-0.5 text-espresso/70 hover:text-gold transition-colors"
                              aria-label="Increase quantity"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inquiry Details Form */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-champagne-light/50 border border-champagne/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-espresso">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span>Your Inquiry Details</span>
                  </div>

                  {validationError && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                      {validationError}
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-espresso mb-1">
                        Your Full Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (validationError) setValidationError('');
                        }}
                        placeholder="e.g. Radhika Mehra"
                        className="w-full px-3 py-2 rounded-lg bg-cream border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-espresso mb-1">
                        Contact / WhatsApp Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 rounded-lg bg-cream border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-espresso mb-1">
                        Customization / Event Date / Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="e.g. Wedding delivery needed by November; custom emerald and gold color preference..."
                        className="w-full px-3 py-2 rounded-lg bg-cream border border-champagne text-xs text-espresso placeholder-muted-brown/50 focus:outline-none focus:border-gold resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Assurance note */}
                <div className="flex items-start gap-2 text-[11px] text-muted-brown p-2.5 rounded-lg bg-cream border border-champagne/40">
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>
                    Direct consultation with our senior artisans on WhatsApp. We confirm dimensions, personalized palettes, and timelines before final weaving.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer / CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-champagne/60 bg-cream space-y-3">
              {/* Pricing Subtotal Notice */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-brown font-medium">Selected Items:</span>
                <span className="font-bold text-espresso">{totalCount} items</span>
              </div>

              {hasPricedItems && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-champagne/40">
                  <span className="text-muted-brown font-medium">Estimated Subtotal:</span>
                  <span className="font-serif font-bold text-espresso text-base sm:text-lg">
                    ₹{numericTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Primary WhatsApp Inquiry CTA Button */}
              <button
                onClick={handleSendWhatsAppInquiry}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp ({totalCount})</span>
              </button>

              <p className="text-center text-[10.5px] text-muted-brown">
                Opens WhatsApp with design IDs &amp; consultation details pre-filled
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

