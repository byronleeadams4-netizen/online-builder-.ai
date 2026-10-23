import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Store,
  Clock,
  Printer,
  ShoppingBag,
  MapPin,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Truck,
  Car,
} from 'lucide-react';
import { StoreComparison, InventoryItem, OrderReceipt } from '../types/diy';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreComparison: StoreComparison | null;
  missingItems: InventoryItem[];
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  selectedStoreComparison,
  missingItems,
}) => {
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('DIY Builder');
  const [customerPhone, setCustomerPhone] = useState('(555) 234-5678');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  if (!isOpen || !selectedStoreComparison) return null;

  const { store, itemQuotes, totalMissingCost } = selectedStoreComparison;
  const tax = parseFloat((totalMissingCost * 0.075).toFixed(2));
  const deliveryFee = fulfillment === 'delivery' ? store.deliveryFee : 0;
  const finalTotal = parseFloat((totalMissingCost + tax + deliveryFee).toFixed(2));
  const bundleSavings = parseFloat((totalMissingCost * 0.12).toFixed(2));

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const payloadItems = missingItems.map((item) => {
        const quote = itemQuotes[item.id] || { price: item.estimatedPrice, aisle: 'Aisle 04', bay: 'Bay 01' };
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: quote.price,
          aisle: quote.aisle,
          bay: quote.bay,
        };
      });

      const res = await fetch('/api/order-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          items: payloadItems,
          fulfillmentType: fulfillment,
          customerName,
        }),
      });

      const data = await res.json();
      if (data.success && data.receipt) {
        setReceipt(data.receipt);
      }
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-bold text-white">
              {receipt ? 'Curbside Pickup Confirmed' : '1-Click Missing Inventory Checkout'}
            </h3>
          </div>
          <button
            onClick={receipt ? handleReset : onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!receipt ? (
            <>
              {/* Store Summary Header */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{store.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{store.address}</p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{store.pickupTime}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{store.distance} miles away</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Missing Items</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    {missingItems.length} parts
                  </span>
                </div>
              </div>

              {/* Fulfillment Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Fulfillment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                      fulfillment === 'pickup'
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Express Curbside Pickup</strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Free · Ready in {store.pickupTime}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                      fulfillment === 'delivery'
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Job Site Same-Day Delivery</strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ${store.deliveryFee.toFixed(2)} · Delivery by courier
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pickup Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    SMS Phone for Locker / Bay Code
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Items Summary Table */}
              <div>
                <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Itemized Order Roster ({missingItems.length} Items)
                </span>
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-850 max-h-48 overflow-y-auto">
                  {missingItems.map((item) => {
                    const quote = itemQuotes[item.id] || { price: item.estimatedPrice, aisle: 'Aisle 04', bay: 'Bay 02' };
                    return (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="font-semibold text-slate-100 block truncate">{item.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {quote.aisle} · {quote.bay}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-slate-200 font-bold tabular-nums">
                            ${quote.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium tabular-nums text-slate-200">
                    ${totalMissingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Local Tax (7.5%):</span>
                  <span className="font-mono font-medium tabular-nums text-slate-200">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                {fulfillment === 'delivery' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Expedited Job Site Delivery:</span>
                    <span className="font-mono font-medium tabular-nums text-slate-200">
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 font-medium pt-1">
                  <span>Best-Deal Bundle Savings:</span>
                  <span className="font-mono tabular-nums">-${bundleSavings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-extrabold text-base pt-2 border-t border-slate-800">
                  <span>Total Order Due:</span>
                  <span className="font-mono text-amber-400 tabular-nums">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Order Receipt View */
            <div className="space-y-5 animate-in fade-in">
              {/* Success Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block font-bold text-sm">
                    1-Click Order Reserved!
                  </strong>
                  <span className="text-xs">
                    Your missing inventory has been held at {receipt.storeName}. Staff are pulling your items now.
                  </span>
                </div>
              </div>

              {/* Barcode & Pickup Pass Card */}
              <div className="p-5 rounded-2xl bg-white text-slate-950 shadow-xl border border-slate-200">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Official Hardware Pickup Pass
                    </span>
                    <h4 className="text-lg font-black text-slate-900">{receipt.storeName}</h4>
                    <p className="text-xs text-slate-600">{receipt.storeAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Order Number</span>
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {receipt.orderId}
                    </span>
                  </div>
                </div>

                {/* Pickup Bay & Time */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 rounded-xl mb-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Curbside Stall / Locker</span>
                    <span className="text-base font-black text-amber-600 font-mono">
                      {receipt.pickupCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Estimated Ready</span>
                    <span className="text-xs font-bold text-slate-900">
                      {receipt.estimatedReadyTime}
                    </span>
                  </div>
                </div>

                {/* Barcode Simulation */}
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center gap-1 h-12 px-6 bg-slate-100 rounded-lg">
                    {[1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 4, 1, 3, 2, 1, 4, 2, 3, 1].map((bar, i) => (
                      <span
                        key={i}
                        className="bg-slate-950 inline-block h-8"
                        style={{ width: `${bar * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="block text-[11px] font-mono tracking-widest text-slate-600 mt-1">
                    *{receipt.orderId}*
                  </span>
                </div>

                {/* Aisle Route Helper for Walking the Store */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Aisle-by-Aisle Shopping Guide:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {receipt.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                        <span className="font-medium text-slate-900">{it.name}</span>
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {it.aisle} · {it.bay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {!receipt ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>
                  {isSubmitting ? 'Reserving Inventory...' : `Confirm & Place 1-Click Order ($${finalTotal.toFixed(2)})`}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt &amp; Aisle Map</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
