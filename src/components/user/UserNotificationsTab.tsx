import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Package, Tag, ShieldCheck, Clock, Settings, Sparkles } from 'lucide-react';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  category: 'Orders' | 'Offers' | 'System';
  timestamp: string;
  isRead: boolean;
}

export const UserNotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([
    {
      id: 'notif_1',
      title: 'Order Dispatched!',
      message: 'Your order KH-2026-8921 has been packed and handed over to Pathao Courier.',
      category: 'Orders',
      timestamp: '10 minutes ago',
      isRead: false,
    },
    {
      id: 'notif_2',
      title: 'Special Ramadan Offer Code',
      message: 'Use code SUNNAH10 to receive 10% discount on all Sidr Royal Honey jars.',
      category: 'Offers',
      timestamp: '2 hours ago',
      isRead: false,
    },
    {
      id: 'notif_3',
      title: 'Health Consultation Scheduled',
      message: 'Your Sunnah Prophetic Health consultation with Dr. Al-Mansoor is confirmed for tomorrow at 04:00 PM.',
      category: 'System',
      timestamp: '1 day ago',
      isRead: true,
    },
    {
      id: 'notif_4',
      title: 'Order KH-2026-7410 Delivered',
      message: 'Your package containing Ajwa Dates Premium Grade A was delivered successfully. Leave a review!',
      category: 'Orders',
      timestamp: '3 days ago',
      isRead: true,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Orders' | 'Offers' | 'System'>('All');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter(
    (n) => activeFilter === 'All' || n.category === activeFilter
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Notification Center</span>
              </h2>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live updates regarding your orders, shipping status, and promotional deals.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 text-xs">
          {(['All', 'Orders', 'Offers', 'System'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                activeFilter === cat
                  ? 'bg-[#1b3d2b] text-amber-400'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200/80 space-y-2">
            <Bell className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">No Notifications</p>
            <p className="text-xs text-stone-500">You don't have any alerts in this category.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-amber-50/40 border-amber-200/90 shadow-2xs'
                  : 'bg-white border-stone-200/80 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.category === 'Orders'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.category === 'Offers'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.category === 'Orders' && <Package className="w-5 h-5" />}
                  {item.category === 'Offers' && <Tag className="w-5 h-5" />}
                  {item.category === 'System' && <Sparkles className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-stone-400 font-medium block pt-1">{item.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleRead(item.id)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <CheckCheck className={`w-4 h-4 ${item.isRead ? 'text-emerald-600' : 'text-stone-400'}`} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preferences Box */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Settings className="w-4 h-4 text-stone-600" />
          <span>Notification Channel Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">Email Notifications</span>
              <span className="text-[11px] text-stone-500">Order invoices and shipment tracking</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-800 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">SMS Mobile Alerts</span>
              <span className="text-[11px] text-stone-500">Instant delivery rider SMS updates</span>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-800 rounded"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
