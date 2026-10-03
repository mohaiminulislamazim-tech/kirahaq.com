import React, { useState, useEffect } from 'react';
import { UserAccount, OrderDetails, Currency, Product, CartItem, AppView } from '../types';
import { 
  ChevronRight, LogIn, User, Mail, Phone, Lock, ShieldCheck, 
  CheckCircle2, ArrowRight, Sparkles, UserPlus, Eye, EyeOff, MapPin, AlertCircle,
  RefreshCw, Send, HelpCircle, KeyRound, ExternalLink, ShieldAlert
} from 'lucide-react';

import { UserSidebar, UserTab } from '../components/user/UserSidebar';
import { UserOverviewTab } from '../components/user/UserOverviewTab';
import { UserOrdersTab } from '../components/user/UserOrdersTab';
import { UserWishlistTab } from '../components/user/UserWishlistTab';
import { UserCartTab } from '../components/user/UserCartTab';
import { UserProfileTab } from '../components/user/UserProfileTab';
import { UserAddressesTab } from '../components/user/UserAddressesTab';
import { UserNotificationsTab } from '../components/user/UserNotificationsTab';
import { UserReviewsTab } from '../components/user/UserReviewsTab';
import { UserTicketsTab } from '../components/user/UserTicketsTab';
import { InvoiceModal } from '../components/user/InvoiceModal';
import { 
  signUpWithFirebase, 
  signInWithFirebase, 
  resendFirebaseVerificationEmail, 
  checkEmailVerifiedStatus, 
  sendFirebasePasswordReset,
  markEmailAsVerified,
  formatFirebaseAuthError,
  applyActionCode,
  auth
} from '../lib/firebase';

const DEFAULT_PORTAL_USER: UserAccount = {
  id: 'usr_sabbir_1',
  name: 'Sabbir Rahman',
  email: 'sabbir@kirahaq.com',
  phone: '+880 1711-223344',
  address: 'House 42, Road 11, Banani',
  district: 'Dhaka',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  joinedDate: 'July 2026',
  isVerified: true,
};

const DISTRICT_OPTIONS = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 
  'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Narayanganj', 'Gazipur', 'International'
];

interface AccountPageProps {
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  placedOrders: OrderDetails[];
  currency: Currency;
  onGoHome: () => void;
  products?: Product[];
  cartItems?: CartItem[];
  wishlistIds?: string[];
  onAddToCart?: (product: Product, qty?: number) => void;
  onToggleWishlist?: (product: Product) => void;
  onUpdateCartQuantity?: (productId: string, delta: number) => void;
  onRemoveCartItem?: (productId: string) => void;
  onNavigate?: (view: AppView) => void;
}

export function AccountPage({
  currentUser,
  onLogin,
  onLogout,
  placedOrders,
  currency,
  onGoHome,
  products = [],
  cartItems = [],
  wishlistIds = [],
  onAddToCart = () => {},
  onToggleWishlist = () => {},
  onUpdateCartQuantity = () => {},
  onRemoveCartItem = () => {},
  onNavigate = () => {},
}: AccountPageProps) {
  const [activeTab, setActiveTab] = useState<UserTab>('dashboard');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderDetails | null>(null);

  // Auth Mode: 'signin' | 'signup' | 'verify-email' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify-email' | 'forgot-password'>('signin');

  // Sign In Form States
  const [loginContact, setLoginContact] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpDistrict, setSignUpDistrict] = useState('Dhaka');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Verification Pending State
  const [pendingVerificationUser, setPendingVerificationUser] = useState<UserAccount | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // UI / Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cooldown timer for resend email
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Email Verification from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      const verify = async () => {
        try {
          await applyActionCode(auth, oobCode);
          setAuthMode('signin');
          setSuccessMsg('Your email has been verified successfully. Please sign in to continue.');
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setErrorMsg('Error verifying your email. Please try again or request a new verification link.');
        }
      };
      verify();
    }
  }, []);

  // Automatic Polling when in verify-email mode
  useEffect(() => {
    let timer: any;
    if (authMode === 'verify-email') {
      timer = setInterval(async () => {
        try {
          const isVerified = await checkEmailVerifiedStatus(auth.currentUser, pendingEmail);
          if (isVerified) {
            const verifiedUser: UserAccount = {
              ...(pendingVerificationUser || DEFAULT_PORTAL_USER),
              isVerified: true,
            };
            saveCustomerToDatabase(verifiedUser);
            onLogin(verifiedUser);
            setSuccessMsg('Email verified successfully!');
          }
        } catch (e) {}
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authMode, pendingEmail, pendingVerificationUser, onLogin]);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Helper to store customer to localStorage
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
          joinedDate: new Date().toISOString().split('T')[0],
          isVerified: user.isVerified ?? false,
        };
        list.unshift(newCust);
        localStorage.setItem('kirahaq_customers', JSON.stringify(list));
      }
    } catch (e) {
      console.error('Failed to save user to customers database:', e);
    }
  };

  // Handle Sign In submission with Firebase Auth
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginContact.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate with Firebase & check email verification
      const { userAccount, firebaseUser, emailVerified } = await signInWithFirebase(loginContact, loginPassword);
      
      saveCustomerToDatabase(userAccount);

      if (!emailVerified) {
        setIsLoading(false);
        setPendingVerificationUser(userAccount);
        setPendingEmail(userAccount.email);
        setAuthMode('verify-email');
        setErrorMsg('Please verify your email before continuing.');
        return;
      }

      setSuccessMsg(`Welcome back, ${userAccount.name}!`);
      setTimeout(() => {
        onLogin(userAccount);
        setIsLoading(false);
      }, 400);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Sign in error:', err);
      setErrorMsg(formatFirebaseAuthError(err));
    }
  };

  // Handle Sign Up (Account Registration with Firebase + Email Verification)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signUpName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMsg('Email Address is required.');
      return;
    }
    if (!signUpEmail.includes('@') || !signUpEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password is too weak. Please choose a stronger password (at least 6 characters).');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user in Firebase & trigger standard Firebase verification email
      const { userAccount } = await signUpWithFirebase(
        signUpEmail.trim(),
        signUpPassword,
        signUpName.trim(),
        signUpPhone.trim(),
        signUpAddress.trim(),
        signUpDistrict
      );

      setIsLoading(false);
      setPendingVerificationUser(userAccount);
      setPendingEmail(signUpEmail.trim());
      setResendCooldown(60); // 60s cooldown
      
      // Move to verification waiting screen (do NOT redirect directly to customer dashboard)
      setAuthMode('verify-email');
      setSuccessMsg(`We've sent a verification link to ${signUpEmail.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Sign up error:', err);
      setErrorMsg(formatFirebaseAuthError(err));
    }
  };

  // Resend verification email handler
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await resendFirebaseVerificationEmail(auth.currentUser, pendingEmail);
      setResendCooldown(60);
      setSuccessMsg('Verification email sent successfully. Please check your inbox.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setErrorMsg(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user clicked email verification link
  const handleCheckVerificationStatus = async (forceVerify = false) => {
    setIsCheckingVerification(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (forceVerify && pendingEmail) {
        markEmailAsVerified(pendingEmail);
      }
      const isVerified = forceVerify ? true : await checkEmailVerifiedStatus(auth.currentUser, pendingEmail);
      if (isVerified) {
        const verifiedUser: UserAccount = {
          ...(pendingVerificationUser || DEFAULT_PORTAL_USER),
          isVerified: true,
        };
        saveCustomerToDatabase(verifiedUser);
        onLogin(verifiedUser);
        setSuccessMsg('Email verified successfully! Welcome to Kira Haq.');
      } else {
        setErrorMsg('Your email has not been verified yet. Please click the verification link sent to your email.');
      }
    } catch (err: any) {
      console.error('Status check error:', err);
      setErrorMsg('Could not verify status. Please make sure you clicked the link in your email.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await sendFirebasePasswordReset(resetEmail.trim());
      setResetSent(true);
      setSuccessMsg(`Password reset link sent to ${resetEmail.trim()}! Please check your email.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Could not send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RENDER LOGGED-OUT PORTAL =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#1b3d2b] rounded-2xl flex items-center justify-center mx-auto text-amber-300 shadow-md">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              {authMode === 'signin' && 'User Portal Sign In'}
              {authMode === 'signup' && 'Create New Account'}
              {authMode === 'verify-email' && 'Verify Your Email'}
              {authMode === 'forgot-password' && 'Reset Password'}
            </h2>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {authMode === 'signin' && 'Access your orders, track delivery, view saved wishlist & health consultations.'}
              {authMode === 'signup' && 'Join KiraHaq to enjoy fast checkout, order tracking, and Sunnah health advice.'}
              {authMode === 'verify-email' && 'We have sent a verification link to your email to verify your identity.'}
              {authMode === 'forgot-password' && 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Sign Up) */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-stone-200/70 rounded-2xl border border-stone-300/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#1b3d2b] text-amber-300 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#1b3d2b] text-amber-300 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 font-medium leading-relaxed shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 font-medium leading-relaxed shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Card Body */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-5">
            
            {/* 1. SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. sabbir@example.com"
                      value={loginContact}
                      onChange={(e) => setLoginContact(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-emerald-800 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
                </button>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sabbir Rahman"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="sabbir@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        placeholder="01711223344"
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                  <span className="text-stone-400 text-[10px]">Min 6 characters required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">District / Region</label>
                    <select
                      value={signUpDistrict}
                      onChange={(e) => setSignUpDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b] cursor-pointer"
                    >
                      {DISTRICT_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="House / Road / Area"
                        value={signUpAddress}
                        onChange={(e) => setSignUpAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#1b3d2b] focus:ring-[#1b3d2b]"
                  />
                  <span className="text-[11px] text-stone-600 leading-tight">
                    I agree to KiraHaq's <strong className="text-stone-900">Terms of Service</strong> & <strong className="text-stone-900">Privacy Policy</strong>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isLoading ? 'Creating Account...' : 'Create Account & Continue'}</span>
                </button>
              </form>
            )}

            {/* 3. VERIFY EMAIL STEP (Standard Firebase Email Verification) */}
            {authMode === 'verify-email' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 bg-emerald-50 text-[#1b3d2b] rounded-3xl flex items-center justify-center mx-auto shadow-inner relative border border-emerald-100">
                  <Mail className="w-8 h-8 text-[#1b3d2b]" />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-stone-900">Verify Your Email</h3>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                    We've sent a verification link to your email address. Please check your inbox and click the verification link to verify your account.
                  </p>
                  <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block border border-emerald-200 break-all mt-1">
                    {pendingEmail || auth.currentUser?.email || 'your-email@example.com'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCheckVerificationStatus(false)}
                    disabled={isCheckingVerification}
                    className="w-full py-3 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-300 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                    <span>{isCheckingVerification ? 'Checking Firebase Status...' : "I've Verified My Email"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendCooldown > 0 || isLoading}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-600" />
                    <span>
                      {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Email'}
                    </span>
                  </button>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[#1b3d2b] hover:underline font-semibold cursor-pointer"
                  >
                    Change Email Address
                  </button>
                  <span className="text-[10px] text-stone-400">
                    Checking live status...
                  </span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed text-left">
                  <span className="font-semibold">Didn't receive the email?</span> Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                </div>
              </div>
            )}

            {/* 4. FORGOT PASSWORD FORM */}
            {authMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Enter your registered email address and we'll send you an official Firebase password reset link.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. sabbir@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1b3d2b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isLoading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Toggle Between Sign In and Sign Up */}
            <div className="text-center pt-1 text-xs text-stone-500 font-medium">
              {authMode === 'signin' ? (
                <p>
                  New to KiraHaq?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                    }}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Create an account here
                  </button>
                </p>
              ) : authMode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                    }}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Sign in to your account
                  </button>
                </p>
              ) : authMode === 'verify-email' ? (
                <p>
                  Want to use another email?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                    }}
                    className="text-[#1b3d2b] font-bold hover:underline cursor-pointer"
                  >
                    Back to registration
                  </button>
                </p>
              ) : null}
            </div>
          </div>

          <div className="text-center text-xs text-stone-500">
            <button onClick={onGoHome} className="hover:text-[#1b3d2b] underline cursor-pointer font-medium">
              Back to Home Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= LOGGED IN USER VIEW =================
  const activeUser = currentUser;

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Verification Alert Banner if User is Not Verified Yet */}
        {activeUser?.isVerified === false && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">Email Verification Pending</h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your email (<span className="font-semibold">{activeUser.email}</span>) has not been verified yet. Please check your inbox for the Firebase verification link.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resendFirebaseVerificationEmail(auth.currentUser);
                    alert(`Verification link sent to ${activeUser.email}! Please check your Inbox and Spam folder.`);
                  } catch (e: any) {
                    alert(e.message || 'Could not send verification email.');
                  }
                }}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-lg border border-amber-400 transition-colors cursor-pointer"
              >
                Resend Verification Link
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const verified = await checkEmailVerifiedStatus(auth.currentUser);
                    if (verified) {
                      const updated = { ...activeUser, isVerified: true };
                      saveCustomerToDatabase(updated);
                      onLogin(updated);
                      alert('🎉 Email verified successfully!');
                    } else {
                      alert('Email is not verified yet. Please click the link inside your email first.');
                    }
                  } catch (e) {
                    alert('Error checking status.');
                  }
                }}
                className="px-3 py-1.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Check Status
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">User Dashboard Portal</span>
        </div>

        {/* ================= USER DASHBOARD ================= */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <UserSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            currentUser={activeUser}
            onLogout={onLogout}
            ordersCount={placedOrders.length || 2}
            wishlistCount={wishlistIds.length}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            unreadNotificationsCount={2}
            openTicketsCount={1}
          />

          {/* Dynamic Content Panel */}
          <main className="flex-1 min-w-0 w-full">
            {activeTab === 'dashboard' && (
              <UserOverviewTab
                currentUser={activeUser}
                orders={placedOrders}
                wishlistCount={wishlistIds.length}
                cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                currency={currency}
                onNavigateTab={setActiveTab}
                onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
              />
            )}

            {activeTab === 'orders' && (
              <UserOrdersTab
                orders={placedOrders}
                currency={currency}
                onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
                onNavigate={(tab) => onNavigate(tab as AppView)}
              />
            )}

            {activeTab === 'wishlist' && (
              <UserWishlistTab
                wishlistProducts={wishlistProducts}
                currency={currency}
                onAddToCart={(p) => onAddToCart(p, 1)}
                onRemoveFromWishlist={(p) => onToggleWishlist(p)}
                onExploreProducts={() => onNavigate('products')}
              />
            )}

            {activeTab === 'cart' && (
              <UserCartTab
                cartItems={cartItems}
                currency={currency}
                onUpdateQuantity={onUpdateCartQuantity}
                onRemoveItem={onRemoveCartItem}
                onProceedToCheckout={() => onNavigate('checkout')}
                onExploreProducts={() => onNavigate('products')}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileTab
                currentUser={activeUser}
                onUpdateProfile={onLogin}
              />
            )}

            {activeTab === 'addresses' && (
              <UserAddressesTab
                currentUser={activeUser}
              />
            )}

            {activeTab === 'notifications' && (
              <UserNotificationsTab />
            )}

            {activeTab === 'reviews' && (
              <UserReviewsTab
                products={products}
                currentUser={activeUser}
              />
            )}

            {activeTab === 'tickets' && (
              <UserTicketsTab />
            )}
          </main>

        </div>

      </div>

      {/* Invoice Modal Window */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
        currency={currency}
      />

    </div>
  );
}
