import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { webMCPHost } from "../lib/webmcp";
import { WebMCPTool } from "../types";
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  List,
  Activity,
  Zap,
  Info,
  Layers,
  Sparkles,
  Trash2,
} from "lucide-react";

export const WebMCPInspector: React.FC = () => {
  const { toolLogs, clearLogs, invokeToolDirectly } = useApp();
  const [tools, setTools] = useState<WebMCPTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<WebMCPTool | null>(null);
  const [inputJson, setInputJson] = useState<string>("{}");
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"tools" | "logs" | "guide" | "code">("tools");

  useEffect(() => {
    const list = webMCPHost.getRegisteredTools();
    setTools(list);
    if (list.length > 0 && !selectedTool) {
      setSelectedTool(list[0]);
      setInputJson(getDefaultPayloadForTool(list[0].name));
    }
  }, []);

  const handleSelectTool = (tool: WebMCPTool) => {
    setSelectedTool(tool);
    setInputJson(getDefaultPayloadForTool(tool.name));
    setExecutionResult(null);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setExecuting(true);
    try {
      const parsedInput = JSON.parse(inputJson);
      const res = await invokeToolDirectly(selectedTool.name, parsedInput);
      setExecutionResult({ success: true, data: res });
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message || String(err) });
    } finally {
      setExecuting(false);
    }
  };

  const sampleSnippet = `// ----------------------------------------------------
// Standard WebMCP Registration (Draft 1.0 Specification)
// Accessible to ChatGPT in-app browser & Chrome WebMCP
// ----------------------------------------------------

document.modelContext.registerTool({
  name: "search_catalog",
  description: "Search the product catalog with fuzzy matching and category filters",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search term (e.g., 'keyboard', 'audio')" },
      category: { type: "string", enum: ["peripherals", "audio", "wearables", "computing", "studio"] },
      maxPrice: { type: "number", description: "Max budget limit" },
      sortBy: { type: "string", enum: ["price_asc", "price_desc", "rating", "carbon"] }
    }
  },
  execute: async (input) => {
    // Queries catalog state and returns matching items
    return await catalogService.search(input);
  }
});`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              WEBMCP PROTOCOL INSPECTOR
            </h1>
            <span className="bg-[#6366F1]/20 px-2 py-0.5 text-[9px] font-mono font-bold text-[#6366F1] border border-[#6366F1]/40 uppercase tracking-widest">
              ACTIVE SPEC 1.0
            </span>
          </div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-1">
            Directly inspect, test, and benchmark the 14 WebMCP tools (11 Commerce/Agent + 3 UI/Observability) exposed to AI agents on document.modelContext.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black p-1 border border-white/20">
          {[
            { id: "tools", label: "TOOL EXPLORER", icon: Layers },
            { id: "logs", label: `LOGS (${toolLogs.length})`, icon: Activity },
            { id: "code", label: "SPEC CODE", icon: Code2 },
            { id: "guide", label: "SETUP GUIDE", icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-black font-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Tool Explorer */}
      {activeTab === "tools" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Tool List */}
          <div className="lg:col-span-5 space-y-2 border border-white/10 bg-[#0d0d0d] p-4 max-h-[640px] overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest block px-2 mb-2">
              REGISTERED WEBMCP TOOLS ({tools.length})
            </span>

            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleSelectTool(tool)}
                className={`w-full text-left p-3.5 border transition-all ${
                  selectedTool?.name === tool.name
                    ? "border-white bg-white/10 text-white"
                    : "border-white/10 bg-black/40 text-white/70 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    {tool.name}
                  </span>
                  <span className="border border-white/10 bg-black px-1.5 py-0.5 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                    TOOL
                  </span>
                </div>
                <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed font-mono">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>

          {/* Right Column: Schema & Live Invoker */}
          <div className="lg:col-span-7 space-y-6">
            {selectedTool ? (
              <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-heading font-black text-base font-mono text-white uppercase tracking-tight">
                      document.modelContext.{selectedTool.name}()
                    </h2>
                    <span className="text-[10px] font-mono text-[#00FF00] font-bold">STATUS: READY</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    {selectedTool.description}
                  </p>
                </div>

                {/* Input JSON Schema */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                    INPUT SCHEMA (JSON SCHEMA DRAFT-07):
                  </span>
                  <pre className="p-3.5 bg-black border border-white/10 text-[10px] font-mono text-[#6366F1] max-h-36 overflow-y-auto">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>

                {/* Live Test Input Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                      INVOCATION PAYLOAD (EDIT JSON):
                    </span>
                    <button
                      onClick={() => setInputJson(getDefaultPayloadForTool(selectedTool.name))}
                      className="text-[10px] font-mono text-white hover:underline uppercase tracking-wider"
                    >
                      RESET SAMPLE
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    className="w-full border border-white/20 bg-black p-3.5 font-mono text-xs text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none"
                  />
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleExecuteTool}
                  disabled={executing}
                  className="flex items-center justify-center gap-2 w-full bg-[#6366F1] hover:bg-[#4F46E5] py-3 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                >
                  {executing ? (
                    <span className="animate-spin">EXECUTING ON MODELCONTEXT...</span>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>EXECUTE TOOL DIRECTLY ON DOCUMENT.MODELCONTEXT</span>
                    </>
                  )}
                </button>

                {/* Output Display */}
                {executionResult && (
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                        OUTPUT RETURNED:
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          executionResult.success ? "text-[#00FF00]" : "text-rose-500"
                        }`}
                      >
                        {executionResult.success ? "SUCCESS 200 OK" : "EXECUTION FAILED"}
                      </span>
                    </div>
                    <pre className="p-3.5 bg-black border border-white/10 text-[10px] font-mono text-[#00FF00] max-h-52 overflow-y-auto">
                      {JSON.stringify(executionResult.data || executionResult.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-white/40 font-mono text-xs">Select a tool on the left to inspect and test.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Live Telemetry Logs */}
      {activeTab === "logs" && (
        <div className="space-y-5 border border-white/10 bg-[#0d0d0d] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-tight">
                REAL-TIME TOOL INVOCATION STREAM
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-0.5">
                Audited telemetry of all WebMCP tool calls executed by browser agents, human testers, and the system.
              </p>
            </div>
            {toolLogs.length > 0 && (
              <button
                onClick={clearLogs}
                className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-white/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>CLEAR LOGS</span>
              </button>
            )}
          </div>

          {toolLogs.length === 0 ? (
            <div className="p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
              NO TOOL LOGS RECORDED YET. EXECUTE A TOOL IN THE EXPLORER OR TRIGGER AN AGENT ACTION.
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto font-mono text-xs">
              {toolLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-white/10 bg-black p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          log.status === "success" ? "bg-[#00FF00]" : "bg-rose-500"
                        }`}
                      />
                      <span className="font-bold text-white uppercase">{log.toolName}</span>
                      <span className="border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/50 uppercase tracking-widest">
                        INVOKER: {log.invoker}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-[10px]">
                      <span>⏱️ {log.durationMs}MS</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                    <div className="bg-white/[0.02] p-3 border border-white/10 overflow-x-auto">
                      <span className="text-white/40 font-bold uppercase tracking-widest block mb-1">INPUT:</span>
                      <pre className="text-[#6366F1]">{JSON.stringify(log.input, null, 2)}</pre>
                    </div>
                    <div className="bg-white/[0.02] p-3 border border-white/10 overflow-x-auto">
                      <span className="text-white/40 font-bold uppercase tracking-widest block mb-1">OUTPUT:</span>
                      <pre className="text-[#00FF00]">{JSON.stringify(log.output, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: WebMCP Standard Code Snippet */}
      {activeTab === "code" && (
        <div className="space-y-5 border border-white/10 bg-[#0d0d0d] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-tight">
                OFFICIAL WEBMCP SPECIFICATION CODE
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-0.5">
                This app uses the standard <code className="text-[#00FF00]">document.modelContext.registerTool</code> API so browser agents can discover tools.
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-white/90"
            >
              {copiedSnippet ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>COPY SNIPPET</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-black border border-white/10 text-xs font-mono text-[#00FF00] overflow-x-auto leading-relaxed">
            {sampleSnippet}
          </pre>
        </div>
      )}

      {/* Tab: Setup Guide */}
      {activeTab === "guide" && (
        <div className="space-y-6 border border-white/10 bg-[#0d0d0d] p-6">
          <h2 className="font-heading font-black text-lg text-white uppercase tracking-tight">
            HOW JUDGES & USERS CAN TEST WEBMCP
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80 font-mono">
            <div className="border border-white/10 bg-black p-5 space-y-3">
              <h3 className="font-heading font-black text-sm uppercase tracking-tight text-white">
                1. TEST WITH GOOGLE CHROME
              </h3>
              <p className="leading-relaxed text-white/70">
                Enable WebMCP in Google Chrome Canary / Dev by navigating to:
              </p>
              <code className="block p-3 bg-white/[0.04] border border-white/10 font-mono text-[#6366F1] select-all">
                chrome://flags/#enable-webmcp-testing
              </code>
              <p className="text-white/50 leading-relaxed">
                Set to <strong>Enabled</strong> and restart Chrome. When you visit this live URL, Chrome's built-in Model Context Protocol client will automatically detect <code className="text-[#00FF00]">document.modelContext</code>!
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 space-y-3">
              <h3 className="font-heading font-black text-sm uppercase tracking-tight text-white">
                2. TEST WITH CHATGPT IN-APP BROWSER
              </h3>
              <p className="leading-relaxed text-white/70">
                Open this applet URL inside ChatGPT's in-app browser or ChatGPT Sites.
              </p>
              <p className="text-white/50 leading-relaxed">
                ChatGPT supports WebMCP out of the box. Prompt ChatGPT: <em>"Search the AuraCommerce catalog for mechanical keyboards and customize a brushed titanium model for me."</em>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for default payloads
function getDefaultPayloadForTool(name: string): string {
  switch (name) {
    case "search_catalog":
      return JSON.stringify({ query: "keyboard", category: "peripherals", maxPrice: 500, sortBy: "rating" }, null, 2);
    case "inspect_product_details":
      return JSON.stringify({ productId: "prod-keyboard-01" }, null, 2);
    case "compare_products":
      return JSON.stringify(
        {
          productIds: ["prod-keyboard-01", "prod-audio-02", "prod-wear-03"],
          criteria: ["price", "rating", "carbonKg", "material", "connectivity", "stock"],
        },
        null,
        2
      );
    case "customize_product_spec":
      return JSON.stringify(
        {
          productId: "prod-keyboard-01",
          material: "Brushed Titanium",
          engravingText: "CYBER-2026",
          accentGlow: "Cyan Neon",
          firmwareProfile: "Developer Fast-Macro Profile",
          engravingFont: "JetBrains Mono",
        },
        null,
        2
      );
    case "add_to_cart":
      return JSON.stringify({ productId: "prod-audio-02", quantity: 1 }, null, 2);
    case "stage_procurement_bundle":
      return JSON.stringify(
        {
          items: [
            { productId: "prod-keyboard-01", quantity: 1 },
            { productId: "prod-ring-03", quantity: 2 },
          ],
          shippingTier: "priority_orbital",
        },
        null,
        2
      );
    case "negotiate_price_discount":
      return JSON.stringify({ requestedDiscountPct: 15, reasoning: "Bulk hardware procurement discount" }, null, 2);
    case "request_human_confirmation":
      return JSON.stringify(
        {
          action: "checkout_signoff",
          title: "Approve Order Checkout",
          details: "Authorize purchase total of $538.00 with 15% discount.",
        },
        null,
        2
      );
    case "execute_smart_checkout":
      return JSON.stringify({ customerNotes: "Expedited shipping to SF lab", paymentMethod: "instant_escrow" }, null, 2);
    case "simulate_supply_chain_dispatch":
      return JSON.stringify({ destinationZip: "94107", warehousePriority: "lowest_carbon" }, null, 2);
    case "trigger_ui_highlight":
      return JSON.stringify({ elementId: "prod-card-prod-keyboard-01", durationMs: 4000 }, null, 2);
    case "query_live_metrics":
      return JSON.stringify({ metricType: "full_telemetry" }, null, 2);
    case "stream_agent_scratchpad":
      return JSON.stringify({ thought: "Analyzed product catalog and verified inventory across SF & London hubs.", confidenceScore: 0.98 }, null, 2);
    case "set_app_theme":
      return JSON.stringify({ themeId: "clean_light" }, null, 2);
    default:
      return "{}";
  }
}
