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
import { CartDrawer } from './components/CartDrawer';
import { RatingsSection } from './components/RatingsSection';
import { Product, CategoryKey } from './data/products';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { CartProvider, useCart } from './context/CartContext';
import { AdminPortal } from './components/admin/AdminPortal';

function Storefront() {
  const { products: allProducts } = useCatalog();
  const { toastMessage, openCart } = useCart();
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
  }, [allProducts]);

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
    const sections: { id: string; navId: string }[] = [
      { id: 'hero', navId: 'hero' },
      { id: 'about', navId: 'hero' },
      { id: 'collections', navId: 'collections' },
      { id: 'catalog', navId: 'catalog' },
      { id: 'story', navId: 'story' },
      { id: 'contact', navId: 'contact' },
    ];

    const handleScroll = () => {
      if (isNavigatingRef.current) return;

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70) {
        setActiveSection('contact');
        return;
      }

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
      {/* Main Sticky Header - Clean & Pure, ZERO admin buttons */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchDialogOpen(true)}
        onGeneralInquiry={() => handleNavigate('contact')}
      />

      {/* Storefront Main Experience */}
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

        {/* Customer Ratings & Atelier Testimonials */}
        <RatingsSection />

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

      {/* Inquiry Bag Slide-Over Drawer */}
      <CartDrawer
        onViewProduct={handleOpenProductDetail}
        onExploreCatalog={() => handleNavigate('catalog')}
      />

      {/* Toast Notification when adding items to Inquiry Bag */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-espresso text-warm-ivory px-4 py-3 rounded-xl shadow-2xl border border-gold/40 flex items-center gap-3 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <p className="text-xs font-semibold text-warm-ivory">{toastMessage}</p>
          <button
            onClick={openCart}
            className="text-xs text-gold hover:text-gold-light underline font-bold ml-1 focus:outline-none"
          >
            View Bag
          </button>
        </div>
      )}
    </div>
  );
}

function MainRouter() {
  const { refreshCatalog } = useCatalog();
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return hash === '#admin' || hash.startsWith('#admin') || path === '/admin' || path.startsWith('/admin');
  });

  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      setIsAdminRoute(
        hash === '#admin' || hash.startsWith('#admin') || path === '/admin' || path.startsWith('/admin')
      );
    };

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  const handleExitAdmin = useCallback(() => {
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.pathname.includes('admin')) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminRoute(false);
    refreshCatalog(true);
  }, [refreshCatalog]);

  return isAdminRoute ? (
    <AdminPortal onExit={handleExitAdmin} />
  ) : (
    <Storefront />
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <MainRouter />
      </CartProvider>
    </CatalogProvider>
  );
}
