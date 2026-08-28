import React from "react";
import { useApp } from "../context/AppContext";
import { ThemeSelector } from "./ThemeSelector";
import {
  ShoppingBag,
  Sparkles,
  Terminal,
  Layers,
  Radio,
  BarChart3,
  Columns,
  HelpCircle,
} from "lucide-react";

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { currentView, setCurrentView, cart, activeDiscountPct, theme } = useApp();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        theme === "clean_light"
          ? "border-slate-200 bg-white/95 text-slate-900 shadow-sm"
          : theme === "cyber_neon"
          ? "border-emerald-500/20 bg-[#020D0A]/95 text-emerald-100"
          : theme === "warm_editorial"
          ? "border-amber-500/20 bg-[#0F0D0B]/95 text-amber-100"
          : "border-white/10 bg-[#050505]/95 text-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Brand & WebMCP Spec Tag */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("store")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {/* Geometric diamond emblem from theme */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                theme === "clean_light" ? "bg-slate-900 text-white" : "bg-white text-black"
              }`}
            >
              <div
                className={`w-4 h-4 rotate-45 ${
                  theme === "clean_light" ? "bg-white" : "bg-black"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black tracking-tight text-base sm:text-lg uppercase">
                  AuraCommerce
                </span>
                <span className="rounded bg-[#6366F1]/20 px-2 py-0.5 text-[9px] font-mono font-bold text-[#6366F1] border border-[#6366F1]/40 uppercase tracking-wider">
                  WEBMCP 2026
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50 hidden sm:block">
                Autonomous Hardware Studio
              </p>
            </div>
          </button>

          {/* Live WebMCP Context Status Badge */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-current/15 bg-current/[0.03] px-3.5 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]"></span>
            <span className="font-mono text-[11px] opacity-80 font-bold">document.modelContext</span>
            <span className="text-[#00FF00] font-mono text-[10px] font-bold">● ACTIVE (14 TOOLS)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {[
            { id: "store", label: "Storefront", icon: Layers },
            { id: "studio", label: "Studio", icon: Sparkles },
            { id: "compare", label: "Compare", icon: Columns },
            { id: "benchmark", label: "Benchmarks", icon: BarChart3 },
            { id: "why_webmcp", label: "Why WebMCP", icon: HelpCircle },
            { id: "agent_hud", label: "Agent HUD", icon: Radio },
            { id: "inspector", label: "Inspector", icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 text-[10px] uppercase tracking-[0.15em] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? theme === "clean_light"
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1 bg-indigo-50/50"
                      : "text-white border-b-2 border-[#6366F1] pb-1 bg-white/[0.06]"
                    : "opacity-60 hover:opacity-100 hover:bg-current/[0.04]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#6366F1]" : "opacity-50"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Theme Selector & Cart Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme & Design Switcher Section */}
          <ThemeSelector />

          {/* Cart Trigger Button */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 border px-3 sm:px-4 py-2 text-xs uppercase tracking-widest font-bold transition-all active:scale-95 cursor-pointer ${
              theme === "clean_light"
                ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-900 shadow-sm"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-[#6366F1]" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartItems > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6366F1] px-1 text-[10px] font-black text-white">
                {totalCartItems}
              </span>
            )}
            {activeDiscountPct > 0 && (
              <span className="text-[10px] font-mono text-[#00FF00] font-bold">
                -{activeDiscountPct}%
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

