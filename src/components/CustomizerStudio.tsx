import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ProductVisual } from "./ProductVisual";
import {
  Sparkles,
  Layers,
  Wand2,
  Check,
  Cpu,
  Type,
  Palette,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export const CustomizerStudio: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    customConfig,
    setCustomConfig,
    addToCart,
    setCurrentView,
    sendAgentMessage,
    isAgentRunning,
  } = useApp();

  const [aiPrompt, setAiPrompt] = useState("");
  const [addedAnimation, setAddedAnimation] = useState(false);

  const product = selectedProduct || products[0];
  const customOpts = product.customization || products[0].customization!;

  // Material calculation
  const currentMaterial = customOpts.materials.find((m) => m.name === customConfig.material) || customOpts.materials[0];
  const currentGlow = customOpts.accentGlows.find((g) => g.name === customConfig.accentGlow) || customOpts.accentGlows[0];
  const finalPrice = product.price + (currentMaterial?.surcharge || 0);

  const handleAiCollaborate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const prompt = `Customize the ${product.name}: ${aiPrompt}`;
    setAiPrompt("");
    await sendAgentMessage(prompt);
  };

  const handleSaveAndAddToCart = () => {
    addToCart(product, 1, customConfig);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("store")}
            className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                COLLABORATIVE HARDWARE STUDIO
              </h1>
              <span className="bg-[#6366F1]/20 px-2 py-0.5 text-[9px] font-mono font-bold text-[#6366F1] border border-[#6366F1]/40 uppercase tracking-widest">
                TOOL: CUSTOMIZE_PRODUCT_SPEC
              </span>
            </div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-1">
              Personalize materials, laser engraving typography, and firmware presets alongside browser agents.
            </p>
          </div>
        </div>

        {/* Product selector dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/50 font-mono font-bold uppercase tracking-widest">TARGET NODE:</span>
          <select
            value={product.id}
            onChange={(e) => {
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) setSelectedProduct(p);
            }}
            className="border border-white/20 bg-black px-4 py-2 text-xs font-mono font-bold text-white uppercase tracking-wider focus:border-[#6366F1] focus:outline-none"
          >
            {products.map((p) => (
              <option key={`opt-${p.id}`} value={p.id}>
                {p.name} (${p.price})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Vector Canvas & Live Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div
            id="studio-canvas-container"
            className="relative border border-white/10 bg-[#0d0d0d] p-6 sm:p-8"
          >
            {/* Visual Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-white/80">
                  REAL-TIME VECTOR VIEWPORT // {product.imageType.toUpperCase()}
                </span>
              </div>
              <span className="bg-black px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/60 border border-white/10">
                FINISH: {customConfig.material}
              </span>
            </div>

            {/* Product Rendering */}
            <ProductVisual
              type={product.imageType}
              materialColor={currentMaterial?.hex || "#94a3b8"}
              accentGlow={currentGlow?.hex || "#06b6d4"}
              engravingText={customConfig.engravingText}
              engravingFont={customConfig.engravingFont}
              className="h-64 sm:h-80"
            />

            {/* Telemetry Overlay */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-[10px] font-mono">
              <div className="bg-black/60 p-3 border border-white/10">
                <span className="block text-white/40 uppercase tracking-widest text-[9px] mb-1">ENGRAVING</span>
                <span className="text-white font-bold truncate block">
                  "{customConfig.engravingText || "DEFAULT"}"
                </span>
              </div>
              <div className="bg-black/60 p-3 border border-white/10">
                <span className="block text-white/40 uppercase tracking-widest text-[9px] mb-1">RGB SPECTRUM</span>
                <span className="text-[#6366F1] font-bold block truncate">{customConfig.accentGlow}</span>
              </div>
              <div className="bg-black/60 p-3 border border-white/10">
                <span className="block text-white/40 uppercase tracking-widest text-[9px] mb-1">FIRMWARE</span>
                <span className="text-[#00FF00] font-bold block truncate">
                  {customConfig.firmwareProfile}
                </span>
              </div>
            </div>
          </div>

          {/* AI Agent Natural Language Co-Design Bar */}
          <div className="border border-[#6366F1]/30 bg-[#6366F1]/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <Wand2 className="h-4 w-4 text-[#6366F1]" />
                PROMPT AGENT TO AUTO-CUSTOMIZE HARDWARE
              </span>
              <span className="text-[10px] font-mono text-[#6366F1] font-bold">
                Calls document.modelContext.customize_product_spec
              </span>
            </div>

            <form onSubmit={handleAiCollaborate} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 'Use Aerospace Walnut with custom engraving HACKATHON-2026 and Amber glow'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isAgentRunning}
                className="flex-1 border border-white/20 bg-black px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isAgentRunning}
                className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
              >
                {isAgentRunning ? (
                  <span className="animate-spin">⚙️</span>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>RUN</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {[
                "Aerospace Walnut with 'CYBER-DEV' engraving",
                "Brushed Titanium with Emerald Glow",
                "Matte Obsidian with 'NEURAL-CORE' in JetBrains Mono",
              ].map((example, i) => (
                <button
                  key={`ex-${i}`}
                  type="button"
                  onClick={() => setAiPrompt(example)}
                  className="bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white/70 hover:text-white border border-white/10 hover:border-white/40 transition-colors uppercase"
                >
                  ⚡ {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Material Finish Swatches */}
          <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#6366F1]" />
                CHASSIS MATERIAL & FINISH
              </h3>
              <span className="text-[10px] font-mono text-white/50 uppercase">
                +{currentMaterial?.surcharge ? `$${currentMaterial.surcharge}` : "INCLUDED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {customOpts.materials.map((mat) => (
                <button
                  key={mat.name}
                  onClick={() => setCustomConfig((prev) => ({ ...prev, material: mat.name }))}
                  className={`flex items-center gap-3 border p-3 text-left transition-all ${
                    customConfig.material === mat.name
                      ? "border-white bg-white/10"
                      : "border-white/10 bg-black/40 hover:border-white/30"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: mat.hex }}
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate uppercase">{mat.name}</span>
                    <span className="text-[9px] text-white/50 font-mono block">
                      {mat.surcharge > 0 ? `+$${mat.surcharge}` : "STANDARD"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Laser Engraving */}
          <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Type className="h-4 w-4 text-[#6366F1]" />
                PRECISION LASER ENGRAVING
              </h3>
              <span className="text-[9px] font-mono text-[#00FF00] uppercase font-bold">INCLUDED</span>
            </div>

            <input
              type="text"
              maxLength={22}
              placeholder="E.G. CYBER-2026 // WEBMCP"
              value={customConfig.engravingText}
              onChange={(e) => setCustomConfig((prev) => ({ ...prev, engravingText: e.target.value.toUpperCase() }))}
              className="w-full border border-white/20 bg-black px-4 py-2.5 text-xs font-mono font-bold text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none uppercase"
            />

            {/* Font selector */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              {customOpts.engravingFonts.map((font) => (
                <button
                  key={font}
                  onClick={() => setCustomConfig((prev) => ({ ...prev, engravingFont: font }))}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                    customConfig.engravingFont === font
                      ? "bg-white text-black font-black"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* RGB Accent Spectrum */}
          <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#6366F1]" />
              UNDERGLOW ACCENT SPECTRUM
            </h3>

            <div className="grid grid-cols-4 gap-2.5">
              {customOpts.accentGlows.map((glow) => (
                <button
                  key={glow.name}
                  onClick={() => setCustomConfig((prev) => ({ ...prev, accentGlow: glow.name }))}
                  className={`flex flex-col items-center gap-2 border p-3 text-center transition-all ${
                    customConfig.accentGlow === glow.name
                      ? "border-white bg-white/10"
                      : "border-white/10 bg-black/40 hover:border-white/30"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: glow.hex, boxShadow: `0 0 8px ${glow.hex}` }}
                  />
                  <span className="text-[9px] font-bold text-white/80 uppercase truncate w-full">
                    {glow.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Firmware Profile Preset */}
          <div className="border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#6366F1]" />
              FIRMWARE LOGIC PROFILE
            </h3>

            <div className="space-y-2.5">
              {customOpts.firmwareProfiles.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => setCustomConfig((prev) => ({ ...prev, firmwareProfile: fp.name }))}
                  className={`w-full border p-3.5 text-left transition-all ${
                    customConfig.firmwareProfile === fp.name
                      ? "border-white bg-white/10"
                      : "border-white/10 bg-black/40 hover:border-white/30"
                  }`}
                >
                  <span className="text-xs font-black text-white block uppercase">{fp.name}</span>
                  <span className="text-[10px] text-white/50 block font-mono mt-0.5">{fp.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="border border-white/20 bg-black p-6 space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[9px] text-white/50 font-mono uppercase tracking-widest block">CUSTOMIZED TOTAL</span>
                <span className="font-heading font-black text-3xl text-white">${finalPrice}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#00FF00] font-mono uppercase tracking-widest block font-bold">DISPATCH LEAD TIME</span>
                <span className="text-xs text-white/80 font-mono">{product.leadTimeDays} BUSINESS DAYS</span>
              </div>
            </div>

            <button
              onClick={handleSaveAndAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all active:scale-[0.99]"
            >
              {addedAnimation ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>SPEC ADDED TO CART</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>STAGE CUSTOM HARDWARE TO CART</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
