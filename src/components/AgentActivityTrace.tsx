import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  Terminal,
  Layers,
  Copy,
  Check,
  Search,
  Sliders,
  Sparkles,
  Lock,
} from "lucide-react";

export interface ActivityTraceStep {
  id: string;
  tool: string;
  purpose: string;
  status: "idle" | "running" | "done" | "failed" | "blocked";
  securityTier: "GREEN_AUTO" | "YELLOW_GUARDRAILED" | "RED_HITL_REQUIRED";
  args: any;
  result?: any;
  observation?: string;
  durationMs?: number;
  timestamp: string;
}

interface AgentActivityTraceProps {
  compact?: boolean;
  maxItems?: number;
}

export const AgentActivityTrace: React.FC<AgentActivityTraceProps> = ({
  compact = false,
  maxItems = 10,
}) => {
  const { toolLogs, isAgentRunning, chatMessages, clearLogs } = useApp();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");

  const handleCopyJson = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Derive active trace events from toolLogs and chatMessages
  const logsToDisplay = toolLogs.slice(0, maxItems);

  return (
    <div className="border border-white/10 bg-[#0a0a0a] shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs sm:text-sm uppercase tracking-tight text-white">
                AGENT ACTIVITY TRACE
              </span>
              {isAgentRunning ? (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#00FF00] bg-[#00FF00]/10 px-2 py-0.5 border border-[#00FF00]/30 animate-pulse uppercase">
                  ● ACTIVE EXECUTION
                </span>
              ) : (
                <span className="text-[9px] font-bold text-white/40 bg-white/5 px-2 py-0.5 border border-white/10 uppercase">
                  IDLE / READY
                </span>
              )}
            </div>
            <span className="text-[9px] text-white/50 uppercase tracking-widest block mt-0.5">
              LIVE WEBMCP INVOCATION PIPELINE & OBSERVATION TRACE
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {toolLogs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-[9px] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 uppercase tracking-wider transition-colors"
            >
              CLEAR TRACE
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-black/40 border-b border-white/5 text-[10px]">
        <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5">
          <span className="text-white/40 font-bold uppercase">1. INTENT:</span>
          <span className="text-white font-bold truncate">
            {isAgentRunning ? "Processing..." : "Catalog Scoring"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5">
          <span className="text-white/40 font-bold uppercase">2. SCHEMA:</span>
          <span className="text-[#00FF00] font-bold">STRICT DRAFT-07</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5">
          <span className="text-white/40 font-bold uppercase">3. REGISTRY:</span>
          <span className="text-[#6366F1] font-bold">14 TOOLS (11+3)</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5">
          <span className="text-white/40 font-bold uppercase">4. TOTAL LOGS:</span>
          <span className="text-white font-bold">{toolLogs.length} EVENTS</span>
        </div>
      </div>

      {/* Live Invocations List */}
      <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
        {logsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs uppercase tracking-wider space-y-2">
            <Terminal className="h-6 w-6 mx-auto opacity-30 text-[#6366F1]" />
            <p>No WebMCP tool calls recorded yet.</p>
            <p className="text-[10px] text-white/30">
              Trigger any prompt or benchmark task to watch the live action trace stream.
            </p>
          </div>
        ) : (
          logsToDisplay.map((log, index) => {
            const isExpanded = expandedLogId === log.id;
            const isRedTier = log.toolName === "execute_smart_checkout" || log.toolName === "request_human_confirmation";
            const isYellowTier = log.toolName === "negotiate_price_discount";

            // Synthesize clear observation summary
            let observationText = "";
            if (log.status === "success") {
              if (log.toolName === "search_catalog") {
                const count = log.output?.totalMatches || log.output?.products?.length || 0;
                observationText = `✓ Catalog searched. Found ${count} matching candidates.`;
              } else if (log.toolName === "inspect_product_details") {
                const name = log.output?.product?.name || "Product";
                const stock = log.output?.product?.stock || 0;
                observationText = `✓ Inspected specs for '${name}'. In Stock: ${stock} units.`;
              } else if (log.toolName === "compare_products") {
                const count = log.output?.candidateCount || 2;
                const winner = log.output?.rankings?.[0]?.product?.name || "Top candidate";
                observationText = `✓ Evaluated ${count} hardware units. Top Value: '${winner}'.`;
              } else if (log.toolName === "customize_product_spec") {
                const mat = log.output?.appliedConfig?.material || "Titanium";
                observationText = `✓ 3D Customizer updated. Material: ${mat}.`;
              } else if (log.toolName === "add_to_cart") {
                observationText = `✓ Staged ${log.input?.quantity || 1}x item into procurement cart.`;
              } else if (log.toolName === "stage_procurement_bundle") {
                observationText = `✓ Staged multi-item hardware bundle with priority logistics.`;
              } else if (log.toolName === "negotiate_price_discount") {
                const discount = log.output?.offeredDiscountPct || 0;
                observationText = `✓ Pricing engine response: ${discount}% discount authorized (Margin Floor Verified).`;
              } else if (log.toolName === "request_human_confirmation") {
                const decision = log.output?.decision || "APPROVED";
                observationText = `🔐 Human signoff result: ${decision}`;
              } else if (log.toolName === "execute_smart_checkout") {
                const orderId = log.output?.orderId || "AURA-ORDER";
                observationText = `✓ Escrow confirmed & locked. Order: ${orderId}`;
              } else if (log.toolName === "simulate_supply_chain_dispatch") {
                observationText = `✓ Dispatch route optimized for zero-emission logistics.`;
              } else {
                observationText = `✓ Tool executed cleanly in DOM.`;
              }
            } else {
              observationText = `⚠️ Execution failed or blocked: ${log.output?.error || "Unknown error"}`;
            }

            return (
              <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00FF00]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white font-bold text-xs uppercase">
                          document.modelContext.{log.toolName}()
                        </span>

                        {/* Security Tier Badge */}
                        {isRedTier ? (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold text-rose-400 border border-rose-500/30 uppercase flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> RED_HITL
                          </span>
                        ) : isYellowTier ? (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
                            <Shield className="h-2.5 w-2.5" /> YELLOW_GUARD
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400 border border-emerald-500/30 uppercase">
                            GREEN_AUTO
                          </span>
                        )}

                        <span className="text-white/40 text-[9px]">
                          ({log.durationMs}ms)
                        </span>
                      </div>

                      {/* Observation Summary */}
                      <p className="text-[11px] text-white/80 font-mono">
                        {observationText}
                      </p>
                    </div>
                  </div>

                  {/* Expand & Copy Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyJson(log.id, { tool: log.toolName, input: log.input, output: log.output })}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                      title="Copy JSON Payload"
                    >
                      {copiedId === log.id ? <Check className="h-3.5 w-3.5 text-[#00FF00]" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                      title="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded JSON Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-3 text-[10px]">
                    <div>
                      <div className="text-white/40 font-bold uppercase tracking-widest text-[9px] mb-1">
                        INPUT ARGUMENTS:
                      </div>
                      <pre className="p-2.5 bg-black border border-white/10 text-[#6366F1] overflow-x-auto max-h-40">
                        {JSON.stringify(log.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-white/40 font-bold uppercase tracking-widest text-[9px] mb-1">
                        EXECUTION OUTPUT / RETURN OBJECT:
                      </div>
                      <pre className="p-2.5 bg-black border border-white/10 text-[#00FF00] overflow-x-auto max-h-40">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
