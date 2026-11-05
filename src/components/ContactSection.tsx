import React, { useState } from 'react';
import { MessageCircle, Phone, Instagram, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  WHATSAPP_DISPLAY_PHONE,
  WHATSAPP_PHONE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  createGeneralInquiryUrl,
} from '../data/products';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Product Information');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Please enter your name.');
      return;
    }

    setNameError('');

    const waUrl = createGeneralInquiryUrl({
      customerName: name,
      customerPhone: phone,
      inquiryType,
      message,
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <section id="contact" className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-champagne-light/50 border-t border-champagne/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-espresso leading-tight">
            Connect with <span className="font-bold italic text-gold">Our Studio</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-3" />
          <p className="text-sm sm:text-base text-espresso/80 font-medium">
            Whether inquiring about a specific creation or commissioning a custom embroidery piece, we welcome your message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cream rounded-xl p-6 sm:p-8 border border-champagne shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-semibold text-espresso">
                Direct Channels
              </h3>
              <p className="text-xs sm:text-sm text-muted-brown leading-relaxed">
                We believe in personalized, conversational customer service. Reach out directly through
                WhatsApp or follow our work on Instagram.
              </p>

              {/* WhatsApp Card */}
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-4 p-4 rounded-lg bg-warm-ivory border border-champagne/70 hover:border-gold hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-warm-ivory transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-brown block">
                    WhatsApp &amp; Direct Phone
                  </span>
                  <span className="font-serif text-base sm:text-lg font-semibold text-espresso group-hover:text-gold transition-colors">
                    {WHATSAPP_DISPLAY_PHONE}
                  </span>
                </div>
              </a>

              {/* Phone Calling Card */}
              <a
                href={`tel:${WHATSAPP_PHONE}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-warm-ivory border border-champagne/70 hover:border-gold hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-champagne text-espresso flex items-center justify-center group-hover:bg-gold group-hover:text-warm-ivory transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-brown block">
                    Telephone
                  </span>
                  <span className="font-serif text-base sm:text-lg font-semibold text-espresso group-hover:text-gold transition-colors">
                    {WHATSAPP_DISPLAY_PHONE}
                  </span>
                </div>
              </a>

              {/* Instagram Card */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-4 p-4 rounded-lg bg-warm-ivory border border-champagne/70 hover:border-gold hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 rounded-full bg-sage/15 text-sage flex items-center justify-center group-hover:bg-sage group-hover:text-warm-ivory transition-colors">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-brown block">
                    Instagram Atelier
                  </span>
                  <span className="font-serif text-base sm:text-lg font-semibold text-espresso group-hover:text-gold transition-colors">
                    {INSTAGRAM_HANDLE}
                  </span>
                </div>
              </a>

            </div>
          </div>

          {/* Right Column: General Inquiry Form with WhatsApp Dispatch */}
          <div className="lg:col-span-7">
            <div className="bg-cream rounded-xl p-6 sm:p-8 border border-champagne shadow-sm">
              <h3 className="font-serif text-2xl font-semibold text-espresso mb-1">
                Send an Inquiry
              </h3>
              <p className="text-xs sm:text-sm text-muted-brown mb-6">
                Fill out the details below to generate a prefilled message directly on WhatsApp.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="inquiry-name"
                        className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                      >
                        Your Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="inquiry-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError('');
                        }}
                        placeholder="e.g. Meera Kapoor"
                        className={`w-full px-3.5 py-2.5 bg-warm-ivory/70 border rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none transition-colors ${
                          nameError ? 'border-rose-400 focus:border-rose-500' : 'border-champagne focus:border-gold'
                        }`}
                        required
                      />
                      {nameError && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{nameError}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="inquiry-phone"
                        className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                      >
                        Phone Number <span className="text-muted-brown text-[11px] font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        id="inquiry-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-warm-ivory/70 border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label
                      htmlFor="inquiry-type"
                      className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                    >
                      Inquiry Nature
                    </label>
                    <select
                      id="inquiry-type"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-warm-ivory/70 border border-champagne rounded-lg text-base sm:text-sm text-espresso focus:border-gold focus:outline-none"
                    >
                      <option value="Product Information">Product Information &amp; Dimensions</option>
                      <option value="Pricing and Availability">Pricing and Availability</option>
                      <option value="Bespoke Bridal Commission">Bespoke Bridal Commission</option>
                      <option value="Decorative Wall Hoop Customization">Decorative Wall Hoop Customization</option>
                      <option value="General Studio Inquiry">General Studio Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="inquiry-message"
                      className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1"
                    >
                      Message or Requirements
                    </label>
                    <textarea
                      id="inquiry-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you have in mind—color palettes, preferred designs, framing, or delivery dates..."
                      className="w-full px-3.5 py-2.5 bg-warm-ivory/70 border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:border-gold focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gold hover:bg-gold-dark text-warm-ivory text-sm font-semibold tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry via WhatsApp</span>
                  </button>
                </form>
              ) : (
                /* Success feedback */
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-espresso">
                      Message Formatted &amp; Opened!
                    </h4>
                    <p className="text-sm text-muted-brown mt-1 max-w-sm mx-auto">
                      Your inquiry has been opened in WhatsApp with our studio. Please hit "Send" in WhatsApp to dispatch your message.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-2.5 bg-champagne-light hover:bg-champagne text-espresso text-xs uppercase tracking-wider font-semibold rounded border border-champagne"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

