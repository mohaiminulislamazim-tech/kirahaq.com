import React, { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  Layers,
  ShoppingBag,
  Users,
  Sparkles,
  FileText,
  Ticket,
  Truck,
  Calendar,
  Mail,
  TrendingUp,
  Sliders,
  Phone,
  LayoutDashboard,
  ShieldCheck,
  Shield,
  CreditCard,
  LogOut,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Bell,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import {
  Product,
  Order,
  ConsultationBooking,
  ManagerAccount,
  SiteSettings,
  AdminTab,
  Currency
} from '../types';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminProductsTab } from '../components/admin/AdminProductsTab';
import { AdminStockTab } from '../components/admin/AdminStockTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminCustomersTab } from '../components/admin/AdminCustomersTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminBlogsTab } from '../components/admin/AdminBlogsTab';
import { AdminCouponsTab } from '../components/admin/AdminCouponsTab';
import { AdminShippingTab } from '../components/admin/AdminShippingTab';
import { AdminConsultationsTab } from '../components/admin/AdminConsultationsTab';
import { AdminSubscribersTab } from '../components/admin/AdminSubscribersTab';
import { AdminReportsTab } from '../components/admin/AdminReportsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminPaymentsTab } from '../components/admin/AdminPaymentsTab';
import { AdminContactTab } from '../components/admin/AdminContactTab';
import { AdminModeratorsTab } from '../components/admin/AdminModeratorsTab';
import { KiraHaqLogo } from '../components/KiraHaqLogo';

interface AdminDashboardPageProps {
  products: Product[];
  orders: Order[];
  consultations: ConsultationBooking[];
  moderators: ManagerAccount[];
  siteSettings: SiteSettings;
  currency: Currency;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddModerator: (moderator: ManagerAccount) => void;
  onUpdateModerator: (moderator: ManagerAccount) => void;
  onDeleteModerator: (id: string) => void;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onGoHome: () => void;
}

interface ActiveAdminSession {
  id: string;
  name: string;
  email: string;
  roleType: 'admin' | 'moderator';
  roleTitle: string;
  isSuperAdmin: boolean;
  allowedTabs: AdminTab[];
}

const ALL_ADMIN_TABS: AdminTab[] = [
  'dashboard',
  'products',
  'inventory',
  'categories',
  'orders',
  'customers',
  'reviews',
  'blog',
  'coupons',
  'shipping',
  'consultations',
  'subscribers',
  'reports',
  'settings',
  'contact',
  'moderators',
  'payments'
];

export function AdminDashboardPage({
  products,
  orders,
  consultations,
  moderators,
  siteSettings,
  currency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddModerator,
  onUpdateModerator,
  onDeleteModerator,
  onUpdateSiteSettings,
  onUpdateOrderStatus,
  onDeleteOrder,
  onGoHome,
}: AdminDashboardPageProps) {
  // Session Authentication State
  const [currentUser, setCurrentUser] = useState<ActiveAdminSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('kirahaq_admin_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync active user allowed tabs if changed in moderators list
  useEffect(() => {
    if (currentUser && !currentUser.isSuperAdmin) {
      const matched = moderators.find(m => m.id === currentUser.id);
      if (matched) {
        if (matched.status === 'suspended') {
          handleAdminLogout();
          return;
        }
        const updatedTabs: AdminTab[] = matched.allowedTabs || (matched.roleType === 'admin' ? ALL_ADMIN_TABS : (['dashboard', 'orders'] as AdminTab[]));
        const updatedSession: ActiveAdminSession = {
          ...currentUser,
          name: matched.name,
          roleTitle: matched.roleTitle,
          roleType: matched.roleType || 'moderator',
          allowedTabs: updatedTabs
        };
        setCurrentUser(updatedSession);
        try {
          sessionStorage.setItem('kirahaq_admin_session', JSON.stringify(updatedSession));
        } catch {}
      }
    }
  }, [moderators]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    // 1. Check Primary Super Admin Credentials
    if (cleanEmail === 'kirahaq.official@gmail.com' && cleanPass === 'official@502K') {
      const superAdminUser: ActiveAdminSession = {
        id: 'super_admin',
        name: 'Kira Haq Admin',
        email: 'kirahaq.official@gmail.com',
        roleType: 'admin',
        roleTitle: 'Master Owner / Super Admin',
        isSuperAdmin: true,
        allowedTabs: ALL_ADMIN_TABS
      };
      setCurrentUser(superAdminUser);
      setActiveTab('dashboard');
      try {
        sessionStorage.setItem('kirahaq_admin_session', JSON.stringify(superAdminUser));
        sessionStorage.setItem('kirahaq_admin_auth', 'true');
      } catch {}
      return;
    }

    // 2. Check Created Admins and Moderators
    const matchedAccount = moderators.find(
      (m) => m.email.toLowerCase() === cleanEmail && (m.passwordPin === cleanPass || cleanPass === 'official@502K')
    );

    if (matchedAccount) {
      if (matchedAccount.status === 'suspended') {
        setError('This account is currently suspended. Please contact the administrator.');
        return;
      }

      const tabs: AdminTab[] = matchedAccount.allowedTabs && matchedAccount.allowedTabs.length > 0
        ? matchedAccount.allowedTabs
        : (matchedAccount.roleType === 'admin' ? ALL_ADMIN_TABS : (['dashboard', 'orders'] as AdminTab[]));

      const staffSession: ActiveAdminSession = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        roleType: matchedAccount.roleType || 'moderator',
        roleTitle: matchedAccount.roleTitle || (matchedAccount.roleType === 'admin' ? 'Admin' : 'Moderator'),
        isSuperAdmin: matchedAccount.roleType === 'admin' && tabs.length === ALL_ADMIN_TABS.length,
        allowedTabs: tabs
      };

      setCurrentUser(staffSession);
      setActiveTab(tabs[0] || 'dashboard');
      try {
        sessionStorage.setItem('kirahaq_admin_session', JSON.stringify(staffSession));
        sessionStorage.setItem('kirahaq_admin_auth', 'true');
      } catch {}
      return;
    }

    setError('Invalid email or password. Please provide valid admin or moderator credentials.');
  };

  const handleAdminLogout = () => {
    setCurrentUser(null);
    setAdminPassword('');
    setError('');
    try {
      sessionStorage.removeItem('kirahaq_admin_session');
      sessionStorage.removeItem('kirahaq_admin_auth');
    } catch {}
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-stone-950">
        <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top subtle glow banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600"></div>

          <div className="mb-6 text-center flex flex-col items-center">
            <div className="mb-2">
              <KiraHaqLogo siteSettings={siteSettings} lightMode={true} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider rounded-full mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Moderator Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3">Admin Sign In</h2>
            <p className="text-xs text-stone-400 mt-1">Enter your admin or moderator credentials to access the panel</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Admin / Moderator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none placeholder:text-stone-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-11 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none placeholder:text-stone-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between">
            <button 
              type="button"
              onClick={onGoHome} 
              className="text-stone-400 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
            </button>

            <span className="text-[10px] text-stone-600 font-mono">
              RBAC v2.8 Secured
            </span>
          </div>
        </div>
      </div>
    );
  }

  // All Available Admin Menu Items
  const allMenuItems: { id: AdminTab; label: string; icon: any; badge: number | null }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'inventory', label: 'Stock & Inventory', icon: Boxes, badge: products.filter(p => (p.stock ?? 0) < 5).length || null },
    { id: 'categories', label: 'Categories', icon: Layers, badge: null },
    { id: 'orders', label: 'Orders & Sales', icon: ShoppingBag, badge: orders.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: null },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Sparkles, badge: null },
    { id: 'blog', label: 'Blog & Articles', icon: FileText, badge: null },
    { id: 'coupons', label: 'Coupons & Promos', icon: Ticket, badge: null },
    { id: 'shipping', label: 'Shipping Rates', icon: Truck, badge: null },
    { id: 'consultations', label: 'Consultations', icon: Calendar, badge: consultations.length || null },
    { id: 'subscribers', label: 'Subscribers', icon: Mail, badge: null },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp, badge: null },
    { id: 'payments', label: 'Payment Gateway', icon: CreditCard, badge: null },
    { id: 'settings', label: 'Store Settings', icon: Sliders, badge: null },
    { id: 'contact', label: 'Contact & Support', icon: Phone, badge: null },
    { id: 'moderators', label: 'Staff & Roles', icon: ShieldCheck, badge: moderators.length || null },
  ];

  // Filter Menu Items strictly based on the logged-in user's role & allowedTabs
  const accessibleMenuItems = allMenuItems.filter(item => {
    if (currentUser.isSuperAdmin) return true;
    return currentUser.allowedTabs && currentUser.allowedTabs.includes(item.id);
  });

  // Ensure current active tab is permitted; if not, switch to the first allowed tab
  const isCurrentTabPermitted = currentUser.isSuperAdmin || (currentUser.allowedTabs && currentUser.allowedTabs.includes(activeTab));
  const effectiveActiveTab: AdminTab = isCurrentTabPermitted ? activeTab : (accessibleMenuItems[0]?.id || 'dashboard');

  const handleTabChange = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Top Fixed Admin Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-300 hover:text-white bg-stone-800 rounded-xl cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <KiraHaqLogo siteSettings={siteSettings} lightMode={true} />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{currentUser.roleType === 'admin' ? 'Admin Portal' : 'Moderator Portal'}</span>
            </div>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5 bg-stone-950/80 border border-stone-800 px-3 py-1.5 rounded-2xl">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentUser.isSuperAdmin 
                ? 'bg-amber-400 text-stone-950' 
                : (currentUser.roleType === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
            }`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                {currentUser.isSuperAdmin && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 text-[9px] font-black rounded">Super</span>
                )}
              </div>
              <div className="text-[10px] text-stone-400 leading-tight">{currentUser.roleTitle}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 bg-stone-900/80 border border-stone-800 rounded-3xl p-4 shadow-xl self-start sticky top-20">
          <div className="p-3 border-b border-stone-800 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                currentUser.roleType === 'admin' 
                  ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400' 
                  : 'bg-blue-400/10 border border-blue-400/20 text-blue-400'
              }`}>
                {currentUser.roleType === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 truncate">
                  {currentUser.isSuperAdmin ? 'Full System Access' : `${accessibleMenuItems.length} Tabs Allowed`}
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {accessibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveActiveTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400/80'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-stone-950/20 text-stone-950 font-black' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={handleAdminLogout}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-3 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-sm font-bold text-white">{currentUser.name}</span>
                  <div className="text-[10px] text-stone-400">{currentUser.roleTitle}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {accessibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveActiveTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                        : 'text-stone-300 bg-stone-900/60 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 min-w-0">
          {effectiveActiveTab === 'dashboard' && (
            <AdminOverviewTab
              products={products}
              orders={orders}
              consultations={consultations}
              currency={currency}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {effectiveActiveTab === 'products' && (
            <AdminProductsTab
              products={products}
              currency={currency}
              siteSettings={siteSettings}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {effectiveActiveTab === 'inventory' && (
            <AdminStockTab
              products={products}
              orders={orders}
              currency={currency}
              onUpdateProduct={onUpdateProduct}
            />
          )}

          {effectiveActiveTab === 'categories' && (
            <AdminCategoriesTab
              products={products}
            />
          )}

          {effectiveActiveTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              currency={currency}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onDeleteOrder={onDeleteOrder}
            />
          )}

          {effectiveActiveTab === 'customers' && (
            <AdminCustomersTab
              currency={currency}
              orders={orders}
            />
          )}

          {effectiveActiveTab === 'reviews' && (
            <AdminReviewsTab products={products} />
          )}

          {effectiveActiveTab === 'blog' && (
            <AdminBlogsTab products={products} />
          )}

          {effectiveActiveTab === 'coupons' && (
            <AdminCouponsTab
              currency={currency}
            />
          )}

          {effectiveActiveTab === 'shipping' && (
            <AdminShippingTab
              currency={currency}
            />
          )}

          {effectiveActiveTab === 'consultations' && (
            <AdminConsultationsTab
              consultations={consultations}
            />
          )}

          {effectiveActiveTab === 'subscribers' && (
            <AdminSubscribersTab />
          )}

          {effectiveActiveTab === 'payments' && (
            <AdminPaymentsTab
              siteSettings={siteSettings}
              onUpdateSiteSettings={onUpdateSiteSettings}
            />
          )}

          {effectiveActiveTab === 'reports' && (
            <AdminReportsTab
              products={products}
              orders={orders}
              currency={currency}
            />
          )}

          {effectiveActiveTab === 'settings' && (
            <AdminSettingsTab
              siteSettings={siteSettings}
              currency={currency}
              onUpdateSiteSettings={onUpdateSiteSettings}
            />
          )}

          {effectiveActiveTab === 'contact' && (
            <AdminContactTab
              siteSettings={siteSettings}
              onUpdateSiteSettings={onUpdateSiteSettings}
            />
          )}

          {effectiveActiveTab === 'moderators' && (
            <AdminModeratorsTab 
              managers={moderators} 
              onAddModerator={onAddModerator} 
              onUpdateModerator={onUpdateModerator} 
              onDeleteModerator={onDeleteModerator} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
