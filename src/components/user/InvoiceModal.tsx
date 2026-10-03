import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Package, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { OrderDetails, Currency, formatProductPrice, getProductPriceInfo, formatCurrencyAmount } from '../../types';
import { calculateCheckoutTotals, getProductFinalUnitPrice } from '../../lib/checkout';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  currency: Currency;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  currency,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderId.replace(/[^A-Z0-9]/gi, '')}`;
  const totals = order.items && order.items.length > 0 
    ? calculateCheckoutTotals(order.items, 0, currency)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden my-6 max-h-[90vh] overflow-y-auto print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="sticky top-0 z-10 bg-stone-900 text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Official Tax Invoice
            </span>
            <span className="text-stone-400 text-xs font-mono">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Container */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-stone-900 font-sans print:p-8">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#1b3d2b] flex items-center justify-center text-amber-400 font-serif font-bold text-xl">
                  KH
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-extrabold text-[#1b3d2b] tracking-tight">
                    KIRA HAQ
                  </h1>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    Pure • Natural • Sunnah Wellness
                  </p>
                </div>
              </div>
              <div className="text-xs text-stone-600 space-y-0.5 pt-1">
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-800" /> House 14, Road 7, Block D, Dhanmondi, Dhaka 1205</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-800" /> +880 1700-000000 | +880 1800-112233</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-emerald-800" /> support@kirahaq.com | www.kirahaq.com</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-stone-50 p-4 rounded-2xl border border-stone-100 min-w-48">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">TAX INVOICE</span>
              <p className="text-lg font-mono font-bold text-[#1b3d2b]">{invoiceNumber}</p>
              <div className="text-xs text-stone-600 pt-1">
                <p><span className="text-stone-400 font-medium">Order Reference:</span> <strong className="text-stone-800">{order.orderId}</strong></p>
                <p><span className="text-stone-400 font-medium">Date:</span> <strong className="text-stone-800">{order.orderDate}</strong></p>
                <p><span className="text-stone-400 font-medium">Payment Status:</span> <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold">PAID</strong></p>
              </div>
            </div>
          </div>

          {/* Customer & Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50/80 p-6 rounded-2xl border border-stone-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Billed & Shipped To:</span>
              <h3 className="text-sm font-bold text-stone-900 mt-1">{order.customerName}</h3>
              <p className="text-stone-600 mt-1">{order.address}</p>
              <p className="text-stone-600">{order.district}, {order.country || 'Bangladesh'}</p>
              <p className="text-stone-600 font-medium mt-1">Phone: {order.phone}</p>
              <p className="text-stone-600">Email: {order.email}</p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-4 sm:pt-0 sm:pl-6 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Payment Details:</span>
              <div className="space-y-1">
                <p><span className="text-stone-500">Method:</span> <strong className="text-stone-800">{order.paymentMethod}</strong></p>
                <p><span className="text-stone-500">Currency:</span> <strong className="text-stone-800">{order.currency || currency}</strong></p>
                <p><span className="text-stone-500">Fulfillment:</span> <strong className="text-stone-800">{order.status}</strong></p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1b3d2b] text-white font-serif uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const priceInfo = getProductPriceInfo(item.product, currency);
                    const finalUnit = getProductFinalUnitPrice(item.product, currency);
                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900">{item.product.name}</div>
                          <div className="text-[10px] text-stone-500">{item.product.category} • {item.product.weight || 'Standard Pack'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-stone-800">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right text-stone-700">
                          {priceInfo.currentPriceFormatted}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                          {formatCurrencyAmount(finalUnit * item.quantity, currency)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-stone-900">Sunnah Organic Wellness Order Package</td>
                    <td className="py-3.5 px-4 text-center font-bold">1</td>
                    <td className="py-3.5 px-4 text-right">
                      {currency === 'BDT' ? `৳ ${order.totalBdt.toLocaleString()}` : `$${order.totalUsd.toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      {currency === 'BDT' ? `৳ ${order.totalBdt.toLocaleString()}` : `$${order.totalUsd.toFixed(2)}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown & Guarantee Stamp */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
            
            <div className="space-y-2 border border-emerald-200 bg-emerald-50/50 p-4 rounded-2xl max-w-sm">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>100% Organic & Halal Authenticity Verified</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Thank you for choosing Kira Haq. All our products are ethically sourced, 100% natural, and inspected according to Sunnah quality benchmarks.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs border-t border-stone-200 pt-4 sm:border-0 sm:pt-0">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900">
                  {totals ? `${totals.formattedSubtotal} ${currency}` : (currency === 'BDT' ? `৳ ${order.totalBdt.toLocaleString()}` : `$${order.totalUsd.toFixed(2)}`)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee:</span>
                <span className="text-emerald-700 font-bold">
                  {totals ? `${totals.formattedShipping} ${currency}` : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Tax/VAT:</span>
                <span className="font-semibold text-stone-900">Included</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#1b3d2b] border-t border-stone-300 pt-2">
                <span>Grand Total:</span>
                <span>
                  {totals ? `${totals.formattedTotal} ${currency}` : (currency === 'BDT' ? `৳ ${order.totalBdt.toLocaleString()} BDT` : `$${order.totalUsd.toFixed(2)} USD`)}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Seal & Signature */}
          <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-500 gap-4">
            <p>This is a computer-generated invoice and requires no physical signature.</p>
            <div className="flex items-center gap-2 text-emerald-900 font-bold bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>OFFICIALLY VERIFIED & APPROVED</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
