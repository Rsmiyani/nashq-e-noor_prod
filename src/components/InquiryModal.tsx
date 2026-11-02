import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, createWhatsAppInquiryUrl, WHATSAPP_DISPLAY_PHONE } from '../data/products';

interface InquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCustomerPhone('');
      setMessage('');
      setNameError('');
      setIsSubmitted(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setNameError('Please enter your full name so our atelier can address you.');
      return;
    }

    setNameError('');

    // Generate accurate product page URL
    const productUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;

    const waUrl = createWhatsAppInquiryUrl({
      customerName,
      customerPhone,
      productName: product.name,
      productId: product.id,
      category: product.categoryLabel,
      message,
      productUrl,
    });

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-espresso-dark/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div
        className="relative bg-cream rounded-2xl max-w-lg w-full overflow-hidden shadow-modal border border-champagne text-espresso flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-espresso text-warm-ivory px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gold" />
            <h3 id="inquiry-modal-title" className="font-serif text-lg font-semibold tracking-wide">
              Inquire on WhatsApp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-ivory/70 hover:text-warm-ivory p-1 rounded focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Banner */}
        <div className="p-4 sm:p-5 bg-champagne-light/70 border-b border-champagne flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-champagne shadow-xs flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded bg-gold text-warm-ivory text-[10px] font-bold tracking-wider">
                {product.id}
              </span>
              <span className="text-xs text-muted-brown truncate">
                {product.categoryLabel}
              </span>
            </div>
            <h4 className="font-serif text-base font-semibold text-espresso truncate">
              {product.name}
            </h4>
            <p className="text-xs text-muted-brown italic">
              {product.price}
            </p>
          </div>
        </div>

        {/* Form or Confirmation */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                >
                  Your Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="e.g. Aanya Sharma"
                  className={`w-full px-3.5 py-2.5 bg-warm-ivory/70 border rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none transition-colors ${
                    nameError
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-champagne focus:border-gold'
                  }`}
                  required
                  autoFocus
                />
                {nameError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              {/* Customer Phone (Optional) */}
              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                >
                  Mobile / WhatsApp Number <span className="text-muted-brown text-[11px] font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-warm-ivory/70 border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:border-gold focus:outline-none"
                />
              </div>

              {/* Requirement / Message */}
              <div>
                <label
                  htmlFor="customer-message"
                  className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                >
                  Your Requirement or Customization <span className="text-muted-brown text-[11px] font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="customer-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details such as preferred hoop size, color alterations, framing requests, or timeline..."
                  className="w-full px-3.5 py-2.5 bg-warm-ivory/70 border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:border-gold focus:outline-none resize-none"
                />
              </div>

              {/* WhatsApp Note */}
              <div className="p-3 rounded-lg bg-champagne-light text-xs text-muted-brown leading-relaxed flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Clicking below will format your message with product details and link, then open
                  WhatsApp chat with our studio (<strong className="text-espresso">{WHATSAPP_DISPLAY_PHONE}</strong>).
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gold hover:bg-gold-dark text-warm-ivory text-sm font-semibold tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none"
              >
                <Send className="w-4 h-4" />
                <span>Continue to WhatsApp Chat</span>
              </button>
            </form>
          ) : (
            /* Confirmation state */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-semibold text-espresso">
                  WhatsApp Chat Initiated!
                </h4>
                <p className="text-sm text-muted-brown mt-1 max-w-sm mx-auto">
                  Your inquiry message for <strong className="text-espresso">{product.name} ({product.id})</strong> has been pre-filled in WhatsApp.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs uppercase tracking-wider font-semibold rounded"
                >
                  Re-open WhatsApp
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-champagne-light hover:bg-champagne text-espresso text-xs uppercase tracking-wider font-semibold rounded border border-champagne"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

