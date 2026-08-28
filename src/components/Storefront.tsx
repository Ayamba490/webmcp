import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Product } from "../types";
import { ProductVisual } from "./ProductVisual";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Check,
  Truck,
  Info,
  ChevronRight,
  Plus,
} from "lucide-react";

export const Storefront: React.FC = () => {
  const { products, setSelectedProduct, addToCart, setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter & sort
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "carbon") return a.carbonKg - b.carbonKg;
      return 0;
    });

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView("studio");
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Bold Typography */}
      <div className="relative border border-white/10 bg-[#0d0d0d] p-8 sm:p-12 overflow-hidden">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#6366F1] text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
              WEBMCP HACKATHON
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/50 font-bold">
              DOCUMENT.MODELCONTEXT SPEC 1.0
            </span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.9] text-white max-w-5xl">
            AUTONOMOUS COMMERCE & HARDWARE STUDIO
          </h1>

          <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed max-w-3xl">
            Exposing 12 structured WebMCP endpoints directly to AI agents via <code className="font-mono text-[#00FF00] bg-black/60 px-2 py-0.5 border border-white/10 font-bold">document.modelContext</code>. Agents search live inventory, negotiate dynamic B2B pricing, customize titanium hardware, and stage checkout with human confirmation.
          </p>

          {/* Bold Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 bg-white/[0.02] border border-white/5">
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold mb-1">
                REGISTERED TOOLS
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">12 SPEC</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5">
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold mb-1">
                GLOBAL LOGISTICS
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#6366F1]">SF / LON / TYO</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5">
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold mb-1">
                DISCOUNT ENGINE
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#00FF00]">UP TO -25%</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5">
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold mb-1">
                CUSTOM MANUFACTURING
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">3D LASER</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 border border-white/10 bg-[#0d0d0d] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="SEARCH INVENTORY, SPECS, TITANIUM, HUBS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-white/10 bg-black/60 py-2.5 pl-10 pr-4 text-xs uppercase tracking-wider text-white placeholder:text-white/30 focus:border-[#6366F1] focus:outline-none font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "ALL" },
            { id: "peripherals", label: "PERIPHERALS" },
            { id: "audio", label: "AUDIO" },
            { id: "wearables", label: "WEARABLES" },
            { id: "computing", label: "COMPUTING" },
            { id: "studio", label: "STUDIO" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-white text-black font-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-white/10 bg-black px-3 py-2 text-xs uppercase tracking-wider font-mono text-white/80 focus:border-[#6366F1] focus:outline-none"
          >
            <option value="featured">SORT: FEATURED</option>
            <option value="rating">TOP RATED</option>
            <option value="price_asc">PRICE: LOW TO HIGH</option>
            <option value="price_desc">PRICE: HIGH TO LOW</option>
            <option value="carbon">LOWEST CARBON</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            id={`prod-card-${product.id}`}
            className="group relative flex flex-col justify-between border border-white/10 bg-[#0d0d0d] p-6 hover:border-white/40 transition-all duration-200"
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">
                {product.vendor}
              </span>
              {product.badge && (
                <span className="bg-[#6366F1]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#6366F1] border border-[#6366F1]/30 uppercase tracking-widest">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Product Visual */}
            <ProductVisual
              type={product.imageType}
              materialColor={product.customization?.materials[0]?.hex || "#94a3b8"}
              accentGlow={product.customization?.accentGlows[0]?.hex || "#06b6d4"}
              engravingText="AURA"
              className="mb-5"
            />

            {/* Details */}
            <div className="space-y-2.5 flex-1">
              <h3 className="font-heading font-black text-xl text-white uppercase tracking-tight group-hover:text-[#6366F1] transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                {product.tagline}
              </p>

              {/* Specs pill list */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-black px-2.5 py-1 text-[10px] font-mono text-white/70 border border-white/10 uppercase">
                  {product.specs.material}
                </span>
                <span className="bg-black px-2.5 py-1 text-[10px] font-mono text-[#00FF00] border border-white/10 uppercase">
                  🌱 {product.carbonKg}kg CO₂
                </span>
              </div>
            </div>

            {/* Price & Action Row */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-white/40 line-through font-mono">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#00FF00] font-mono font-bold block">
                  {product.stock} IN STOCK
                </span>
              </div>

              <div className="flex items-center gap-2">
                {product.customization && (
                  <button
                    onClick={() => handleCustomize(product)}
                    className="flex items-center gap-1 border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-white transition-all"
                    title="Open in Collaborative Customizer Studio"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
                    <span className="hidden sm:inline">STUDIO</span>
                  </button>
                )}

                <button
                  onClick={() => handleQuickAdd(product)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    justAddedId === product.id
                      ? "bg-[#00FF00] text-black"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {justAddedId === product.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>ADDED</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>ADD</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spec Sheet trigger */}
            <button
              onClick={() => setActiveModalProduct(product)}
              className="mt-3 text-[10px] uppercase tracking-[0.15em] font-mono text-white/40 hover:text-white flex items-center justify-center gap-1 w-full py-1 transition-colors"
            >
              <Info className="h-3 w-3" />
              <span>SPECIFICATIONS & HUBS</span>
            </button>
          </div>
        ))}
      </div>

      {/* Multi-Vendor Logistics & Warehouse Sourcing Table */}
      <div className="border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-heading font-black text-xl text-white uppercase tracking-tight flex items-center gap-2.5">
              <Truck className="h-5 w-5 text-[#6366F1]" />
              GLOBAL WAREHOUSE SOURCING MATRIX
            </h2>
            <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-1">
              WebMCP agents query stock across SF, London, and Tokyo for low-carbon automated dispatch.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <tr>
                <th className="py-3 px-4">Hardware Node</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">SF Alpha</th>
                <th className="py-3 px-4">London</th>
                <th className="py-3 px-4">Tokyo</th>
                <th className="py-3 px-4">Carbon</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {products.map((p) => (
                <tr key={`matrix-${p.id}`} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[#00FF00]" />
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4 text-white/50">{p.vendor}</td>
                  <td className="py-3.5 px-4 text-white/80">
                    {p.warehouseStock[0]?.stock}u ({p.warehouseStock[0]?.shippingDays}d)
                  </td>
                  <td className="py-3.5 px-4 text-white/80">
                    {p.warehouseStock[1]?.stock}u ({p.warehouseStock[1]?.shippingDays}d)
                  </td>
                  <td className="py-3.5 px-4 text-white/80">
                    {p.warehouseStock[2]?.stock}u ({p.warehouseStock[2]?.shippingDays}d)
                  </td>
                  <td className="py-3.5 px-4 text-[#00FF00]">{p.carbonKg} kg CO₂</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleCustomize(p)}
                      className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
                    >
                      <span>Studio</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Spec Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-w-xl w-full border border-white/20 bg-[#0d0d0d] p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#6366F1] font-bold">
                  {activeModalProduct.vendor}
                </span>
                <h3 className="font-heading font-black text-2xl text-white uppercase tracking-tight mt-1">
                  {activeModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="border border-white/10 px-2.5 py-1 text-xs font-mono text-white/50 hover:text-white hover:border-white transition-colors"
              >
                ✕
              </button>
            </div>

            <ProductVisual
              type={activeModalProduct.imageType}
              materialColor={activeModalProduct.customization?.materials[0]?.hex || "#94a3b8"}
              accentGlow={activeModalProduct.customization?.accentGlows[0]?.hex || "#06b6d4"}
              className="max-h-40"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-white/10 bg-black/40 p-3 space-y-1">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">MATERIALS</span>
                <p className="text-white font-medium">{activeModalProduct.specs.material}</p>
              </div>
              <div className="border border-white/10 bg-black/40 p-3 space-y-1">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">CONNECTIVITY</span>
                <p className="text-white font-medium">{activeModalProduct.specs.connectivity}</p>
              </div>
              <div className="border border-white/10 bg-black/40 p-3 space-y-1">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">WEIGHT & DIMS</span>
                <p className="text-white font-medium">{activeModalProduct.specs.weight} / {activeModalProduct.specs.dimensions}</p>
              </div>
              <div className="border border-white/10 bg-black/40 p-3 space-y-1">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">WARRANTY</span>
                <p className="text-white font-medium">{activeModalProduct.specs.warranty}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-heading font-black text-3xl text-white">
                ${activeModalProduct.price}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleCustomize(activeModalProduct);
                    setActiveModalProduct(null);
                  }}
                  className="border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all"
                >
                  Customizer Studio
                </button>
                <button
                  onClick={() => {
                    handleQuickAdd(activeModalProduct);
                    setActiveModalProduct(null);
                  }}
                  className="bg-white hover:bg-white/90 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
