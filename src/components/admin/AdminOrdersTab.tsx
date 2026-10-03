import React, { useState } from 'react';
import { OrderDetails, Currency, formatProductPrice, getProductPriceInfo, formatCurrencyAmount } from '../../types';
import { getProductFinalUnitPrice, calculateCheckoutTotals } from '../../lib/checkout';
import { 
  ShoppingBag, Search, Filter, Clock, CheckCircle2, Truck, PackageCheck, 
  AlertCircle, Phone, Mail, MapPin, Eye, Trash2, Printer, X, Save, 
  DollarSign, ArrowUpRight, ChevronDown, CheckCircle, Package, User, RefreshCw, CreditCard
} from 'lucide-react';
import { InvoiceModal } from '../user/InvoiceModal';
import { refundOrderPayment } from '../../services/paymentApi';

interface AdminOrdersTabProps {
  orders: OrderDetails[];
  currency: Currency;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export function AdminOrdersTab({
  orders,
  currency,
  onUpdateOrderStatus,
  onDeleteOrder,
}: AdminOrdersTabProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');
  
  // Selected Order for Details Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  
  // Selected Order for Printing Invoice
  const [invoiceOrder, setInvoiceOrder] = useState<OrderDetails | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Selected Order for Delete Confirmation
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<OrderDetails | null>(null);

  // Selected Order for Refund
  const [refundModalOrder, setRefundModalOrder] = useState<OrderDetails | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('Customer return / order cancelled');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Toast Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleProcessRefund = async () => {
    if (!refundModalOrder) return;
    setIsProcessingRefund(true);

    try {
      const amt = refundAmount ? parseFloat(refundAmount) : (currency === 'BDT' ? refundModalOrder.totalBdt : refundModalOrder.totalUsd);
      const res = await refundOrderPayment({
        orderId: refundModalOrder.orderId,
        paymentId: refundModalOrder.paymentId,
        amount: amt,
        reason: refundReason,
      });

      if (res.success) {
        showToast('success', `Refund of ${amt} processed successfully. Trx: ${res.refundTransactionId || 'OK'}`);
        if (selectedOrderDetails?.orderId === refundModalOrder.orderId) {
          setSelectedOrderDetails({
            ...selectedOrderDetails,
            refundStatus: 'REFUNDED',
            refundAmount: amt,
            refundTransactionId: res.refundTransactionId,
            status: 'Cancelled',
          });
        }
        if (onUpdateOrderStatus) {
          onUpdateOrderStatus(refundModalOrder.orderId, 'Cancelled');
        }
        setRefundModalOrder(null);
      } else {
        showToast('error', res.error || 'Failed to process refund');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Refund error');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getPaymentBadge = (ord: OrderDetails) => {
    if (ord.refundStatus === 'REFUNDED') {
      return <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-md text-[10px] font-bold shrink-0">Refunded</span>;
    }
    if (ord.paymentStatus === 'SUCCESS') {
      return <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-md text-[10px] font-bold shrink-0">Paid Online</span>;
    }
    return <span className="px-2 py-0.5 bg-stone-900 border border-stone-700 text-stone-400 rounded-md text-[10px] font-bold shrink-0">Pending</span>;
  };

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Metrics calculation
  const totalRevenueBdt = orders.reduce((sum, o) => sum + (o.totalBdt || 0), 0);
  const totalRevenueUsd = orders.reduce((sum, o) => sum + (o.totalUsd || 0), 0);
  const pendingCount = orders.filter(o => o.status.toLowerCase() === 'pending').length;
  const processingCount = orders.filter(o => o.status.toLowerCase() === 'processing').length;
  const completedCount = orders.filter(o => o.status.toLowerCase() === 'delivered').length;

  // Filter & Search
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = selectedStatusFilter === 'All' || ord.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      ord.orderId.toLowerCase().includes(searchLower) ||
      ord.customerName.toLowerCase().includes(searchLower) ||
      ord.phone.includes(searchLower) ||
      (ord.address && ord.address.toLowerCase().includes(searchLower)) ||
      (ord.district && ord.district.toLowerCase().includes(searchLower));

    // Date filtering (assuming ord.orderDate is in a comparable format or YYYY-MM-DD)
    const orderDate = new Date(ord.orderDate);
    const matchesDate = 
      (!startDate || orderDate >= new Date(startDate)) &&
      (!endDate || orderDate <= new Date(endDate));

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Sort
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'highest') {
      return (b.totalBdt || 0) - (a.totalBdt || 0);
    }
    // Default newest first (based on index or orderId/date)
    return 0;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, newStatus);
      showToast('success', `Order #${orderId} status updated to "${newStatus}"`);
      
      // Update local state if details modal is open
      if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
        setSelectedOrderDetails({
          ...selectedOrderDetails,
          status: newStatus
        });
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmOrder && onDeleteOrder) {
      onDeleteOrder(deleteConfirmOrder.orderId);
      showToast('success', `Order #${deleteConfirmOrder.orderId} deleted successfully.`);
      setDeleteConfirmOrder(null);
      if (selectedOrderDetails?.orderId === deleteConfirmOrder.orderId) {
        setSelectedOrderDetails(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> Pending</span>;
      case 'processing':
        return <span className="px-2.5 py-1 bg-blue-950/80 border border-blue-800 text-blue-400 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> Processing</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-400 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-stone-700 text-stone-300 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-800 text-amber-300 border border-emerald-600' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-stone-400">Total Revenue</div>
          <div className="text-lg font-serif font-bold text-amber-400 mt-1">
            {currency === 'BDT' ? `৳${totalRevenueBdt.toLocaleString()}` : `$${totalRevenueUsd.toFixed(2)}`}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">{orders.length} total orders</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Pending Orders</div>
          <div className="text-lg font-serif font-bold text-white mt-1">{pendingCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Awaiting fulfillment</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-blue-400">In Processing</div>
          <div className="text-lg font-serif font-bold text-white mt-1">{processingCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Packing & preparing</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Delivered</div>
          <div className="text-lg font-serif font-bold text-white mt-1">{completedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Successfully fulfilled</div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg">
        <div>
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Order Fulfillment Center ({orders.length} Total Orders)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Track customer purchases, update dispatch status, print tax invoices, and manage order lifecycles.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800">
        {['All', ...statusOptions].map((status) => {
          const count = status === 'All' 
            ? orders.length 
            : orders.filter(o => o.status.toLowerCase() === status.toLowerCase()).length;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                selectedStatusFilter.toLowerCase() === status.toLowerCase()
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedStatusFilter.toLowerCase() === status.toLowerCase()
                  ? 'bg-stone-950/20 text-stone-950 font-black'
                  : 'bg-stone-950 text-stone-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, Address, District..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
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

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-2xl px-3 py-3 text-xs text-stone-400 focus:border-amber-400 focus:outline-none"
            title="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-2xl px-3 py-3 text-xs text-stone-400 focus:border-amber-400 focus:outline-none"
            title="End Date"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-2xl px-4 py-3 text-xs text-white focus:border-amber-400 focus:outline-none font-bold cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="highest">Sort: Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-base text-white">Live Orders List ({sortedOrders.length})</h4>
            <p className="text-[11px] text-stone-400">Click any row action to view details, print tax invoice, or update status</p>
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
            <h5 className="text-sm font-bold text-white">No Orders Found</h5>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              There are no orders matching your selected status filter or search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 text-stone-300">
                {sortedOrders.map((ord) => {
                  const itemsCount = ord.items ? ord.items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 1;

                  return (
                    <tr key={ord.orderId} className="hover:bg-stone-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-amber-400 font-mono">{ord.orderId}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{ord.orderDate}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{ord.customerName}</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-amber-400/80" /> {ord.phone}
                        </div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="w-2.5 h-2.5 text-stone-500 shrink-0" /> {ord.address}, {ord.district}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-[10px] text-stone-300 font-medium">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400 text-sm">
                        {currency === 'BDT' ? `৳${ord.totalBdt}` : `$${ord.totalUsd}`}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="px-2.5 py-1 bg-stone-950 border border-stone-800 text-amber-300/90 rounded-lg text-[10px] font-medium w-fit">
                            {ord.paymentMethod}
                          </span>
                          {getPaymentBadge(ord)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ord.status)}
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.orderId, e.target.value)}
                            className="bg-stone-950 border border-stone-800 rounded-xl px-2 py-1 text-[11px] text-amber-300 focus:border-amber-400 focus:outline-none cursor-pointer font-bold"
                          >
                            {statusOptions.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Print Invoice Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceOrder(ord);
                              setIsInvoiceOpen(true);
                            }}
                            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer transition-colors"
                            title="Print / Export Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* Delete Order Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmOrder(ord)}
                            className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded-xl cursor-pointer transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-mono">
                    #{selectedOrderDetails.orderId}
                  </span>
                  {getStatusBadge(selectedOrderDetails.status)}
                </div>
                <h3 className="text-lg font-serif font-bold text-white mt-1">
                  Order Details
                </h3>
                <p className="text-xs text-stone-400">Placed on {selectedOrderDetails.orderDate}</p>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Updater inside Modal */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-stone-300">Update Order Status:</span>
                <p className="text-[11px] text-stone-500">Change processing status to notify delivery workflow</p>
              </div>
              <select
                value={selectedOrderDetails.status}
                onChange={(e) => handleStatusChange(selectedOrderDetails.orderId, e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-2 text-xs text-amber-300 focus:border-amber-400 focus:outline-none cursor-pointer font-bold"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950/60 p-4 rounded-2xl border border-stone-800 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" /> Customer Information
                </span>
                <p className="font-bold text-white text-sm">{selectedOrderDetails.customerName}</p>
                <p className="text-stone-300 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-stone-400" /> {selectedOrderDetails.phone}
                </p>
                {selectedOrderDetails.email && (
                  <p className="text-stone-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-stone-400" /> {selectedOrderDetails.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Shipping Address
                </span>
                <p className="text-stone-200">{selectedOrderDetails.address}</p>
                <p className="text-stone-300">{selectedOrderDetails.district}, {selectedOrderDetails.country || 'Bangladesh'}</p>
              </div>
            </div>

            {/* Payment & Gateway Details */}
            <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-amber-400" /> Payment & Gateway Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-300">
                <div>
                  <span className="text-stone-500">Method:</span> <strong className="text-white">{selectedOrderDetails.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Payment Status:</span> <span className="ml-1">{getPaymentBadge(selectedOrderDetails)}</span>
                </div>
                {selectedOrderDetails.transactionId && (
                  <div>
                    <span className="text-stone-500">Transaction ID:</span> <strong className="text-amber-400 font-mono">{selectedOrderDetails.transactionId}</strong>
                  </div>
                )}
                {selectedOrderDetails.paidAt && (
                  <div>
                    <span className="text-stone-500">Paid Timestamp:</span> <span className="text-stone-300">{new Date(selectedOrderDetails.paidAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedOrderDetails.refundStatus === 'REFUNDED' && (
                  <div className="col-span-full bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/80 text-rose-300 space-y-1">
                    <div className="font-bold">Refund Executed: {selectedOrderDetails.refundAmount ? `${selectedOrderDetails.refundAmount} ${currency}` : 'Full'}</div>
                    {selectedOrderDetails.refundTransactionId && (
                      <div className="font-mono text-[11px]">Refund Trx: {selectedOrderDetails.refundTransactionId}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" /> Ordered Items ({selectedOrderDetails.items?.length || 0})
              </h4>

              <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden divide-y divide-stone-800">
                {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                  selectedOrderDetails.items.map((item, idx) => {
                    const priceInfo = getProductPriceInfo(item.product, currency);
                    const finalUnit = getProductFinalUnitPrice(item.product, currency);
                    const lineSubtotal = finalUnit * item.quantity;

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-stone-800 shrink-0" 
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{item.product.name}</div>
                            <div className="text-[10px] text-stone-400">
                              Unit Price: {priceInfo.currentPriceFormatted} × {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-bold text-amber-400 text-xs">
                          {formatCurrencyAmount(lineSubtotal, currency)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">No item details recorded</div>
                )}
              </div>
            </div>

            {/* Order Totals */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal:</span>
                <span>
                  {selectedOrderDetails.items && selectedOrderDetails.items.length > 0
                    ? `${calculateCheckoutTotals(selectedOrderDetails.items, 0, currency).formattedSubtotal} ${currency}`
                    : (currency === 'BDT' ? `৳${selectedOrderDetails.totalBdt}` : `$${selectedOrderDetails.totalUsd}`)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Shipping Fee:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedOrderDetails.items && selectedOrderDetails.items.length > 0
                    ? `${calculateCheckoutTotals(selectedOrderDetails.items, 0, currency).formattedShipping} ${currency}`
                    : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm border-t border-stone-800 pt-2">
                <span>Grand Total:</span>
                <span className="text-amber-400 font-serif text-base">
                  {selectedOrderDetails.items && selectedOrderDetails.items.length > 0
                    ? `${calculateCheckoutTotals(selectedOrderDetails.items, 0, currency).formattedTotal} ${currency}`
                    : (currency === 'BDT' ? `৳${selectedOrderDetails.totalBdt}` : `$${selectedOrderDetails.totalUsd}`)}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-stone-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOrder(selectedOrderDetails)}
                  className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Order</span>
                </button>

                {selectedOrderDetails.refundStatus !== 'REFUNDED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRefundAmount((currency === 'BDT' ? selectedOrderDetails.totalBdt : selectedOrderDetails.totalUsd).toString());
                      setRefundModalOrder(selectedOrderDetails);
                    }}
                    className="px-4 py-2.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-bold rounded-xl border border-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Refund Payment</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrder(selectedOrderDetails);
                    setIsInvoiceOpen(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= REFUND DIALOG ================= */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Process Payment Refund</h4>
                <p className="text-xs text-stone-400">Order #{refundModalOrder.orderId}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Refund Amount ({currency})</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                  placeholder="Amount to refund"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Refund Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  placeholder="Reason for refund"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingRefund}
                onClick={handleProcessRefund}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessingRefund ? 'animate-spin' : ''}`} />
                <span>{isProcessingRefund ? 'Processing...' : 'Execute Refund'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Order?</h4>
                <p className="text-xs text-stone-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              Are you sure you want to permanently delete order <strong className="text-amber-400">#{deleteConfirmOrder.orderId}</strong> for customer <strong className="text-white">{deleteConfirmOrder.customerName}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOrder(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAX INVOICE MODAL ================= */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceOrder(null);
        }}
        order={invoiceOrder}
        currency={currency}
      />

    </div>
  );
}
