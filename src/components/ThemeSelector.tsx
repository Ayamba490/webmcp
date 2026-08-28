import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { THEME_PRESETS } from "../data/themes";
import { ThemeMode } from "../types";
import { Palette, Check, Sun, Moon, Sparkles, Sliders, X } from "lucide-react";

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentThemeConfig = THEME_PRESETS.find((t) => t.id === theme) || THEME_PRESETS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (tId: ThemeMode) => {
    setTheme(tId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} id="theme-selector-bar">
      {/* Theme Trigger Button */}
      <button
        type="button"
        id="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change app theme and design appearance"
        className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
          theme === "clean_light"
            ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-900 shadow-sm"
            : theme === "cyber_neon"
            ? "border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            : theme === "warm_editorial"
            ? "border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200"
            : "border-white/20 bg-white/5 hover:bg-white/10 text-white"
        }`}
      >
        <Palette className="h-3.5 w-3.5 opacity-80" />
        <span className="hidden md:inline font-semibold">{currentThemeConfig.name}</span>
        <span className="md:hidden">Theme</span>
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/20"
          style={{ backgroundColor: currentThemeConfig.previewAccent }}
        />
      </button>

      {/* Floating Theme Selection Drawer / Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 p-4 border shadow-2xl backdrop-blur-xl animate-fade-in ${
            theme === "clean_light"
              ? "border-slate-300 bg-white/98 text-slate-900 shadow-slate-400/20"
              : "border-white/20 bg-[#0c0c0c]/98 text-white shadow-black/80"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-3 border-inherit/15">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#6366F1]" />
              <div>
                <span className="font-heading font-black text-xs uppercase tracking-tight block">
                  Design & Visual Atmosphere
                </span>
                <span className="text-[9px] font-mono opacity-60 tracking-wider uppercase">
                  Adaptive UI Visibility Modes
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:opacity-100 opacity-60 transition-opacity"
              aria-label="Close theme menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme Presets List */}
          <div className="space-y-2.5">
            {THEME_PRESETS.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-option-${t.id}`}
                  onClick={() => handleSelectTheme(t.id)}
                  className={`w-full text-left p-3 border transition-all flex items-start gap-3 cursor-pointer group ${
                    isSelected
                      ? theme === "clean_light"
                        ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500"
                        : "border-white bg-white/10 ring-1 ring-white/40"
                      : "border-inherit/20 hover:border-inherit/50 bg-inherit/5 hover:bg-inherit/10"
                  }`}
                >
                  {/* Theme Palette Swatch Indicator */}
                  <div
                    className="w-8 h-8 rounded shrink-0 border border-black/20 flex items-center justify-center shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: t.previewBg }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: t.previewAccent }}
                    />
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs tracking-tight flex items-center gap-1.5">
                        {t.name}
                        {t.id === "clean_light" && <Sun className="h-3 w-3 text-amber-500" />}
                        {t.id === "dark_obsidian" && <Moon className="h-3 w-3 text-indigo-400" />}
                        {t.id === "cyber_neon" && <Sparkles className="h-3 w-3 text-emerald-400" />}
                      </span>
                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-inherit/10 border border-inherit/20 opacity-75">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-70 mt-1 leading-snug">
                      {t.description}
                    </p>
                  </div>

                  {/* Checked Icon */}
                  {isSelected && (
                    <div className="shrink-0 text-emerald-500 pt-0.5">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Tip for Agent Context */}
          <div className="mt-3 pt-3 border-t border-inherit/15 flex items-center justify-between text-[9px] font-mono opacity-60">
            <span>● document.modelContext set_app_theme</span>
            <span>AUTO-SAVED</span>
          </div>
        </div>
      )}
    </div>
  );
};
