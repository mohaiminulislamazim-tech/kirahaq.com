import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ConsultationSection } from './components/ConsultationSection';
import { DiscountBannerSection } from './components/DiscountBannerSection';
import { ValuePropositionBar } from './components/ValuePropositionBar';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BlogSection } from './components/BlogSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

// Drawers & Modals
import { CartDrawer } from './components/CartDrawer';
import { ConsultationModal } from './components/ConsultationModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { SearchModal } from './components/SearchModal';
import { UserAccountModal } from './components/UserAccountModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingChatButton, ChatPosition } from './components/FloatingChatButton';
import { ChatModal } from './components/ChatModal';

// Dedicated Page Views
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { auth } from './lib/firebase';

// Initial Data & Types
import { products as initialProducts } from './data/products';
import { testimonials } from './data/testimonials';
import { blogs } from './data/blogs';
import { 
  Product, CartItem, Currency, Category, UserAccount, 
  OrderDetails, ConsultationBooking, AppView, SiteSettings,
  DEFAULT_MENU_ITEMS, DEFAULT_ADMIN_ACCOUNT, DEFAULT_MANAGERS, DEFAULT_CONTACT_SETTINGS, Review, BlogPost, ManagerAccount,
  DiscountOfferFilter, parseOfferDiscountRange
} from './types';

const defaultSiteSettings: SiteSettings = {
  logoUrl: '',
  announcementText: '100% Pure Organic Sunnah Products • Special Offer: Use SUNNAH10 for 10% OFF • Free Consultation Available',
  announcementMode: 'running',
  heroBadge: 'PURE BY NATURE, GUIDED BY SUNNAH',
  heroTitle: 'Pure Honey.\nNatural Foods.\nSunnah Wellness.',
  heroSubtitle: '100% natural products and Sunnah based wellness solutions for a healthier life according to Islamic principles.',
  heroImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
  heroButtons: [],
  shopCtaText: 'Shop Now',
  contactInfo: DEFAULT_CONTACT_SETTINGS,
  discountOffers: [
    { id: 'd1', title: '25% - 75% OFF', subtitle: 'EOS SUPER SALE', backgroundColor: 'bg-purple-900', isVisible: true },
    { id: 'd2', title: '48 HOURS ONLY', subtitle: 'EOS LIVE SALE', backgroundColor: 'bg-red-600', isVisible: true },
    { id: 'd3', title: 'SUMMER EDITION', subtitle: 'HIGHLIGHTS', backgroundColor: 'bg-stone-700', isVisible: true }
  ],
  menuItems: DEFAULT_MENU_ITEMS,
  adminAccount: DEFAULT_ADMIN_ACCOUNT,
  footerAboutText: 'Dedicated to offering 100% authentic, unadulterated natural foods and prophetic wellness solutions for a healthy Ummah according to Islamic principles.',
  copyrightText: '© 2026 Kira Haq. All Rights Reserved. Pure by Nature, Guided by Sunnah.',
  enabledPaymentMethods: ['bkash', 'nagad', 'rocket', 'visa', 'mastercard', 'amex', 'cod'],
  paymentLogos: {},
  footerQuickLinks: [
    { id: 'ql1', label: 'Home', target: 'home' },
    { id: 'ql2', label: 'Shop All', target: 'All' },
    { id: 'ql3', label: 'Natural Foods', target: 'Natural Foods' },
    { id: 'ql4', label: 'Sunnah Products', target: 'Sunnah Products' },
    { id: 'ql5', label: 'Health Consultation', target: 'Health Consultation' },
    { id: 'ql6', label: 'Blog & Articles', target: 'blog' },
    { id: 'ql7', label: 'About Us', target: 'about' },
  ],
  footerProductLinks: [
    { id: 'pl1', label: 'Pure Sidr Honey', target: 'Pure Honey' },
    { id: 'pl2', label: 'Black Seed Oil', target: 'Sunnah Products' },
    { id: 'pl3', label: 'Extra Virgin Olive Oil', target: 'Natural Foods' },
    { id: 'pl4', label: 'Madina Ajwa Dates', target: 'Sunnah Products' },
    { id: 'pl5', label: 'Raw Honeycomb', target: 'Pure Honey' },
    { id: 'pl6', label: 'Sunnah Gift Sets', target: 'Gift Packs' },
  ],
  playStoreEnabled: true,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kirahaq.app',
  sectionVisibilityMobile: [
    { id: 'discountBanners', name: 'Discount Banners', isVisible: true },
    { id: 'heroBanner', name: 'Hero Banner', isVisible: true },
    { id: 'categories', name: 'Categories', isVisible: true },
    { id: 'featuredProducts', name: 'Featured Products', isVisible: true },
    { id: 'consultation', name: 'Consultation', isVisible: true },
    { id: 'valueProp', name: 'Value Proposition', isVisible: true },
    { id: 'testimonials', name: 'Testimonials', isVisible: true },
    { id: 'blog', name: 'Blog', isVisible: true },
    { id: 'newsletter', name: 'Newsletter', isVisible: true },
  ],
  sectionVisibilityDesktop: [
    { id: 'discountBanners', name: 'Discount Banners', isVisible: true },
    { id: 'heroBanner', name: 'Hero Banner', isVisible: true },
    { id: 'categories', name: 'Categories', isVisible: true },
    { id: 'featuredProducts', name: 'Featured Products', isVisible: true },
    { id: 'consultation', name: 'Consultation', isVisible: true },
    { id: 'valueProp', name: 'Value Proposition', isVisible: true },
    { id: 'testimonials', name: 'Testimonials', isVisible: true },
    { id: 'blog', name: 'Blog', isVisible: true },
    { id: 'newsletter', name: 'Newsletter', isVisible: true },
  ]
};

const DEFAULT_USER_ACCOUNT: UserAccount = {
  id: 'usr_sabbir_1',
  name: 'Sabbir Rahman',
  email: 'sabbir@kirahaq.com',
  phone: '+880 1711-223344',
  address: 'House 42, Road 11, Banani',
  district: 'Dhaka',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  joinedDate: 'July 2026',
};

export default function App() {
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    async function detectCurrency() {
      // 1. Immediate browser timezone & locale check (instant fallback without network delay/blocking)
      try {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === 'Asia/Dhaka' || userTimeZone === 'Asia/Chittagong') {
          setCurrency('BDT');
        }
      } catch (e) {
        // ignore
      }

      // 2. Fetch IP Geolocation using HTTPS-supported free endpoints
      try {
        const response = await fetch('https://ipwho.is/');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.currency && data.currency.code) {
            const detectedCurrency = data.currency.code;
            if (['USD', 'BDT', 'EUR', 'GBP', 'SAR', 'AED', 'CAD', 'AUD', 'MYR', 'INR', 'QAR', 'KWD', 'OMR', 'BHD', 'SGD', 'JPY', 'PKR'].includes(detectedCurrency)) {
              setCurrency(detectedCurrency as Currency);
              return;
            }
          }
        }
      } catch (error) {
        console.info('ipwho.is fetch failed, trying secondary fallback:', error);
      }

      // 3. Secondary fallback IP fetch (ipapi.co)
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.currency && ['USD', 'BDT', 'EUR', 'GBP', 'SAR', 'AED', 'CAD', 'AUD', 'MYR', 'INR', 'QAR', 'KWD', 'OMR', 'BHD', 'SGD', 'JPY', 'PKR'].includes(data.currency)) {
            setCurrency(data.currency as Currency);
          }
        }
      } catch (error) {
        console.info('Secondary IP geolocation fallback failed:', error);
      }
    }

    detectCurrency();
  }, []);

  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [discountFilter, setDiscountFilter] = useState(false);
  const [activeOfferFilter, setActiveOfferFilter] = useState<DiscountOfferFilter | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_current_user');
      if (saved !== null) {
        if (saved === 'null') return null;
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER_ACCOUNT;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSetCurrentUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem('kirahaq_current_user', JSON.stringify(user));
      } else {
        localStorage.setItem('kirahaq_current_user', 'null');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Site Settings state persisted in localStorage
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.sectionVisibility)) {
          return defaultSiteSettings;
        }
        if (!parsed.contactInfo) {
          parsed.contactInfo = defaultSiteSettings.contactInfo;
        } else if (!parsed.contactInfo.whatsapp || parsed.contactInfo.whatsapp === '+880 1700-000000') {
          parsed.contactInfo.whatsapp = '+60 17-4505868';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultSiteSettings;
  });

  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    try {
      localStorage.setItem('kirahaq_site_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Live products state persisted in localStorage
  const [productList, setProductList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialProducts;
  });

  const effectiveProductList = productList;

  // Testimonials / Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return testimonials;
  });

  useEffect(() => {
    const handleSyncReviews = () => {
      try {
        const saved = localStorage.getItem('kirahaq_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setReviewsList(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_reviews_updated', handleSyncReviews);
    return () => window.removeEventListener('kirahaq_reviews_updated', handleSyncReviews);
  }, []);

  // Blogs state
  const [blogsList, setBlogsList] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_blogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return blogs;
  });

  useEffect(() => {
    const handleSyncBlogs = () => {
      try {
        const saved = localStorage.getItem('kirahaq_blogs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setBlogsList(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_blogs_updated', handleSyncBlogs);
    return () => window.removeEventListener('kirahaq_blogs_updated', handleSyncBlogs);
  }, []);

  // Placed Orders & Consultations lists
  const [placedOrders, setPlacedOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        orderId: 'KH-892104',
        items: [
          {
            product: initialProducts[0],
            quantity: 1
          }
        ],
        customerName: 'Sabbir Rahman',
        email: 'sabbir@example.com',
        phone: '+880 1711-223344',
        address: 'House 42, Road 11, Banani',
        district: 'Dhaka',
        country: 'Bangladesh',
        paymentMethod: 'bKash Online',
        totalUsd: 32,
        totalBdt: 3840,
        currency: 'BDT',
        status: 'Processing',
        orderDate: 'Jul 25, 2026'
      },
      {
        orderId: 'KH-741029',
        items: [
          {
            product: initialProducts[1] || initialProducts[0],
            quantity: 2
          }
        ],
        customerName: 'Amina Khatun',
        email: 'amina@example.com',
        phone: '+880 1812-998877',
        address: 'Flat 4B, Green Road',
        district: 'Dhaka',
        country: 'Bangladesh',
        paymentMethod: 'Cash on Delivery',
        totalUsd: 32,
        totalBdt: 3840,
        currency: 'BDT',
        status: 'Processing',
        orderDate: 'Jul 24, 2026'
      }
    ];
  });
  const [consultationsList, setConsultationsList] = useState<ConsultationBooking[]>([]);
  const [moderators, setModerators] = useState<ManagerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_moderators');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MANAGERS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: initialProducts[0], quantity: 1 } // Pre-loaded item for easy preview
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['p1', 'p2']);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState<ChatPosition>(() => {
    try {
      const saved = localStorage.getItem('kira_chat_btn_pos_2d');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    return { right: 20, bottom: 24 };
  });

  // Admin Operations
  const handleAddModerator = (newModerator: ManagerAccount) => {
    setModerators((prev) => {
      const updated = [newModerator, ...prev];
      try { localStorage.setItem('kirahaq_moderators', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleUpdateModerator = (updatedModerator: ManagerAccount) => {
    setModerators((prev) => {
      const updated = prev.map((m) => (m.id === updatedModerator.id ? updatedModerator : m));
      try { localStorage.setItem('kirahaq_moderators', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleDeleteModerator = (id: string) => {
    setModerators((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try { localStorage.setItem('kirahaq_moderators', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleAddProduct = (newProduct: Product) => {
    setProductList((prev) => {
      const updated = [newProduct, ...prev];
      try { localStorage.setItem('kirahaq_products', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProductList((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      try { localStorage.setItem('kirahaq_products', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProductList((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try { localStorage.setItem('kirahaq_products', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  // Cart Operations
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      const stockLimit = product.stock ?? 0;
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(currentQty + qty, stockLimit);
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        const actualQty = Math.min(qty, stockLimit);
        if (actualQty <= 0) return prev;
        return [...prev, { product, quantity: actualQty }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const stockLimit = item.product.stock ?? 0;
            const newQty = Math.min(item.quantity + delta, stockLimit);
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handlePlaceOrder = (order: OrderDetails): boolean => {
    console.log("Placing order:", order);
    // Check if any items are out of stock
    const isOutOfStock = order.items.some(item => {
      const product = productList.find(p => p.id === item.product.id);
      console.log(`Checking stock for ${item.product.name}: (product?.stock ?? 0) = ${product?.stock}, quantity = ${item.quantity}`);
      return (product?.stock ?? 0) < item.quantity;
    });
    
    console.log("isOutOfStock:", isOutOfStock);
    if (isOutOfStock) return false;

    setProductList((prev) => {
      const updatedProducts = prev.map((p) => {
        const itemInOrder = order.items.find((item) => item.product.id === p.id);
        if (itemInOrder) {
          const newStock = Math.max((p.stock ?? 0) - itemInOrder.quantity, 0);
          return {
            ...p,
            stock: newStock,
            inStock: newStock > 0
          };
        }
        return p;
      });
      try { localStorage.setItem('kirahaq_products', JSON.stringify(updatedProducts)); } catch (e) {}
      return updatedProducts;
    });

    setPlacedOrders((prev) => {
      const updated = [order, ...prev];
      try { localStorage.setItem('kirahaq_orders', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setCartItems([]);
    console.log("Order placed successfully");
    return true;
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setPlacedOrders((prev) => {
      const updated = prev.map((ord) =>
        ord.orderId === orderId ? { ...ord, status: newStatus } : ord
      );
      try { localStorage.setItem('kirahaq_orders', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setPlacedOrders((prev) => {
      const updated = prev.filter((ord) => ord.orderId !== orderId);
      try { localStorage.setItem('kirahaq_orders', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col selection:bg-amber-400 selection:text-stone-950 overflow-x-hidden w-full max-w-full">
      
      {/* Header (Storefront only) */}
      {currentView !== 'admin' && (
        <Header
          cartCount={totalCartCount}
          wishlistCount={wishlistIds.length}
          currency={currency}
          currentUser={currentUser}
          currentView={currentView}
          customLogoUrl={siteSettings.logoUrl}
          announcementText={siteSettings.announcementText}
          siteSettings={siteSettings}
          onNavigate={navigateTo}
          onCurrencyChange={setCurrency}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => {
            setActiveCategory('All');
            navigateTo('products');
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
          onOpenConsultation={() => navigateTo('consultation')}
          onOpenAccountModal={() => navigateTo('account')}
          onOpenAdminPanel={() => navigateTo('admin')}
          onSelectCategory={(cat) => {
            setActiveCategory(cat as Category);
            navigateTo('products');
          }}
          activeCategory={activeCategory}
        />
      )}

      {/* Main Page Body Dynamic Switch */}
      <main className={`flex-1 ${currentView !== 'admin' ? 'pb-20 lg:pb-0' : ''}`}>
        {currentView === 'products' && (
          <ProductsPage
            products={effectiveProductList}
            currency={currency}
            wishlistIds={wishlistIds}
            activeCategory={activeCategory}
            initialDiscountFilter={discountFilter}
            activeOfferFilter={activeOfferFilter}
            onClearOfferFilter={() => {
              setActiveOfferFilter(null);
              setDiscountFilter(false);
            }}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setActiveOfferFilter(null);
            }}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => {
              setSelectedProduct(p);
              navigateTo('product-detail');
            }}
            onGoHome={() => {
              setDiscountFilter(false);
              setActiveOfferFilter(null);
              navigateTo('home');
            }}
            onOpenAdminPanel={() => navigateTo('admin')}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            product={effectiveProductList.find(p => p.id === selectedProduct?.id) || effectiveProductList[0]}
            allProducts={effectiveProductList}
            currency={currency}
            wishlistIds={wishlistIds}
            siteSettings={siteSettings}
            customLogoUrl={siteSettings.logoUrl}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onGoBack={() => navigateTo('products')}
            onBuyNow={(p, qty) => {
              handleAddToCart(p, qty);
              navigateTo('checkout');
            }}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesPage
            products={effectiveProductList}
            currency={currency}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              navigateTo('products');
            }}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onGoHome={() => navigateTo('home')}
            onOpenConsultation={() => navigateTo('consultation')}
          />
        )}

        {currentView === 'blog' && (
          <BlogPage
            blogs={blogsList.filter(b => b.status !== 'draft')}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'consultation' && (
          <ConsultationPage
            onGoHome={() => navigateTo('home')}
            onBookSubmitted={(booking) => {
              setConsultationsList((prev) => [booking, ...prev]);
            }}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            currency={currency}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onPlaceOrder={handlePlaceOrder}
            onGoHome={() => navigateTo('home')}
            onGoToProducts={() => navigateTo('products')}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'account' && (
          <AccountPage
            currentUser={currentUser}
            onLogin={handleSetCurrentUser}
            onLogout={() => handleSetCurrentUser(null)}
            placedOrders={placedOrders}
            currency={currency}
            onGoHome={() => navigateTo('home')}
            products={effectiveProductList}
            cartItems={cartItems}
            wishlistIds={wishlistIds}
            onAddToCart={(p, qty) => handleAddToCart(p, qty)}
            onToggleWishlist={handleToggleWishlist}
            onUpdateCartQuantity={handleUpdateQuantity}
            onRemoveCartItem={handleRemoveCartItem}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'verify-email' && (
          <VerifyEmailPage
            currentUser={currentUser}
            pendingEmail={currentUser?.email || auth.currentUser?.email || ''}
            onVerified={(verifiedUser) => {
              handleSetCurrentUser(verifiedUser);
              navigateTo('account');
            }}
            onNavigate={navigateTo}
            onLogout={() => handleSetCurrentUser(null)}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onGoHome={() => navigateTo('home')}
            siteSettings={siteSettings}
            contactSettings={siteSettings.contactInfo}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage
            products={productList}
            orders={placedOrders}
            consultations={consultationsList}
            moderators={moderators}
            siteSettings={siteSettings}
            currency={currency}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddModerator={handleAddModerator}
            onUpdateModerator={handleUpdateModerator}
            onDeleteModerator={handleDeleteModerator}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'home' && (
          <>
            {/* Dynamic Sections Rendering */}
            {(Array.isArray(isMobile ? siteSettings.sectionVisibilityMobile : siteSettings.sectionVisibilityDesktop) ? (isMobile ? siteSettings.sectionVisibilityMobile : siteSettings.sectionVisibilityDesktop) : []).map((section) => {
              if (!section.isVisible) return null;

              switch (section.id) {
                case 'heroBanner':
                  // If any discount banner is visible, hide hero banner
                  if (siteSettings.discountOffers?.some(o => o.isVisible)) return null;
                  return (
                    <HeroSection
                      key="heroBanner"
                      heroBadge={siteSettings.heroBadge}
                      heroTitle={siteSettings.heroTitle}
                      heroSubtitle={siteSettings.heroSubtitle}
                      heroImage={siteSettings.heroImage}
                      heroButtons={siteSettings.heroButtons}
                      shopCtaText={siteSettings.shopCtaText}
                      onShopNow={() => navigateTo('products')}
                      onBookConsultation={() => navigateTo('consultation')}
                    />
                  );
                case 'categories':
                  return (
                    <CategoriesSection
                      key="categories"
                      onSelectCategory={(cat) => {
                        setActiveCategory(cat);
                        navigateTo('products');
                      }}
                      onOpenConsultation={() => navigateTo('consultation')}
                    />
                  );
                case 'featuredProducts':
                  return (
                    <FeaturedProducts
                      key="featuredProducts"
                      products={effectiveProductList}
                      currency={currency}
                      wishlistIds={wishlistIds}
                      activeCategory={activeCategory}
                      onSelectCategory={setActiveCategory}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={(p) => {
                        setSelectedProduct(p);
                        navigateTo('product-detail');
                      }}
                      onViewAllProducts={() => navigateTo('products')}
                    />
                  );
                case 'consultation':
                  return (
                    <ConsultationSection
                      key="consultation"
                      onOpenConsultation={() => navigateTo('consultation')}
                    />
                  );
                case 'discountBanners':
                  return (
                    <DiscountBannerSection
                      key="discountBanners"
                      offers={siteSettings.discountOffers || []}
                      onSelectOffer={(offer) => {
                        const parsed = parseOfferDiscountRange(offer);
                        setActiveOfferFilter(parsed);
                        if (parsed.categoryId && parsed.categoryId !== 'All') {
                          setActiveCategory(parsed.categoryId as Category);
                        } else {
                          setActiveCategory('All');
                        }
                        setDiscountFilter(true);
                        navigateTo('products');
                      }}
                      onNavigate={(cat) => {
                        setActiveCategory(cat as Category);
                        setActiveOfferFilter(null);
                        setDiscountFilter(true);
                        navigateTo('products');
                      }}
                    />
                  );
                case 'valueProp':
                  return <ValuePropositionBar key="valueProp" />;
                case 'testimonials':
                  return (
                    <TestimonialsSection
                      key="testimonials"
                      testimonials={reviewsList.filter(r => (r.status || 'approved') === 'approved')}
                    />
                  );
                case 'blog':
                  return (
                    <BlogSection
                      key="blog"
                      blogs={blogsList.filter(b => b.status !== 'draft')}
                    />
                  );
                case 'newsletter':
                  return <Newsletter key="newsletter" />;
                default:
                  return null;
              }
            })}
          </>
        )}
      </main>

      {/* Footer (Storefront only) */}
      {currentView !== 'admin' && (
        <Footer
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            navigateTo('products');
          }}
          onOpenConsultation={() => navigateTo('consultation')}
          onNavigate={navigateTo}
          customLogoUrl={siteSettings.logoUrl}
          siteSettings={siteSettings}
        />
      )}

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          navigateTo('checkout');
        }}
      />

      {/* Book Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />

      {/* AI Sunnah Health Advisor Modal */}
      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
      />

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={effectiveProductList}
        currency={currency}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          navigateTo('product-detail');
        }}
      />

      {/* Account Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogin={handleSetCurrentUser}
        onLogout={() => handleSetCurrentUser(null)}
        onUpdateProfile={handleSetCurrentUser}
        currency={currency}
        wishlistProducts={effectiveProductList.filter((p) => wishlistIds.includes(p.id))}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Sticky Mobile Bottom Navigation Bar (Visible on small screens) */}
      {currentView !== 'admin' && (
        <MobileBottomNav
          currentView={currentView}
          cartItems={cartItems}
          wishlistCount={wishlistIds.length}
          onNavigate={(view) => {
            if (view === 'products') {
              setActiveCategory('All');
            }
            navigateTo(view);
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      )}

      {currentView !== 'admin' && (
        <FloatingChatButton 
          onClick={() => setIsChatOpen(true)} 
          position={chatPosition}
          onPositionChange={setChatPosition}
        />
      )}
      
      {currentView !== 'admin' && (
        <ChatModal 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          contactInfo={siteSettings.contactInfo}
          position={chatPosition}
        />
      )}

    </div>
  );
}
