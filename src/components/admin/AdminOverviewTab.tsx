import React from 'react';
import { Product, OrderDetails, Currency, ConsultationBooking, AdminTab } from '../../types';
import { LayoutDashboard, ShoppingBag, Package, DollarSign, Calendar, TrendingUp, Users, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminOverviewTabProps {
  products: Product[];
  orders: OrderDetails[];
  consultations?: ConsultationBooking[];
  currency: Currency;
  onNavigate: (tab: AdminTab) => void;
}

export function AdminOverviewTab({
  products,
  orders,
  consultations = [],
  currency,
  onNavigate,
}: AdminOverviewTabProps) {
  const totalSalesBdt = orders.reduce((acc, o) => acc + o.totalBdt, 0);
  const totalSalesUsd = orders.reduce((acc, o) => acc + o.totalUsd, 0);
  const pendingOrders = orders.filter((o) => o.status.toLowerCase() === 'pending');
  const lowStockProducts = products.filter((p) => (p.stock ?? 0) < 5 && (p.stock ?? 0) >= 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-stone-700/80 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-full">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Kira Haq Store Admin Executive Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            Store Command Center
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Manage product inventory, order processing, categories, customer reviews, blog articles, and storefront settings.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-stone-800 p-5 rounded-3xl border border-stone-700 hover:border-amber-400/50 transition-all cursor-pointer space-y-3 group shadow-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Gross Sales</span>
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
            {currency === 'BDT' ? `৳${totalSalesBdt.toLocaleString()}` : `$${totalSalesUsd.toFixed(2)}`}
          </div>
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>From {orders.length} total orders</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('orders')}
          className="bg-stone-800 p-5 rounded-3xl border border-stone-700 hover:border-amber-400/50 transition-all cursor-pointer space-y-3 group shadow-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Orders Status</span>
            <span className="p-2 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {pendingOrders.length} <span className="text-xs font-normal text-stone-400">Pending</span>
          </div>
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>{orders.length} Total orders placed</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('products')}
          className="bg-stone-800 p-5 rounded-3xl border border-stone-700 hover:border-amber-400/50 transition-all cursor-pointer space-y-3 group shadow-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Catalogue Items</span>
            <span className="p-2 bg-blue-950 text-blue-400 rounded-xl border border-blue-800">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
            {products.length} <span className="text-xs font-normal text-stone-400">Products</span>
          </div>
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>{lowStockProducts.length} items low on stock</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('consultations')}
          className="bg-stone-800 p-5 rounded-3xl border border-stone-700 hover:border-amber-400/50 transition-all cursor-pointer space-y-3 group shadow-md"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Consultations</span>
            <span className="p-2 bg-purple-950 text-purple-400 rounded-xl border border-purple-800">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {consultations.length} <span className="text-xs font-normal text-stone-400">Bookings</span>
          </div>
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Prophetic health guidance</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-stone-800 p-6 rounded-3xl border border-rose-800 hover:border-rose-600 transition-all cursor-pointer space-y-4 shadow-lg group"
        >
          <div className="flex justify-between items-center border-b border-stone-700 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className="text-rose-400">Low Stock Alerts</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 group-hover:underline">
              <span>View Full Stock Report & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900 text-stone-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/50 text-stone-300">
                {lowStockProducts.slice(0, 5).map((prod) => (
                  <tr key={prod.id}>
                    <td className="p-3 font-bold text-white">{prod.name}</td>
                    <td className="p-3 font-bold text-rose-400 text-right">
                      {prod.stock ?? 0} remaining
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="bg-stone-800 p-6 rounded-3xl border border-stone-700 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Admin Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Product', tab: 'products' as AdminTab, icon: Package },
            { label: 'View Orders', tab: 'orders' as AdminTab, icon: ShoppingBag },
            { label: 'Categories', tab: 'categories' as AdminTab, icon: LayoutDashboard },
            { label: 'Customers', tab: 'customers' as AdminTab, icon: Users },
            { label: 'Site Settings', tab: 'settings' as AdminTab, icon: ShieldCheck },
            { label: 'Contact Info', tab: 'contact' as AdminTab, icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.tab)}
                className="p-4 bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-stone-300 border border-stone-700/80 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all text-xs font-bold group"
              >
                <Icon className="w-5 h-5 text-amber-400 group-hover:text-stone-950" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-stone-800 p-6 rounded-3xl border border-stone-700 space-y-4 shadow-lg">
        <div className="flex justify-between items-center border-b border-stone-700 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Recent Customer Orders</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/50 text-stone-300">
              {orders.slice(0, 4).map((ord) => (
                <tr key={ord.orderId}>
                  <td className="p-3 font-bold text-amber-400">{ord.orderId}</td>
                  <td className="p-3">{ord.customerName} ({ord.phone})</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {currency === 'BDT' ? `৳${ord.totalBdt}` : `$${ord.totalUsd}`}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 rounded-full text-[10px] font-bold">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
