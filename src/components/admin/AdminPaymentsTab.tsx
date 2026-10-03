import React, { useState, useEffect } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminPaymentsTabProps {
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({ siteSettings, onUpdateSiteSettings }) => {
  const [formState, setFormState] = useState(siteSettings.paymentGatewaySettings || {});

  useEffect(() => {
    setFormState(siteSettings.paymentGatewaySettings || {});
  }, [siteSettings]);

  const handleSave = () => {
    onUpdateSiteSettings({
      ...siteSettings,
      paymentGatewaySettings: formState
    });
  };

  const updateField = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const fields = [
    { label: 'bKash Base URL', key: 'bkashBaseUrl' },
    { label: 'bKash App Key', key: 'bkashAppKey' },
    { label: 'bKash App Secret', key: 'bkashAppSecret' },
    { label: 'bKash Username', key: 'bkashUsername' },
    { label: 'bKash Password', key: 'bkashPassword' },
    { label: 'Nagad Base URL', key: 'nagadBaseUrl' },
    { label: 'Nagad Merchant ID', key: 'nagadMerchantId' },
    { label: 'Nagad Public Key', key: 'nagadPublicKey' },
    { label: 'Nagad Private Key', key: 'nagadPrivateKey' },
    { label: 'Card Gateway URL', key: 'cardGatewayUrl' },
    { label: 'Card Gateway Store ID', key: 'cardGatewayId' },
    { label: 'Card Gateway Secret Key', key: 'cardGatewaySecret' },
    { label: 'Card Gateway Mode (sandbox/live)', key: 'cardGatewayMode' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          Payment Gateway Management
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key} className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{field.label}</label>
            <input
              type="text"
              value={(formState as any)[field.key] || ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder={`Enter ${field.label}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
