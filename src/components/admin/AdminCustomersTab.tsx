import React, { useState, useEffect } from 'react';
import { CustomerAccount, Currency, OrderDetails } from '../../types';
import { 
  Users, Search, ShieldAlert, ShieldCheck, Mail, Phone, MapPin, 
  Calendar, ShoppingBag, Plus, Edit3, Trash2, Eye, X, Save, 
  CheckCircle2, AlertCircle, DollarSign, UserCheck, UserX, Package,
  Filter, ChevronRight, UserPlus
} from 'lucide-react';

interface AdminCustomersTabProps {
  currency: Currency;
  orders?: OrderDetails[];
}

const DEFAULT_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'cust_01',
    name: 'Rahim Chowdhury',
    email: 'rahim@gmail.com',
    phone: '+880 1711-223344',
    address: 'House 42, Road 11, Banani',
    district: 'Dhaka',
    status: 'active',
    ordersCount: 5,
    totalSpentBdt: 14500,
    joinedDate: '2026-03-12',
    isVerified: true,
  },
  {
    id: 'cust_02',
    name: 'Sumaiya Akter',
    email: 'sumaiya@yahoo.com',
    phone: '+880 1811-556677',
    address: 'GEC Circle, Chittagong',
    district: 'Chattogram',
    status: 'active',
    ordersCount: 3,
    totalSpentBdt: 8200,
    joinedDate: '2026-04-18',
    isVerified: true,
  },
  {
    id: 'cust_03',
    name: 'Kamrul Hasan',
    email: 'kamrul@gmail.com',
    phone: '+880 1911-889900',
    address: 'Zindabazar, Sylhet',
    district: 'Sylhet',
    status: 'active',
    ordersCount: 8,
    totalSpentBdt: 22000,
    joinedDate: '2026-01-10',
    isVerified: true,
  },
  {
    id: 'cust_04',
    name: 'Nusrat Jahan',
    email: 'nusrat.j@gmail.com',
    phone: '+880 1611-334455',
    address: 'Uttara Sector 7, Dhaka',
    district: 'Dhaka',
    status: 'suspended',
    ordersCount: 1,
    totalSpentBdt: 3000,
    joinedDate: '2026-06-01',
    isVerified: true,
  }
];

export function AdminCustomersTab({ currency, orders = [] }: AdminCustomersTabProps) {
  // State for Customer Accounts
  const [customers, setCustomers] = useState<CustomerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading customers from localStorage:', e);
    }
    return DEFAULT_CUSTOMERS;
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'suspended'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'spent' | 'orders' | 'name'>('newest');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<CustomerAccount | null>(null);
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<CustomerAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [isVerified, setIsVerified] = useState(true);

  // Toast notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Auto-sync customer accounts with live orders
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    setCustomers(prev => {
      const updatedList = [...prev];
      let hasChanges = false;

      orders.forEach(ord => {
        // Find by phone or email
        const index = updatedList.findIndex(c => 
          (c.phone && ord.phone && c.phone.replace(/\s+/g, '') === ord.phone.replace(/\s+/g, '')) ||
          (c.email && ord.email && c.email.toLowerCase() === ord.email.toLowerCase())
        );

        if (index >= 0) {
          // Check if order date or order counts need updating
          const existing = updatedList[index];
          const matchingOrders = orders.filter(o => 
            (o.phone && existing.phone && o.phone.replace(/\s+/g, '') === existing.phone.replace(/\s+/g, '')) ||
            (o.email && existing.email && o.email.toLowerCase() === existing.email.toLowerCase())
          );

          const totalSpent = matchingOrders.reduce((sum, o) => sum + (o.totalBdt || 0), 0);
          const ordersCount = matchingOrders.length;

          if (existing.totalSpentBdt !== totalSpent || existing.ordersCount !== ordersCount) {
            updatedList[index] = {
              ...existing,
              totalSpentBdt: Math.max(existing.totalSpentBdt, totalSpent),
              ordersCount: Math.max(existing.ordersCount, ordersCount)
            };
            hasChanges = true;
          }
        } else if (ord.customerName && (ord.phone || ord.email)) {
          // Auto-add new customer from order
          const newCust: CustomerAccount = {
            id: `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: ord.customerName,
            email: ord.email || `${ord.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            phone: ord.phone,
            address: ord.address || 'Address not provided',
            district: ord.district || 'Dhaka',
            status: 'active',
            ordersCount: 1,
            totalSpentBdt: ord.totalBdt || 0,
            joinedDate: ord.orderDate || new Date().toISOString().split('T')[0]
          };
          updatedList.unshift(newCust);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        try {
          localStorage.setItem('kirahaq_customers', JSON.stringify(updatedList));
        } catch (e) {
          console.error('Failed to save updated customers:', e);
        }
        return updatedList;
      }
      return prev;
    });
  }, [orders]);

  // Persist customers whenever state updates
  const saveCustomersState = (updatedList: CustomerAccount[]) => {
    setCustomers(updatedList);
    try {
      localStorage.setItem('kirahaq_customers', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to persist customers:', e);
    }
  };

  // Form Reset
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDistrict('Dhaka');
    setStatus('active');
    setIsVerified(true);
    setEditingCustomer(null);
  };

  const handleStartAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleStartEdit = (cust: CustomerAccount) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setAddress(cust.address);
    setDistrict(cust.district || 'Dhaka');
    setStatus(cust.status);
    setIsVerified(cust.isVerified !== false);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Please enter customer name.');
      return;
    }
    if (!phone.trim()) {
      showToast('error', 'Please enter customer phone number.');
      return;
    }

    if (editingCustomer) {
      const updatedList = customers.map(c => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: name.trim(),
            email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            phone: phone.trim(),
            address: address.trim() || 'Dhaka, Bangladesh',
            district: district.trim() || 'Dhaka',
            status,
            isVerified,
          };
        }
        return c;
      });

      saveCustomersState(updatedList);
      showToast('success', `Customer profile "${name.trim()}" updated successfully!`);

      if (selectedCustomerDetails && selectedCustomerDetails.id === editingCustomer.id) {
        setSelectedCustomerDetails({
          ...selectedCustomerDetails,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: district.trim(),
          status,
          isVerified,
        });
      }
    } else {
      const newCust: CustomerAccount = {
        id: `cust_${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: phone.trim(),
        address: address.trim() || 'Dhaka, Bangladesh',
        district: district.trim() || 'Dhaka',
        status,
        isVerified,
        ordersCount: 0,
        totalSpentBdt: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      saveCustomersState([newCust, ...customers]);
      showToast('success', `New customer "${newCust.name}" added successfully!`);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const toggleSuspendCustomer = (id: string) => {
    const updatedList = customers.map(c => {
      if (c.id === id) {
        const nextStatus: 'active' | 'suspended' = c.status === 'active' ? 'suspended' : 'active';
        showToast('success', `Customer status updated to ${nextStatus.toUpperCase()}`);
        return { ...c, status: nextStatus };
      }
      return c;
    });

    saveCustomersState(updatedList);

    if (selectedCustomerDetails && selectedCustomerDetails.id === id) {
      setSelectedCustomerDetails({
        ...selectedCustomerDetails,
        status: selectedCustomerDetails.status === 'active' ? 'suspended' : 'active'
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmCustomer) {
      const updatedList = customers.filter(c => c.id !== deleteConfirmCustomer.id);
      saveCustomersState(updatedList);
      showToast('success', `Customer "${deleteConfirmCustomer.name}" deleted.`);
      setDeleteConfirmCustomer(null);

      if (selectedCustomerDetails?.id === deleteConfirmCustomer.id) {
        setSelectedCustomerDetails(null);
      }
    }
  };

  // KPI Calculations
  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === 'active').length;
  const suspendedCount = customers.filter(c => c.status === 'suspended').length;
  const totalLifetimeSpentBdt = customers.reduce((sum, c) => sum + (c.totalSpentBdt || 0), 0);
  const avgLifetimeSpendBdt = totalCustomers > 0 ? Math.round(totalLifetimeSpentBdt / totalCustomers) : 0;

  // Filter & Search Logic
  const filteredCustomers = customers.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchLower) ||
      c.address.toLowerCase().includes(searchLower) ||
      (c.district && c.district.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Sort
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'spent') return (b.totalSpentBdt || 0) - (a.totalSpentBdt || 0);
    if (sortBy === 'orders') return (b.ordersCount || 0) - (a.ordersCount || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default newest / order in array
  });

  // Customer specific orders helper
  const getCustomerOrders = (cust: CustomerAccount): OrderDetails[] => {
    if (!orders || orders.length === 0) return [];
    return orders.filter(o => 
      (o.phone && cust.phone && o.phone.replace(/\s+/g, '') === cust.phone.replace(/\s+/g, '')) ||
      (o.email && cust.email && o.email.toLowerCase() === cust.email.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase() === cust.name.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Registered</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalCustomers}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Customer Profiles</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Active Accounts</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Verified & active</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-rose-400">Suspended</div>
          <div className="text-xl font-serif font-bold text-rose-400 mt-1">{suspendedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Access restricted</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Avg Value / Customer</div>
          <div className="text-lg font-serif font-bold text-amber-400 mt-1">
            {currency === 'BDT' ? `৳${avgLifetimeSpendBdt.toLocaleString()}` : `$${(avgLifetimeSpendBdt / 120).toFixed(2)}`}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Lifetime spend average</div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Customer Directory & Accounts ({customers.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage customer accounts, inspect purchase history, update contact information, and toggle account access status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNew}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4 text-stone-950" />
          <span>+ Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search customers by name, email, phone number, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            {(['All', 'active', 'suspended'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-bold cursor-pointer"
          >
            <option value="newest">Sort: Newest Joined</option>
            <option value="spent">Sort: Highest Spent</option>
            <option value="orders">Sort: Most Orders</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-base text-white">Registered Customer Profiles ({sortedCustomers.length})</h4>
            <p className="text-[11px] text-stone-400">Click actions to edit customer, inspect orders history, or toggle status</p>
          </div>
        </div>

        {sortedCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-stone-600 mx-auto" />
            <h5 className="text-sm font-bold text-white">No Customers Found</h5>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              No customer records match your filter criteria. Try clearing the search or click below to add a customer.
            </p>
            <button
              type="button"
              onClick={handleStartAddNew}
              className="mt-2 px-4 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Customer</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact & Location</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Total Lifetime Spent</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 text-stone-300">
                {sortedCustomers.map((c) => {
                  const custOrders = getCustomerOrders(c);
                  const actualOrdersCount = Math.max(c.ordersCount, custOrders.length);
                  const actualSpentBdt = Math.max(c.totalSpentBdt, custOrders.reduce((sum, o) => sum + (o.totalBdt || 0), 0));

                  return (
                    <tr key={c.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-xs">{c.name}</span>
                              {c.isVerified !== false && (
                                <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/40 shrink-0" title="Verified Customer">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-2.5 h-2.5 text-stone-500" /> Joined {c.joinedDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[11px] text-stone-200">
                          <Mail className="w-3 h-3 text-amber-400/80 shrink-0" /> {c.email}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-stone-500 shrink-0" /> {c.phone}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5 truncate max-w-xs">
                          <MapPin className="w-2.5 h-2.5 text-stone-500 shrink-0" /> {c.address}, {c.district || 'Dhaka'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-amber-300 font-bold text-[11px]">
                          {actualOrdersCount} {actualOrdersCount === 1 ? 'Order' : 'Orders'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400 text-sm">
                        {currency === 'BDT' ? `৳${actualSpentBdt.toLocaleString()}` : `$${(actualSpentBdt / 120).toFixed(2)}`}
                      </td>
                      <td className="p-4">
                        {c.status === 'active' ? (
                          <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-full text-[10px] font-bold flex items-center gap-1 w-max">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Order History & Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerDetails(c)}
                            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                            title="View Orders History & Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Quick Toggle Verification Badge */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = customers.map(cust => cust.id === c.id ? { ...cust, isVerified: cust.isVerified === false ? true : false } : cust);
                              saveCustomersState(updated);
                              showToast('success', `${c.name} verification status updated!`);
                            }}
                            className={`p-2 border rounded-xl cursor-pointer transition-colors ${
                              c.isVerified !== false
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                            }`}
                            title={c.isVerified !== false ? "Verified Account (Click to unverify)" : "Unverified Account (Click to verify)"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* Edit Customer Profile */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                            title="Edit Customer Details"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* Toggle Suspend / Reactivate */}
                          <button
                            type="button"
                            onClick={() => toggleSuspendCustomer(c.id)}
                            className={`p-2 border rounded-xl cursor-pointer transition-colors ${
                              c.status === 'active'
                                ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800'
                            }`}
                            title={c.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                          >
                            {c.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </button>

                          {/* Delete Customer */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCustomer(c)}
                            className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded-xl cursor-pointer transition-colors"
                            title="Delete Customer Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT CUSTOMER MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Customer Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="tanvir@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Address & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    placeholder="House 12, Road 4, Sector 3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    District / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Chattogram, Sylhet"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Account Access Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      status === 'active'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Active Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('suspended')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      status === 'suspended'
                        ? 'bg-rose-950 border-rose-600 text-rose-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Suspended</span>
                  </button>
                </div>
              </div>

              {/* Verified Account Checkbox */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer bg-stone-950 p-3 rounded-xl border border-stone-800 hover:border-stone-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified User Badge (Verified Customer)</span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCustomer ? 'Update Profile' : 'Save Customer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= CUSTOMER DETAILS & ORDER HISTORY MODAL ================= */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-base flex items-center justify-center uppercase shrink-0">
                  {selectedCustomerDetails.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <span>{selectedCustomerDetails.name}</span>
                    {selectedCustomerDetails.status === 'active' ? (
                      <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-bold rounded-full">Suspended</span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Joined on {selectedCustomerDetails.joinedDate}</p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedCustomerDetails(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400">Contact Information</span>
                <p className="text-stone-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" /> {selectedCustomerDetails.email}
                </p>
                <p className="text-stone-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" /> {selectedCustomerDetails.phone}
                </p>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-amber-400">Primary Delivery Address</span>
                <p className="text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> {selectedCustomerDetails.address}
                </p>
                <p className="text-stone-400">District: <strong className="text-white">{selectedCustomerDetails.district || 'Dhaka'}</strong></p>
              </div>
            </div>

            {/* Summary Statistics */}
            {(() => {
              const custOrders = getCustomerOrders(selectedCustomerDetails);
              const count = Math.max(selectedCustomerDetails.ordersCount, custOrders.length);
              const spentBdt = Math.max(selectedCustomerDetails.totalSpentBdt, custOrders.reduce((s, o) => s + (o.totalBdt || 0), 0));

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Total Orders</span>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{count} Orders</div>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Total Spent</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {currency === 'BDT' ? `৳${spentBdt.toLocaleString()}` : `$${(spentBdt / 120).toFixed(2)}`}
                    </div>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Average Order</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {count > 0 
                        ? (currency === 'BDT' ? `৳${Math.round(spentBdt / count).toLocaleString()}` : `$${((spentBdt / count) / 120).toFixed(2)}`)
                        : '৳0'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Customer Order History ({getCustomerOrders(selectedCustomerDetails).length})</span>
              </h4>

              {getCustomerOrders(selectedCustomerDetails).length === 0 ? (
                <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 text-center text-xs text-stone-400 space-y-1">
                  <p className="font-bold text-white">No Live Orders Found for this Account</p>
                  <p className="text-[11px]">Orders placed via checkout with this phone or email will automatically appear here.</p>
                </div>
              ) : (
                <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden divide-y divide-stone-800 text-xs">
                  {getCustomerOrders(selectedCustomerDetails).map((ord) => (
                    <div key={ord.orderId} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-900/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 font-mono">#{ord.orderId}</span>
                          <span className="text-[10px] text-stone-400">{ord.orderDate}</span>
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {ord.items ? ord.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ') : 'Organic items'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">
                            {currency === 'BDT' ? `৳${ord.totalBdt}` : `$${ord.totalUsd}`}
                          </div>
                          <span className="text-[10px] text-stone-400 capitalize">{ord.paymentMethod}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-full text-[10px] font-bold text-amber-300">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => toggleSuspendCustomer(selectedCustomerDetails.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCustomerDetails.status === 'active'
                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedCustomerDetails.status === 'active' ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" /> Suspend Customer
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Reactivate Account
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(selectedCustomerDetails);
                  }}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerDetails(null)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Customer Profile?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete customer profile for <strong className="text-amber-400">"{deleteConfirmCustomer.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCustomer(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
