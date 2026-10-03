import React, { useState } from 'react';
import { Ticket, Plus, Send, CheckCircle2, Clock, AlertCircle, Headphones, MessageSquare, ShieldCheck } from 'lucide-react';

export interface SupportTicketMessage {
  sender: 'user' | 'support';
  senderName: string;
  text: string;
  time: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
  messages: SupportTicketMessage[];
}

export const UserTicketsTab: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TK-8821',
      subject: 'Inquiry regarding Sidr Royal Honey Harvest Date',
      category: 'Product Inquiry',
      priority: 'Medium',
      status: 'In Progress',
      date: 'July 24, 2026',
      messages: [
        {
          sender: 'user',
          senderName: 'Sabbir Rahman',
          text: 'Assalamu Alaikum, could you please confirm the exact harvest season and location for the batch #KH-509 Sidr Honey?',
          time: 'July 24, 10:15 AM'
        },
        {
          sender: 'support',
          senderName: 'Kira Haq Health Specialist',
          text: 'Walaikum Assalam Tariq Sahib. Batch #KH-509 was harvested in May 2026 from organic Sidr valleys in Yemen/Chittagong Hill Tracts. Certified 100% pure raw nectar.',
          time: 'July 24, 11:30 AM'
        }
      ]
    },
    {
      id: 'TK-7402',
      subject: 'Address Change Request for Order KH-2026-8921',
      category: 'Delivery',
      priority: 'High',
      status: 'Resolved',
      date: 'July 20, 2026',
      messages: [
        {
          sender: 'user',
          senderName: 'Sabbir Rahman',
          text: 'Please update my delivery address to Banani Road 11 instead of Road 5.',
          time: 'July 20, 02:00 PM'
        },
        {
          sender: 'support',
          senderName: 'Logistics Desk',
          text: 'Address updated successfully with Pathao courier. Package delivered to Road 11.',
          time: 'July 20, 03:45 PM'
        }
      ]
    }
  ]);

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const newMsg: SupportTicketMessage = {
      sender: 'user',
      senderName: 'You',
      text: replyText.trim(),
      time: 'Just now'
    };

    const updated = {
      ...activeTicket,
      messages: [...activeTicket.messages, newMsg]
    };

    setTickets(tickets.map((t) => (t.id === activeTicket.id ? updated : t)));
    setActiveTicket(updated);
    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTk: SupportTicket = {
      id: 'TK-' + Math.floor(1000 + Math.random() * 9000),
      subject: subject.trim(),
      category,
      priority,
      status: 'Open',
      date: 'Today',
      messages: [
        {
          sender: 'user',
          senderName: 'You',
          text: description.trim(),
          time: 'Just now'
        }
      ]
    };

    setTickets([newTk, ...tickets]);
    setIsCreatingModal(false);
    setSubject('');
    setDescription('');
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-600" />
              <span>Customer Support Tickets</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Submit support queries regarding orders, delivery, refunds, or product consultations.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingModal(true)}
            className="px-4 py-2.5 bg-[#1b3d2b] hover:bg-emerald-950 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="space-y-4">
        {tickets.map((tk) => (
          <div
            key={tk.id}
            onClick={() => setActiveTicket(tk)}
            className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-amber-400/60 transition-all cursor-pointer space-y-3"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                  {tk.id}
                </span>
                <span className="text-xs font-bold text-[#1b3d2b] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {tk.category}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyle(tk.status)}`}>
                  {tk.status}
                </span>
              </div>
              <span className="text-xs text-stone-400">{tk.date}</span>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm">{tk.subject}</h3>
              <p className="text-xs text-stone-600 line-clamp-1 mt-1">
                Last message: {tk.messages[tk.messages.length - 1]?.text}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-amber-700 font-bold pt-1">
              <span>View Conversation ({tk.messages.length} Messages) →</span>
              <span className="text-[10px] text-stone-400 uppercase">Priority: {tk.priority}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Conversation Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl p-6 space-y-5">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-[#1b3d2b]">{activeTicket.id}</span>
                <h3 className="text-base font-serif font-bold text-stone-900">{activeTicket.subject}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyle(activeTicket.status)}`}>
                  Status: {activeTicket.status}
                </span>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Thread */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-amber-50/70 border border-amber-200 ml-6 text-right'
                      : 'bg-stone-50 border border-stone-200 mr-6 text-left'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
                    <span>{msg.senderName}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-stone-800 font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Send</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-900">Open New Support Ticket</h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Order Issue">Order Issue</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Refund">Refund</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain your issue or question in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 border border-stone-200 text-xs font-bold text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b3d2b] text-white text-xs font-bold rounded-xl hover:bg-emerald-950"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
