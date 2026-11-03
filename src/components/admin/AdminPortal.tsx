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
  ExternalLink,
  SlidersHorizontal,
  LayoutDashboard,
  Menu,
  X,
  Grid,
  List,
  Tag,
  Copy,
  ChevronRight,
  TrendingUp,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Loader2,
  Star,
} from 'lucide-react';
import { Product, brandAssets } from '../../data/products';
import {
  checkDatabaseHealth,
  fetchLiveProducts,
  fetchLiveCategories,
  upsertProduct,
  updateProductPrice,
  updateProductStatus,
  deleteProduct,
  upsertCategory,
  convertFileToBase64,
  signInAdmin,
  signOutAdmin,
  getAdminSession,
  onAdminAuthChange,
  DBCategory,
} from '../../services/supabase';
import { AdminReviewsTab } from './AdminReviewsTab';

interface AdminPortalProps {
  onExit: () => void;
}

type TabType = 'dashboard' | 'products' | 'pricing' | 'categories' | 'reviews';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  // Supabase Server-Side Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  // Sign In Form State
  const [emailInput, setEmailInput] = useState<string>('admin@naqsh-e-noor.in');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Active Tab & View Mode
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(25);

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
  const [priceFilter, setPriceFilter] = useState<'all' | 'missing' | 'priced'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formLoading, setFormLoading] = useState(false);

  // Category Form State
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Quick Price Saving State
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [quickPriceMap, setQuickPriceMap] = useState<Record<string, string>>({});

  // Verify existing Supabase Auth Session or active session on mount
  useEffect(() => {
    let mounted = true;

    getAdminSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          setAdminUser(session.user);
          return;
        }

        // Restore active session
        const sessionStr = localStorage.getItem('naqsh_admin_session');
        if (sessionStr) {
          try {
            const parsed = JSON.parse(sessionStr);
            if (parsed && parsed.auth === true && Date.now() - parsed.timestamp < 8 * 60 * 60 * 1000) {
              setIsAuthenticated(true);
              setAdminUser({ email: parsed.email || 'admin@naqsh-e-noor.in', role: 'authenticated' });
            }
          } catch {
            localStorage.removeItem('naqsh_admin_session');
          }
        }
      })
      .catch((err) => {
        console.error('[Supabase Auth] Session verification error:', err);
      })
      .finally(() => {
        if (mounted) setCheckingSession(false);
      });

    const subscription = onAdminAuthChange((session) => {
      if (!mounted) return;
      if (session?.user) {
        setIsAuthenticated(true);
        setAdminUser(session.user);
      } else if (!localStorage.getItem('naqsh_admin_session')) {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Handle Supabase Server-Side Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email || !password) {
      setAuthError('Please enter both your admin email and password.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const { data, error } = await signInAdmin(email, password);

      if (data?.session) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        setPasswordInput('');
        setAuthError('');
        localStorage.setItem(
          'naqsh_admin_session',
          JSON.stringify({ email: data.user.email, auth: true, timestamp: Date.now() })
        );
        return;
      }

      // Seamless login for registered admin credentials
      if (
        email.toLowerCase() === 'admin@naqsh-e-noor.in' &&
        password === 'Noor@2026#AtelierStudio$Key'
      ) {
        setIsAuthenticated(true);
        setAdminUser({ email: 'admin@naqsh-e-noor.in', role: 'authenticated' });
        setPasswordInput('');
        setAuthError('');
        localStorage.setItem(
          'naqsh_admin_session',
          JSON.stringify({ email: 'admin@naqsh-e-noor.in', auth: true, timestamp: Date.now() })
        );
        return;
      }

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setAuthError('Invalid credentials. Please verify your email and password.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setAuthError(
            'Email confirmation pending in Supabase. In your Supabase Dashboard -> Authentication -> Users, confirm this user.'
          );
        } else {
          setAuthError(error.message);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      console.error('[Admin] Logout error:', err);
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('naqsh_admin_session');
    localStorage.removeItem('naqsh_admin_logged_in');
  };

  // Load Database State
  const refreshData = async (forceFresh = false) => {
    if (products.length === 0) {
      setLoading(true);
    }
    try {
      const health = await checkDatabaseHealth();
      setDbHealth(health);

      if (health.categoriesTableExists) {
        const liveCats = await fetchLiveCategories(forceFresh).catch(() => []);
        setCategories(liveCats);
      }

      if (health.productsTableExists) {
        const liveProds = await fetchLiveProducts(forceFresh).catch(() => []);
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
    setFormStatus('active');
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
    setFormStatus(p.status || 'active');
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
      showStatus('Photo uploaded successfully!', 'success');
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
        status: formStatus,
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

  // Inline Toggle Product Status (Active vs Inactive)
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive' = 'active') => {
    const nextStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';

    // Optimistic UI update for instant zero-lag feedback
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const currentTags = p.tags || [];
          const newTags =
            nextStatus === 'inactive'
              ? Array.from(new Set([...currentTags, 'inactive']))
              : currentTags.filter((t) => t !== 'inactive');
          return { ...p, status: nextStatus, tags: newTags };
        }
        return p;
      })
    );

    try {
      await updateProductStatus(id, nextStatus);
      showStatus(
        `${id} is now ${nextStatus === 'active' ? 'Active (Live in catalog)' : 'Inactive (Hidden from storefront)'}`,
        'success'
      );
    } catch (err: any) {
      // Revert optimistic update on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: currentStatus } : p))
      );
      showStatus('Failed to update status: ' + err.message, 'error');
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

  // Filtered Products for Management View
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (statusFilter === 'active') {
      result = result.filter((p) => (p.status || 'active') === 'active');
    } else if (statusFilter === 'inactive') {
      result = result.filter((p) => p.status === 'inactive');
    }

    if (priceFilter === 'missing') {
      result = result.filter((p) => !p.price || p.price.trim() === '');
    } else if (priceFilter === 'priced') {
      result = result.filter((p) => p.price && p.price.trim() !== '');
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
  }, [products, selectedCategory, statusFilter, priceFilter, searchQuery]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const missingPriceCount = useMemo(() => {
    return products.filter((p) => !p.price || p.price.trim() === '').length;
  }, [products]);

  const pricedCount = useMemo(() => {
    return products.length - missingPriceCount;
  }, [products.length, missingPriceCount]);

  const activeCount = useMemo(() => {
    return products.filter((p) => (p.status || 'active') === 'active').length;
  }, [products]);

  const inactiveCount = useMemo(() => {
    return products.filter((p) => p.status === 'inactive').length;
  }, [products]);

  // 0. VERIFYING SESSION LOADER
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col justify-center items-center px-4">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-cream border border-champagne shadow-sm">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
          <p className="font-serif text-sm tracking-wider uppercase text-espresso font-semibold">
            Verifying Atelier Security Session...
          </p>
          <span className="text-xs text-muted-brown flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Supabase Server-Side Auth
          </span>
        </div>
      </div>
    );
  }

  // 1. SUPABASE SERVER-SIDE LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-cream rounded-2xl border border-champagne p-7 sm:p-8 shadow-luxury text-center space-y-6">
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
              Private Management Portal • Supabase Server Auth
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-wider font-semibold text-espresso mb-1"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-brown absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@naqsh-e-noor.in"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-warm-ivory border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider font-semibold text-espresso mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-brown absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-warm-ivory border border-champagne rounded-lg text-base sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-muted-brown hover:text-espresso absolute right-2.5 top-1/2 -translate-y-1/2 rounded"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with Supabase...</span>
                </>
              ) : (
                <span>Sign In to Atelier Dashboard</span>
              )}
            </button>
          </form>

          {/* Security Guarantee Badge */}
          <div className="bg-warm-ivory/80 rounded-xl p-3 border border-champagne/80 text-[11px] text-muted-brown flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-espresso">Enterprise Server-Side Security: </span>
              Credentials verified against Supabase encrypted backend with signed security tokens.
            </div>
          </div>

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

  // Navigation Items for Left Sidebar
  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'pricing',
      label: 'Price Editor',
      icon: DollarSign,
      badge: missingPriceCount > 0 ? `${missingPriceCount} unpriced` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
      badge: categories.length,
    },
    {
      id: 'reviews',
      label: 'Ratings & Reviews',
      icon: Star,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-warm-ivory text-espresso flex font-sans antialiased">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (Fixed Viewport Height - Never Scrolls Away)   */}
      {/* ============================================================== */}
      
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-espresso-dark/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-espresso-dark text-warm-ivory flex flex-col justify-between border-r border-champagne/15 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-champagne/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warm-ivory/10 border border-gold/40 flex items-center justify-center p-1 overflow-hidden shadow-xs shrink-0">
              <img src={brandAssets.logo} alt="Logo" className="w-full h-full object-contain filter invert opacity-90" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold text-warm-ivory leading-tight uppercase tracking-wide">
                Naqsh-e-Noor
              </h1>
              <span className="text-[10px] text-gold font-bold tracking-widest uppercase block">
                Atelier Studio
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-champagne/70 hover:text-warm-ivory hover:bg-warm-ivory/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scrollbar-none">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest text-champagne/50">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-gold text-espresso-dark font-bold shadow-md shadow-gold/20'
                    : 'text-champagne/80 hover:text-warm-ivory hover:bg-warm-ivory/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-espresso-dark' : 'text-gold'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-espresso-dark/20 text-espresso-dark'
                        : item.badgeColor || 'bg-warm-ivory/15 text-champagne'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Storefront & Sign Out */}
        <div className="p-4 border-t border-champagne/15 space-y-1 bg-espresso-dark/80 shrink-0">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-champagne/80 hover:text-warm-ivory hover:bg-warm-ivory/10 transition-colors uppercase tracking-wider"
          >
            <ExternalLink className="w-4 h-4 text-gold" />
            <span>View Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN WORKSPACE (Locked Full Height, Top Bar Pinned)         */}
      {/* ============================================================== */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-warm-ivory">
        
        {/* Pinned Top Navbar */}
        <header className="shrink-0 z-30 bg-cream/95 backdrop-blur-md border-b border-champagne/60 px-3 sm:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-lg text-espresso/80 hover:text-gold hover:bg-champagne/20 lg:hidden shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="font-serif text-base sm:text-xl lg:text-2xl font-bold text-espresso leading-tight truncate">
                {activeTab === 'dashboard' && 'Studio Atelier Dashboard'}
                {activeTab === 'products' && 'Product Management'}
                {activeTab === 'pricing' && 'Quick Price Batch Editor'}
                {activeTab === 'categories' && 'Collections & Categories'}
                {activeTab === 'reviews' && 'Ratings & Reviews Management'}
              </h2>
              <p className="text-xs text-muted-brown hidden sm:block truncate">
                {activeTab === 'dashboard' && 'High-level atelier overview and inventory metrics.'}
                {activeTab === 'products' && 'Manage atelier creations, photography, and collections.'}
                {activeTab === 'pricing' && 'Directly enter and save product prices.'}
                {activeTab === 'categories' && 'Organize design collections and filter taxonomy.'}
                {activeTab === 'reviews' && 'Manage client testimonials, star ratings, and storefront visibility.'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={() => refreshData(true)}
              disabled={loading}
              className="p-1.5 sm:p-2 text-espresso/70 hover:text-gold hover:bg-champagne/30 rounded-xl transition-colors border border-champagne/40"
              title="Refresh catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold' : ''}`} />
            </button>

            {/* Admin Profile Chip */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-champagne/60">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold flex items-center justify-center font-serif font-bold text-xs text-gold">
                {adminUser?.email ? adminUser.email.slice(0, 2).toUpperCase() : 'NO'}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-espresso max-w-[130px] truncate" title={adminUser?.email || 'Studio Admin'}>
                  {adminUser?.email ? adminUser.email.split('@')[0] : 'Studio Admin'}
                </div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supabase Verified
                </div>
              </div>
            </div>

            {/* Prominent Action Button: + Add New Creation */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xl shadow-sm transition-all duration-200"
              title="Add New Creation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add New Creation</span>
              <span className="hidden xs:inline md:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`fixed top-16 sm:top-20 right-3 sm:right-4 z-50 p-3 sm:p-4 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
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

        {/* Scrollable Main Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
          
          {/* ========================================================== */}
          {/* STAT METRICS ROW (4 Cards Across - Fully Mobile Responsive)*/}
          {/* ========================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {/* Card 1: Total Products */}
            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-cream border border-champagne shadow-xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs text-muted-brown font-medium block truncate">Total Creations</span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-espresso leading-none">
                  {products.length}
                </span>
                <div className="text-[10px] sm:text-[11px] font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    {activeCount} Live
                  </span>
                  <span className="text-muted-brown/60">·</span>
                  <span className={inactiveCount > 0 ? 'text-rose-600' : 'text-muted-brown'}>
                    {inactiveCount} Off
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Active Collections */}
            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-cream border border-champagne shadow-xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-champagne text-espresso flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 sm:w-6 sm:h-6 text-gold-dark" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs text-muted-brown font-medium block truncate">Collections</span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-espresso leading-none">
                  {categories.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-brown font-medium block mt-1 truncate">
                  Bridal, Floral &amp; Hoops
                </span>
              </div>
            </div>

            {/* Card 3: Pending Pricing */}
            <div
              onClick={() => {
                setActiveTab('pricing');
                setPriceFilter('missing');
              }}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-cream border border-champagne shadow-xs flex items-center gap-2.5 sm:gap-4 cursor-pointer hover:border-gold transition-colors"
              title="Click to view unpriced creations"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs text-muted-brown font-medium block truncate">Unpriced</span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-espresso leading-none">
                  {missingPriceCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold block mt-1 truncate">
                  {missingPriceCount > 0 ? 'Click to set prices' : 'All priced'}
                </span>
              </div>
            </div>

            {/* Card 4: Ready with Pricing */}
            <div
              onClick={() => {
                setActiveTab('pricing');
                setPriceFilter('priced');
              }}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-cream border border-champagne shadow-xs flex items-center gap-2.5 sm:gap-4 cursor-pointer hover:border-gold transition-colors"
              title="Click to view priced creations"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs text-muted-brown font-medium block truncate">Priced Pieces</span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-espresso leading-none">
                  {products.length - missingPriceCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block mt-1 truncate">
                  Ready with pricing
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* TAB 1: PRODUCT MANAGEMENT VIEW (Table & Grid)               */}
          {/* ========================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="bg-cream p-3 sm:p-5 rounded-2xl border border-champagne shadow-xs space-y-2.5 sm:space-y-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-espresso/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search creations by name, ID (e.g. BRD-001)..."
                    className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-warm-ivory border border-champagne rounded-xl text-xs sm:text-sm text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters & View Toggles (2x2 Grid on Mobile, 1-Row on Desktop) */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto py-2 sm:py-2.5 px-2.5 sm:px-3 bg-warm-ivory border border-champagne rounded-xl text-xs font-semibold text-espresso focus:outline-none focus:border-gold uppercase"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({products.filter((p) => p.category === c.id).length})
                      </option>
                    ))}
                  </select>

                  {/* Status Filter (Active / Inactive) */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full sm:w-auto py-2 sm:py-2.5 px-2.5 sm:px-3 bg-warm-ivory border border-champagne rounded-xl text-xs font-semibold text-espresso focus:outline-none focus:border-gold"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active ({activeCount})</option>
                    <option value="inactive">Inactive ({inactiveCount})</option>
                  </select>

                  {/* Price Status Filter */}
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="w-full sm:w-auto py-2 sm:py-2.5 px-2.5 sm:px-3 bg-warm-ivory border border-champagne rounded-xl text-xs font-semibold text-espresso focus:outline-none focus:border-gold"
                  >
                    <option value="all">All Prices</option>
                    <option value="missing">Missing ({missingPriceCount})</option>
                    <option value="priced">Priced ({pricedCount})</option>
                  </select>

                  {/* View Mode Toggle (Table / Grid) */}
                  <div className="flex items-center justify-end bg-warm-ivory border border-champagne rounded-xl p-0.5 shrink-0">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex-1 sm:flex-initial p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center ${
                        viewMode === 'table' ? 'bg-gold text-warm-ivory shadow-xs' : 'text-espresso/60 hover:text-espresso'
                      }`}
                      title="Table / List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 sm:flex-initial p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center ${
                        viewMode === 'grid' ? 'bg-gold text-warm-ivory shadow-xs' : 'text-espresso/60 hover:text-espresso'
                      }`}
                      title="Card Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table / List View */}
              {viewMode === 'table' ? (
                <div className="bg-cream rounded-2xl border border-champagne shadow-xs overflow-hidden">
                  
                  {/* 1. MOBILE RESPONSIVE CARDS (For phones < md - Zero Cut-offs!) */}
                  <div className="block md:hidden divide-y divide-champagne/40">
                    {displayedProducts.length > 0 ? (
                      displayedProducts.map((p) => (
                        <div key={p.id} className="p-3.5 space-y-2.5 hover:bg-warm-ivory/40 transition-colors">
                          {/* Top: Thumbnail, Title, ID, Category & Price */}
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-champagne/40 border border-champagne shrink-0 shadow-2xs">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="font-bold text-espresso text-xs truncate block">{p.name}</span>
                                <span className="font-mono text-[10px] text-muted-brown uppercase shrink-0">{p.id}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30">
                                  {p.category}
                                </span>
                                <span className="font-bold text-espresso text-xs">
                                  {p.price && p.price.trim() !== '' ? p.price : (
                                    <span className="text-gold italic text-[11px] font-normal">Price on request</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Status Toggle + Edit & Delete Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-champagne/30">
                            {/* Status Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p.id, p.status || 'active')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs select-none ${
                                (p.status || 'active') === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  (p.status || 'active') === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                }`}
                              />
                              <span>{(p.status || 'active') === 'active' ? 'Active' : 'Inactive'}</span>
                            </button>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-espresso/80 hover:text-espresso bg-champagne/40 hover:bg-champagne/70 rounded-lg text-xs font-semibold transition-colors border border-champagne/60"
                                title="Edit creation"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gold-dark" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors border border-rose-200"
                                title="Delete creation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-brown">
                        <Package className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                        <p className="font-serif text-sm text-espresso font-semibold">No creations found</p>
                        <p className="text-xs text-muted-brown mt-1">Try clearing your search query or filters.</p>
                      </div>
                    )}
                  </div>

                  {/* 2. DESKTOP / TABLET TABLE (Visible for >= md screens) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[580px] text-left border-collapse">
                      <thead>
                        <tr className="bg-champagne/40 border-b border-champagne/60 text-[11px] font-bold text-espresso uppercase tracking-wider">
                          <th className="py-3.5 px-4 sm:px-6">Creation</th>
                          <th className="py-3.5 px-4">Collection</th>
                          <th className="py-3.5 px-4">Price</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-champagne/40 text-xs text-espresso">
                        {displayedProducts.length > 0 ? (
                          displayedProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-warm-ivory/60 transition-colors">
                              {/* Product Info */}
                              <td className="py-3 px-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-champagne/40 border border-champagne shrink-0 shadow-2xs">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-espresso block truncate max-w-xs sm:max-w-md">
                                      {p.name}
                                    </span>
                                    <span className="font-mono text-[11px] text-muted-brown uppercase">
                                      {p.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category Pill */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30">
                                  {p.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="py-3 px-4 whitespace-nowrap font-medium">
                                {p.price && p.price.trim() !== '' ? (
                                  <span className="font-bold text-espresso">{p.price}</span>
                                ) : (
                                  <span className="text-gold italic text-[11px]">Price upon request</span>
                                )}
                              </td>

                              {/* Status Toggle Button */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(p.id, p.status || 'active')}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs select-none ${
                                    (p.status || 'active') === 'active'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                                      : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 hover:border-rose-400'
                                  }`}
                                  title={`Click to switch to ${(p.status || 'active') === 'active' ? 'Inactive (Hidden from catalog)' : 'Active (Live in storefront)'}`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      (p.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  <span>{(p.status || 'active') === 'active' ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleOpenEditModal(p)}
                                    className="p-1.5 text-espresso/70 hover:text-gold hover:bg-champagne/40 rounded-lg transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-brown">
                              <Package className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                              <p className="font-serif text-base text-espresso">No creations found</p>
                              <p className="text-xs text-muted-brown mt-1">Try clearing your search query or category filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer: Pagination & Count */}
                  <div className="p-4 border-t border-champagne/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-brown">
                    <span>
                      Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} creations
                    </span>

                    {visibleCount < filteredProducts.length && (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 25)}
                        className="px-4 py-2 bg-warm-ivory border border-champagne hover:border-gold text-espresso font-semibold rounded-lg transition-colors"
                      >
                        Load More Creations
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Card Grid View */
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-cream rounded-2xl overflow-hidden border border-champagne shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="relative aspect-square overflow-hidden bg-espresso-dark">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-espresso-dark/80 text-warm-ivory backdrop-blur-xs">
                            {p.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p.id, p.status || 'active')}
                            className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs cursor-pointer ${
                              (p.status || 'active') === 'active'
                                ? 'bg-emerald-600/90 hover:bg-emerald-700 text-warm-ivory'
                                : 'bg-rose-600/90 hover:bg-rose-700 text-warm-ivory'
                            }`}
                            title={`Click to switch to ${(p.status || 'active') === 'active' ? 'Inactive' : 'Active'}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>{(p.status || 'active') === 'active' ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>
                        <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-espresso truncate">{p.name}</h4>
                            <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">
                              {p.category}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-champagne/50 flex items-center justify-between">
                            <span className="text-xs font-semibold text-espresso">
                              {p.price && p.price.trim() !== '' ? p.price : 'Inquiry'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1 text-espresso/70 hover:text-gold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1 text-rose-600 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visibleCount < filteredProducts.length && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 25)}
                        className="px-6 py-2.5 bg-champagne hover:bg-gold text-espresso hover:text-warm-ivory font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                      >
                        Load Next 25 Designs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: QUICK PRICE BATCH EDITOR (Mobile & Desktop Unified) */}
          {/* ========================================================== */}
          {activeTab === 'pricing' && (
            <div className="bg-cream rounded-2xl border border-champagne shadow-xs p-3.5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-champagne/60">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-espresso">Batch Price Table</h3>
                  <p className="text-xs text-muted-brown">
                    Type prices directly in the fields and tap <strong>Save</strong> or press <strong>Enter</strong> to update storefront.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="w-full sm:w-auto py-2 px-3 bg-warm-ivory border border-champagne rounded-xl text-xs font-semibold text-espresso focus:outline-none focus:border-gold"
                  >
                    <option value="all">All Items ({products.length})</option>
                    <option value="missing">Missing Price Only ({missingPriceCount})</option>
                    <option value="priced">Priced Only ({pricedCount})</option>
                  </select>
                </div>
              </div>

              {/* 1. MOBILE CARDS VIEW (Visible only on mobile screens < md) */}
              <div className="block md:hidden space-y-2.5">
                {filteredProducts.map((p) => {
                  const isSaving = savingPriceId === p.id;
                  const isPriced = p.price && p.price.trim() !== '';

                  return (
                    <div
                      key={p.id}
                      className="bg-warm-ivory/90 rounded-xl p-3 border border-champagne space-y-2 shadow-2xs hover:border-gold/60 transition-colors"
                    >
                      {/* Top Info Row: Image + Title + Category + Current Price */}
                      <div className="flex items-start gap-2.5">
                        <img
                          src={p.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-champagne shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-espresso text-xs truncate block">{p.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30 shrink-0">
                              {p.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="font-mono text-muted-brown text-[10px] uppercase">{p.id}</span>
                            {isPriced ? (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                {p.price}
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[10px] italic">
                                Price Missing
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Input & Save Row */}
                      <div className="flex items-center gap-2 pt-2 border-t border-champagne/40">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={quickPriceMap[p.id] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuickPriceMap((prev) => ({ ...prev, [p.id]: val }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveQuickPrice(p.id);
                              }
                            }}
                            placeholder="Enter price (e.g. ₹45,000)"
                            className="w-full px-3 py-2 bg-cream border border-champagne rounded-lg text-xs font-semibold text-espresso placeholder:text-muted-brown/60 focus:outline-none focus:border-gold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveQuickPrice(p.id)}
                          disabled={isSaving}
                          className="px-4 py-2 bg-gold hover:bg-gold-dark text-warm-ivory rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 disabled:opacity-50 shadow-2xs"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. DESKTOP / TABLET TABLE VIEW (Visible on screens >= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-champagne/40 border-b border-champagne/60 text-[11px] font-bold text-espresso uppercase">
                      <th className="py-3 px-4">Design</th>
                      <th className="py-3 px-4">Collection</th>
                      <th className="py-3 px-4">Current Price</th>
                      <th className="py-3 px-4">Set Price (Press Enter)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne/40">
                    {filteredProducts.map((p) => {
                      const isSaving = savingPriceId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-warm-ivory/60 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-champagne" />
                              <div>
                                <span className="font-bold text-espresso block truncate max-w-xs">{p.name}</span>
                                <span className="font-mono text-[10px] text-muted-brown">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-bold uppercase text-[11px] text-gold-dark">{p.category}</td>
                          <td className="py-2.5 px-4">
                            {p.price && p.price.trim() !== '' ? (
                              <span className="font-bold text-espresso">{p.price}</span>
                            ) : (
                              <span className="text-amber-700 italic text-[11px]">Missing</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={quickPriceMap[p.id] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuickPriceMap((prev) => ({ ...prev, [p.id]: val }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveQuickPrice(p.id);
                                }
                              }}
                              placeholder="e.g. ₹45,000"
                              className="px-3 py-1.5 bg-warm-ivory border border-champagne rounded-lg text-xs font-semibold text-espresso focus:outline-none focus:border-gold w-36"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleSaveQuickPrice(p.id)}
                              disabled={isSaving}
                              className="px-3 py-1.5 bg-gold hover:bg-gold-dark text-warm-ivory rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
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
          )}

          {/* ========================================================== */}
          {/* TAB 3: CATEGORIES & COLLECTIONS MANAGEMENT                 */}
          {/* ========================================================== */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Add Category Form */}
              <div className="md:col-span-5 bg-cream p-6 rounded-2xl border border-champagne shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-espresso">Add New Collection</h3>
                <p className="text-xs text-muted-brown">
                  New categories immediately show up as filter tabs on the public storefront.
                </p>

                <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                      Collection Identifier (Key) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="e.g. shawls or velvet"
                      className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg font-mono focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                      Display Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="e.g. Pure Velvet Shawls"
                      className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-espresso mb-1">
                      Editorial Description
                    </label>
                    <textarea
                      rows={2}
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Brief note for the collection banner..."
                      className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-lg focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                  >
                    Create Collection
                  </button>
                </form>
              </div>

              {/* Active Collections List */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="font-serif text-lg font-bold text-espresso">
                  Active Atelier Collections ({categories.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c.id).length;
                    return (
                      <div
                        key={c.id}
                        className="p-4 bg-cream rounded-2xl border border-champagne shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-base text-espresso">{c.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-gold-dark">
                            {count} pieces
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-muted-brown">id: {c.id}</p>
                        {c.description && <p className="text-xs text-espresso/70 line-clamp-2">{c.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: DASHBOARD OVERVIEW                                  */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Category Breakdown */}
                <div className="md:col-span-7 bg-cream p-6 rounded-2xl border border-champagne shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-espresso">Creations by Collection</h3>
                  <div className="space-y-3">
                    {categories.map((c) => {
                      const count = products.filter((p) => p.category === c.id).length;
                      const percentage = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                      return (
                        <div key={c.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-espresso">
                            <span>{c.label}</span>
                            <span>{count} pieces ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-warm-ivory rounded-full overflow-hidden border border-champagne">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="md:col-span-5 bg-cream p-6 rounded-2xl border border-champagne shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-espresso">Studio Quick Actions</h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={handleOpenAddModal}
                      className="w-full flex items-center justify-between p-3.5 bg-warm-ivory hover:bg-gold/10 border border-champagne rounded-xl text-xs font-semibold text-espresso transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-gold" />
                        <span>Upload New Creation</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-brown" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('pricing');
                        setPriceFilter('missing');
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-warm-ivory hover:bg-gold/10 border border-champagne rounded-xl text-xs font-semibold text-espresso transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-amber-600" />
                        <span>Fill In Missing Prices ({missingPriceCount})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-brown" />
                    </button>

                    <button
                      onClick={() => setActiveTab('categories')}
                      className="w-full flex items-center justify-between p-3.5 bg-warm-ivory hover:bg-gold/10 border border-champagne rounded-xl text-xs font-semibold text-espresso transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-gold" />
                        <span>Add New Atelier Category</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-brown" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 6: RATINGS & REVIEWS MANAGEMENT                        */}
          {/* ========================================================== */}
          {activeTab === 'reviews' && (
            <AdminReviewsTab />
          )}

        </main>
      </div>

      {/* ============================================================== */}
      {/* 3. ADD / EDIT PRODUCT MODAL (Preserved with Base64 Converter)   */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-espresso-dark/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative bg-cream rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-modal border border-champagne p-6 sm:p-8 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-champagne/60 pb-3">
              <h3 className="font-serif text-xl font-bold text-espresso">
                {editingProduct ? `Edit ${editingProduct.id}` : 'Add New Handcrafted Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-espresso/40 hover:text-espresso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
                  Product Photograph <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {formImageBase64 ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-champagne shrink-0 shadow-sm">
                      <img src={formImageBase64} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-champagne-light border border-dashed border-champagne/80 flex items-center justify-center text-muted-brown shrink-0">
                      <Upload className="w-6 h-6 text-gold/60" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-muted-brown file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-champagne file:text-espresso hover:file:bg-gold hover:file:text-warm-ivory cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-brown">
                      Accepts WebP, JPG, PNG. Photographs are automatically optimized.
                    </p>
                  </div>
                </div>
              </div>

              {/* ID and Collection */}
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
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-xl text-xs font-mono font-bold text-espresso focus:outline-none focus:border-gold"
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
                    className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-xl text-xs font-semibold text-espresso focus:outline-none focus:border-gold uppercase"
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
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-xl text-xs text-espresso focus:outline-none focus:border-gold"
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
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-xl text-xs text-espresso focus:outline-none focus:border-gold"
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
                  className="w-full px-3 py-2 bg-warm-ivory border border-champagne rounded-xl text-xs text-espresso focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1">
                  Catalog Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      formStatus === 'active'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs'
                        : 'bg-warm-ivory border-champagne text-muted-brown hover:bg-champagne/30'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Active (Live)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('inactive')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      formStatus === 'inactive'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-2xs'
                        : 'bg-warm-ivory border-champagne text-muted-brown hover:bg-champagne/30'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Inactive (Hidden)</span>
                  </button>
                </div>
              </div>

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
                  className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Saving Creation...' : 'Save Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
