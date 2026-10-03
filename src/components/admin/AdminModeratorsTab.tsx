import React, { useState } from 'react';
import { 
  User, Shield, Trash2, Edit3, Plus, Check, X, Save, 
  Lock, Eye, EyeOff, Copy, CheckCheck, RefreshCw, KeyRound, 
  ShieldCheck, ShieldAlert, Sliders, Users, AlertCircle, 
  Package, Boxes, Layers, ShoppingBag, Sparkles, FileText, 
  Ticket, Truck, Calendar, Mail, TrendingUp, Phone, CheckSquare, Square
} from 'lucide-react';
import { ManagerAccount, AdminTab } from '../../types';

interface AdminModeratorsTabProps {
  managers: ManagerAccount[];
  onAddModerator: (moderator: ManagerAccount) => void;
  onUpdateModerator: (moderator: ManagerAccount) => void;
  onDeleteModerator: (id: string) => void;
}

interface TabOption {
  id: AdminTab;
  label: string;
  category: 'core' | 'catalog' | 'sales' | 'marketing' | 'system';
  icon: any;
  description: string;
}

const TAB_OPTIONS: TabOption[] = [
  { id: 'dashboard', label: 'Dashboard Overview', category: 'core', icon: TrendingUp, description: 'Sales and order analytics & overview' },
  { id: 'products', label: 'Products Management', category: 'catalog', icon: Package, description: 'Add, edit and manage store products' },
  { id: 'inventory', label: 'Stock & Inventory', category: 'catalog', icon: Boxes, description: 'Stock counts & low-stock alerts' },
  { id: 'categories', label: 'Categories Control', category: 'catalog', icon: Layers, description: 'Product category creation and ordering' },
  { id: 'orders', label: 'Orders & Fulfillment', category: 'sales', icon: ShoppingBag, description: 'Order processing, status and shipping' },
  { id: 'customers', label: 'Customer Database', category: 'sales', icon: Users, description: 'Customer details and purchase history' },
  { id: 'consultations', label: 'Consultation Bookings', category: 'sales', icon: Calendar, description: 'Hijama & herbal consultation appointments' },
  { id: 'reviews', label: 'Customer Reviews', category: 'marketing', icon: Sparkles, description: 'Moderate and publish customer reviews' },
  { id: 'blog', label: 'Blog & Health Tips', category: 'marketing', icon: FileText, description: 'Articles and health guides' },
  { id: 'coupons', label: 'Coupons & Promos', category: 'marketing', icon: Ticket, description: 'Promo codes and discounts' },
  { id: 'shipping', label: 'Shipping Rates', category: 'sales', icon: Truck, description: 'Delivery fees and shipping zones' },
  { id: 'subscribers', label: 'Newsletter Subscribers', category: 'marketing', icon: Mail, description: 'Email subscriber list' },
  { id: 'reports', label: 'Sales Reports', category: 'core', icon: TrendingUp, description: 'Daily, monthly and yearly revenue reports' },
  { id: 'settings', label: 'Store Settings', category: 'system', icon: Sliders, description: 'Website and store configuration' },
  { id: 'contact', label: 'Contact Info & Support', category: 'system', icon: Phone, description: 'Helpline, WhatsApp and business address' },
  { id: 'moderators', label: 'Admin & Moderator Control', category: 'system', icon: ShieldCheck, description: 'Staff credentials and role permissions' },
];

export const AdminModeratorsTab: React.FC<AdminModeratorsTabProps> = ({ 
  managers, 
  onAddModerator, 
  onUpdateModerator, 
  onDeleteModerator 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingManager, setEditingManager] = useState<ManagerAccount | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'moderator'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Creation State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleType, setNewRoleType] = useState<'admin' | 'moderator'>('moderator');
  const [newRoleTitle, setNewRoleTitle] = useState('Product & Order Moderator');
  const [newPhone, setNewPhone] = useState('');
  const [newAllowedTabs, setNewAllowedTabs] = useState<AdminTab[]>([
    'dashboard', 'products', 'inventory', 'orders', 'customers'
  ]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Editing State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRoleType, setEditRoleType] = useState<'admin' | 'moderator'>('moderator');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editAllowedTabs, setEditAllowedTabs] = useState<AdminTab[]>([]);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const applyPreset = (presetType: 'full_admin' | 'products' | 'orders' | 'content' | 'custom', isEdit = false) => {
    let tabs: AdminTab[] = [];
    let title = '';

    switch (presetType) {
      case 'full_admin':
        tabs = TAB_OPTIONS.map(t => t.id);
        title = 'General Administrator';
        break;
      case 'products':
        tabs = ['dashboard', 'products', 'inventory', 'categories', 'reviews'];
        title = 'Inventory & Product Manager';
        break;
      case 'orders':
        tabs = ['dashboard', 'orders', 'customers', 'consultations', 'shipping'];
        title = 'Order Fulfillment & Support';
        break;
      case 'content':
        tabs = ['dashboard', 'blog', 'reviews', 'subscribers', 'coupons'];
        title = 'Content & Marketing Manager';
        break;
      case 'custom':
        tabs = ['dashboard', 'orders'];
        title = 'Custom Moderator';
        break;
    }

    if (isEdit) {
      setEditAllowedTabs(tabs);
      if (title && !editRoleTitle) setEditRoleTitle(title);
    } else {
      setNewAllowedTabs(tabs);
      if (title) setNewRoleTitle(title);
    }
  };

  const handleCopyCredentials = (email: string, pass: string, id: string) => {
    const text = `Kira Haq Admin Portal Login:\nEmail: ${email}\nPassword: ${pass}\nLogin Link: /admin`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim()) {
      setFormError('Please enter the staff member full name.');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setFormError('Please enter a valid login email address.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }

    // Check duplicate email
    const emailLower = newEmail.trim().toLowerCase();
    if (emailLower === 'kirahaq.official@gmail.com' || managers.some(m => m.email.toLowerCase() === emailLower)) {
      setFormError('This email is already in use by another account. Please provide a different email.');
      return;
    }

    if (newAllowedTabs.length === 0) {
      setFormError('Please select at least 1 allowed feature tab.');
      return;
    }

    const newAccount: ManagerAccount = {
      id: `acc_${Date.now()}`,
      name: newName.trim(),
      email: emailLower,
      phone: newPhone.trim(),
      roleType: newRoleType,
      roleTitle: newRoleTitle.trim() || (newRoleType === 'admin' ? 'Admin' : 'Moderator'),
      passwordPin: newPassword.trim(),
      allowedTabs: newAllowedTabs,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddModerator(newAccount);
    setIsCreating(false);
    
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setNewRoleTitle('Product & Order Moderator');
    setNewRoleType('moderator');
    setNewAllowedTabs(['dashboard', 'products', 'inventory', 'orders', 'customers']);
    setFormError('');
  };

  const handleStartEdit = (manager: ManagerAccount) => {
    setEditingManager(manager);
    setEditName(manager.name);
    setEditEmail(manager.email);
    setEditPassword(manager.passwordPin);
    setEditRoleType(manager.roleType || 'moderator');
    setEditRoleTitle(manager.roleTitle);
    setEditPhone(manager.phone || '');
    setEditStatus(manager.status);
    setEditAllowedTabs(manager.allowedTabs || (manager.roleType === 'admin' ? TAB_OPTIONS.map(t => t.id) : (['dashboard', 'orders'] as AdminTab[])));
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('Please enter a name.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditError('Please enter a valid email address.');
      return;
    }
    if (!editPassword.trim()) {
      setEditError('Password cannot be empty.');
      return;
    }

    const emailLower = editEmail.trim().toLowerCase();
    if (
      emailLower !== editingManager.email.toLowerCase() && 
      (emailLower === 'kirahaq.official@gmail.com' || managers.some(m => m.id !== editingManager.id && m.email.toLowerCase() === emailLower))
    ) {
      setEditError('This email is already associated with another staff account.');
      return;
    }

    if (editAllowedTabs.length === 0) {
      setEditError('Please select at least 1 feature access permission.');
      return;
    }

    const updatedAccount: ManagerAccount = {
      ...editingManager,
      name: editName.trim(),
      email: emailLower,
      phone: editPhone.trim(),
      roleType: editRoleType,
      roleTitle: editRoleTitle.trim() || (editRoleType === 'admin' ? 'Admin' : 'Moderator'),
      passwordPin: editPassword.trim(),
      status: editStatus,
      allowedTabs: editAllowedTabs
    };

    onUpdateModerator(updatedAccount);
    setEditingManager(null);
  };

  const handleToggleTabSelection = (tabId: AdminTab, isEdit = false) => {
    if (isEdit) {
      if (editAllowedTabs.includes(tabId)) {
        setEditAllowedTabs(editAllowedTabs.filter(id => id !== tabId));
      } else {
        setEditAllowedTabs([...editAllowedTabs, tabId]);
      }
    } else {
      if (newAllowedTabs.includes(tabId)) {
        setNewAllowedTabs(newAllowedTabs.filter(id => id !== tabId));
      } else {
        setNewAllowedTabs([...newAllowedTabs, tabId]);
      }
    }
  };

  const handleSelectAllTabs = (isEdit = false) => {
    const all = TAB_OPTIONS.map(t => t.id);
    if (isEdit) {
      setEditAllowedTabs(all);
    } else {
      setNewAllowedTabs(all);
    }
  };

  const handleClearAllTabs = (isEdit = false) => {
    if (isEdit) {
      setEditAllowedTabs([]);
    } else {
      setNewAllowedTabs([]);
    }
  };

  const filteredManagers = managers.filter(m => {
    if (filterRole === 'admin') return m.roleType === 'admin';
    if (filterRole === 'moderator') return m.roleType !== 'admin';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              Admin & Moderator Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              Create unique credentials for administrators and moderators, and configure granular tab-level access permissions for each staff member.
            </p>
          </div>

          {!isCreating && (
            <button
              type="button"
              onClick={() => {
                setIsCreating(true);
                setNewPassword(generateRandomPassword());
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Admin / Moderator</span>
            </button>
          )}
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800">
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <div className="text-stone-400 text-[11px] font-bold">Total Accounts</div>
            <div className="text-xl font-black text-white mt-0.5">{managers.length + 1}</div>
          </div>
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <div className="text-amber-400 text-[11px] font-bold">Admins</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{managers.filter(m => m.roleType === 'admin').length + 1}</div>
          </div>
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <div className="text-emerald-400 text-[11px] font-bold">Active Moderators</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">{managers.filter(m => m.roleType !== 'admin' && m.status === 'active').length}</div>
          </div>
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <div className="text-rose-400 text-[11px] font-bold">Suspended</div>
            <div className="text-xl font-black text-rose-300 mt-0.5">{managers.filter(m => m.status === 'suspended').length}</div>
          </div>
        </div>
      </div>

      {/* CREATE NEW ADMIN / MODERATOR FORM */}
      {isCreating && (
        <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Create Staff Account</h3>
                <p className="text-xs text-stone-400">Set up login credentials and specify allowed dashboard tabs</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-6">
            {/* Account Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">Account Role Type</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setNewRoleType('admin');
                    applyPreset('full_admin');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    newRoleType === 'admin'
                      ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin (Full / Custom Access)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewRoleType('moderator');
                    applyPreset('orders');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    newRoleType === 'moderator'
                      ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Moderator (Restricted Access)</span>
                </button>
              </div>
            </div>

            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Designation / Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Processing Executive, Inventory Head"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Login Email ID *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@kirahaq.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500 mt-1">Staff will use this email address to log in.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300">
                    Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+880 1700-000000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Permissions & Tab Access Section */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Allowed Tabs & Features Access</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">The staff member will only be able to view and operate the selected tabs.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllTabs(false)}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearAllTabs(false)}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-bold text-stone-400 self-center">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('full_admin')}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Full Admin Access
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('products')}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Products & Inventory
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('orders')}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Orders & Support
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('content')}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Blog & Marketing
                </button>
              </div>

              {/* Tab Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {TAB_OPTIONS.map((tab) => {
                  const isSelected = newAllowedTabs.includes(tab.id);
                  const Icon = tab.icon;
                  return (
                    <label
                      key={tab.id}
                      onClick={() => handleToggleTabSelection(tab.id, false)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400/50 text-white'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'border border-stone-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                          <span className={isSelected ? 'text-amber-300' : 'text-stone-300'}>{tab.label}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">{tab.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Account</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL / FORM */}
      {editingManager && (
        <div className="bg-stone-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Edit Account: {editingManager.name}</h3>
                <p className="text-xs text-stone-400">Update credentials, status, or permitted dashboard tabs</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingManager(null)}
              className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {editError && (
            <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Role Title / Designation *</label>
                <input
                  type="text"
                  required
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Login Email ID *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300">Login Password *</label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(generateRandomPassword())}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate New</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                >
                  <option value="active">Active (Permitted to log in)</option>
                  <option value="suspended">Suspended (Temporarily disabled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Role Type</label>
                <select
                  value={editRoleType}
                  onChange={(e) => setEditRoleType(e.target.value as 'admin' | 'moderator')}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Allowed Tabs Selection */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h4 className="text-xs sm:text-sm font-bold text-white">Feature Access Permissions</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllTabs(true)}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearAllTabs(true)}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TAB_OPTIONS.map((tab) => {
                  const isSelected = editAllowedTabs.includes(tab.id);
                  const Icon = tab.icon;
                  return (
                    <label
                      key={tab.id}
                      onClick={() => handleToggleTabSelection(tab.id, true)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400/50 text-white'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'border border-stone-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                          <span className={isSelected ? 'text-amber-300' : 'text-stone-300'}>{tab.label}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">{tab.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Account</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & LIST OF ACCOUNTS */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Staff Accounts & Credentials</span>
            </h2>
            <p className="text-xs text-stone-400">View and manage staff profiles, passwords, and tab access permissions</p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start">
            <button
              type="button"
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterRole === 'all' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({managers.length + 1})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterRole === 'admin' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Admins ({managers.filter(m => m.roleType === 'admin').length + 1})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('moderator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterRole === 'moderator' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Moderators ({managers.filter(m => m.roleType !== 'admin').length})
            </button>
          </div>
        </div>

        {/* Master Root Admin Card (Always pinned on top) */}
        {(filterRole === 'all' || filterRole === 'admin') && (
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-white">Kira Haq Main Admin</span>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-black uppercase rounded-full tracking-wider">
                      Master Owner
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-amber-300">kirahaq.official@gmail.com</span>
                    <span>•</span>
                    <span className="text-stone-300">Super Admin / Store Owner</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl self-start md:self-center">
                <div className="text-left">
                  <div className="text-[10px] text-stone-400">Access Scope:</div>
                  <div className="text-xs font-bold text-amber-400">Full System Access (16/16 Tabs)</div>
                </div>
                <div className="px-2.5 py-1 bg-stone-800 text-stone-300 text-[11px] font-mono rounded">
                  Root Protected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List of Created Staff / Managers */}
        <div className="space-y-4">
          {filteredManagers.map((manager) => {
            const isPasswordVisible = visiblePasswords[manager.id] || false;
            const isCopied = copiedId === manager.id;
            const isSuspended = manager.status === 'suspended';
            const allowedTabsList = manager.allowedTabs || ['dashboard', 'orders'];

            return (
              <div
                key={manager.id}
                className={`bg-stone-950 border rounded-2xl p-5 transition-all ${
                  isSuspended 
                    ? 'border-rose-900/40 opacity-75' 
                    : 'border-stone-800 hover:border-stone-700 shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Profile Details */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      manager.roleType === 'admin' 
                        ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400' 
                        : 'bg-blue-400/10 border border-blue-400/30 text-blue-400'
                    }`}>
                      {manager.roleType === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{manager.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                          manager.roleType === 'admin'
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                            : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                        }`}>
                          {manager.roleType === 'admin' ? 'Admin' : 'Moderator'}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          isSuspended 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-stone-300 font-semibold">{manager.roleTitle}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-400">{manager.email}</span>
                        {manager.phone && (
                          <>
                            <span>•</span>
                            <span className="text-stone-400">{manager.phone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-stone-500 text-[11px]">Added: {manager.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Password & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Password Display Box */}
                    <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
                      <div className="text-left">
                        <div className="text-[9px] uppercase font-bold text-stone-500">Password</div>
                        <div className="text-xs font-mono font-bold text-amber-300">
                          {isPasswordVisible ? manager.passwordPin : '••••••••'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(manager.id)}
                        className="p-1 text-stone-500 hover:text-stone-300 cursor-pointer"
                        title={isPasswordVisible ? 'Hide' : 'Show'}
                      >
                        {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Copy Login Info */}
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(manager.email, manager.passwordPin, manager.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500 text-stone-950 shadow'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700'
                      }`}
                      title="Copy Login Credentials"
                    >
                      {isCopied ? <CheckCheck className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Login'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(manager)}
                      className="p-2 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                      title="Edit Staff Account"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${manager.name}? This action cannot be undone.`)) {
                          onDeleteModerator(manager.id);
                        }
                      }}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl cursor-pointer transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges of Allowed Tabs */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-500 mr-1">Permitted Tabs:</span>
                  {allowedTabsList.map((tabId) => {
                    const tabInfo = TAB_OPTIONS.find(t => t.id === tabId);
                    return (
                      <span
                        key={tabId}
                        className="px-2 py-0.5 bg-stone-900 border border-stone-800 text-stone-300 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {tabInfo ? tabInfo.label : tabId}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredManagers.length === 0 && (
            <div className="text-center py-10 bg-stone-950/40 border border-stone-800/60 rounded-2xl text-stone-500 text-xs">
              No staff accounts found in this category. Click &quot;Add New Admin / Moderator&quot; to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
