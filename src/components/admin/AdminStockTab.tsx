import React, { useState } from 'react';
import { Product, OrderDetails, Currency, formatProductPrice } from '../../types';
import { 
  Boxes, AlertTriangle, CheckCircle2, XCircle, Search, Filter, 
  ArrowUpDown, Download, History, Plus, Minus, RefreshCw, ShoppingBag, 
  TrendingDown, TrendingUp, PackageCheck, Layers
} from 'lucide-react';

interface AdminStockTabProps {
  products: Product[];
  orders: OrderDetails[];
  currency: Currency;
  onUpdateProduct: (product: Product) => void;
}

export function AdminStockTab({
  products,
  orders,
  currency,
  onUpdateProduct,
}: AdminStockTabProps) {
  const [activeSubView, setActiveSubView] = useState<'report' | 'history'>('report');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'instock' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'lowest_stock' | 'highest_stock' | 'name' | 'highest_value'>('lowest_stock');
  
  // Inline editing state for stock adjustments
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Overview metrics
  const totalUnits = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const outOfStockCount = products.filter(p => (p.stock ?? 0) <= 0).length;
  const lowStockCount = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5).length;
  const inStockCount = products.filter(p => (p.stock ?? 0) >= 5).length;

  const totalValueBdt = products.reduce((sum, p) => sum + (p.priceBdt * (p.stock ?? 0)), 0);
  const totalValueUsd = products.reduce((sum, p) => sum + (p.priceUsd * (p.stock ?? 0)), 0);

  // Filtered products for Stock Report
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesStatus = true;
    const stock = p.stock ?? 0;
    if (stockStatusFilter === 'instock') matchesStatus = stock >= 5;
    if (stockStatusFilter === 'low') matchesStatus = stock > 0 && stock < 5;
    if (stockStatusFilter === 'out') matchesStatus = stock <= 0;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const stockA = a.stock ?? 0;
    const stockB = b.stock ?? 0;
    if (sortBy === 'lowest_stock') return stockA - stockB;
    if (sortBy === 'highest_stock') return stockB - stockA;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'highest_value') return (b.priceBdt * stockB) - (a.priceBdt * stockA);
    return 0;
  });

  // Handle direct stock update
  const handleSaveStock = (product: Product, newStock: number) => {
    const updatedQty = Math.max(0, newStock);
    const updatedProduct: Product = {
      ...product,
      stock: updatedQty,
      inStock: updatedQty > 0
    };
    onUpdateProduct(updatedProduct);
    setEditingStockId(null);
    setSuccessMessage(`Updated stock for "${product.name}" to ${updatedQty} units`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Build stock history from completed orders
  const stockHistoryList = orders.flatMap(order => {
    return order.items.map(item => ({
      id: `${order.orderId}-${item.product.id}`,
      orderId: order.orderId,
      productName: item.product.name,
      productId: item.product.id,
      productImage: item.product.image,
      quantityDeducted: item.quantity,
      customerName: order.customerName,
      date: order.orderDate,
      type: 'Sale Deduction' as const,
      paymentMethod: order.paymentMethod,
    }));
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Product ID', 'Product Name', 'Category', 'Stock Units', 'Status', 'Price BDT', 'Price USD', 'Total Stock Value BDT'];
    const rows = filteredProducts.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.stock ?? 0,
      (p.stock ?? 0) <= 0 ? 'Out of Stock' : (p.stock ?? 0) < 5 ? 'Low Stock' : 'In Stock',
      p.priceBdt,
      p.priceUsd,
      (p.priceBdt * (p.stock ?? 0)).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Main View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Boxes className="w-4 h-4" />
            <span>Inventory System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            All Products Stock Report & History
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            All products stock report and filtered history tracking
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubView('report')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubView === 'report' 
                ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Stock Report</span>
          </button>
          <button
            onClick={() => setActiveSubView('history')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubView === 'history' 
                ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock History</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl shadow-md">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            Total Units
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {totalUnits.toLocaleString()} <span className="text-xs font-normal text-stone-400">Pcs</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Across {products.length} catalog items
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl shadow-md">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            In Stock Items
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {inStockCount} <span className="text-xs font-normal text-stone-400">Products</span>
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">
            Healthy inventory (&ge;5 units)
          </div>
        </div>

        <div className="bg-stone-900/90 border border-amber-900/40 p-4 rounded-2xl shadow-md">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Low Stock (&lt;5)
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {lowStockCount} <span className="text-xs font-normal text-stone-400">Products</span>
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">
            Requires restocking soon
          </div>
        </div>

        <div className="bg-stone-900/90 border border-rose-900/40 p-4 rounded-2xl shadow-md">
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Out of Stock
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
            {outOfStockCount} <span className="text-xs font-normal text-stone-400">Products</span>
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">
            Currently unavailable
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubView === 'report' ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name, category, ID..."
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-2 rounded-2xl border border-stone-800 text-xs">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-stone-300 font-bold focus:outline-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-stone-900 text-white">
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-2 rounded-2xl border border-stone-800 text-xs">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  className="bg-transparent text-stone-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-stone-900 text-white">All Stock Status</option>
                  <option value="instock" className="bg-stone-900 text-white">In Stock (&ge;5)</option>
                  <option value="low" className="bg-stone-900 text-white">Low Stock (&lt;5)</option>
                  <option value="out" className="bg-stone-900 text-white">Out of Stock (0)</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-2 rounded-2xl border border-stone-800 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-stone-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="lowest_stock" className="bg-stone-900 text-white">Lowest Stock First</option>
                  <option value="highest_stock" className="bg-stone-900 text-white">Highest Stock First</option>
                  <option value="name" className="bg-stone-900 text-white">Name (A-Z)</option>
                  <option value="highest_value" className="bg-stone-900 text-white">Highest Total Value</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                title="Download Stock Report CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Total Value Summary Row */}
          <div className="flex flex-wrap items-center justify-between bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80 text-xs">
            <div className="text-stone-400 font-medium">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> of <span className="text-white font-bold">{products.length}</span> products
            </div>
            <div className="flex items-center gap-6 mt-2 sm:mt-0">
              <div>
                <span className="text-stone-400">Total Inventory BDT Value: </span>
                <span className="text-amber-400 font-extrabold text-sm">৳{totalValueBdt.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-stone-400">Total USD Value: </span>
                <span className="text-emerald-400 font-extrabold text-sm">${totalValueUsd.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stock Report Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4 border-b border-stone-800">Product</th>
                  <th className="p-4 border-b border-stone-800">Category</th>
                  <th className="p-4 border-b border-stone-800 text-right">Unit Price</th>
                  <th className="p-4 border-b border-stone-800 text-center">Current Stock</th>
                  <th className="p-4 border-b border-stone-800 text-right">Total Stock Value</th>
                  <th className="p-4 border-b border-stone-800 text-center">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-500">
                      No products found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stock = product.stock ?? 0;
                    const stockValueBdt = product.priceBdt * stock;
                    const isEditing = editingStockId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-stone-800/40 transition-colors">
                        {/* Product Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-10 h-10 object-cover rounded-xl border border-stone-700 shrink-0 ${stock <= 0 ? 'grayscale' : ''}`}
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{product.name}</div>
                              <div className="text-[10px] text-stone-500 font-mono">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-stone-800 text-stone-300 rounded-lg text-[10px] font-semibold border border-stone-700">
                            {product.category}
                          </span>
                        </td>

                        {/* Unit Price */}
                        <td className="p-4 text-right font-semibold">
                          {formatProductPrice(product, currency)}
                        </td>

                        {/* Current Stock Badge */}
                        <td className="p-4 text-center">
                          {stock <= 0 ? (
                            <span className="px-3 py-1 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              Out of Stock
                            </span>
                          ) : stock < 5 ? (
                            <span className="px-3 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              {stock} Pcs (Low)
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              {stock} Pcs
                            </span>
                          )}
                        </td>

                        {/* Total Value */}
                        <td className="p-4 text-right font-mono font-bold text-amber-400">
                          ৳{stockValueBdt.toLocaleString()}
                        </td>

                        {/* Quick Stock Controls */}
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(parseInt(e.target.value) || 0)}
                                className="w-20 bg-stone-950 border border-amber-400 rounded-xl px-2 py-1 text-center text-xs font-bold text-white focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveStock(product, tempStockValue)}
                                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold rounded-xl text-xs cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStockId(null)}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-xl text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveStock(product, Math.max(0, stock - 1))}
                                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg cursor-pointer transition-colors"
                                title="Decrease Stock (-1)"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStockId(product.id);
                                  setTempStockValue(stock);
                                }}
                                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                              >
                                Edit ({stock})
                              </button>
                              <button
                                onClick={() => handleSaveStock(product, stock + 1)}
                                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg cursor-pointer transition-colors"
                                title="Increase Stock (+1)"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock History Log Subview */
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-stone-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Stock Movement History Log</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Automatic stock deduction details from order delivery and sales purchase
              </p>
            </div>

            <div className="text-xs text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
              Total Recorded Deductions: <span className="font-bold text-amber-400">{stockHistoryList.length}</span>
            </div>
          </div>

          {stockHistoryList.length === 0 ? (
            <div className="text-center py-16 bg-stone-950/50 rounded-2xl border border-stone-800">
              <ShoppingBag className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-stone-300">No Stock Movement History Yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Customer orders placed in the store will automatically record item stock deductions here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4 border-b border-stone-800">Date & Time</th>
                    <th className="p-4 border-b border-stone-800">Product</th>
                    <th className="p-4 border-b border-stone-800">Event Type</th>
                    <th className="p-4 border-b border-stone-800 text-center">Stock Change</th>
                    <th className="p-4 border-b border-stone-800">Order Reference</th>
                    <th className="p-4 border-b border-stone-800">Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {stockHistoryList.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="p-4 text-stone-400 font-mono text-[11px]">
                        {new Date(log.date).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={log.productImage}
                            alt={log.productName}
                            className="w-8 h-8 object-cover rounded-lg border border-stone-700 shrink-0"
                          />
                          <span className="font-bold text-white">{log.productName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-amber-400" />
                          {log.type}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-rose-400 text-sm font-mono">
                        -{log.quantityDeducted} Pcs
                      </td>
                      <td className="p-4 font-mono text-amber-400 font-bold">
                        #{log.orderId}
                      </td>
                      <td className="p-4 text-stone-300">
                        {log.customerName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
