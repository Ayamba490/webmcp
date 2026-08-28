import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { Storefront } from "./components/Storefront";
import { CustomizerStudio } from "./components/CustomizerStudio";
import { AgentHud } from "./components/AgentHud";
import { WebMCPInspector } from "./components/WebMCPInspector";
import { CartDrawer } from "./components/CartDrawer";
import { HumanConfirmModal } from "./components/HumanConfirmModal";
import {
  Bot,
} from "lucide-react";

function MainLayout() {
  const { currentView, setCurrentView, theme } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div
      className={`min-h-screen theme-${theme} flex flex-col antialiased transition-colors duration-200 selection:bg-[#6366F1] selection:text-white ${
        theme === "clean_light"
          ? "bg-[#F8FAFC] text-[#0F172A]"
          : theme === "cyber_neon"
          ? "bg-[#020D0A] text-[#ECFDF5]"
          : theme === "warm_editorial"
          ? "bg-[#0F0D0B] text-[#FFFBEB]"
          : "bg-[#050505] text-white"
      }`}
    >
      {/* Header Bar */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-8 py-8 w-full">
        {currentView === "store" && <Storefront />}
        {currentView === "studio" && <CustomizerStudio />}
        {currentView === "agent_hud" && <AgentHud />}
        {currentView === "inspector" && <WebMCPInspector />}
      </main>

      {/* Floating Agent HUD Quick Trigger */}
      {currentView !== "agent_hud" && (
        <button
          onClick={() => setCurrentView("agent_hud")}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-3.5 text-xs font-black uppercase tracking-widest shadow-2xl shadow-[#6366F1]/40 hover:scale-105 active:scale-95 transition-all group border border-white/20 cursor-pointer"
        >
          <Bot className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span>Launch Agent HUD</span>
          <span className="flex h-2 w-2 rounded-full bg-[#00FF00] animate-ping" />
        </button>
      )}

      {/* Slide-over Cart & Human Confirmation Modals */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <HumanConfirmModal />

      {/* Adaptive Theme Editorial Footer */}
      <footer
        className={`border-t py-8 text-xs transition-colors duration-200 mt-auto ${
          theme === "clean_light"
            ? "border-slate-200 bg-white text-slate-500"
            : theme === "cyber_neon"
            ? "border-emerald-500/20 bg-[#020D0A] text-emerald-300/60"
            : theme === "warm_editorial"
            ? "border-amber-500/20 bg-[#0F0D0B] text-amber-200/60"
            : "border-white/10 bg-[#050505] text-white/50"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                theme === "clean_light" ? "bg-slate-900" : "bg-white"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rotate-45 ${
                  theme === "clean_light" ? "bg-white" : "bg-black"
                }`}
              />
            </div>
            <span
              className={`font-heading font-black tracking-tight uppercase text-sm ${
                theme === "clean_light" ? "text-slate-900" : "text-white"
              }`}
            >
              AuraCommerce
            </span>
            <span className="opacity-30">/</span>
            <span className="text-[11px] uppercase tracking-widest font-semibold opacity-70">
              Autonomous Hardware Co-Design Studio
            </span>
          </div>

          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-mono font-semibold">
            <span className="text-[#00FF00]">● document.modelContext ACTIVE (13)</span>
            <button
              onClick={() => setCurrentView("inspector")}
              className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Protocol Inspector
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
