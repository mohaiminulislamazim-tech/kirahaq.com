import React, { useState, useEffect } from 'react';
import { Subscriber } from '../../types';
import { 
  Mail, Plus, Trash2, Download, Check, Search, Calendar, Copy, 
  Send, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Filter, UserCheck, Edit3, X, Paperclip, Clock
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  body: string;
  sentAt: string;
  recipientCount: number;
}

const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', email: 'rahim.customer@gmail.com', subscribedAt: '2026-07-20', status: 'active' },
  { id: 's2', email: 'sumaiya.organic@yahoo.com', subscribedAt: '2026-07-21', status: 'active' },
  { id: 's3', email: 'farhana.yasmine@gmail.com', subscribedAt: '2026-07-22', status: 'active' },
  { id: 's4', email: 'tariq.mansoor@hotmail.com', subscribedAt: '2026-07-24', status: 'active' },
  { id: 's5', email: 'kamrul.islam@gmail.com', subscribedAt: '2026-07-25', status: 'active' },
  { id: 's6', email: 'nasrin.dhaka@outlook.com', subscribedAt: '2026-07-26', status: 'active' },
  { id: 's7', email: 'saif.al.sunnah@gmail.com', subscribedAt: '2026-07-26', status: 'active' }
];

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'cmp_1',
    title: 'Blessed Friday Honey Discount',
    subject: '15% Off Organic Sundarban Honey - Use Code EID2026!',
    body: 'Assalamu Alaikum dear subscriber! Enjoy pure organic honey & Sunnah seeds with 15% discount today.',
    sentAt: '2026-07-22 10:30 AM',
    recipientCount: 6
  }
];

export function AdminSubscribersTab() {
  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_subscribers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading subscribers:', e);
    }
    return DEFAULT_SUBSCRIBERS;
  });

  // Campaigns state
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('kirahaq_email_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CAMPAIGNS;
  });

  // Sync listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('kirahaq_subscribers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setSubscribers(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('kirahaq_subscribers_updated', handleSync);
    return () => window.removeEventListener('kirahaq_subscribers_updated', handleSync);
  }, []);

  const saveSubscribers = (newList: Subscriber[]) => {
    setSubscribers(newList);
    try {
      localStorage.setItem('kirahaq_subscribers', JSON.stringify(newList));
      window.dispatchEvent(new Event('kirahaq_subscribers_updated'));
    } catch (e) {
      console.error('Error saving subscribers:', e);
    }
  };

  const saveCampaigns = (newList: EmailCampaign[]) => {
    setCampaigns(newList);
    try {
      localStorage.setItem('kirahaq_email_campaigns', JSON.stringify(newList));
    } catch (e) {
      console.error('Error saving campaigns:', e);
    }
  };

  // Form & Filter States
  const [newEmail, setNewEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedCouponCode, setSelectedCouponCode] = useState('EID2026');

  // Edit modal
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [deleteConfirmSub, setDeleteConfirmSub] = useState<Subscriber | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Actions
  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('error', 'Please enter a valid email address.');
      return;
    }

    if (subscribers.some(s => s.email.toLowerCase() === clean)) {
      showToast('error', `Email "${clean}" is already subscribed.`);
      return;
    }

    const newSub: Subscriber = {
      id: `sub_${Date.now()}`,
      email: clean,
      subscribedAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    saveSubscribers([newSub, ...subscribers]);
    setNewEmail('');
    showToast('success', `Subscriber "${clean}" added successfully!`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = subscribers.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'active' ? 'unsubscribed' : 'active';
        showToast('success', `Status for ${s.email} changed to ${nextStatus}.`);
        return { ...s, status: nextStatus };
      }
      return s;
    });
    saveSubscribers(updated);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    const clean = editEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('error', 'Please enter a valid email address.');
      return;
    }

    const updated = subscribers.map(s => {
      if (s.id === editingSub.id) {
        return { ...s, email: clean };
      }
      return s;
    });

    saveSubscribers(updated);
    showToast('success', `Updated subscriber email to ${clean}`);
    setEditingSub(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmSub) {
      const updated = subscribers.filter(s => s.id !== deleteConfirmSub.id);
      saveSubscribers(updated);
      showToast('success', `Subscriber ${deleteConfirmSub.email} removed.`);
      setDeleteConfirmSub(null);
    }
  };

  const exportCSV = () => {
    if (subscribers.length === 0) {
      showToast('error', 'No subscribers available to export.');
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Email,SubscribedAt,Status", ...subscribers.map(s => `${s.email},${s.subscribedAt},${s.status || 'active'}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kira_haq_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Subscriber CSV downloaded successfully!');
  };

  const handleCopyEmails = () => {
    const activeEmails = subscribers
      .filter(s => (s.status || 'active') === 'active')
      .map(s => s.email)
      .join(', ');

    if (!activeEmails) {
      showToast('error', 'No active subscriber emails to copy.');
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    showToast('success', `Copied ${subscribers.filter(s => (s.status || 'active') === 'active').length} active emails to clipboard!`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !subjectLine.trim()) {
      showToast('error', 'Please fill in campaign title and email subject.');
      return;
    }

    const activeCount = subscribers.filter(s => (s.status || 'active') === 'active').length;
    if (activeCount === 0) {
      showToast('error', 'There are no active subscribers to send newsletter to.');
      return;
    }

    const newCampaign: EmailCampaign = {
      id: `cmp_${Date.now()}`,
      title: campaignTitle.trim(),
      subject: subjectLine.trim(),
      body: emailBody.trim(),
      sentAt: new Date().toLocaleString(),
      recipientCount: activeCount
    };

    saveCampaigns([newCampaign, ...campaigns]);
    setIsBroadcastOpen(false);
    setCampaignTitle('');
    setSubjectLine('');
    setEmailBody('');
    showToast('success', `Newsletter broadcast dispatched to ${activeCount} active subscribers!`);
  };

  // KPIs
  const totalCount = subscribers.length;
  const activeCount = subscribers.filter(s => (s.status || 'active') === 'active').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;
  const totalCampaigns = campaigns.length;

  // Filtered List
  const filtered = subscribers.filter(s => {
    const status = s.status || 'active';
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && status === 'active') || 
      (statusFilter === 'unsubscribed' && status === 'unsubscribed');

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || s.email.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Subscribers</div>
          <div className="text-xl font-serif font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Signed up for newsletter</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Active Email Audience</div>
          <div className="text-xl font-serif font-bold text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Ready to receive broadcasts</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Unsubscribed</div>
          <div className="text-xl font-serif font-bold text-amber-400 mt-1">{unsubscribedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Opted out from newsletter</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-blue-400">Campaigns Sent</div>
          <div className="text-xl font-serif font-bold text-blue-400 mt-1">{totalCampaigns}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Promotional broadcasts</div>
        </div>
      </div>

      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>Newsletter Subscribers ({subscribers.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage subscriber email leads, send promotional email broadcasts with coupons, and export audiences.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleCopyEmails}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-stone-700 cursor-pointer transition-colors"
            title="Copy all active subscriber email addresses"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copy Active Emails</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-stone-700 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBroadcastOpen(true)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <Send className="w-4 h-4 text-stone-950" />
            <span>Send Email Broadcast</span>
          </button>
        </div>
      </div>

      {/* Manual Add Subscriber Form */}
      <form onSubmit={handleAddSubscriber} className="flex flex-col sm:flex-row gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="email"
            required
            placeholder="Enter new email address (e.g. customer@gmail.com)..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscriber</span>
        </button>
      </form>

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search subscriber list by email address..."
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

        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs shrink-0">
          {(['all', 'active', 'unsubscribed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-4">Subscriber Email</th>
                <th className="p-4">Subscription Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-stone-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-stone-400 space-y-2">
                    <Mail className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="text-xs font-bold">No subscriber records found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isActive = (s.status || 'active') === 'active';
                  return (
                    <tr key={s.id} className="hover:bg-stone-800/40 transition-colors">
                      
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-mono">{s.email}</span>
                        </div>
                      </td>

                      <td className="p-4 text-stone-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span>{s.subscribedAt}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {isActive ? (
                          <span className="px-3 py-1 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Active Subscribed</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-stone-950 border border-stone-700 text-stone-400 rounded-full text-[10px] font-bold">
                            Unsubscribed
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(s.id)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors border ${
                              isActive
                                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {isActive ? 'Mark Unsubscribed' : 'Re-activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingSub(s);
                              setEditEmail(s.email);
                            }}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-blue-400 border border-stone-700 rounded-lg cursor-pointer transition-colors"
                            title="Edit Email Address"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmSub(s)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg cursor-pointer transition-colors"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Email Broadcast Campaigns Table */}
      {campaigns.length > 0 && (
        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-xl">
          <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-3">
            <Send className="w-4 h-4 text-amber-400" />
            <span>Past Email Broadcast History ({campaigns.length})</span>
          </h4>

          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{c.title}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded text-[10px] font-bold">
                      Dispatched to {c.recipientCount} subscribers
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 font-mono">Subject: {c.subject}</p>
                  {c.body && <p className="text-[11px] text-stone-400 line-clamp-1">{c.body}</p>}
                </div>

                <div className="text-[10px] text-stone-500 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{c.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= BROADCAST CAMPAIGN MODAL ================= */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  Send Newsletter Broadcast Email
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsBroadcastOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              
              <div className="bg-amber-400/10 border border-amber-400/30 p-3 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>This broadcast will be dispatched to <strong>{activeCount} active subscribers</strong>.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Campaign Internal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eid-ul-Adha Special Offer Campaign"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email Subject Line <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🍯 15% OFF Sundarban Honey & Black Seed Oil!"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email Body Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Assalamu Alaikum! Enjoy our pure organic food products with an exclusive discount..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-stone-950" />
                  <span>Send Broadcast Now</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= EDIT SUBSCRIBER MODAL ================= */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Edit Subscriber Email</h4>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-stone-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteConfirmSub && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h4 className="text-base font-bold text-white">Remove Subscriber?</h4>
            </div>

            <p className="text-xs text-stone-300">
              Are you sure you want to delete <strong className="text-amber-400">{deleteConfirmSub.email}</strong> from the newsletter subscriber list?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSub(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
