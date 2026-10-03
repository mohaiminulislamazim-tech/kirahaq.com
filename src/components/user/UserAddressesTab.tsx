import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home, Building } from 'lucide-react';
import { UserAccount } from '../../types';

export interface SavedAddress {
  id: string;
  tag: 'Home' | 'Office' | 'Parents' | 'Other';
  recipientName: string;
  phone: string;
  addressLine: string;
  district: string;
  city: string;
  isDefault: boolean;
}

interface UserAddressesTabProps {
  currentUser: UserAccount | null;
}

export const UserAddressesTab: React.FC<UserAddressesTabProps> = ({ currentUser }) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr_1',
      tag: 'Home',
      recipientName: currentUser?.name || 'Sabbir Rahman',
      phone: currentUser?.phone || '+880 1711-223344',
      addressLine: currentUser?.address || 'House 42, Road 11, Banani',
      district: currentUser?.district || 'Dhaka',
      city: 'Dhaka North',
      isDefault: true,
    },
    {
      id: 'addr_2',
      tag: 'Office',
      recipientName: currentUser?.name || 'Sabbir Rahman',
      phone: '+880 1800-998877',
      addressLine: 'Level 5, Gulshan Tower, Plot 31, Gulshan-2',
      district: 'Dhaka',
      city: 'Dhaka',
      isDefault: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<SavedAddress | null>(null);

  // Form state
  const [tag, setTag] = useState<'Home' | 'Office' | 'Parents' | 'Other'>('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleOpenAddModal = () => {
    setEditingAddr(null);
    setTag('Home');
    setRecipientName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setAddressLine('');
    setDistrict('Dhaka');
    setCity('');
    setIsDefault(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingAddr(addr);
    setTag(addr.tag);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setDistrict(addr.district);
    setCity(addr.city);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddr) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddr.id
            ? { ...a, tag, recipientName, phone, addressLine, district, city, isDefault }
            : isDefault
            ? { ...a, isDefault: false }
            : a
        )
      );
    } else {
      const newAddr: SavedAddress = {
        id: 'addr_' + Date.now(),
        tag,
        recipientName,
        phone,
        addressLine,
        district,
        city,
        isDefault,
      };
      setAddresses((prev) => {
        if (isDefault) {
          return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))];
        }
        return [newAddr, ...prev];
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>Saved Delivery Addresses</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your saved delivery destinations for quick 1-click checkout.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
              addr.isDefault
                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-600/20'
                : 'bg-stone-50/80 border-stone-200/80 hover:border-stone-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b3d2b] text-white text-[10px] font-bold rounded-full uppercase">
                  {addr.tag === 'Home' ? <Home className="w-3 h-3 text-amber-400" /> : <Building className="w-3 h-3 text-amber-400" />}
                  <span>{addr.tag}</span>
                </span>

                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-extrabold rounded-full uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Default Address</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-stone-900 text-sm">{addr.recipientName}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{addr.addressLine}</p>
              <p className="text-xs text-stone-600">{addr.district}, Bangladesh</p>
              <p className="text-xs font-semibold text-stone-800 pt-1">Phone: {addr.phone}</p>
            </div>

            <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between gap-2">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-emerald-800 hover:underline font-bold cursor-pointer"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11px] text-emerald-800 font-bold">Primary Location</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(addr)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-900">
                {editingAddr ? 'Edit Saved Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tag / Label</label>
                <div className="flex gap-2">
                  {(['Home', 'Office', 'Parents', 'Other'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTag(t)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                        tag === t ? 'bg-[#1b3d2b] text-amber-400 border-[#1b3d2b]' : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Address Line *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House, Road, Apartment, Area"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Area / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Banani"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800"
                />
                <label htmlFor="defaultCheck" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-xs font-bold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-950"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
