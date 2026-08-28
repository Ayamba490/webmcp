import React from "react";
import { useApp } from "../context/AppContext";
import { ShieldAlert, Check, X, ShieldX, ShieldCheck } from "lucide-react";

export const HumanConfirmModal: React.FC = () => {
  const { pendingConfirmation, resolveConfirmation } = useApp();

  if (!pendingConfirmation) return null;

  const isResolved = pendingConfirmation.status !== "pending";
  const isApproved = pendingConfirmation.status === "approved";
  const isRejected = pendingConfirmation.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full border border-white/20 bg-[#050505] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors ${
              isRejected ? "bg-rose-600 text-white" : isApproved ? "bg-emerald-600 text-white" : "bg-[#6366F1] text-white"
            }`}
          >
            {isRejected ? (
              <ShieldX className="h-5 w-5" />
            ) : isApproved ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-[#6366F1] uppercase tracking-widest block">
              HUMAN-IN-THE-LOOP PROTOCOL (WEBMCP)
            </span>
            <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight leading-tight mt-0.5">
              {pendingConfirmation.title}
            </h3>
          </div>
        </div>

        {/* Details card */}
        <div className="border border-white/10 bg-black p-4 space-y-3">
          <p className="text-xs font-mono text-white/80 leading-relaxed">
            {pendingConfirmation.details}
          </p>
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 pt-2 border-t border-white/10 uppercase tracking-wider">
            <span>REQUEST ID: {pendingConfirmation.id}</span>
            <span>{pendingConfirmation.timestamp}</span>
          </div>
        </div>

        {/* Status or Action Buttons */}
        {isResolved ? (
          <div
            className={`p-3 border text-center font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
              isApproved
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            {isApproved ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span>{isApproved ? "AUTHORIZED BY HUMAN OPERATOR" : "ACTION DECLINED - PROTOCOL ABORTED"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => resolveConfirmation(false)}
              className="flex-1 flex items-center justify-center gap-2 border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/30 py-3 text-xs font-mono font-bold uppercase tracking-widest text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>DECLINE</span>
            </button>

            <button
              onClick={() => resolveConfirmation(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-white/90 py-3 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer shadow-lg shadow-white/10"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>APPROVE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

