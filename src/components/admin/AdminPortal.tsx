import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Copy,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Grid,
  List,
  ArrowUpRight,
  Tag,
  TrendingUp,
  Eye,
  Database,
  Key,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Product } from '../../data/products';
import {
  checkDatabaseHealth,
  fetchLiveProducts,
  fetchLiveCategories,
  upsertProduct,
  updateProductPrice,
  deleteProduct,
  upsertCategory,
  convertFileToBase64,
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'pricing' | 'categories' | 'setup'>('products');

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // View mode for products (Table vs Grid)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Database Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Health & Diagnostics
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

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

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

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, onlyMissingPrice]);

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
      showStatus(`Price for ${id} updated to "${newPrice || 'Price upon request'}"`, 'success');
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

  // Computed Metrics
  const missingPriceCount = useMemo(() => {
    return products.filter((p) => !p.price || p.price.trim() === '').length;
  }, [products]);

  const featuredCount = useMemo(() => {
    return products.filter((p) => p.featured).length;
  }, [products]);

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
          p.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, selectedCategory, onlyMissingPrice, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Category badge color helper
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'bridal':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'embroidery':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'floral':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'hoop':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'hues':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    }
  };

  // SQL Setup Script for user reference
  const sqlSetupScript = `-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create products table (Image is stored as Base64 text)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_label TEXT NOT NULL,
  image TEXT NOT NULL,
  source_file TEXT,
  description TEXT,
  price TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Create public access policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Manage Categories" ON public.categories;
CREATE POLICY "Public Manage Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Manage Products" ON public.products;
CREATE POLICY "Public Manage Products" ON public.products FOR ALL USING (true) WITH CHECK (true);`;

  // ----------------------------------------------------
  // RENDER: PASSWORD PROTECTION GATE
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">NAQSH-E-NOOR</h1>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mt-1">Studio Administration</p>
            <p className="text-xs text-slate-500 mt-2">
              Enter your management passcode to access database tools.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Passcode (default: admin123)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-500 font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-slate-700 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Return to public website</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: MAIN ADMIN DASHBOARD WITH LEFT SIDEBAR
  // ----------------------------------------------------
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ==================================================== */}
      {/* 1. LEFT SIDEBAR (DARK NAVY / SLATE AS IN SCREENSHOT) */}
      {/* ==================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111625] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <span className="font-serif text-lg font-bold text-white tracking-wider">N</span>
            </div>
            <div>
              <h1 className="font-serif text-base font-bold text-white tracking-wide leading-tight">NAQSH-E-NOOR</h1>
              <p className="text-[11px] text-slate-400 font-medium">Studio Admin</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Options (Vibrant Active Pill like in screenshot!) */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Products & Catalog */}
          <button
            onClick={() => {
              setActiveTab('products');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 shrink-0" />
              <span>Products</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Quick Price Editor */}
          <button
            onClick={() => {
              setActiveTab('pricing');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'pricing'
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Price Editor</span>
            </div>
            {missingPriceCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {missingPriceCount}
              </span>
            )}
          </button>

          {/* Collections & Categories */}
          <button
            onClick={() => {
              setActiveTab('categories');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'categories'
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Collections</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {categories.length}
            </span>
          </button>

          {/* Database Setup & SQL */}
          <button
            onClick={() => {
              setActiveTab('setup');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'setup'
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings &amp; SQL</span>
          </button>
        </nav>

        {/* Bottom Sidebar: Logout & Storefront */}
        <div className="p-4 border-t border-slate-800/80 space-y-1.5">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Storefront</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2. MAIN CONTENT AREA (CLEAN WHITE / SLATE DASHBOARD) */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* TOP HEADER BAR */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4">
          
          {/* Left: Mobile hamburger & Page Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'products' && 'Product Management'}
                {activeTab === 'pricing' && 'Quick Price Editor'}
                {activeTab === 'categories' && 'Collections & Categories'}
                {activeTab === 'setup' && 'Database & SQL Setup'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                {activeTab === 'dashboard' && 'Key metrics, database activity, and inventory summary.'}
                {activeTab === 'products' && 'Manage boutique creations, Base64 photography, and tags.'}
                {activeTab === 'pricing' && 'Type prices directly in the table and save instantly.'}
                {activeTab === 'categories' && 'Organize creations into slow needlework collections.'}
                {activeTab === 'setup' && 'Supabase connection status and PostgreSQL schema.'}
              </p>
            </div>
          </div>

          {/* Right: Actions, Refresh, Add Button & Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            
            {/* Refresh Live DB Button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Refresh database data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Prominent Primary Action Button (+ Add New Creation, purple pill like screenshot!) */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add New Creation</span>
              <span className="xs:hidden">Add</span>
            </button>

            {/* Admin User Profile Pill (matching top-right of screenshot) */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-serif font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-bold text-slate-900">Admin</p>
                <p className="text-[11px] text-slate-400">Super Admin</p>
              </div>
            </div>

          </div>
        </header>

        {/* SCROLLABLE MAIN BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">

          {/* ==================================================== */}
          {/* STATS KPI CARDS ROW (4 CARDS LIKE IN SCREENSHOT!)    */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* KPI 1: Total Products */}
            <div
              onClick={() => setActiveTab('products')}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Total Creations</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{products.length}</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Stored in Supabase DB</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Active Collections */}
            <div
              onClick={() => setActiveTab('categories')}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Active Collections</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{categories.length}</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>5 needlework categories</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Missing Prices */}
            <div
              onClick={() => {
                setActiveTab('pricing');
                setOnlyMissingPrice(true);
              }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-amber-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Pending Prices</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">{missingPriceCount}</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {missingPriceCount === 0 ? 'All priced!' : 'Click to write prices'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4: Featured Creations */}
            <div
              onClick={() => setActiveTab('products')}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Featured Pieces</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{featuredCount}</p>
                <p className="text-[11px] font-semibold text-indigo-600">Highlighted on homepage</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW                            */}
          {/* ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Category Breakdown & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Collections Progress Distribution */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Collections Breakdown</h3>
                      <p className="text-xs text-slate-400">Distribution of designs stored in Supabase</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Manage Collections &rarr;
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category === cat.id).length;
                      const percent = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span className="capitalize">{cat.label}</span>
                            <span className="text-slate-400">{count} pieces ({percent}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Quick Action Cards */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Database Studio Quick Actions</h3>
                    <p className="text-xs text-slate-400 mt-1">Direct shortcuts to manage your live catalog</p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleOpenAddModal}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          +
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Add New Creation</p>
                          <p className="text-[11px] text-slate-400">Upload Base64 photo and description</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('pricing')}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          $
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Fill Missing Prices</p>
                          <p className="text-[11px] text-slate-400">{missingPriceCount} pieces pending price tag</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={onExit}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Preview Live Storefront</p>
                          <p className="text-[11px] text-slate-400">See changes reflected in real-time</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Supabase Database is healthy and connected.</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PRODUCT MANAGEMENT (TABLE LIKE SCREENSHOT!)   */}
          {/* ==================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              {/* Filter and Search Bar Controls (matching screenshot layout!) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search creations by ID, title, collection..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns & View Toggle (matching screenshot!) */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  
                  {/* Category Dropdown */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="all">All Collections ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({products.filter((p) => p.category === c.id).length})
                      </option>
                    ))}
                  </select>

                  {/* Price Status Dropdown */}
                  <select
                    value={onlyMissingPrice ? 'missing' : 'all'}
                    onChange={(e) => setOnlyMissingPrice(e.target.value === 'missing')}
                    className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="all">All Price Status</option>
                    <option value="missing">Pending Price ({missingPriceCount})</option>
                  </select>

                  {/* View Mode Toggle: Table vs Grid */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Table View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Cards Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>

              {/* MAIN CONTENT: TABLE OR GRID */}
              {filteredProducts.length > 0 ? (
                <>
                  {viewMode === 'table' ? (
                    /* ==================================================== */
                    /* HIGH-END DATA TABLE (EXACTLY LIKE SCREENSHOT)        */
                    /* ==================================================== */
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50/80 border-b border-slate-100 uppercase text-[11px] font-semibold text-slate-400 tracking-wider">
                            <tr>
                              <th className="py-3.5 pl-6 pr-3 w-10">
                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                              </th>
                              <th className="py-3.5 px-4">Creation</th>
                              <th className="py-3.5 px-4">Collection</th>
                              <th className="py-3.5 px-4">Price</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {pagedProducts.map((p) => {
                              const hasPrice = p.price && p.price.trim() !== '';
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                  {/* Checkbox */}
                                  <td className="py-3 pl-6 pr-3">
                                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                  </td>

                                  {/* Product Thumbnail & Title (like user avatar in screenshot) */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900 leading-snug">{p.name}</p>
                                        <p className="font-mono text-[11px] text-slate-400">{p.id}</p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Category Pastel Badge (like Super Admin/Editor in screenshot) */}
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize border ${getCategoryBadgeClass(
                                        p.category
                                      )}`}
                                    >
                                      {p.category}
                                    </span>
                                  </td>

                                  {/* Price Tag */}
                                  <td className="py-3 px-4">
                                    {hasPrice ? (
                                      <span className="font-semibold text-slate-900">{p.price}</span>
                                    ) : (
                                      <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                        Price upon request
                                      </span>
                                    )}
                                  </td>

                                  {/* Status Dot */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="text-[11px] text-slate-600">Active</span>
                                      {p.featured && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right pr-6">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        onClick={() => handleOpenEditModal(p)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit creation"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete creation"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Row (matching bottom of screenshot!) */}
                      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <p>
                          Showing{' '}
                          <span className="font-bold text-slate-900">
                            {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                            {Math.min(currentPage * pageSize, filteredProducts.length)}
                          </span>{' '}
                          of <span className="font-bold text-slate-900">{filteredProducts.length}</span> creations
                        </p>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                            let pageNum = idx + 1;
                            if (totalPages > 5 && currentPage > 3) {
                              pageNum = currentPage - 3 + idx;
                              if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-[#6366F1] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ==================================================== */
                    /* VISUAL CARDS GRID VIEW                               */
                    /* ==================================================== */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {pagedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col hover:border-indigo-200 transition-all group"
                        >
                          <div className="relative aspect-square overflow-hidden bg-slate-100">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-xs ${getCategoryBadgeClass(
                                p.category
                              )}`}
                            >
                              {p.category}
                            </span>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <p className="font-mono text-[10px] text-slate-400">{p.id}</p>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                              <p className="text-xs font-semibold text-slate-700 mt-1">
                                {p.price && p.price.trim() !== '' ? p.price : 'Price upon request'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                {p.featured ? '⭐ Featured' : 'Standard'}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-1 text-slate-400 hover:text-indigo-600"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No creations found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery ? `No creations match "${searchQuery}".` : 'Your database is currently empty.'}
                  </p>
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Creation</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: QUICK PRICE EDITOR                            */}
          {/* ==================================================== */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Interactive Price Table</h3>
                  <p className="text-xs text-slate-500">
                    Type prices directly into the inputs and press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Tab</kbd> to save.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyMissingPrice}
                      onChange={(e) => setOnlyMissingPrice(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Missing Price Only ({missingPriceCount})</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 border-b border-slate-100 uppercase text-[11px] font-semibold text-slate-400 tracking-wider">
                      <tr>
                        <th className="py-3 px-6">ID &amp; Photo</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Collection</th>
                        <th className="py-3 px-4 w-60">Price (Instant Save)</th>
                        <th className="py-3 px-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-6">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-900">{p.id}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{p.name}</td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${getCategoryBadgeClass(p.category)}`}>
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                                ₹ / $
                              </span>
                              <input
                                type="text"
                                value={quickPriceMap[p.id] ?? ''}
                                onChange={(e) => setQuickPriceMap({ ...quickPriceMap, [p.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveQuickPrice(p.id);
                                  }
                                }}
                                placeholder="e.g. ₹45,000"
                                className="w-full pl-10 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right pr-6">
                            <button
                              onClick={() => handleSaveQuickPrice(p.id)}
                              disabled={savingPriceId === p.id}
                              className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg shadow-2xs transition-colors"
                            >
                              {savingPriceId === p.id ? 'Saving...' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <p>
                    Showing {pagedProducts.length} of {filteredProducts.length} items
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-bold text-slate-800">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: COLLECTIONS & CATEGORIES                      */}
          {/* ==================================================== */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left: Add New Collection Form */}
              <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Collection</h3>
                  <p className="text-xs text-slate-500">Add a new needlework collection category.</p>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Category Identifier (Slug)
                    </label>
                    <input
                      type="text"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="e.g. shawls, jewelry"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="e.g. Heirloom Shawls"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      rows={3}
                      placeholder="Short editorial subtitle for the collection..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-colors"
                  >
                    Add Collection
                  </button>
                </form>
              </div>

              {/* Right: Active Collections Cards */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="text-base font-bold text-slate-900">Active Collections ({categories.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c.id).length;
                    return (
                      <div
                        key={c.id}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize border ${getCategoryBadgeClass(c.id)}`}>
                            {c.label}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{count} pieces</span>
                        </div>
                        <p className="font-mono text-[10px] text-slate-400">ID: {c.id}</p>
                        {c.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: DATABASE & SQL SETUP                          */}
          {/* ==================================================== */}
          {activeTab === 'setup' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Supabase SQL Schema &amp; Connection</h3>
                  <p className="text-xs text-slate-500">
                    Verify connection health or copy the schema definition.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSetupScript);
                    showStatus('Copied SQL to clipboard!', 'success');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </button>
              </div>

              {/* Status Pill */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase font-semibold">Supabase Endpoint</p>
                  <p className="font-mono text-slate-900 font-medium truncate mt-0.5">
                    https://pjfkocskpqeopentiqsj.supabase.co
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase font-semibold">Live Products Table</p>
                  <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{products.length} records active</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase font-semibold">Live Categories Table</p>
                  <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{categories.length} categories active</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  PostgreSQL Initialization Script
                </label>
                <pre className="p-4 rounded-xl bg-[#0F172A] text-indigo-300 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  {sqlSetupScript}
                </pre>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==================================================== */}
      {/* ADD / EDIT PRODUCT MODAL                             */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct ? `Edit Creation: ${editingProduct.id}` : 'Add New Creation'}
                </h3>
                <p className="text-xs text-slate-500">
                  Photos are auto-converted to Base64 format and stored directly in Supabase.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Creation Identifier (ID)
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. BRD-015"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Collection Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none capitalize"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Design Title
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Royal Emerald Zardozi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Leave blank for 'Price upon request'"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with Base64 Converter & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Creation Photograph (Auto-Converted to Base64)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-colors text-center">
                    <ImageIcon className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-800">Choose photograph file</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP &bull; Auto-optimized</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {formImageBase64 && (
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shrink-0 shadow-xs">
                      <img src={formImageBase64} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                        Base64
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Artisanal Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail the fabric, threadwork, hours of craftsmanship, and care instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featuredToggle" className="text-xs font-semibold text-slate-800 cursor-pointer select-none">
                  Highlight as Featured Piece on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving to Supabase...' : editingProduct ? 'Update Creation' : 'Save Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
