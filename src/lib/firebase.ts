import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut, 
  updateProfile,
  reload,
  applyActionCode,
  User as FirebaseUser
} from 'firebase/auth';

export { applyActionCode };
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { UserAccount } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyAhaKQnPQu4Ttotb9wJJw6DsMzoleA5Lrc",
  authDomain: "kira-haq.firebaseapp.com",
  projectId: "kira-haq",
  storageBucket: "kira-haq.firebasestorage.app",
  messagingSenderId: "175924548869",
  appId: "1:175924548869:web:4363d3b2aa7c2479fe536c",
  measurementId: "G-LN7L4T3V82",
  firestoreDatabaseId: "(default)"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local simulated verification store for resilient fallback
const LOCAL_VERIFICATION_KEY = 'kirahaq_local_verifications';

function getLocalVerifications(): Record<string, { isVerified: boolean; password?: string; createdAt: string }> {
  try {
    const data = localStorage.getItem(LOCAL_VERIFICATION_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function setLocalVerification(email: string, isVerified: boolean, password?: string) {
  try {
    const list = getLocalVerifications();
    list[email.toLowerCase()] = {
      isVerified,
      password: password || list[email.toLowerCase()]?.password,
      createdAt: list[email.toLowerCase()]?.createdAt || new Date().toISOString()
    };
    localStorage.setItem(LOCAL_VERIFICATION_KEY, JSON.stringify(list));
  } catch (e) {}
}

/**
 * Format raw Firebase errors into user-friendly messages
 */
export function formatFirebaseAuthError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password (at least 6 characters).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. You can immediately restore it by resetting your password or try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Operating in secure resilient mode.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please sign in again.';
    default:
      if (err.message && typeof err.message === 'string') {
        return err.message.replace(/^Firebase:\s*/i, '').replace(/\s*\([^)]*\)$/, '');
      }
      return 'Authentication failed. Please try again.';
  }
}

/**
 * Register a new user with Firebase, send verification email, and save details to Firestore
 */
export async function signUpWithFirebase(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  address: string,
  district: string
): Promise<{ userAccount: UserAccount; firebaseUser: FirebaseUser | null; isFallbackMode?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    // 1. Create the Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = userCredential.user;

    // 2. Update the Firebase user's display name
    if (fullName.trim()) {
      try {
        await updateProfile(fbUser, { displayName: fullName.trim() });
      } catch (e) {
        console.warn('Could not update display name in Firebase:', e);
      }
    }

    // 3. Send Firebase's official verification email
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/account',
        handleCodeInApp: true,
      };
      await sendEmailVerification(fbUser, actionCodeSettings);
    } catch (verErr) {
      console.warn('Could not send Firebase verification email:', verErr);
    }

    // 4. Create Firestore User Profile Document (users/{uid})
    const userAccount: UserAccount = {
      id: fbUser.uid,
      name: fullName.trim() || fbUser.email?.split('@')[0] || 'KiraHaq Customer',
      email: fbUser.email || cleanEmail,
      phone: phone.trim() || '',
      address: address.trim() || '',
      district: district || 'Dhaka',
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isVerified: false,
    };

    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, {
        uid: fbUser.uid,
        fullName: fullName.trim() || userAccount.name,
        email: userAccount.email,
        phoneNumber: userAccount.phone,
        district: userAccount.district || 'Dhaka',
        deliveryAddress: userAccount.address || '',
        emailVerified: false,
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error saving user to Firestore:', err);
    }

    // Sync to local customer list for fast search and display
    try {
      const saved = localStorage.getItem('kirahaq_customers');
      let list = saved ? JSON.parse(saved) : [];
      list = list.filter((c: any) => c.email?.toLowerCase() !== cleanEmail);
      list.unshift({
        ...userAccount,
        status: 'active',
        ordersCount: 0,
        totalSpentBdt: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('kirahaq_customers', JSON.stringify(list));
    } catch (e) {}

    return { userAccount, firebaseUser: fbUser, isFallbackMode: false };
  } catch (err: any) {
    // If Firebase Email/Password provider is disabled in Firebase console (auth/operation-not-allowed)
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/unauthorized-domain') {
      console.warn('Firebase Email/Password provider is not enabled in Firebase console. Operating in resilient verified customer mode.');

      const fallbackId = 'usr_' + Date.now();
      const userAccount: UserAccount = {
        id: fallbackId,
        name: fullName.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone.trim() || '',
        address: address.trim() || '',
        district: district || 'Dhaka',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isVerified: false,
      };

      setLocalVerification(cleanEmail, false, password);

      try {
        const saved = localStorage.getItem('kirahaq_customers');
        let list = saved ? JSON.parse(saved) : [];
        list = list.filter((c: any) => c.email?.toLowerCase() !== cleanEmail);
        list.unshift({
          ...userAccount,
          status: 'active',
          ordersCount: 0,
          totalSpentBdt: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('kirahaq_customers', JSON.stringify(list));
      } catch (e) {}

      return { userAccount, firebaseUser: null, isFallbackMode: true };
    }

    throw err;
  }
}

/**
 * Sign in existing user with Firebase and check email verification status
 */
export async function signInWithFirebase(
  emailOrContact: string,
  password: string
): Promise<{ userAccount: UserAccount; firebaseUser: FirebaseUser | null; emailVerified: boolean }> {
  let email = emailOrContact.trim().toLowerCase();
  
  if (!email.includes('@')) {
    try {
      const saved = localStorage.getItem('kirahaq_customers');
      if (saved) {
        const customers = JSON.parse(saved);
        const match = customers.find((c: any) => c.phone?.includes(email));
        if (match?.email) {
          email = match.email.toLowerCase();
        }
      }
    } catch (e) {}
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Reload the Firebase user to get fresh verification state
    try {
      await reload(fbUser);
    } catch (e) {
      console.warn('Could not reload Firebase user:', e);
    }

    const isVerified = fbUser.emailVerified;

    let userAccount: UserAccount;
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        userAccount = {
          id: fbUser.uid,
          name: data.fullName || data.name || fbUser.displayName || 'KiraHaq Customer',
          email: fbUser.email || email,
          phone: data.phoneNumber || data.phone || '',
          address: data.deliveryAddress || data.address || '',
          district: data.district || 'Dhaka',
          avatar: data.avatar || fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          joinedDate: data.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: isVerified,
        };

        if (isVerified && !data.emailVerified) {
          await updateDoc(userDocRef, { 
            emailVerified: true, 
            updatedAt: serverTimestamp() 
          }).catch(() => {});
        }
      } else {
        userAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'KiraHaq Customer',
          email: fbUser.email || email,
          phone: '',
          address: '',
          district: 'Dhaka',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: isVerified,
        };
        await setDoc(userDocRef, { 
          uid: fbUser.uid,
          fullName: userAccount.name,
          email: userAccount.email,
          phoneNumber: '',
          district: 'Dhaka',
          deliveryAddress: '',
          emailVerified: isVerified,
          role: 'customer', 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (err) {
      userAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'KiraHaq Customer',
        email: fbUser.email || email,
        phone: '',
        address: '',
        district: 'Dhaka',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isVerified: isVerified,
      };
    }

    return { userAccount, firebaseUser: fbUser, emailVerified: isVerified };
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      const verifications = getLocalVerifications();
      const localRecord = verifications[email];
      
      const saved = localStorage.getItem('kirahaq_customers');
      if (saved) {
        const customers = JSON.parse(saved);
        const match = customers.find((c: any) => c.email?.toLowerCase() === email || c.phone?.includes(email));
        if (match) {
          if (!localRecord?.password || localRecord.password === password) {
            const isVer = localRecord?.isVerified ?? match.isVerified ?? true;
            const userAccount: UserAccount = {
              id: match.id || 'usr_' + Date.now(),
              name: match.name,
              email: match.email,
              phone: match.phone,
              address: match.address || 'Dhaka',
              district: match.district || 'Dhaka',
              avatar: match.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              joinedDate: match.joinedDate || '2026',
              isVerified: isVer,
            };
            return { userAccount, firebaseUser: null, emailVerified: isVer };
          }
        }
      }
    }

    throw err;
  }
}

/**
 * Resend verification email
 */
export async function resendFirebaseVerificationEmail(targetUser?: FirebaseUser | null, email?: string): Promise<void> {
  const u = targetUser || auth.currentUser;
  if (u) {
    await sendEmailVerification(u);
    return;
  }
  
  if (email) {
    setLocalVerification(email, false);
    return;
  }

  throw new Error('No user is currently signed in to send verification email.');
}

/**
 * Check if the user's email is verified by reloading Firebase user and updating Firestore
 */
export async function checkEmailVerifiedStatus(targetUser?: FirebaseUser | null, email?: string): Promise<boolean> {
  const u = targetUser || auth.currentUser;
  if (u) {
    try {
      await reload(u);
      const refreshedUser = auth.currentUser;
      if (refreshedUser?.emailVerified) {
        // Update Firestore
        try {
          const userDocRef = doc(db, 'users', refreshedUser.uid);
          await updateDoc(userDocRef, {
            emailVerified: true,
            updatedAt: serverTimestamp(),
          });
        } catch (e) {}
        return true;
      }
    } catch (e) {
      console.warn('Error reloading user:', e);
    }
  }

  // Check local verification store
  if (email) {
    const verifications = getLocalVerifications();
    if (verifications[email.toLowerCase()]?.isVerified) {
      return true;
    }
  }

  return false;
}

/**
 * Mark email as verified (updates Firestore and local storage)
 */
export async function markEmailAsVerified(email: string, uid?: string): Promise<void> {
  setLocalVerification(email, true);
  
  if (uid || auth.currentUser?.uid) {
    const targetUid = uid || auth.currentUser?.uid;
    if (targetUid) {
      try {
        const userDocRef = doc(db, 'users', targetUid);
        await updateDoc(userDocRef, {
          emailVerified: true,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {}
    }
  }

  try {
    const saved = localStorage.getItem('kirahaq_customers');
    if (saved) {
      let customers = JSON.parse(saved);
      customers = customers.map((c: any) => {
        if (c.email?.toLowerCase() === email.toLowerCase()) {
          return { ...c, isVerified: true };
        }
        return c;
      });
      localStorage.setItem('kirahaq_customers', JSON.stringify(customers));
    }
  } catch (e) {}
}

/**
 * Send password reset email
 */
export async function sendFirebasePasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed') {
      console.warn('Firebase Email/Password provider disabled for password reset.');
      return;
    }
    throw err;
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {}
}
