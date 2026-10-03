import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, Heart, ShoppingCart, 
  User, MapPin, Bell, Star, Ticket, LogOut, ChevronRight, CheckCircle2
} from 'lucide-react';
import { UserAccount } from '../../types';

export type UserTab = 
  | 'dashboard'
  | 'orders'
  | 'wishlist'
  | 'cart'
  | 'profile'
  | 'addresses'
  | 'notifications'
  | 'reviews'
  | 'tickets';

interface UserSidebarProps {
  activeTab: UserTab;
  onSelectTab: (tab: UserTab) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  ordersCount: number;
  wishlistCount: number;
  cartCount: number;
  unreadNotificationsCount: number;
  openTicketsCount: number;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  ordersCount,
  wishlistCount,
  cartCount,
  unreadNotificationsCount,
  openTicketsCount,
}) => {
  const menuItems = [
    { id: 'dashboard' as UserTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'orders' as UserTab, label: 'My Orders', icon: ShoppingBag, badge: ordersCount || null },
    { id: 'wishlist' as UserTab, label: 'Wishlist', icon: Heart, badge: wishlistCount || null },
    { id: 'cart' as UserTab, label: 'Shopping Cart', icon: ShoppingCart, badge: cartCount || null },
    { id: 'profile' as UserTab, label: 'My Profile', icon: User, badge: null },
    { id: 'addresses' as UserTab, label: 'Addresses', icon: MapPin, badge: null },
    { id: 'notifications' as UserTab, label: 'Notifications', icon: Bell, badge: unreadNotificationsCount || null, isHighlight: unreadNotificationsCount > 0 },
    { id: 'reviews' as UserTab, label: 'Reviews', icon: Star, badge: null },
    { id: 'tickets' as UserTab, label: 'Support Tickets', icon: Ticket, badge: openTicketsCount || null },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white rounded-3xl border border-stone-200/90 shadow-xs p-5 space-y-6 shrink-0 self-start">
      
      {/* Profile Mini Header */}
      <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70">
        <div className="relative">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser?.name || 'User'}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-stone-900 text-sm truncate">
              {currentUser?.name || 'Valued Customer'}
            </h3>
            {currentUser?.isVerified !== false && (
              <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border border-emerald-300 shrink-0" title="Verified Customer Account">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 truncate mt-0.5">
            {currentUser?.email || currentUser?.phone || 'Customer Portal'}
          </p>
          <span className="inline-block mt-1 text-[10px] bg-amber-400/20 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
            VIP Member
          </span>
        </div>
      </div>

      {/* Main Sidebar Links */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b3d2b] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    isActive
                      ? 'bg-amber-400 text-stone-950'
                      : item.isHighlight
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-amber-400' : 'text-stone-300'}`} />
              </div>
            </button>
          );
        })}

        {/* Logout Button */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

    </aside>
  );
};
