import React, { useState, useEffect } from 'react';
import { Menu, X, Search, MessageCircle, Instagram, ChevronRight, ShoppingBag } from 'lucide-react';
import { brandAssets, WHATSAPP_DISPLAY_PHONE, WHATSAPP_PHONE, INSTAGRAM_URL, CategoryKey } from '../data/products';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string, category?: CategoryKey) => void;
  onOpenSearch: () => void;
  onGeneralInquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onOpenSearch,
  onGeneralInquiry,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'hero', label: 'HOME' },
    { id: 'collections', label: 'COLLECTIONS' },
    { id: 'catalog', label: 'CATALOG' },
    { id: 'story', label: 'OUR STORY' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 h-14 sm:h-16 flex items-center ${
        isScrolled
          ? 'bg-warm-ivory/95 backdrop-blur-md shadow-sm border-b border-champagne/50'
          : 'bg-warm-ivory/90 backdrop-blur-xs border-b border-champagne/30'
      }`}
    >
      {/* Full-width container spanning edge-to-edge */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Brand Logo & Wordmark Lockup */}
          <button
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2 sm:gap-3 focus:outline-none group text-left flex-shrink-0"
            aria-label="Naqsh-e-Noor Home"
          >
            {/* Royal Gold Seal Medallion: Perfectly framing the crest inside the circle */}
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-warm-ivory border-2 border-gold/85 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-gold group-hover:shadow transition-all duration-300 flex-shrink-0 p-0.5">
              <img
                src={brandAssets.logo}
                alt="Naqsh-e-Noor Crest"
                className="w-full h-full object-contain mix-blend-multiply scale-[1.18] transform transition-transform duration-300 group-hover:scale-[1.26]"
              />
            </div>
            
            {/* Elegant Serif Wordmark */}
            <div className="flex flex-col justify-center">
              <span className="font-serif text-sm xs:text-base sm:text-lg lg:text-xl font-bold tracking-[0.14em] sm:tracking-[0.16em] uppercase text-espresso leading-none group-hover:text-gold transition-colors">
                Naqsh-e-Noor
              </span>
              <span className="text-[7.5px] xs:text-[8px] sm:text-[9.5px] font-sans tracking-[0.22em] sm:tracking-[0.28em] uppercase text-gold font-bold mt-0.5 sm:mt-1">
                Handcrafted Atelier
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links with Luxury Hover & Active Effects */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group relative px-2.5 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm tracking-wider uppercase font-semibold transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${
                    isActive
                      ? 'text-espresso font-bold'
                      : 'text-espresso/80 hover:text-gold hover:bg-champagne/25'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse" />}
                  <span className="relative py-0.5">
                    {item.label}
                    {/* Animated Gold Underline on Hover & Active */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-gold rounded-full transition-all duration-300 ease-out ${
                        isActive
                          ? 'w-full opacity-100'
                          : 'w-0 group-hover:w-full opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & WhatsApp Button */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Trigger (Touch friendly 44px min tap target) */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 sm:p-2 text-espresso/75 hover:text-gold hover:bg-champagne/20 rounded-full transition-colors focus:outline-none"
              aria-label="Search catalog"
              title="Search catalog"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Inquiry Bag / Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 sm:p-2 text-espresso/75 hover:text-gold hover:bg-champagne/20 rounded-full transition-colors focus:outline-none"
              aria-label={`View Inquiry Bag (${totalCount} items)`}
              title={`Inquiry Bag (${totalCount})`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gold text-warm-ivory text-[9px] sm:text-[10px] font-bold rounded-full min-w-[17px] h-4 px-1 flex items-center justify-center shadow-xs">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </button>

            {/* Instagram Link */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hidden sm:inline-flex p-2 text-espresso/75 hover:text-gold hover:bg-champagne/20 rounded-full transition-colors"
              aria-label="Visit Instagram"
              title="Follow @naqsh_e_noor7 on Instagram"
            >
              <Instagram className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>

            {/* Inquire on WhatsApp CTA */}
            <button
              onClick={onGeneralInquiry}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-dark text-warm-ivory text-xs sm:text-sm font-semibold tracking-wider uppercase rounded shadow-xs hover:shadow transition-all duration-200 focus:outline-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Inquire on WhatsApp</span>
              <span className="lg:hidden">Inquire</span>
            </button>

            {/* Mobile Hamburger Toggle (44px min touch target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-espresso hover:text-gold rounded-md focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-espresso/50 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 right-0 w-4/5 max-w-sm h-full h-dvh max-h-dvh bg-cream shadow-2xl z-50 transform transition-all duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen
            ? 'translate-x-0 opacity-100 visible pointer-events-auto'
            : 'translate-x-full opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="p-4 border-b border-champagne flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-warm-ivory border-2 border-gold/80 flex items-center justify-center overflow-hidden p-0.5 shadow-xs">
              <img src={brandAssets.logo} alt="Naqsh-e-Noor" className="w-full h-full object-contain mix-blend-multiply scale-[1.18]" />
            </div>
            <span className="font-serif text-base font-bold uppercase tracking-wider text-espresso">Naqsh-e-Noor</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-espresso/70 hover:text-espresso rounded focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded text-xs tracking-wider uppercase font-medium transition-colors ${
                    isActive
                      ? 'bg-champagne/40 text-espresso font-semibold'
                      : 'text-espresso/80 hover:bg-champagne/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-espresso/40" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-champagne/50 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openCart();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-espresso/80 hover:bg-champagne/20 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-gold" />
                <span>Inquiry Bag</span>
              </span>
              {totalCount > 0 && (
                <span className="bg-gold text-warm-ivory text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-espresso/80 hover:bg-champagne/20 transition-colors"
            >
              <Search className="w-4 h-4 text-gold" />
              <span>Search Catalog</span>
            </button>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-espresso/80 hover:bg-champagne/20 transition-colors"
            >
              <Instagram className="w-4 h-4 text-gold" />
              <span>Follow @naqsh_e_noor7</span>
            </a>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGeneralInquiry();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold tracking-wide uppercase rounded shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </button>
              <p className="text-center text-[11px] text-muted-brown mt-2">
                Phone: {WHATSAPP_DISPLAY_PHONE}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-champagne-light text-center text-[11px] text-muted-brown border-t border-champagne">
          Naqsh-e-Noor Atelier · Handcrafted Luxury
        </div>
      </div>
    </header>
  );
};
