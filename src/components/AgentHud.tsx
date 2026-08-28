import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const AgentHud: React.FC = () => {
  const { chatMessages, sendAgentMessage, isAgentRunning } = useApp();
  const [inputQuery, setInputQuery] = useState("");
  const [expandedToolIndex, setExpandedToolIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentRunning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAgentRunning) return;
    const text = inputQuery;
    setInputQuery("");
    await sendAgentMessage(text);
  };

  const handleScenarioClick = async (scenarioText: string) => {
    if (isAgentRunning) return;
    await sendAgentMessage(scenarioText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      {/* Left Column: Chat Conversation Stream */}
      <div className="lg:col-span-8 flex flex-col h-[720px] border border-white/10 bg-[#0d0d0d] shadow-2xl">
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm uppercase tracking-tight text-white">
                  WEBMCP AUTONOMOUS CO-PILOT
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
              </div>
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mt-0.5">
                DOCUMENT.MODELCONTEXT // 12 REGISTERED TOOLS
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span className="border border-white/10 bg-black px-2.5 py-1 text-[#6366F1] font-bold">
              MODEL: GEMINI 3.7 FLASH
            </span>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                msg.sender === "human" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender !== "human" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/5 border border-white/10 text-white">
                  {msg.sender === "agent" ? <Bot className="h-4 w-4 text-[#6366F1]" /> : <Terminal className="h-4 w-4 text-[#00FF00]" />}
                </div>
              )}

              <div
                className={`max-w-[85%] space-y-3 p-5 leading-relaxed ${
                  msg.sender === "human"
                    ? "bg-white text-black font-semibold ml-auto border border-white"
                    : msg.sender === "system"
                    ? "bg-black text-[#00FF00] font-mono text-xs border border-white/20"
                    : "bg-black border border-white/10 text-white/90"
                }`}
              >
                {/* Agent Thought header if present */}
                {msg.thought && (
                  <div className="border border-white/10 bg-white/[0.02] p-3 text-[10px] text-white/60 font-mono">
                    <span className="text-[#6366F1] font-bold uppercase tracking-widest block mb-1">
                      🧠 AGENT REASONING SCRATCHPAD:
                    </span>
                    {msg.thought}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Tool calls execution accordion */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] block">
                      ⚡ WEBMCP TOOL INVOCATIONS ({msg.toolCalls.length})
                    </span>

                    {msg.toolCalls.map((tc, idx) => {
                      const toolKey = `${msg.id}-tool-${idx}`;
                      const isExpanded = expandedToolIndex === toolKey;

                      return (
                        <div
                          key={toolKey}
                          className="border border-white/10 bg-white/[0.02] font-mono text-[10px]"
                        >
                          <button
                            onClick={() => setExpandedToolIndex(isExpanded ? null : toolKey)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {tc.status === "running" && <span className="animate-spin text-white">⏳</span>}
                              {tc.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF00]" />}
                              {tc.status === "failed" && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                              <span className="font-bold text-white uppercase">
                                document.modelContext.{tc.tool}()
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50">
                              <span className="text-[9px] uppercase tracking-wider hidden sm:inline">{tc.purpose}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-4 border-t border-white/10 bg-black space-y-3">
                              <div>
                                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block mb-1">
                                  INPUT ARGUMENTS (JSON SCHEMA):
                                </span>
                                <pre className="p-3 bg-white/[0.02] border border-white/5 text-[#6366F1] text-[10px] overflow-x-auto">
                                  {JSON.stringify(tc.args, null, 2)}
                                </pre>
                              </div>
                              {tc.result && (
                                <div>
                                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block mb-1">
                                    EXECUTION RESULT:
                                  </span>
                                  <pre className="p-3 bg-white/[0.02] border border-white/5 text-[#00FF00] text-[10px] overflow-x-auto">
                                    {JSON.stringify(tc.result, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <span className="block text-[9px] text-white/40 text-right font-mono mt-1 uppercase tracking-wider">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "human" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-black font-bold">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isAgentRunning && (
            <div className="flex gap-2 items-center text-xs font-mono text-[#00FF00] p-4 bg-black border border-white/10">
              <span className="animate-spin">⚙️</span>
              <span className="uppercase tracking-wider">EVALUATING DOCUMENT.MODELCONTEXT SPEC TOOLS...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-black p-4 flex gap-3"
        >
          <input
            type="text"
            placeholder="INSTRUCT YOUR AGENT (E.G. 'FIND KEYBOARDS, NEGOTIATE 15% OFF, AND STAGE CHECKOUT')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAgentRunning}
            className="flex-1 border border-white/20 bg-[#0d0d0d] px-4 py-3 text-xs uppercase tracking-wider font-mono text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAgentRunning || !inputQuery.trim()}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">SEND</span>
          </button>
        </form>
      </div>

      {/* Right Column: Pre-configured WebMCP Hackathon Showcase Scenarios */}
      <div className="lg:col-span-4 space-y-6">
        <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[#6366F1]" />
            <h3 className="font-heading font-black text-sm uppercase tracking-tight text-white">
              WEBMCP CHALLENGE SCENARIOS
            </h3>
          </div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-mono">
            Trigger complete multi-tool autonomous workflows executing across <code className="text-[#00FF00]">document.modelContext</code>.
          </p>

          <div className="space-y-3">
            {[
              {
                title: "1. SOURCING & B2B NEGOTIATION",
                desc: "Search audio & peripherals, negotiate 15% discount, stage checkout.",
                prompt: "Search the catalog for audio and keyboard hardware, negotiate a 15% discount, stage the bundle into my cart, and ask for my signoff.",
                badge: "HIGH IMPACT",
              },
              {
                title: "2. HARDWARE CUSTOMIZER",
                desc: "Apply Aerospace Walnut finish, laser engraving 'CYBER-2026', and Emerald glow.",
                prompt: "Customize the mechanical keyboard with Aerospace Walnut material, laser engrave 'CYBER-2026 // WEBMCP' in JetBrains Mono font, and set Emerald accent glow.",
                badge: "STUDIO",
              },
              {
                title: "3. GREEN SUPPLY CHAIN LOGISTICS",
                desc: "Simulate lowest-carbon dispatch to 94107 with warehouse stock telemetry.",
                prompt: "Simulate supply chain dispatch for destination zip 94107 with lowest_carbon priority and query store sustainability metrics.",
                badge: "ESG CARBON",
              },
              {
                title: "4. QUANTUM SERVER INSPECTION",
                desc: "Inspect 32TB Quantum-Edge server node and trigger spotlight highlight.",
                prompt: "Inspect details for product prod-server-04, spotlight the element on screen, and output warehouse stock breakdown.",
                badge: "UI SPOTLIGHT",
              },
            ].map((sc, i) => (
              <button
                key={`sc-${i}`}
                onClick={() => handleScenarioClick(sc.prompt)}
                disabled={isAgentRunning}
                className="w-full text-left border border-white/10 bg-black/60 p-4 transition-all group hover:border-white hover:bg-white/[0.04] disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading font-bold text-xs uppercase tracking-tight text-white group-hover:text-[#6366F1] transition-colors">
                    {sc.title}
                  </span>
                  <span className="border border-white/10 bg-black px-1.5 py-0.5 text-[9px] font-mono text-white/50 uppercase tracking-widest">
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed uppercase font-mono">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Context Telemetry Panel */}
        <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              WEBMCP PROTOCOL TELEMETRY
            </span>
            <span className="text-[#00FF00] text-[10px] font-bold">STATUS: 100% SPEC</span>
          </div>

          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-white/40 uppercase">REGISTRY HOST:</span>
              <span className="text-white font-bold">window.document.modelContext</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-white/40 uppercase">SCHEMA VALIDATION:</span>
              <span className="text-[#6366F1] font-bold">JSON SCHEMA DRAFT-07</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-white/40 uppercase">HUMAN SIGNOFF:</span>
              <span className="text-white font-bold">TWO-WAY PROMISE PROTOCOL</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-white/40 uppercase">EVENTS EMITTED:</span>
              <span className="text-[#00FF00] font-bold">MODELCONTEXT:*</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
