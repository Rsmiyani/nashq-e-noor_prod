import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { BrandIntro } from './components/BrandIntro';
import { CollectionShowcase } from './components/CollectionShowcase';
import { ProductCatalog } from './components/ProductCatalog';
import { BrandStory } from './components/BrandStory';
import { InstagramShowcase } from './components/InstagramShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InquiryModal } from './components/InquiryModal';
import { SearchDialog } from './components/SearchDialog';
import { BackToTop } from './components/BackToTop';
import { allProducts, Product, CategoryKey } from './data/products';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation lock ref to avoid scroll spy overriding user clicks
  const isNavigatingRef = useRef<boolean>(false);
  const navTimeoutRef = useRef<number | null>(null);

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);

  // Sync with URL Hash on load & hashchange (e.g. #product=BRD-001)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product=')) {
        const productId = hash.replace('#product=', '').trim();
        const found = allProducts.find((p) => p.id.toLowerCase() === productId.toLowerCase());
        if (found) {
          setDetailProduct(found);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when opening/closing product detail
  const handleOpenProductDetail = useCallback((product: Product) => {
    setDetailProduct(product);
    window.history.pushState(null, '', `#product=${product.id}`);
  }, []);

  const handleCloseProductDetail = useCallback(() => {
    setDetailProduct(null);
    if (window.location.hash.startsWith('#product=')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Navigation handler with smooth programmatic scroll and selection lock
  const handleNavigate = useCallback((sectionId: string, category?: CategoryKey) => {
    setActiveSection(sectionId);
    isNavigatingRef.current = true;

    // Reset lock after smooth scrolling finishes
    if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = window.setTimeout(() => {
      isNavigatingRef.current = false;
    }, 850);
    
    if (category) {
      setSelectedCategory(category);
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 64; // height of header
      const y = element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: 'smooth',
      });
    }
  }, []);

  // Handle selecting a collection from CollectionShowcase
  const handleSelectCollection = useCallback((cat: CategoryKey) => {
    setSelectedCategory(cat);
    handleNavigate('catalog');
  }, [handleNavigate]);

  // Open direct inquiry modal
  const handleOpenInquiry = useCallback((product: Product) => {
    setInquiryProduct(product);
  }, []);

  const handleCloseInquiry = useCallback(() => {
    setInquiryProduct(null);
  }, []);

  // Accurate Active section scroll spy using getBoundingClientRect
  useEffect(() => {
    // Ordered sequentially down the page
    const sections: { id: string; navId: string }[] = [
      { id: 'hero', navId: 'hero' },
      { id: 'about', navId: 'hero' }, // About/Intro is part of Home experience
      { id: 'collections', navId: 'collections' },
      { id: 'catalog', navId: 'catalog' },
      { id: 'story', navId: 'story' },
      { id: 'contact', navId: 'contact' },
    ];

    const handleScroll = () => {
      // If user recently clicked a nav item, do not let intermediate scroll events override it
      if (isNavigatingRef.current) return;

      // Bottom of page detection (Contact section)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70) {
        setActiveSection('contact');
        return;
      }

      // Check current section intersecting the viewport near the top
      const headerOffset = 70;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset + 120 && rect.bottom >= headerOffset + 40) {
            setActiveSection(section.navId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-full">
      {/* Main Sticky Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchDialogOpen(true)}
        onGeneralInquiry={() => handleNavigate('contact')}
      />

      {/* Hero Section with Image Slider */}
      <main className="flex-1">
        <HeroSlider
          onExploreCollections={() => handleNavigate('collections')}
          onInquireWhatsApp={() => handleNavigate('contact')}
        />

        {/* Brand Introduction */}
        <BrandIntro
          onExploreClick={() => handleNavigate('collections')}
        />

        {/* Collection Showcase */}
        <CollectionShowcase
          onSelectCollection={handleSelectCollection}
        />

        {/* Complete Product Catalog */}
        <ProductCatalog
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onViewProduct={handleOpenProductDetail}
          onInquireProduct={handleOpenInquiry}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Craftsmanship & Brand Story */}
        <BrandStory />

        {/* Instagram Showcase */}
        <InstagramShowcase
          onSelectProduct={handleOpenProductDetail}
        />

        {/* Contact and General Inquiry */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={handleCloseProductDetail}
        onInquire={(prod) => {
          handleCloseProductDetail();
          handleOpenInquiry(prod);
        }}
        onSelectRelated={(rel) => {
          handleOpenProductDetail(rel);
        }}
      />

      {/* WhatsApp Product Inquiry Modal */}
      <InquiryModal
        product={inquiryProduct}
        isOpen={Boolean(inquiryProduct)}
        onClose={handleCloseInquiry}
      />

      {/* Quick Search Dialog */}
      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSelectProduct={handleOpenProductDetail}
      />
    </div>
  );
}
