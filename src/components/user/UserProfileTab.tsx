import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Sparkles, Upload, Camera } from 'lucide-react';
import { UserAccount } from '../../types';

interface UserProfileTabProps {
  currentUser: UserAccount | null;
  onUpdateProfile: (updated: UserAccount) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
];

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  currentUser,
  onUpdateProfile,
}) => {
  // Profile form state
  const [name, setName] = useState(currentUser?.name || 'Sabbir Rahman');
  const [email, setEmail] = useState(currentUser?.email || 'sabbir@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+880 1711-223344');
  const [secondaryPhone, setSecondaryPhone] = useState('+880 1800-998877');
  const [address, setAddress] = useState(currentUser?.address || 'House 42, Road 11, Banani');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [bio, setBio] = useState('Seeking pure organic honey & Sunnah health wellness foods.');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Custom photo upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSavedMsg, setPassSavedMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Realtime password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-stone-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*]/.test(pass);
    if (pass.length >= 8 && hasNum && hasSpecial) return { score: 3, label: 'Strong', color: 'bg-emerald-600' };
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  };

  const passStrength = getPasswordStrength(newPass);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserAccount = {
      ...currentUser,
      name,
      email,
      phone,
      address,
      district,
      avatar,
    };
    onUpdateProfile(updatedUser);
    setProfileSavedMsg('Profile information updated successfully!');
    setTimeout(() => setProfileSavedMsg(''), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSavedMsg('');

    if (!currentPass) {
      setPassErrorMsg('Please enter your current password.');
      return;
    }
    if (newPass.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErrorMsg('New password and confirm password do not match.');
      return;
    }

    setPassSavedMsg('Password changed successfully! Keep your new credentials safe.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSavedMsg(''), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Profile Info Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-800" />
              <span>Profile Update & Personal Information</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your personal contact details, delivery preference, and account photo.
            </p>
          </div>
        </div>

        {profileSavedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{profileSavedMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          
          {/* Avatar Chooser */}
          <div className="space-y-4 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Profile Photo & Avatar
            </label>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Selected Photo Preview with Upload Trigger Overlay */}
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Selected Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md transition-all"
                />
                <label 
                  htmlFor="user-avatar-upload"
                  className="absolute inset-0 bg-stone-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] font-bold mt-0.5">Upload</span>
                </label>
              </div>

              {/* Upload & Camera Buttons & Preset Choices */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-4 py-2.5 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed border border-stone-200"
                  >
                    <Camera className="w-4 h-4 text-stone-400" />
                    <span>Camera Disabled</span>
                  </button>

                  <label 
                    htmlFor="user-avatar-upload"
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-stone-200"
                  >
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>Upload File</span>
                    <input
                      id="user-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-stone-500">JPG, PNG or WEBP (Max 5MB)</span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-stone-600 mb-1.5">Or Select Preset Avatar:</p>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setAvatar(url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          avatar === url ? 'border-[#1b3d2b] scale-105 ring-2 ring-amber-400/50' : 'border-stone-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Primary Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Alternative Phone (Optional)</label>
              <input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">District / Region</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Default Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Health Goal & Bio Notes</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your natural health goals..."
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1b3d2b] outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>Password & Security Management</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Change your password to keep your Sunnah Natural account protected.
            </p>
          </div>
        </div>

        {passSavedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{passSavedMsg}</span>
          </div>
        )}

        {passErrorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>{passErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Current Password *</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">New Password *</label>
              {newPass && (
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white ${passStrength.color}`}>
                  Strength: {passStrength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter Bar */}
            {newPass && (
              <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div className={`h-full transition-all duration-300 ${passStrength.color}`} style={{ width: `${(passStrength.score / 3) * 100}%` }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password *</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Repeat new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Update Password</span>
          </button>
        </form>
      </div>

      {/* Camera removed */}
    </div>
  );
};
