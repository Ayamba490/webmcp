import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ShoppingBag,
  X,
  Trash2,
  Sparkles,
  Check,
  ArrowRight,
  TrendingDown,
  Lock,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    clearCart,
    cartSubtotal,
    activeDiscountPct,
    cartTotal,
    negotiation,
    startNegotiation,
    invokeToolDirectly,
  } = useApp();

  const [isNegotiating, setIsNegotiating] = useState(false);
  const [requestedDiscount, setRequestedDiscount] = useState<number>(15);
  const [negotiationReason, setNegotiationReason] = useState<string>("Bulk developer team hardware purchase");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  if (!isOpen) return null;

  const handleStartNegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    await startNegotiation(requestedDiscount, negotiationReason);
    setIsNegotiating(false);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // First invoke human confirmation protocol
      const confRes = await invokeToolDirectly("request_human_confirmation", {
        action: "checkout_signoff",
        title: "Approve Hardware Order Placement",
        details: `Authorize payment of $${cartTotal} (${cart.length} unique items, ${activeDiscountPct}% discount applied).`,
      });

      if (confRes.decision === "APPROVED_BY_HUMAN") {
        const orderResult = await invokeToolDirectly("execute_smart_checkout", {
          customerNotes: "Priority shipping to studio",
          paymentMethod: "instant_escrow",
        });
        setOrderComplete(orderResult);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6 bg-black">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-white" />
              <h2 className="font-heading font-black text-lg text-white uppercase tracking-tight">
                STAGED PROCUREMENT CART
              </h2>
              <span className="border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono font-bold text-white/60 uppercase tracking-widest">
                {cart.reduce((a, b) => a + b.quantity, 0)} ITEMS
              </span>
            </div>
            <button
              onClick={onClose}
              className="border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {orderComplete ? (
              <div className="border border-[#00FF00]/40 bg-black p-6 text-center space-y-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#00FF00] text-black">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white uppercase tracking-tight">
                    ORDER CONFIRMED & STAGED
                  </h3>
                  <span className="text-[10px] font-mono text-[#00FF00] font-bold block mt-1 uppercase tracking-widest">
                    ORDER ID: {orderComplete.orderId}
                  </span>
                </div>
                <div className="bg-white/[0.02] p-4 text-[10px] font-mono text-white/80 text-left space-y-2 border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase">ESCROW STATUS:</span>
                    <span className="text-[#00FF00] font-bold">LOCKED // VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase">TOTAL PAID:</span>
                    <span className="text-white font-bold">${orderComplete.totalCharged}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase">TRACKING TOKEN:</span>
                    <span className="text-[#6366F1] font-bold">{orderComplete.trackingToken}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOrderComplete(null);
                    onClose();
                  }}
                  className="w-full bg-white hover:bg-white/90 py-3 text-xs font-black uppercase tracking-widest text-black"
                >
                  CLOSE CART
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="p-12 text-center text-white/40 space-y-2 font-mono text-xs uppercase tracking-wider">
                <ShoppingBag className="mx-auto h-8 w-8 text-white/20 mb-3" />
                <p className="font-bold">YOUR PROCUREMENT CART IS EMPTY.</p>
                <p className="text-[10px] text-white/30">
                  Add items from the store or tell your WebMCP agent to stage a hardware bundle.
                </p>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div
                      key={`cart-item-${idx}`}
                      className="border border-white/10 bg-[#0d0d0d] p-4 space-y-3 relative"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">
                            {item.product.vendor}
                          </span>
                          <h4 className="font-heading font-black text-sm text-white uppercase tracking-tight mt-0.5">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-white mt-1 block">
                            ${item.product.price} × {item.quantity}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-white/40 hover:text-rose-500 p-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Custom Specs if configured */}
                      {item.customConfig && (
                        <div className="bg-black p-3 text-[10px] font-mono text-white/70 space-y-1.5 border border-white/10">
                          <div className="flex justify-between">
                            <span className="text-white/40 uppercase">MATERIAL:</span>
                            <span className="text-white font-bold uppercase">{item.customConfig.material}</span>
                          </div>
                          {item.customConfig.engravingText && (
                            <div className="flex justify-between">
                              <span className="text-white/40 uppercase">ENGRAVING:</span>
                              <span className="text-[#6366F1] font-bold">"{item.customConfig.engravingText}"</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-white/40 uppercase">RGB GLOW:</span>
                            <span className="text-[#00FF00] font-bold uppercase">{item.customConfig.accentGlow}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dynamic Price Negotiation Box */}
                <div
                  id="cart-negotiation-box"
                  className="border border-white/20 bg-black p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6366F1]" />
                      <span className="font-heading font-black text-xs uppercase tracking-tight text-white">
                        DYNAMIC B2B NEGOTIATION
                      </span>
                    </div>
                    {activeDiscountPct > 0 && (
                      <span className="border border-[#00FF00]/40 bg-[#00FF00]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#00FF00] uppercase tracking-widest">
                        {activeDiscountPct}% GRANTED
                      </span>
                    )}
                  </div>

                  {negotiation.status === "negotiating" ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#6366F1] animate-pulse py-2">
                      <span className="animate-spin">⚙️</span>
                      <span className="uppercase tracking-wider">EVALUATING ALGORITHMIC DISCOUNT MODEL...</span>
                    </div>
                  ) : isNegotiating ? (
                    <form onSubmit={handleStartNegotiate} className="space-y-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/60 font-mono font-bold uppercase tracking-widest flex justify-between">
                          <span>REQUESTED DISCOUNT:</span>
                          <span className="text-white font-bold">{requestedDiscount}%</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          step="1"
                          value={requestedDiscount}
                          onChange={(e) => setRequestedDiscount(Number(e.target.value))}
                          className="w-full accent-[#6366F1]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Negotiation justification (e.g., Hackathon bulk order)..."
                        value={negotiationReason}
                        onChange={(e) => setNegotiationReason(e.target.value)}
                        className="w-full border border-white/20 bg-[#0d0d0d] px-3.5 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] py-2 text-xs font-black uppercase tracking-widest text-white"
                        >
                          SUBMIT OFFER
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsNegotiating(false)}
                          className="border border-white/20 bg-white/5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-white/10"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <p className="text-[10px] text-white/50 font-mono uppercase leading-relaxed">
                        {negotiation.history.length > 0
                          ? negotiation.history[negotiation.history.length - 1].reason
                          : "Propose a bulk or team discount. WebMCP tool 'negotiate_price_discount' evaluates terms dynamically."}
                      </p>
                      <button
                        onClick={() => setIsNegotiating(true)}
                        className="mt-3 text-xs font-mono font-bold text-white hover:underline flex items-center gap-1 uppercase tracking-wider"
                      >
                        <TrendingDown className="h-3.5 w-3.5 text-[#6366F1]" />
                        <span>PROPOSE / ADJUST DISCOUNT RATE</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer & Total */}
          {cart.length > 0 && !orderComplete && (
            <div className="border-t border-white/10 bg-black p-6 space-y-5">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-white/50 uppercase">
                  <span>SUBTOTAL:</span>
                  <span>${cartSubtotal}</span>
                </div>
                {activeDiscountPct > 0 && (
                  <div className="flex justify-between text-[#00FF00] uppercase font-bold">
                    <span>NEGOTIATED DISCOUNT (-{activeDiscountPct}%):</span>
                    <span>-${Math.round((cartSubtotal * activeDiscountPct) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/50 uppercase">
                  <span>LOGISTICS CARBON OFFSET:</span>
                  <span className="text-[#00FF00] font-bold">100% OFFSET</span>
                </div>
                <div className="flex justify-between items-baseline text-white pt-3 border-t border-white/10">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">TOTAL DUE:</span>
                  <span className="font-heading font-black text-2xl text-white">${cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 py-4 text-xs font-black uppercase tracking-widest text-black transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <span className="animate-spin">REQUESTING HUMAN SIGNOFF...</span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>PROCEED TO SMART ESCROW CHECKOUT</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
