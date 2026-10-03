import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, Inbox, ArrowLeft } from 'lucide-react';
import { UserAccount, AppView } from '../types';
import { 
  auth, 
  checkEmailVerifiedStatus, 
  resendFirebaseVerificationEmail, 
  markEmailAsVerified,
  signOutUser 
} from '../lib/firebase';

interface VerifyEmailPageProps {
  currentUser: UserAccount | null;
  pendingEmail?: string;
  onVerified: (user: UserAccount) => void;
  onNavigate: (view: AppView) => void;
  onLogout?: () => void;
}

export function VerifyEmailPage({
  currentUser,
  pendingEmail = '',
  onVerified,
  onNavigate,
  onLogout = () => {},
}: VerifyEmailPageProps) {
  const emailToDisplay = pendingEmail || currentUser?.email || auth.currentUser?.email || 'your-email@example.com';
  
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('A verification link has been sent to your email address.');
  const pollingRef = useRef<any>(null);

  // 1. If already verified, automatically redirect to account dashboard
  useEffect(() => {
    if (currentUser?.isVerified || auth.currentUser?.emailVerified) {
      if (currentUser) {
        onVerified(currentUser);
      }
      onNavigate('account');
    }
  }, [currentUser, onNavigate, onVerified]);

  // 2. Cooldown timer for resend email
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // 3. Automatic Verification Polling (every 4 seconds)
  useEffect(() => {
    let isMounted = true;

    const performAutoCheck = async () => {
      try {
        const isVerified = await checkEmailVerifiedStatus(auth.currentUser, emailToDisplay);
        if (isVerified && isMounted) {
          const verifiedUser: UserAccount = {
            id: auth.currentUser?.uid || currentUser?.id || 'usr_' + Date.now(),
            name: currentUser?.name || auth.currentUser?.displayName || emailToDisplay.split('@')[0],
            email: emailToDisplay,
            phone: currentUser?.phone || '',
            address: currentUser?.address || 'Dhaka',
            district: currentUser?.district || 'Dhaka',
            avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            joinedDate: currentUser?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            isVerified: true,
          };
          onVerified(verifiedUser);
          onNavigate('account');
        }
      } catch (e) {
        // Polling failure silent handling
      }
    };

    pollingRef.current = setInterval(performAutoCheck, 4000);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [emailToDisplay, currentUser, onVerified, onNavigate]);

  // Handle Manual "I've Verified My Email" Check
  const handleManualCheck = async () => {
    setIsChecking(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const isVerified = await checkEmailVerifiedStatus(auth.currentUser, emailToDisplay);
      if (isVerified) {
        const verifiedUser: UserAccount = {
          id: auth.currentUser?.uid || currentUser?.id || 'usr_' + Date.now(),
          name: currentUser?.name || auth.currentUser?.displayName || emailToDisplay.split('@')[0],
          email: emailToDisplay,
          phone: currentUser?.phone || '',
          address: currentUser?.address || 'Dhaka',
          district: currentUser?.district || 'Dhaka',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          joinedDate: currentUser?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: true,
        };
        onVerified(verifiedUser);
        setSuccessMsg('Email verified successfully! Redirecting to your account...');
        setTimeout(() => {
          onNavigate('account');
        }, 600);
      } else {
        setErrorMsg('Your email has not been verified yet. Please click the verification link sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg('Could not verify status. Please check your internet connection and make sure you clicked the link in your email.');
    } finally {
      setIsChecking(false);
    }
  };

  // Handle Resend Verification Email
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await resendFirebaseVerificationEmail(auth.currentUser, emailToDisplay);
      setCooldown(60);
      setSuccessMsg('Verification email sent successfully. Please check your inbox.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle Change Email / Back to Sign Up
  const handleChangeEmail = async () => {
    await signOutUser();
    onLogout();
    onNavigate('account');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full">
        
        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 text-center relative overflow-hidden">
          
          {/* Top Decorative Kira Haq Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1b3d2b] via-emerald-600 to-amber-400" />

          {/* Mail Verification Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-50 text-[#1b3d2b] rounded-2xl flex items-center justify-center mb-5 border border-emerald-100 shadow-sm">
            <Mail className="w-8 h-8 text-[#1b3d2b]" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
            Verify Your Email
          </h2>

          {/* Description */}
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            We've sent a verification link to your email address. Please check your inbox and click the verification link to verify your account.
          </p>

          {/* Display User Email */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-100 border border-stone-200 rounded-full text-xs font-semibold text-stone-800 mb-6 max-w-full truncate">
            <Inbox className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="truncate">{emailToDisplay}</span>
          </div>

          {/* Success Message Alert */}
          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 text-left animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Button */}
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="w-full py-3 px-4 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Checking Verification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>I've Verified My Email</span>
                </>
              )}
            </button>

            {/* Secondary Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending email...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Resend available in {cooldown}s</span>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-[#1b3d2b]" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Instant One-Click Verification for Testing / Demo */}
            <button
              type="button"
              onClick={async () => {
                setIsChecking(true);
                try {
                  await markEmailAsVerified(emailToDisplay, auth.currentUser?.uid);
                  const verifiedUser: UserAccount = {
                    id: auth.currentUser?.uid || currentUser?.id || 'usr_' + Date.now(),
                    name: currentUser?.name || auth.currentUser?.displayName || emailToDisplay.split('@')[0],
                    email: emailToDisplay,
                    phone: currentUser?.phone || '',
                    address: currentUser?.address || 'Dhaka',
                    district: currentUser?.district || 'Dhaka',
                    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                    joinedDate: currentUser?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    isVerified: true,
                  };
                  onVerified(verifiedUser);
                  setSuccessMsg('Email verified successfully! Redirecting...');
                  setTimeout(() => {
                    onNavigate('account');
                  }, 400);
                } catch (e) {
                  setErrorMsg('Instant verification failed. Please try again.');
                } finally {
                  setIsChecking(false);
                }
              }}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 border border-amber-600 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
              <span>Click here to verify directly if you didn't receive an email</span>
            </button>
          </div>

          {/* Change Email Address Link */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-[#1b3d2b] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email Address</span>
            </button>

            <span className="text-[11px] text-stone-400">
              Auto-checking live status...
            </span>
          </div>

          {/* Help Text */}
          <div className="mt-5 p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-semibold">Didn't receive the email?</span> Check your <strong>Spam</strong> or <strong>Promotions</strong> folder, or wait for the cooldown to resend.
          </div>

        </div>

      </div>
    </div>
  );
}
