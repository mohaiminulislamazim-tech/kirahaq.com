import React from 'react';
import { Home, ShoppingBag, Search, Sparkles, User, ShoppingCart } from 'lucide-react';
import { AppView, CartItem } from '../types';

interface MobileBottomNavProps {
  currentView: AppView;
  cartItems: CartItem[];
  wishlistCount: number;
  onNavigate: (view: AppView) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenAiAdvisor: () => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  cartItems,
  wishlistCount,
  onNavigate,
  onOpenSearch,
  onOpenCart,
  onOpenAiAdvisor,
  onOpenAccount,
}) => {
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl px-2 py-1.5 lg:hidden transition-transform duration-300"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          id="mobile-nav-home-btn"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentView === 'home'
              ? 'text-[#1b3d2b] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-[#1b3d2b] stroke-[2.5]' : 'text-stone-500'}`} />
            {currentView === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1b3d2b] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Home</span>
        </button>

        {/* Shop / Products */}
        <button
          id="mobile-nav-shop-btn"
          onClick={() => onNavigate('products')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentView === 'products'
              ? 'text-[#1b3d2b] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${currentView === 'products' ? 'text-[#1b3d2b] stroke-[2.5]' : 'text-stone-500'}`} />
            {currentView === 'products' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1b3d2b] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Shop</span>
        </button>

        {/* Search */}
        <button
          id="mobile-nav-search-btn"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-stone-500 hover:text-stone-800 font-medium transition-all cursor-pointer"
        >
          <div className="relative">
            <Search className="w-5 h-5 text-stone-500" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Search</span>
        </button>

        {/* AI Advisor Button */}
        <button
          id="mobile-nav-ai-btn"
          onClick={onOpenAiAdvisor}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-amber-700 hover:text-amber-800 font-semibold transition-all cursor-pointer"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1b3d2b]" />
            </div>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap text-amber-800 font-bold">AI Guide</span>
        </button>

        {/* Cart */}
        <button
          id="mobile-nav-cart-btn"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-stone-500 hover:text-stone-800 font-medium transition-all cursor-pointer relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-stone-600" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#1b3d2b] text-amber-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalCartCount > 9 ? '9+' : totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Cart</span>
        </button>

        {/* Account / Wishlist */}
        <button
          id="mobile-nav-account-btn"
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentView === 'account'
              ? 'text-[#1b3d2b] font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${currentView === 'account' ? 'text-[#1b3d2b] stroke-[2.5]' : 'text-stone-500'}`} />
            {wishlistCount > 0 && currentView !== 'account' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
            {currentView === 'account' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1b3d2b] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Account</span>
        </button>
      </div>
    </nav>
  );
};
