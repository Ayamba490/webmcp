import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ProductVisual } from "./ProductVisual";
import {
  Check,
  Zap,
  Sparkles,
  Award,
  ShoppingBag,
  ArrowRight,
  Shield,
  Leaf,
  Layers,
  BarChart3,
  Cpu,
  RefreshCw,
} from "lucide-react";

export const ProductComparisonView: React.FC = () => {
  const {
    products,
    activeComparison,
    compareProducts,
    addToCart,
    setSelectedProduct,
    setCurrentView,
    theme,
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (activeComparison && activeComparison.products.length >= 2) {
      return activeComparison.products.map((p) => p.id);
    }
    return [products[0].id, products[1]?.id || products[0].id, products[2]?.id || products[0].id];
  });

  const comparison = activeComparison || compareProducts(selectedIds);
  const compProducts = comparison.products;

  const toggleProduct = (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // Keep minimum 2
      next = selectedIds.filter((x) => x !== id);
    } else {
      if (selectedIds.length >= 4) return; // Cap at 4
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    compareProducts(next);
  };

  const isDark = theme !== "clean_light";
  const bgCard = isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200 shadow-sm";
  const bgHeader = isDark ? "bg-white/[0.05]" : "bg-slate-50";

  return (
    <div id="compare-view-matrix" className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-current/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
              Tool: compare_products
            </span>
            <span className="text-xs opacity-60 font-mono">WebMCP Schema v2.4</span>
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight">
            Multi-Product Spec Matrix
          </h1>
          <p className="text-sm opacity-70 mt-1 max-w-2xl">
            Side-by-side architectural comparison of enterprise hardware peripherals, carbon metrics, switch mechanics, and AI value scoring.
          </p>
        </div>

        {/* Product Selector Quick Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase font-bold opacity-60 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Compare (2-4):
          </span>
          {products.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                id={`chip-compare-${p.id}`}
                onClick={() => toggleProduct(p.id)}
                className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#6366F1] text-white border-[#6366F1] shadow-sm"
                    : isDark
                    ? "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {isSelected ? <Check className="inline w-3 h-3 mr-1" /> : "+ "}
                {p.name.split(" ")[0]} {p.name.split(" ")[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Automated Recommendation Card */}
      {comparison.recommendation && (
        <div
          id="compare-recommendation-card"
          className={`p-6 border relative overflow-hidden ${
            isDark
              ? "bg-gradient-to-r from-[#6366F1]/15 via-purple-900/10 to-transparent border-[#6366F1]/40"
              : "bg-indigo-50/70 border-indigo-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#6366F1] text-white rounded-none shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6366F1]">
                    Agent Synthesis Ranking
                  </span>
                  <span className="bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40 px-2 py-0.2 text-[9px] font-mono font-bold">
                    RECOMMENDED CHOICE
                  </span>
                </div>
                <h3 className="font-heading font-black text-lg md:text-xl uppercase mt-0.5">
                  {comparison.recommendation.winnerName}
                </h3>
                <p className="text-xs opacity-80 mt-1 max-w-3xl leading-relaxed">
                  {comparison.recommendation.rationale}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  const winner = products.find((p) => p.id === comparison.recommendation?.winnerId);
                  if (winner) {
                    setSelectedProduct(winner);
                    setCurrentView("studio");
                  }
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Customize in Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid Table */}
      <div className={`border overflow-x-auto ${bgCard}`}>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={`border-b border-current/10 ${bgHeader}`}>
              <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider opacity-60 w-1/4">
                Specification Metric
              </th>
              {compProducts.map((prod) => (
                <th key={prod.id} className="p-4 text-xs font-bold uppercase tracking-wider w-1/4 border-l border-current/10">
                  <div className="flex flex-col gap-2">
                    <div className="h-32 w-full flex items-center justify-center bg-black/20 p-2 overflow-hidden">
                      <ProductVisual product={prod} />
                    </div>
                    <div className="mt-1">
                      <span className="text-[10px] font-mono opacity-50 block">{prod.id}</span>
                      <h4 className="font-heading font-black text-sm uppercase leading-tight line-clamp-1">
                        {prod.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono font-black text-base text-[#6366F1]">
                          ${prod.price}
                        </span>
                        <span className="text-xs opacity-60">★ {prod.rating}</span>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-current/10 text-xs">
            {/* Category & Tagline */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Category / Role</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10 font-semibold uppercase">
                  <span className="px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] font-mono text-[10px]">
                    {p.category}
                  </span>
                  <p className="text-[11px] opacity-70 mt-1 font-normal normal-case">{p.tagline}</p>
                </td>
              ))}
            </tr>

            {/* Chassis Material */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Chassis Material</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10 font-medium">
                  {p.specs.material}
                </td>
              ))}
            </tr>

            {/* Connectivity & Weight */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Connectivity & Weight</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10">
                  <div className="font-semibold">{p.specs.connectivity}</div>
                  <div className="opacity-60 text-[11px] mt-0.5">{p.specs.weight}</div>
                </td>
              ))}
            </tr>

            {/* Battery / Power Spec */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Battery / Power</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10 font-medium">
                  {p.specs.batteryLife || "AC / Bus Powered"}
                </td>
              ))}
            </tr>

            {/* Switch / Sensor Architecture */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Hardware Architecture</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10 font-medium">
                  {p.specs.switchType || p.specs.driverSize || p.specs.sensor || p.specs.computeUnit || "Integrated Neural Core"}
                </td>
              ))}
            </tr>

            {/* Carbon Footprint */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01] flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Carbon Footprint
              </td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-500">{p.carbonKg} kg CO₂e</span>
                    <span className="text-[10px] opacity-60">
                      ({p.carbonKg < 4 ? "Eco-Tier 1" : p.carbonKg < 10 ? "Standard" : "High Spec"})
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Warehouse Stock & Lead Time */}
            <tr>
              <td className="p-4 font-bold font-mono opacity-80 bg-current/[0.01]">Logistics Availability</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10">
                  <div className="font-mono font-bold text-xs">{p.stock} units ready</div>
                  <div className="opacity-60 text-[11px] mt-0.5">{p.leadTimeDays} days dispatch</div>
                </td>
              ))}
            </tr>

            {/* Direct Action Row */}
            <tr className={bgHeader}>
              <td className="p-4 font-bold font-mono opacity-80">Quick Actions</td>
              {compProducts.map((p) => (
                <td key={p.id} className="p-4 border-l border-current/10">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setCurrentView("studio");
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-wider border cursor-pointer ${
                        isDark ? "border-white/20 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#6366F1]" /> Customize
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
