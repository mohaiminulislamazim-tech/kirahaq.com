import React, { useState } from 'react';
import { 
  X, User, Mail, Lock, Phone, MapPin, ShoppingBag, 
  Heart, LogOut, CheckCircle, ShieldCheck, ArrowRight,
  Edit2, PackageCheck, Clock, KeyRound, AlertCircle, Upload,
  UserPlus, LogIn, CheckCircle2, Sparkles, Eye, EyeOff, RefreshCw, Send
} from 'lucide-react';
import { UserAccount, OrderDetails, Currency, Product } from '../types';
import { 
  signUpWithFirebase, 
  signInWithFirebase, 
  resendFirebaseVerificationEmail, 
  checkEmailVerifiedStatus, 
  markEmailAsVerified,
  formatFirebaseAuthError,
  auth 
} from '../lib/firebase';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: UserAccount) => void;
  currency: Currency;
  wishlistProducts: Product[];
  onOpenCart: () => void;
}

// Sample dummy past orders for logged in user preview
const sampleOrders: OrderDetails[] = [
  {
    orderId: 'ORD-2026-8921',
    items: [],
    customerName: 'Sabbir Rahman',
    email: 'sabbir@example.com',
    phone: '+880 1711-223344',
    address: 'House 42, Road 11, Banani',
    district: 'Dhaka',
    country: 'Bangladesh',
    paymentMethod: 'bKash',
    totalUsd: 48,
    totalBdt: 5760,
    currency: 'BDT',
    status: 'Shipped',
    orderDate: '2026-07-20'
  },
  {
    orderId: 'ORD-2026-7410',
    items: [],
    customerName: 'Sabbir Rahman',
    email: 'sabbir@example.com',
    phone: '+880 1711-223344',
    address: 'House 42, Road 11, Banani',
    district: 'Dhaka',
    country: 'Bangladesh',
    paymentMethod: 'Cash on Delivery',
    totalUsd: 25,
    totalBdt: 3000,
    currency: 'BDT',
    status: 'Processing',
    orderDate: '2026-07-24'
  }
];

export function UserAccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  currency,
  wishlistProducts,
  onOpenCart
}: UserAccountModalProps) {
  const activeUser = currentUser || {
    id: 'usr_sabbir_1',
    name: 'Sabbir Rahman',
    email: 'sabbir@kirahaq.com',
    phone: '+880 1711-223344',
    address: 'House 42, Road 11, Banani',
    district: 'Dhaka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    joinedDate: 'July 2026'
  };

  const [activeAccountTab, setActiveAccountTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>('profile');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(activeUser.address || '');
  const [editDistrict, setEditDistrict] = useState(activeUser.district || 'Dhaka');
  const [editAvatar, setEditAvatar] = useState(activeUser.avatar || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auth Mode for modal when logged out: 'signin' | 'signup' | 'verify-email'
  const [modalAuthMode, setModalAuthMode] = useState<'signin' | 'signup' | 'verify-email'>('signin');
  const [modalLoginContact, setModalLoginContact] = useState('');
  const [modalLoginPassword, setModalLoginPassword] = useState('');

  const [modalSignUpName, setModalSignUpName] = useState('');
  const [modalSignUpEmail, setModalSignUpEmail] = useState('');
  const [modalSignUpPhone, setModalSignUpPhone] = useState('');
  const [modalSignUpPassword, setModalSignUpPassword] = useState('');
  const [modalSignUpDistrict, setModalSignUpDistrict] = useState('Dhaka');
  const [modalSignUpAddress, setModalSignUpAddress] = useState('');
  const [modalPendingEmail, setModalPendingEmail] = useState('');
  const [modalPendingUser, setModalPendingUser] = useState<UserAccount | null>(null);

  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  if (!isOpen) return null;

  // Helper to save user to customers list
  const saveCustomerToDatabase = (user: UserAccount) => {
    try {
      const saved = localStorage.getItem('kirahaq_customers');
      let list = saved ? JSON.parse(saved) : [];
      const exists = list.some((c: any) => (user.email && c.email === user.email) || (user.phone && c.phone === user.phone));
      if (!exists) {
        const newCust = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address || '',
          district: user.district || 'Dhaka',
          status: 'active',
          ordersCount: 0,
          totalSpentBdt: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        list.unshift(newCust);
        localStorage.setItem('kirahaq_customers', JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Render Login & Signup Modal when logged out
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-amber-100 overflow-hidden my-8">
          
          {/* Header */}
          <div className="bg-[#1b3d2b] text-white p-5 relative flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-amber-100">
                  {modalAuthMode === 'signin' ? 'Sign In to KiraHaq' : 'Create KiraHaq Account'}
                </h2>
                <p className="text-[11px] text-emerald-200">
                  {modalAuthMode === 'signin' ? 'View orders, saved wishlist & consultation history' : 'Sign up for fast checkout & track your orders'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setModalAuthMode('signin');
                  setModalError('');
                  setModalSuccess('');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalAuthMode === 'signin'
                    ? 'bg-[#1b3d2b] text-amber-300 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalAuthMode('signup');
                  setModalError('');
                  setModalSuccess('');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalAuthMode === 'signup'
                    ? 'bg-[#1b3d2b] text-amber-300 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Error / Success messages */}
            {modalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Sign In Form */}
            {modalAuthMode === 'signin' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setModalError('');
                  setModalSuccess('');
                  if (!modalLoginContact.trim()) {
                    setModalError('Please enter your email.');
                    return;
                  }
                  if (!modalLoginPassword) {
                    setModalError('Please enter your password.');
                    return;
                  }

                  setModalLoading(true);
                  try {
                    const { userAccount, emailVerified } = await signInWithFirebase(modalLoginContact, modalLoginPassword);
                    saveCustomerToDatabase(userAccount);
                    
                    if (!emailVerified) {
                      setModalLoading(false);
                      setModalPendingUser(userAccount);
                      setModalPendingEmail(userAccount.email);
                      setModalAuthMode('verify-email');
                      setModalError('Please verify your email before continuing.');
                      return;
                    }

                    setModalSuccess(`Welcome back, ${userAccount.name}!`);
                    setTimeout(() => {
                      onLogin(userAccount);
                      onClose();
                      setModalLoading(false);
                    }, 400);
                  } catch (err: any) {
                    setModalLoading(false);
                    console.error('Sign in error:', err);
                    setModalError(formatFirebaseAuthError(err));
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. sabbir@example.com"
                      value={modalLoginContact}
                      onChange={(e) => setModalLoginContact(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={modalShowPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={modalLoginPassword}
                      onChange={(e) => setModalLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                    />
                    <button
                      type="button"
                      onClick={() => setModalShowPassword(!modalShowPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {modalShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" /> : <LogIn className="w-4 h-4 text-amber-300" />}
                  <span>{modalLoading ? 'Signing In...' : 'Sign In to Account'}</span>
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {modalAuthMode === 'signup' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setModalError('');
                  setModalSuccess('');
                  if (!modalSignUpName.trim()) {
                    setModalError('Full Name is required.');
                    return;
                  }
                  if (!modalSignUpEmail.trim()) {
                    setModalError('Email is required for Firebase verification.');
                    return;
                  }
                  if (modalSignUpPassword.length < 6) {
                    setModalError('Password must be at least 6 characters.');
                    return;
                  }

                  setModalLoading(true);
                  try {
                    const { userAccount } = await signUpWithFirebase(
                      modalSignUpEmail.trim(),
                      modalSignUpPassword,
                      modalSignUpName.trim(),
                      modalSignUpPhone.trim(),
                      modalSignUpAddress.trim(),
                      modalSignUpDistrict
                    );

                    setModalLoading(false);
                    setModalPendingUser(userAccount);
                    setModalPendingEmail(modalSignUpEmail.trim());
                    setModalAuthMode('verify-email');
                    setModalSuccess(`Verification email sent to ${modalSignUpEmail.trim()}! Please check your inbox.`);
                  } catch (err: any) {
                    setModalLoading(false);
                    console.error('Sign up error:', err);
                    setModalError(formatFirebaseAuthError(err));
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sabbir Rahman"
                      value={modalSignUpName}
                      onChange={(e) => setModalSignUpName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sabbir@example.com"
                      value={modalSignUpEmail}
                      onChange={(e) => setModalSignUpEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      placeholder="01711223344"
                      value={modalSignUpPhone}
                      onChange={(e) => setModalSignUpPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={modalSignUpPassword}
                    onChange={(e) => setModalSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1b3d2b]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" /> : <ArrowRight className="w-4 h-4 text-amber-300" />}
                  <span>{modalLoading ? 'Creating Account...' : 'Create Account & Continue'}</span>
                </button>
              </form>
            )}

            {/* Email Verification Step in Modal */}
            {modalAuthMode === 'verify-email' && (
              <div className="space-y-3.5 text-center py-2">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Check Your Email</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    We sent a verification link to <span className="font-semibold text-emerald-900">{modalPendingEmail}</span>. Click the link in your email to verify.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const verified = await checkEmailVerifiedStatus(auth.currentUser, modalPendingEmail);
                    if (verified) {
                      const user: UserAccount = modalPendingUser || {
                        id: auth.currentUser?.uid || 'usr_' + Date.now(),
                        name: auth.currentUser?.displayName || 'KiraHaq Customer',
                        email: modalPendingEmail || auth.currentUser?.email || '',
                        phone: '',
                        address: 'Dhaka',
                        district: 'Dhaka',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                        isVerified: true,
                      };
                      saveCustomerToDatabase(user);
                      
                      onLogin(user);
                      onClose();
                    } else {
                      setModalError('Email is not verified yet. Please click the link in your email, or click Continue.');
                    }
                  }}
                  className="w-full py-2 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  I've Verified My Email (Check Status)
                </button>
                <div className="flex items-center justify-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await resendFirebaseVerificationEmail(auth.currentUser, modalPendingEmail);
                        setModalSuccess('Verification email resent! Please check your inbox.');
                      } catch (e: any) {
                        setModalError(e.message || 'Error resending email.');
                      }
                    }}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Resend Verification Email
                  </button>
                </div>
              </div>
            )}

            <div className="text-center text-xs text-stone-500 font-medium pt-1">
              {modalAuthMode === 'signin' ? (
                <span>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => setModalAuthMode('signup')}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Sign Up Now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setModalAuthMode('signin')}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: UserAccount = {
      ...activeUser,
      name: editName,
      phone: editPhone,
      address: editAddress,
      district: editDistrict,
      avatar: editAvatar || activeUser.avatar
    };

    onUpdateProfile(updatedUser);
    setIsEditingProfile(false);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-amber-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-[#1b3d2b] text-white p-6 relative flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">
                User Dashboard Account ({activeUser.name})
              </h2>
              <p className="text-xs text-emerald-200">
                Manage orders, wishlist & delivery addresses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout from Account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Top Navigation Tabs */}
          <div className="flex border-b border-stone-200 mb-6 gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveAccountTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeAccountTab === 'profile'
                  ? 'border-[#1b3d2b] text-[#1b3d2b] bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <User className="w-4 h-4" />
              My Profile
            </button>

            <button
              onClick={() => setActiveAccountTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeAccountTab === 'orders'
                  ? 'border-[#1b3d2b] text-[#1b3d2b] bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Order History ({sampleOrders.length})
            </button>

            <button
              onClick={() => setActiveAccountTab('addresses')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeAccountTab === 'addresses'
                  ? 'border-[#1b3d2b] text-[#1b3d2b] bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Saved Address
            </button>

            <button
              onClick={() => setActiveAccountTab('wishlist')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeAccountTab === 'wishlist'
                  ? 'border-[#1b3d2b] text-[#1b3d2b] bg-emerald-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Saved Wishlist ({wishlistProducts.length})
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {saveSuccessMsg}
            </div>
          )}

          {/* TAB 1: Profile Tab */}
          {activeAccountTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={activeUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={activeUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-base">{activeUser.name}</h3>
                      {activeUser.isVerified !== false && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                          <span>Verified Account</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">{activeUser.email}</p>
                    <p className="text-xs text-stone-500">{activeUser.phone}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                      Member since {activeUser.joinedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-400 cursor-not-allowed"
                  >
                    <span>Camera Disabled</span>
                  </button>

                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(activeUser.name);
                        setEditPhone(activeUser.phone);
                        setEditAddress(activeUser.address || '');
                        setEditDistrict(activeUser.district || 'Dhaka');
                        setEditAvatar(activeUser.avatar || '');
                        setIsEditingProfile(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-xl border border-amber-200 space-y-4">
                  <h4 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">Update Account Details</h4>
                  
                  {/* Photo Upload & Camera Capture in Modal */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="relative group shrink-0">
                      <img
                        src={editAvatar || activeUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-xs"
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <p className="text-xs font-bold text-stone-800">Profile Image</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {}}
                          className="px-3 py-1.5 bg-stone-100 text-stone-400 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-not-allowed border border-stone-200"
                        >
                          <span>Camera Disabled</span>
                        </button>

                        <label 
                          htmlFor="modal-avatar-upload"
                          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-stone-600" />
                          <span>Upload File</span>
                          <input
                            id="modal-avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleModalImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500">Upload JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">District / Region</label>
                      <select
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barisal">Barisal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Full Delivery Address</label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1b3d2b] text-white rounded-lg text-xs font-medium hover:bg-emerald-900 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Email Address</span>
                    <p className="text-xs font-medium text-stone-800 mt-0.5">{activeUser.email}</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Phone Number</span>
                    <p className="text-xs font-medium text-stone-800 mt-0.5">{activeUser.phone}</p>
                  </div>

                  <div className="sm:col-span-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Default Shipping Address</span>
                    <p className="text-xs font-medium text-stone-800 mt-0.5">
                      {activeUser.address ? `${activeUser.address}, ${activeUser.district}` : 'No saved address yet.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Order History */}
          {activeAccountTab === 'orders' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">Track and review your recent Sunnah Natural orders:</p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {sampleOrders.map((ord) => (
                  <div key={ord.orderId} className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div>
                        <span className="font-bold text-stone-800">{ord.orderId}</span>
                        <span className="text-stone-400 ml-2">({ord.orderDate})</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Shipped'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status === 'Shipped' ? '🚚 Shipped / Dispatched' : '⏳ Processing'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <div>
                        <span>Payment Method: </span>
                        <strong className="text-stone-800">{ord.paymentMethod}</strong>
                      </div>
                      <div className="text-right">
                        <span>Total Paid: </span>
                        <strong className="text-[#1b3d2b] font-bold text-sm">
                          {currency === 'BDT' ? `৳${ord.totalBdt}` : `$${ord.totalUsd}`}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 pt-1">
                      Shipping to: {ord.address}, {ord.district}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeAccountTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-stone-700">Primary Delivery Address</h4>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2 relative">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Home / Primary Location</span>
                  <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Default</span>
                </div>
                <p className="text-stone-800 font-medium">{activeUser.name}</p>
                <p className="text-stone-600">{activeUser.address || 'House 42, Road 11, Banani'}</p>
                <p className="text-stone-600">{activeUser.district || 'Dhaka'}, Bangladesh</p>
                <p className="text-stone-500 pt-1">Phone: {activeUser.phone}</p>
              </div>
            </div>
          )}

          {/* TAB 4: Saved Wishlist */}
          {activeAccountTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <Heart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Your wishlist is currently empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="flex gap-3 items-center bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold text-stone-800 truncate">{p.name}</p>
                        <p className="text-emerald-700 font-bold">
                          {currency === 'BDT' ? `৳${p.priceBdt}` : `$${p.priceUsd}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {wishlistProducts.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="w-full py-2 bg-[#1b3d2b] text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  View Shopping Cart
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Camera Photo Capture Modal */}
    </div>
  );
}
