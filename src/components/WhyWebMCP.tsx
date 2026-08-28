import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Layers,
  Zap,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Cpu,
  Terminal,
  Sparkles,
  ArrowRight,
  Code,
  Lock,
} from "lucide-react";

export const WhyWebMCP: React.FC = () => {
  const { theme, setCurrentView, invokeToolDirectly } = useApp();
  const [activeDemo, setActiveDemo] = useState<"api" | "scraping" | "webmcp">("webmcp");

  const isDark = theme !== "clean_light";
  const bgCard = isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200 shadow-sm";

  return (
    <div id="why-webmcp-view" className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="border-b pb-6 border-current/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
            WebMCP Architecture Whitepaper
          </span>
          <span className="text-xs opacity-60 font-mono">W3C Draft / Browser Protocol Standard</span>
        </div>
        <h1 className="font-heading font-black text-2xl md:text-4xl uppercase tracking-tight">
          Why WebMCP is the Future of Agent-Native Commerce
        </h1>
        <p className="text-sm opacity-70 mt-2 max-w-3xl leading-relaxed">
          Comparing the three paradigms of agent interaction: headless APIs, visual browser automation, and first-class in-page WebMCP tool binding via <code className="font-mono text-[#6366F1] bg-[#6366F1]/10 px-1.5 py-0.5">document.modelContext</code>.
        </p>
      </div>

      {/* 3-Column Paradigm Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paradigm 1: Headless API */}
        <div className={`p-6 border flex flex-col justify-between ${bgCard} ${activeDemo === "api" ? "ring-2 ring-blue-500" : ""}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Paradigm 01
              </span>
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-heading font-black text-lg uppercase">Headless Backend APIs</h3>
            <p className="text-xs opacity-70 mt-2 leading-relaxed">
              Agent communicates with traditional REST/GraphQL endpoints in isolation on a remote server.
            </p>

            <ul className="mt-4 space-y-2 text-xs opacity-80">
              <li className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Zero UI feedback: User cannot see agent actions on screen.</span>
              </li>
              <li className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Cannot interact with in-memory client state (3D canvas, drafts).</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Structured data payloads.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveDemo("api")}
            className={`mt-6 w-full py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              activeDemo === "api" ? "bg-blue-600 text-white border-blue-600" : "border-current/20 hover:bg-current/5"
            }`}
          >
            Inspect API Limitations
          </button>
        </div>

        {/* Paradigm 2: Screen Scraping & Vision Clicks */}
        <div className={`p-6 border flex flex-col justify-between ${bgCard} ${activeDemo === "scraping" ? "ring-2 ring-amber-500" : ""}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Paradigm 02
              </span>
              <Eye className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-heading font-black text-lg uppercase">Vision & Screen Scraping</h3>
            <p className="text-xs opacity-70 mt-2 leading-relaxed">
              Agent takes screenshots and simulates OS mouse clicks on DOM coordinates.
            </p>

            <ul className="mt-4 space-y-2 text-xs opacity-80">
              <li className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Extremely brittle: breaks on 1px layout shifts or font changes.</span>
              </li>
              <li className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Slow: 3-5 seconds per visual inference step.</span>
              </li>
              <li className="flex items-start gap-2 text-red-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>High token cost and zero schema validation.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveDemo("scraping")}
            className={`mt-6 w-full py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              activeDemo === "scraping" ? "bg-amber-600 text-white border-amber-600" : "border-current/20 hover:bg-current/5"
            }`}
          >
            Inspect Vision Clicks
          </button>
        </div>

        {/* Paradigm 3: WebMCP Protocol (Winner) */}
        <div className={`p-6 border flex flex-col justify-between relative overflow-hidden ${
          isDark ? "bg-gradient-to-b from-[#6366F1]/15 to-transparent border-[#6366F1]" : "bg-indigo-50 border-indigo-300"
        } ${activeDemo === "webmcp" ? "ring-2 ring-[#6366F1]" : ""}`}>
          <div className="absolute top-0 right-0 bg-[#6366F1] text-white px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
            GOLD STANDARD
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30">
                Paradigm 03 (WebMCP)
              </span>
              <Sparkles className="w-5 h-5 text-[#6366F1]" />
            </div>
            <h3 className="font-heading font-black text-lg uppercase">WebMCP Browser Host</h3>
            <p className="text-xs opacity-70 mt-2 leading-relaxed">
              Tools are declared directly inside the DOM via <code className="font-mono text-[#6366F1]">document.modelContext</code> with JSON Schema validation and reactive UI hooks.
            </p>

            <ul className="mt-4 space-y-2 text-xs opacity-90">
              <li className="flex items-start gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span><b>Bidirectional DOM Sync:</b> Live 3D customizer mutations & highlights.</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span><b>Deterministic Schema Validation:</b> Rejects malformed parameters.</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span><b>Strict HITL Security:</b> Cryptographic human approval tokens for checkout.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveDemo("webmcp")}
            className="mt-6 w-full py-2 text-xs font-bold uppercase tracking-wider bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-all cursor-pointer shadow-md"
          >
            Live WebMCP Demonstration
          </button>
        </div>
      </div>

      {/* Deep-Dive Interactive Matrix Table */}
      <div className={`p-6 border space-y-4 ${bgCard}`}>
        <h3 className="font-heading font-black text-xl uppercase tracking-tight">
          Comprehensive Feature & Security Matrix
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-current/10 bg-current/[0.03]">
                <th className="p-3 font-mono font-bold uppercase">Capability / Dimension</th>
                <th className="p-3 font-mono font-bold uppercase text-blue-400">Headless API</th>
                <th className="p-3 font-mono font-bold uppercase text-amber-400">Vision Scraping</th>
                <th className="p-3 font-mono font-bold uppercase text-[#6366F1] bg-[#6366F1]/10">WebMCP Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              <tr>
                <td className="p-3 font-bold">Client-Side State Mutation (3D / Canvas)</td>
                <td className="p-3 text-red-400">❌ Impossible</td>
                <td className="p-3 text-amber-400">⚠️ Unreliable Clicks</td>
                <td className="p-3 text-emerald-400 font-bold bg-[#6366F1]/5">✅ Native React State</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Visual Human Feedback & Spotlight</td>
                <td className="p-3 text-red-400">❌ No UI Feedback</td>
                <td className="p-3 text-amber-400">⚠️ Mouse Pointer Only</td>
                <td className="p-3 text-emerald-400 font-bold bg-[#6366F1]/5">✅ Instant CSS Glow & Telemetry</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Latency per Action Step</td>
                <td className="p-3 text-emerald-400">100 - 300 ms</td>
                <td className="p-3 text-red-400">2,500 - 6,000 ms</td>
                <td className="p-3 text-emerald-400 font-bold bg-[#6366F1]/5">50 - 150 ms (Local DOM)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Security & Human-in-the-Loop Isolation</td>
                <td className="p-3 text-amber-400">⚠️ Token in Request Header</td>
                <td className="p-3 text-red-400">❌ Vulnerable to Prompt Injection</td>
                <td className="p-3 text-emerald-400 font-bold bg-[#6366F1]/5">✅ Cryptographic HITL Token Gate</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Discovery Mechanism</td>
                <td className="p-3 text-slate-400">OpenAPI Spec / Swagger</td>
                <td className="p-3 text-slate-400">DOM Tree Heuristics</td>
                <td className="p-3 text-emerald-400 font-bold bg-[#6366F1]/5">document.modelContext.tools</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Architecture Sample */}
      <div className={`p-6 border space-y-3 ${bgCard}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#6366F1]" />
            <h4 className="font-heading font-black text-sm uppercase">
              How WebMCP Registers Tools on <code className="font-mono text-[#6366F1]">document.modelContext</code>
            </h4>
          </div>
          <span className="text-[10px] font-mono opacity-50 font-bold">TypeScript / React 18</span>
        </div>

        <pre className="p-4 bg-black/60 border border-current/10 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
{`// 1. Initialize WebMCP host directly on DOM window
const host = initWebMCP();

// 2. Expose schema-validated reactive tools
host.registerTool({
  name: "customize_product_spec",
  description: "Apply custom materials, engraving, and firmware profiles in 3D Studio",
  inputSchema: {
    type: "object",
    properties: {
      productId: { type: "string" },
      material: { type: "string", enum: ["Brushed Titanium", "Matte Obsidian", "Aerospace Walnut"] },
      engravingText: { type: "string" },
      accentGlow: { type: "string" }
    },
    required: ["productId"]
  },
  execute: async (input) => {
    // Directly mutates React client state without roundtrip latency
    setCustomConfig(input);
    triggerSpotlight("studio-canvas-container");
    return { status: "customization_applied", previewUrl: "/studio" };
  }
});`}
        </pre>
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-[#6366F1]/30 bg-[#6366F1]/10">
        <div>
          <h4 className="font-heading font-black text-base uppercase">Experience WebMCP Live</h4>
          <p className="text-xs opacity-70 mt-0.5">
            Test catalog discovery, 3D laser customization, algorithmic negotiations, and cryptographic checkout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("store")}
            className="px-4 py-2 bg-transparent hover:bg-white/10 border border-current/20 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Open Storefront
          </button>
          <button
            onClick={() => setCurrentView("agent_hud")}
            className="flex items-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
          >
            Launch Agent HUD <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
