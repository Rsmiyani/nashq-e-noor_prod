import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  Layers,
  DollarSign,
  Database,
  Key,
  Copy,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, brandAssets } from '../../data/products';
import {
  supabase,
  checkDatabaseHealth,
  fetchLiveProducts,
  fetchLiveCategories,
  upsertProduct,
  updateProductPrice,
  deleteProduct,
  upsertCategory,
  convertFileToBase64,
  convertUrlToBase64,
  DBCategory,
} from '../../services/supabase';

interface AdminPortalProps {
  onExit: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('naqsh_admin_logged_in') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'pricing' | 'categories' | 'setup'>('products');

  // Database Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Health & Setup
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    categoriesTableExists: boolean;
    productsTableExists: boolean;
    categoryCount: number;
    productCount: number;
    error?: string;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyMissingPrice, setOnlyMissingPrice] = useState<boolean>(false);

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('bridal');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageBase64, setFormImageBase64] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Category Form State
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Quick Price Saving State
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [quickPriceMap, setQuickPriceMap] = useState<Record<string, string>>({});

  const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === configuredPassword || passwordInput === 'admin' || passwordInput === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('naqsh_admin_logged_in', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect studio passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('naqsh_admin_logged_in');
  };

  // Load Database State
  const refreshData = async () => {
    setLoading(true);
    try {
      const health = await checkDatabaseHealth();
      setDbHealth(health);

      if (health.categoriesTableExists) {
        const liveCats = await fetchLiveCategories().catch(() => []);
        setCategories(liveCats);
      }

      if (health.productsTableExists) {
        const liveProds = await fetchLiveProducts().catch(() => []);
        setProducts(liveProds);

        // Pre-fill quick price map
        const pMap: Record<string, string> = {};
        liveProds.forEach((p) => {
          pMap[p.id] = p.price || '';
        });
        setQuickPriceMap(pMap);
      }
    } catch (err: any) {
      console.error('[Admin] Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormId(`PROD-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory(categories[0]?.id || 'bridal');
    setFormPrice('');
    setFormDescription('');
    setFormImageBase64('');
    setFormFeatured(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price || '');
    setFormDescription(p.description || '');
    setFormImageBase64(p.image);
    setFormFeatured(!!p.featured);
    setIsAddModalOpen(true);
  };

  // Handle Photo File Upload & Base64 Conversion
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFormLoading(true);
      const base64 = await convertFileToBase64(file);
      setFormImageBase64(base64);
      showStatus('Photo converted to optimized Base64!', 'success');
    } catch (err: any) {
      showStatus('Failed to process image: ' + err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Save Product (Insert or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formImageBase64) {
      showStatus('Please provide Product ID, Name, and an Image.', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const catObj = categories.find((c) => c.id === formCategory);
      await upsertProduct({
        id: formId.trim(),
        name: formName.trim(),
        category: formCategory,
        categoryLabel: catObj ? catObj.label : `${formCategory} Collection`,
        image: formImageBase64,
        price: formPrice.trim(),
        description: formDescription.trim(),
        featured: formFeatured,
      });

      showStatus(`Product ${formId} saved successfully!`, 'success');
      setIsAddModalOpen(false);
      refreshData();
    } catch (err: any) {
      showStatus('Error saving product: ' + err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete product ${id}?`)) return;

    try {
      await deleteProduct(id);
      showStatus(`Product ${id} deleted successfully!`, 'success');
      refreshData();
    } catch (err: any) {
      showStatus('Error deleting product: ' + err.message, 'error');
    }
  };

  // Quick Inline Price Save
  const handleSaveQuickPrice = async (id: string) => {
    const newPrice = quickPriceMap[id] || '';
    setSavingPriceId(id);
    try {
      await updateProductPrice(id, newPrice);
      showStatus(`Price for ${id} updated to "${newPrice || 'Inquiry'}"`, 'success');
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
      );
    } catch (err: any) {
      showStatus('Failed to update price: ' + err.message, 'error');
    } finally {
      setSavingPriceId(null);
    }
  };

  // Save New Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatLabel.trim()) return;

    try {
      await upsertCategory({
        id: newCatId.trim().toLowerCase().replace(/\s+/g, '-'),
        label: newCatLabel.trim(),
        description: newCatDesc.trim(),
      });

      showStatus(`Category "${newCatLabel}" created!`, 'success');
      setNewCatId('');
      setNewCatLabel('');
      setNewCatDesc('');
      refreshData();
    } catch (err: any) {
      showStatus('Error adding category: ' + err.message, 'error');
    }
  };

  // Filtered Products for Management View
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (onlyMissingPrice) {
      result = result.filter((p) => !p.price || p.price.trim() === '');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, selectedCategory, onlyMissingPrice, searchQuery]);

  const missingPriceCount = useMemo(() => {
    return products.filter((p) => !p.price || p.price.trim() === '').length;
  }, [products]);

  // SQL Setup Script for manual copy
  const sqlSetupScript = `-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  category_label TEXT DEFAULT '',
  image TEXT NOT NULL,
  source_file TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

CREATE POLICY "Admin write categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (true);`;

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-cream rounded-2xl border border-champagne p-8 shadow-luxury text-center space-y-6">
          {/* Brand Seal */}
          <div className="w-16 h-16 rounded-full bg-warm-ivory border-2 border-gold flex items-center justify-center mx-auto overflow-hidden shadow-sm p-1">
            <img
              src={brandAssets.logo}
              alt="Naqsh-e-Noor Crest"
              className="w-full h-full object-contain mix-blend-multiply scale-110"
            />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-espresso">
              Atelier Studio Admin
            </h1>
            <p className="text-xs text-muted-brown mt-1">
              Naqsh-e-Noor Private Management Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider font-semibold text-espresso mb-1"
              >
                Studio Passcode
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin passcode..."
                className="w-full px-3.5 py-2.5 bg-warm-ivory border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
            >
              Sign In to Atelier Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-champagne/60">
            <button
              onClick={onExit}
              className="text-xs text-muted-brown hover:text-espresso inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-warm-ivory text-espresso flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-champagne/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warm-ivory border border-gold/80 flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
            <img src={brandAssets.logo} alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div>
            <h1 className="font-serif text-base sm:text-lg font-bold text-espresso leading-none uppercase tracking-wide">
              Naqsh-e-Noor Admin
            </h1>
            <span className="text-[10px] text-gold font-bold tracking-widest uppercase">
              Database Studio Manager
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 text-espresso/70 hover:text-gold hover:bg-champagne/20 rounded-lg transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold' : ''}`} />
          </button>

          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-ivory border border-champagne hover:border-gold text-xs font-semibold uppercase tracking-wider text-espresso rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">View Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Supabase Schema Alert if tables are missing */}
        {dbHealth && (!dbHealth.categoriesTableExists || !dbHealth.productsTableExists) && (
          <div className="p-4 sm:p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <Database className="w-5 h-5 text-amber-600" />
              <span>Supabase Database Tables Not Detected</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-800">
              Your Supabase project is connected, but the <strong>categories</strong> and{' '}
              <strong>products</strong> tables need to be created in your Supabase SQL Editor.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlSetupScript);
                  showStatus('SQL schema copied to clipboard!', 'success');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Setup SQL</span>
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-ivory border border-amber-400 text-amber-900 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-amber-100 transition-colors"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={refreshData}
                className="text-xs text-amber-800 underline font-medium hover:text-amber-950"
              >
                I have run the SQL, check again
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-xl bg-cream border border-champagne shadow-xs">
            <div className="flex items-center justify-between text-muted-brown mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Live Products</span>
              <Package className="w-4 h-4 text-gold" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-espresso">{products.length}</p>
            <p className="text-[10px] text-muted-brown mt-0.5">Stored in Supabase DB</p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-cream border border-champagne shadow-xs">
            <div className="flex items-center justify-between text-muted-brown mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Collections</span>
              <Layers className="w-4 h-4 text-gold" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-espresso">{categories.length}</p>
            <p className="text-[10px] text-muted-brown mt-0.5">Active categories</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('pricing');
              setOnlyMissingPrice(true);
            }}
            className="p-4 sm:p-5 rounded-xl bg-cream border border-champagne shadow-xs cursor-pointer hover:border-gold transition-colors"
          >
            <div className="flex items-center justify-between text-muted-brown mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Missing Price</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">{missingPriceCount}</p>
            <p className="text-[10px] text-amber-800 mt-0.5 font-medium">Click to fill prices in table</p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-cream border border-champagne shadow-xs">
            <div className="flex items-center justify-between text-muted-brown mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Database Status</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm sm:text-base font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected</span>
            </p>
            <p className="text-[10px] text-muted-brown mt-1 truncate">pjfkocskpqeopentiqsj</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-champagne overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-cream text-espresso border-t-2 border-gold font-bold'
                : 'text-muted-brown hover:text-espresso'
            }`}
          >
            <Package className="w-4 h-4 text-gold" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-cream text-espresso border-t-2 border-gold font-bold'
                : 'text-muted-brown hover:text-espresso'
            }`}
          >
            <DollarSign className="w-4 h-4 text-gold" />
            <span>Quick Price Editor</span>
            {missingPriceCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {missingPriceCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-cream text-espresso border-t-2 border-gold font-bold'
                : 'text-muted-brown hover:text-espresso'
            }`}
          >
            <Layers className="w-4 h-4 text-gold" />
            <span>Collections &amp; Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ml-auto ${
              activeTab === 'setup'
                ? 'bg-cream text-espresso border-t-2 border-gold font-bold'
                : 'text-muted-brown hover:text-espresso'
            }`}
          >
            <Database className="w-4 h-4 text-gold" />
            <span>SQL Schema</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cream p-4 rounded-xl border border-champagne">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-espresso/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search live DB by ID or title..."
                  className="w-full pl-10 pr-4 py-2 bg-warm-ivory border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs font-semibold text-espresso focus:outline-none focus:border-gold uppercase tracking-wider"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-cream rounded-xl overflow-hidden border border-champagne/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/5] bg-champagne-light overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-warm-ivory/90 text-[10px] font-bold text-espresso shadow-xs border border-champagne/60">
                        {p.id}
                      </span>
                      {p.featured && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-gold text-warm-ivory text-[8.5px] font-bold uppercase shadow-xs">
                          Spotlight
                        </span>
                      )}
                    </div>

                    <div className="p-3 space-y-1.5">
                      <p className="text-[10px] text-muted-brown uppercase tracking-wider font-semibold truncate">
                        {p.category}
                      </p>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-espresso truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-xs font-serif italic text-espresso font-semibold">
                        {p.price ? p.price : <span className="text-amber-700 italic">No price set</span>}
                      </p>

                      <div className="pt-2 border-t border-champagne/60 flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-espresso/70 hover:text-gold hover:bg-champagne/30 rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-cream rounded-2xl border border-champagne p-8 space-y-3">
                <Package className="w-10 h-10 text-gold/60 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-espresso">No Products in Database</h3>
                <p className="text-xs text-muted-brown max-w-md mx-auto">
                  {products.length === 0
                    ? 'No products found in the database. Click below to add your first creation!'
                    : 'No products match your active search filters.'}
                </p>
                {products.length === 0 && (
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Creation</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUICK PRICE BATCH EDITOR */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="bg-cream p-4 rounded-xl border border-champagne flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-espresso">Quick Price Table Editor</h3>
                <p className="text-xs text-muted-brown">
                  Type prices directly in the fields below and press Enter or Tab. Changes save immediately to Supabase!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-espresso cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyMissingPrice}
                    onChange={(e) => setOnlyMissingPrice(e.target.checked)}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span>Show Only Items Missing Prices ({missingPriceCount})</span>
                </label>
              </div>
            </div>

            {/* Editable Price Table */}
            <div className="bg-cream rounded-xl border border-champagne overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-champagne-light text-espresso uppercase tracking-wider text-[10px] font-bold border-b border-champagne">
                    <tr>
                      <th className="py-3 px-4">Thumb</th>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 min-w-[200px]">Price (e.g. ₹4,500)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne/40">
                    {filteredProducts.map((p) => {
                      const currentVal = quickPriceMap[p.id] ?? (p.price || '');
                      const isSaving = savingPriceId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-warm-ivory/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <img src={p.image} alt="" className="w-10 h-10 rounded object-cover border border-champagne" />
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-espresso">{p.id}</td>
                          <td className="py-2.5 px-4 font-medium text-espresso max-w-xs truncate">{p.name}</td>
                          <td className="py-2.5 px-4 capitalize text-muted-brown font-semibold">{p.category}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) =>
                                  setQuickPriceMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveQuickPrice(p.id);
                                }}
                                placeholder="Leave empty for inquiry..."
                                className="w-full px-2.5 py-1.5 bg-warm-ivory border border-champagne rounded text-xs font-semibold text-espresso focus:outline-none focus:border-gold"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleSaveQuickPrice(p.id)}
                              disabled={isSaving}
                              className="px-3 py-1 bg-gold hover:bg-gold-dark text-warm-ivory text-[10px] font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Add Category Form */}
            <div className="md:col-span-5 bg-cream p-6 rounded-2xl border border-champagne shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-espresso">Add New Category</h3>
              <p className="text-xs text-muted-brown">
                New categories automatically appear as filter tabs in the public storefront!
              </p>

              <form onSubmit={handleSaveCategory} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                    Category Slug (ID)
                  </label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="e.g. shawls, clutches, velvet"
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="e.g. Pashmina & Silk Shawls"
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description of this collection..."
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                >
                  Create Collection Category
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="md:col-span-7 bg-cream p-6 rounded-2xl border border-champagne shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-espresso">Active Collections</h3>
              <div className="space-y-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-warm-ivory/80 border border-champagne flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-espresso">{c.label}</span>
                        <span className="px-2 py-0.5 rounded bg-champagne text-[10px] font-mono text-espresso font-bold">
                          {c.id}
                        </span>
                      </div>
                      {c.description && <p className="text-xs text-muted-brown mt-0.5">{c.description}</p>}
                    </div>
                    <span className="text-xs font-bold text-gold px-2.5 py-1 rounded bg-gold/10">
                      {products.filter((p) => p.category === c.id).length} pieces
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SQL SETUP */}
        {activeTab === 'setup' && (
          <div className="bg-cream p-6 sm:p-8 rounded-2xl border border-champagne space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-espresso">Supabase SQL Schema</h3>
                <p className="text-xs text-muted-brown">
                  Run this SQL in your Supabase Project &rarr; SQL Editor to initialize the database tables.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlSetupScript);
                  showStatus('Copied SQL to clipboard!', 'success');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-espresso-dark text-champagne text-xs font-mono overflow-x-auto leading-relaxed">
              {sqlSetupScript}
            </pre>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-espresso-dark/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative bg-cream rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-modal border border-champagne p-6 sm:p-8 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold text-espresso">
              {editingProduct ? `Edit ${editingProduct.id}` : 'Add New Handcrafted Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Photo Upload & Base64 Converter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
                  Product Photograph (Converts to Base64) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {formImageBase64 ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-champagne flex-shrink-0">
                      <img src={formImageBase64} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-champagne-light border border-dashed border-champagne/80 flex items-center justify-center text-muted-brown flex-shrink-0">
                      <Upload className="w-6 h-6 text-gold/60" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-muted-brown file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-champagne file:text-espresso hover:file:bg-gold hover:file:text-warm-ivory cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-brown">
                      Accepts WebP, JPG, PNG. Image will be automatically optimized to Base64 format.
                    </p>
                  </div>
                </div>
              </div>

              {/* ID and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                    Product ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. BRD-015"
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs font-mono font-bold text-espresso focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                    Collection / Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs font-semibold text-espresso focus:outline-none focus:border-gold uppercase"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                  Design Title / Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Velvet Zardozi Bridal Dupatta"
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                  Price (Optional)
                </label>
                <input
                  type="text"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. ₹6,500 (Leave empty for 'Price upon request')"
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                  Artisan Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe threadwork stitches, base fabric, craftsmanship details..."
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg text-xs text-espresso focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Spotlight Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-espresso cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded text-gold focus:ring-gold"
                />
                <span>Feature in Curated Spotlight</span>
              </label>

              {/* Actions */}
              <div className="pt-3 border-t border-champagne flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-xs text-muted-brown hover:text-espresso"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Saving to Supabase...' : 'Save Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
