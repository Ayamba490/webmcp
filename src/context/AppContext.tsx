import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Product,
  CartItem,
  ToolInvocationLog,
  HumanConfirmationRequest,
  AgentChatMessage,
  NegotiationState,
  LogisticsDispatch,
  ThemeMode,
  AppView,
  ProductComparison,
  NegotiationPolicyReport,
} from "../types";
import { INITIAL_PRODUCTS } from "../data/catalog";
import { THEME_PRESETS } from "../data/themes";
import { webMCPHost, initWebMCP, triggerSpotlight } from "../lib/webmcp";
import { getClientFallbackStep } from "../lib/clientPlanner";
import confetti from "canvas-confetti";

interface HumanApprovalRecord {
  token: string;
  action: string;
  timestamp: number;
  expiresAt: number;
  used: boolean;
  approved: boolean;
}

interface AppContextType {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, customConfig?: CartItem["customConfig"]) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  activeDiscountPct: number;
  cartTotal: number;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
  // Theme & Design state
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  
  // Customizer state
  customConfig: {
    material: string;
    engravingText: string;
    accentGlow: string;
    firmwareProfile: string;
    engravingFont: string;
  };
  setCustomConfig: React.Dispatch<React.SetStateAction<{
    material: string;
    engravingText: string;
    accentGlow: string;
    firmwareProfile: string;
    engravingFont: string;
  }>>;
  
  // Product Comparison state
  activeComparison: ProductComparison | null;
  setActiveComparison: (comp: ProductComparison | null) => void;
  compareProducts: (productIds: string[], criteria?: string[]) => ProductComparison;

  // Negotiation state & policy report
  negotiation: NegotiationState;
  negotiationReport: NegotiationPolicyReport | null;
  startNegotiation: (requestedPct: number, reason: string) => Promise<any>;
  acceptNegotiationOffer: () => void;
  resetNegotiation: () => void;
  
  // Human in the loop confirmation
  pendingConfirmation: HumanConfirmationRequest | null;
  resolveConfirmation: (approved: boolean) => void;
  lastHumanApproval: HumanApprovalRecord | null;
  
  // Agent Chat & Logs
  chatMessages: AgentChatMessage[];
  sendAgentMessage: (text: string) => Promise<void>;
  isAgentRunning: boolean;
  toolLogs: ToolInvocationLog[];
  clearLogs: () => void;
  
  // Logistics
  dispatches: LogisticsDispatch[];
  
  // Direct tool invocation
  invokeToolDirectly: (toolName: string, input: any) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      customConfig: {
        material: "Brushed Titanium",
        engravingText: "WEBMCP // 2026",
        accentGlow: "Cyan Neon",
        firmwareProfile: "Developer Fast-Macro Profile",
        engravingFont: "JetBrains Mono",
      },
    },
  ]);
  const [currentView, setCurrentView] = useState<AppView>("store");
  const [activeComparison, setActiveComparison] = useState<ProductComparison | null>(null);
  const [negotiationReport, setNegotiationReport] = useState<NegotiationPolicyReport | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("auracommerce_theme") as ThemeMode;
      if (saved && ["dark_obsidian", "clean_light", "cyber_neon", "warm_editorial"].includes(saved)) {
        return saved;
      }
    }
    return "dark_obsidian";
  });

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("auracommerce_theme", newTheme);
    }
  };
  
  // Customizer state
  const [customConfig, setCustomConfig] = useState({
    material: "Brushed Titanium",
    engravingText: "WEBMCP // 2026",
    accentGlow: "Cyan Neon",
    firmwareProfile: "Developer Fast-Macro Profile",
    engravingFont: "JetBrains Mono",
  });

  // Negotiation state
  const [negotiation, setNegotiation] = useState<NegotiationState>({
    originalTotal: 289,
    offeredDiscountPct: 0,
    discountedTotal: 289,
    status: "idle",
    history: [],
  });

  // Human confirmation
  const [pendingConfirmation, setPendingConfirmation] = useState<HumanConfirmationRequest | null>(null);
  const [confirmationResolver, setConfirmationResolver] = useState<((approved: boolean) => void) | null>(null);
  const [lastHumanApproval, setLastHumanApproval] = useState<HumanApprovalRecord | null>(null);

  // Chat & telemetry
  const [chatMessages, setChatMessages] = useState<AgentChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "agent",
      text: "👋 Welcome to AuraCommerce! I am your WebMCP Browser Agent. I'm connected to document.modelContext with 12 structured tools. Tell me what you'd like to source, customize, negotiate, or dispatch!",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [toolLogs, setToolLogs] = useState<ToolInvocationLog[]>([]);
  const [dispatches, setDispatches] = useState<LogisticsDispatch[]>([]);

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    let itemPrice = item.product.price;
    if (item.customConfig?.material && item.product.customization) {
      const mat = item.product.customization.materials.find((m) => m.name === item.customConfig!.material);
      if (mat) itemPrice += mat.surcharge;
    }
    return acc + itemPrice * item.quantity;
  }, 0);

  const activeDiscountPct = negotiation.offeredDiscountPct;
  const cartTotal = Math.max(0, Math.round(cartSubtotal * (1 - activeDiscountPct / 100)));

  const addToCart = useCallback((product: Product, quantity = 1, custom?: CartItem["customConfig"]) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && JSON.stringify(i.customConfig) === JSON.stringify(custom)
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, customConfig: custom }];
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetNegotiation = useCallback(() => {
    setNegotiation({
      originalTotal: 0,
      offeredDiscountPct: 0,
      discountedTotal: 0,
      status: "idle",
      history: [],
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setNegotiation({
      originalTotal: 0,
      offeredDiscountPct: 0,
      discountedTotal: 0,
      status: "idle",
      history: [],
    });
    setLastHumanApproval(null);
  }, []);

  // Human in the loop confirmation resolution
  const resolveConfirmation = useCallback((approved: boolean) => {
    if (pendingConfirmation) {
      setPendingConfirmation((prev) => (prev ? { ...prev, status: approved ? "approved" : "rejected" } : null));
    }

    if (approved) {
      const token = `HITL-AUTH-${Date.now().toString(36).toUpperCase()}`;
      const approvalData: HumanApprovalRecord = {
        token,
        action: pendingConfirmation?.action || "checkout_signoff",
        timestamp: Date.now(),
        expiresAt: Date.now() + 120000, // 2-minute validity window
        used: false,
        approved: true,
      };
      setLastHumanApproval(approvalData);
      stateRef.current.lastHumanApproval = approvalData;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `hitl-${Date.now()}`,
          sender: "system",
          text: `🛡️ [Human-in-the-Loop]: Action "${pendingConfirmation?.title || "Operation"}" was APPROVED by human operator. Escrow token issued: ${token}.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const declineData: HumanApprovalRecord = {
        token: "",
        action: pendingConfirmation?.action || "checkout_signoff",
        timestamp: Date.now(),
        expiresAt: 0,
        used: true,
        approved: false,
      };
      setLastHumanApproval(declineData);
      stateRef.current.lastHumanApproval = declineData;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `hitl-${Date.now()}`,
          sender: "system",
          text: `🛑 [Human-in-the-Loop]: Action "${pendingConfirmation?.title || "Operation"}" was DECLINED by human operator. Execution safely aborted.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }

    if (confirmationResolver) {
      confirmationResolver(approved);
      setConfirmationResolver(null);
    }
    setTimeout(() => {
      setPendingConfirmation(null);
    }, 1200);
  }, [pendingConfirmation, confirmationResolver]);

  // Synchronized state reference for WebMCP tools (avoids re-registering tools on state changes)
  const stateRef = useRef({
    products,
    selectedProduct,
    cart,
    customConfig,
    negotiation,
    cartSubtotal,
    activeDiscountPct,
    cartTotal,
    currentView,
    lastHumanApproval,
  });

  useEffect(() => {
    stateRef.current = {
      products,
      selectedProduct,
      cart,
      customConfig,
      negotiation,
      cartSubtotal,
      activeDiscountPct,
      cartTotal,
      currentView,
      lastHumanApproval,
    };
  });

  // Product Comparison Engine
  const compareProducts = useCallback((productIds: string[], criteria?: string[]): ProductComparison => {
    const catalog = stateRef.current.products;
    const matchingProds = catalog.filter((p) => productIds.includes(p.id));
    const activeList = matchingProds.length >= 2 ? matchingProds : catalog.slice(0, 3);
    
    const defaultCriteria = criteria && criteria.length > 0
      ? criteria
      : ["Retail Price ($USD)", "Chassis Material & Build", "Customer Rating (★)", "Connectivity", "Carbon Footprint (kg)", "Warranty Coverage"];

    // Multi-factor ranking: price-to-spec value, rating, carbon efficiency
    const ranked = activeList
      .map((p) => {
        const valueScore = (p.rating * 25) + ((1500 - p.price) / 30) - (p.carbonKg * 3);
        return { product: p, score: valueScore };
      })
      .sort((a, b) => b.score - a.score);

    const winner = ranked[0].product;
    const medals = ["🥇 Best Overall Value", "🥈 High-Performance Spec", "🥉 Budget / Specialist Choice", "4th Pick"];

    const comparisonData: ProductComparison = {
      products: activeList,
      criteria: defaultCriteria,
      recommendation: {
        winnerId: winner.id,
        winnerName: winner.name,
        rationale: `We recommend ${winner.name} as the leading choice based on its ${winner.rating}★ rating, high-grade ${winner.specs.material} architecture, and exceptional $${winner.price} pricing.`,
        rankings: ranked.map((r, idx) => ({
          productId: r.product.id,
          rank: idx + 1,
          medal: medals[idx] || `#${idx + 1} Selection`,
          highlight: idx === 0 ? "Highest aggregate value & engineering score" : `${r.product.specs.material} with ${r.product.specs.warranty}`,
        })),
      },
    };

    setActiveComparison(comparisonData);
    setCurrentView("compare");
    return comparisonData;
  }, []);

  // Dynamic Algorithmic Negotiation Engine with Transparent Policy Math
  const startNegotiation = useCallback(async (requestedPct: number, reason: string) => {
    setNegotiation((prev) => ({ ...prev, status: "negotiating" }));
    
    // Simulate smart dynamic pricing tier calculation
    await new Promise((res) => setTimeout(res, 600));

    const req = Math.max(1, Math.min(30, Math.round(requestedPct)));
    const curSubtotal = stateRef.current.cartSubtotal;
    const totalUnits = stateRef.current.cart.reduce((sum, item) => sum + item.quantity, 0);

    // Hard retail margin safety ceiling (D_max <= 28%)
    const MARGIN_SAFETY_CEILING_PCT = 28;

    // Policy Tier Calculation
    let bulkTier: "Standard" | "Small Batch (3+)" | "Enterprise Volume (10+)";
    let eligibleDiscountMaxPct: number;

    if (totalUnits >= 10 || curSubtotal >= 2000) {
      bulkTier = "Enterprise Volume (10+)";
      eligibleDiscountMaxPct = 25;
    } else if (totalUnits >= 3 || curSubtotal >= 800) {
      bulkTier = "Small Batch (3+)";
      eligibleDiscountMaxPct = 18;
    } else {
      bulkTier = "Standard";
      eligibleDiscountMaxPct = 12;
    }

    let approvedPct: number;
    let storeReason: string;
    let isWithinPolicy = true;

    if (req <= eligibleDiscountMaxPct) {
      approvedPct = req;
      storeReason = `${bulkTier} Policy: Requested ${req}% discount is fully approved under standard margin policy.`;
    } else {
      isWithinPolicy = false;
      approvedPct = Math.min(MARGIN_SAFETY_CEILING_PCT, eligibleDiscountMaxPct);
      storeReason = `Algorithmic Counter-Proposal: Requested ${req}% exceeds tier ceiling. Counter-offered authorized maximum of ${approvedPct}% for current cart volume.`;
    }

    const discountedTotal = Math.max(0, Math.round(curSubtotal * (1 - approvedPct / 100)));

    const policyReport: NegotiationPolicyReport = {
      cartTotal: curSubtotal,
      itemCount: totalUnits,
      bulkTier,
      eligibleDiscountMaxPct,
      requestedDiscountPct: req,
      approvedDiscountPct: approvedPct,
      marginSafetyFloorPct: 72, // 100 - 28% max
      isWithinPolicy,
      policyRationale: storeReason,
    };

    setNegotiationReport(policyReport);

    const result = {
      originalTotal: curSubtotal,
      offeredDiscountPct: approvedPct,
      discountedTotal,
      status: (approvedPct === req ? "accepted" : "countered") as "accepted" | "countered",
      policyReport,
      history: [
        ...stateRef.current.negotiation.history,
        {
          round: stateRef.current.negotiation.history.length + 1,
          party: "agent" as const,
          pct: req,
          reason: reason || "B2B Volume Procurement Discount Request",
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          round: stateRef.current.negotiation.history.length + 2,
          party: "store_ai" as const,
          pct: approvedPct,
          reason: storeReason,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    };

    setNegotiation(result);
    return result;
  }, []);

  const acceptNegotiationOffer = useCallback(() => {
    setNegotiation((prev) => ({ ...prev, status: "accepted" }));
  }, []);

  // WebMCP Registration Effect - RUNS ONCE on mount with stable stateRef
  useEffect(() => {
    const host = initWebMCP();

    // 1. search_catalog
    host.registerTool({
      name: "search_catalog",
      description: "Search and filter high-spec hardware catalog by query, category, maximum price, or minimum rating.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keyword (e.g., 'keyboard', 'audio', 'titanium', 'server')" },
          category: {
            type: "string",
            enum: ["peripherals", "audio", "wearables", "computing", "studio"],
            description: "Product category filter",
          },
          maxPrice: { type: "number", description: "Maximum budget limit in USD" },
          sortBy: {
            type: "string",
            enum: ["price_asc", "price_desc", "rating", "carbon"],
            description: "Sorting rule",
          },
        },
      },
      execute: async (input: any) => {
        let results = [...stateRef.current.products];
        if (input.query) {
          const q = input.query.toLowerCase();
          results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q) ||
              p.vendor.toLowerCase().includes(q)
          );
        }
        if (input.category) {
          results = results.filter((p) => p.category === input.category);
        }
        if (input.maxPrice) {
          results = results.filter((p) => p.price <= input.maxPrice);
        }
        if (input.sortBy === "price_asc") results.sort((a, b) => a.price - b.price);
        if (input.sortBy === "price_desc") results.sort((a, b) => b.price - a.price);
        if (input.sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
        if (input.sortBy === "carbon") results.sort((a, b) => a.carbonKg - b.carbonKg);

        return {
          totalMatches: results.length,
          products: results.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.price,
            rating: r.rating,
            stock: r.stock,
            leadTimeDays: r.leadTimeDays,
            carbonKg: r.carbonKg,
            badge: r.badge,
          })),
        };
      },
    });

    // 2. inspect_product_details
    host.registerTool({
      name: "inspect_product_details",
      description: "Retrieve comprehensive specifications, warehouse stock levels, materials, and customizable parameters for a specific product ID.",
      inputSchema: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Target product identifier (e.g., 'prod-keyboard-01')" },
        },
        required: ["productId"],
      },
      execute: async (input: { productId: string }) => {
        const prod = stateRef.current.products.find((p) => p.id === input.productId);
        if (!prod) throw new Error(`Product '${input.productId}' not found in inventory.`);
        setSelectedProduct(prod);
        triggerSpotlight(`prod-card-${prod.id}`);
        return {
          product: prod,
          warehouseAvailability: prod.warehouseStock,
          customizableOptions: prod.customization || null,
        };
      },
    });

    // 3. compare_products (NEW WEBMCP COMPARISON TOOL)
    host.registerTool({
      name: "compare_products",
      description: "Compare 2 to 4 hardware products side-by-side on specifications, prices, stock, ratings, and carbon metrics with automated AI ranking.",
      inputSchema: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of 2-4 product IDs to compare (e.g., ['prod-keyboard-01', 'prod-mouse-06'])",
          },
          criteria: {
            type: "array",
            items: { type: "string" },
            description: "Optional custom criteria to evaluate",
          },
        },
        required: ["productIds"],
      },
      execute: async (input: { productIds: string[]; criteria?: string[] }) => {
        const comparisonResult = compareProducts(input.productIds, input.criteria);
        triggerSpotlight("compare-view-matrix");
        return comparisonResult;
      },
    });

    // 3. customize_product_spec
    host.registerTool({
      name: "customize_product_spec",
      description: "Apply custom materials, precision laser engraving, RGB accent glow, and firmware profiles to hardware in the collaborative Studio.",
      inputSchema: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Product identifier to customize" },
          material: { type: "string", description: "Material finish (e.g., 'Brushed Titanium', 'Matte Obsidian', 'Aerospace Walnut')" },
          engravingText: { type: "string", description: "Custom laser engraving text (max 24 chars)" },
          accentGlow: { type: "string", description: "RGB accent glow color (e.g., 'Cyan Neon', 'Emerald', 'Solar Amber')" },
          firmwareProfile: { type: "string", description: "Target firmware preset" },
          engravingFont: { type: "string", description: "Font name: 'JetBrains Mono', 'Space Grotesk', 'Orbitron', 'Cinzel'" },
        },
        required: ["productId"],
      },
      execute: async (input: any) => {
        const prod = stateRef.current.products.find((p) => p.id === input.productId) || stateRef.current.products[0];
        setSelectedProduct(prod);
        setCustomConfig((prev) => ({
          material: input.material || prev.material,
          engravingText: input.engravingText !== undefined ? input.engravingText : prev.engravingText,
          accentGlow: input.accentGlow || prev.accentGlow,
          firmwareProfile: input.firmwareProfile || prev.firmwareProfile,
          engravingFont: input.engravingFont || prev.engravingFont,
        }));
        setCurrentView("studio");
        triggerSpotlight("studio-canvas-container");
        return {
          status: "customization_applied",
          productId: prod.id,
          appliedConfig: {
            material: input.material || stateRef.current.customConfig.material,
            engravingText: input.engravingText !== undefined ? input.engravingText : stateRef.current.customConfig.engravingText,
            accentGlow: input.accentGlow || stateRef.current.customConfig.accentGlow,
            firmwareProfile: input.firmwareProfile || stateRef.current.customConfig.firmwareProfile,
          },
          previewUrl: `/studio?product=${prod.id}`,
        };
      },
    });

    // 4. add_to_cart
    host.registerTool({
      name: "add_to_cart",
      description: "Add an item to the shopping cart with optional custom specs and quantity.",
      inputSchema: {
        type: "object",
        properties: {
          productId: { type: "string", description: "Product identifier" },
          quantity: { type: "number", description: "Quantity of items to add (default: 1)" },
          customConfig: {
            type: "object",
            description: "Custom specifications if customized",
          },
        },
        required: ["productId"],
      },
      execute: async (input: any) => {
        const prod = stateRef.current.products.find((p) => p.id === input.productId);
        if (!prod) throw new Error(`Product '${input.productId}' not found.`);
        addToCart(prod, input.quantity || 1, input.customConfig || stateRef.current.customConfig);
        triggerSpotlight("header-cart-btn");
        return {
          status: "added",
          productName: prod.name,
          quantity: input.quantity || 1,
        };
      },
    });

    // 5. stage_procurement_bundle
    host.registerTool({
      name: "stage_procurement_bundle",
      description: "Assemble a multi-item hardware bundle with priority logistics routing directly into the cart.",
      inputSchema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "number" },
              },
              required: ["productId"],
            },
            description: "List of products and quantities",
          },
          shippingTier: {
            type: "string",
            enum: ["standard_eco", "priority_orbital", "same_day_courier"],
            description: "Selected shipping tier",
          },
        },
        required: ["items"],
      },
      execute: async (input: any) => {
        let addedCount = 0;
        input.items.forEach((item: any) => {
          const prod = stateRef.current.products.find((p) => p.id === item.productId);
          if (prod) {
            addToCart(prod, item.quantity || 1);
            addedCount++;
          }
        });
        triggerSpotlight("header-cart-btn");
        return {
          status: "bundle_staged",
          itemsCount: addedCount,
          shippingTier: input.shippingTier || "priority_orbital",
        };
      },
    });

    // 6. negotiate_price_discount
    host.registerTool({
      name: "negotiate_price_discount",
      description: "Initiate dynamic algorithmic B2B discount negotiation with the store pricing engine.",
      inputSchema: {
        type: "object",
        properties: {
          requestedDiscountPct: { type: "number", description: "Requested discount percentage (1-30%)" },
          reasoning: { type: "string", description: "Justification (e.g. bulk order, hackathon sponsor, trade-in)" },
        },
        required: ["requestedDiscountPct"],
      },
      execute: async (input: any) => {
        const result = await startNegotiation(input.requestedDiscountPct, input.reasoning || "Agent negotiation request");
        triggerSpotlight("cart-negotiation-box");
        return result;
      },
    });

    // 7. request_human_confirmation
    host.registerTool({
      name: "request_human_confirmation",
      description: "Trigger a human-in-the-loop signoff modal on the user's screen. Pauses agent execution until human grants authorization.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", description: "Action key (e.g., 'checkout_signoff', 'bulk_purchase')" },
          title: { type: "string", description: "Modal title displayed to user" },
          details: { type: "string", description: "Context details and breakdown for human review" },
          payload: { type: "object", description: "Optional metadata" },
        },
        required: ["action", "title", "details"],
      },
      execute: async (input: any) => {
        const requestId = `req-${Date.now()}`;
        return new Promise((resolve) => {
          setPendingConfirmation({
            id: requestId,
            action: input.action,
            title: input.title,
            details: input.details,
            payload: input.payload || {},
            status: "pending",
            timestamp: new Date().toLocaleTimeString(),
          });
          setConfirmationResolver(() => (approved: boolean) => {
            resolve({
              confirmationId: requestId,
              decision: approved ? "APPROVED_BY_HUMAN" : "REJECTED_BY_HUMAN",
              timestamp: new Date().toISOString(),
            });
          });
        });
      },
    });

    // 8. execute_smart_checkout (STRICT HUMAN-IN-THE-LOOP SECURITY ENFORCEMENT)
    host.registerTool({
      name: "execute_smart_checkout",
      description: "Finalize payment and checkout for currently staged cart, generating verifiable receipt and escrow authorization. STRICTLY REQUIRES prior human authorization token from request_human_confirmation.",
      inputSchema: {
        type: "object",
        properties: {
          customerNotes: { type: "string", description: "Optional order instructions" },
          paymentMethod: { type: "string", enum: ["instant_escrow", "corporate_po", "apple_pay", "crypto_usdc"] },
        },
      },
      execute: async (input: any) => {
        const { cart, cartTotal, activeDiscountPct, lastHumanApproval } = stateRef.current;
        
        if (!cart || cart.length === 0) {
          throw new Error("Cannot checkout: procurement cart is empty.");
        }

        // STRICT GATE: Verify human authorization record
        const now = Date.now();
        const hasValidApproval =
          lastHumanApproval &&
          lastHumanApproval.approved === true &&
          !lastHumanApproval.used &&
          lastHumanApproval.expiresAt > now;

        if (!hasValidApproval) {
          throw new Error(
            "SECURITY VIOLATION [HITL-001]: Unauthorized financial transaction blocked. 'execute_smart_checkout' requires prior human authorization via 'request_human_confirmation' tool with decision APPROVED_BY_HUMAN. Human approval token missing or expired."
          );
        }

        // Invalidate token immediately upon use to prevent replay
        setLastHumanApproval((prev) => (prev ? { ...prev, used: true } : null));

        const orderId = `AURA-${Date.now().toString(36).toUpperCase()}`;
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        const summary = {
          orderId,
          status: "CONFIRMED_ESCROW_LOCKED",
          itemsCount: cart.reduce((a, b) => a + b.quantity, 0),
          totalCharged: cartTotal,
          discountApplied: `${activeDiscountPct}%`,
          estimatedDeliveryDays: 2,
          trackingToken: `TRK-AURA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          hitlApprovalToken: lastHumanApproval.token,
        };

        // Clear cart AND reset negotiation discount so it does not persist across future sessions
        clearCart();
        return summary;
      },
    });

    // 9. simulate_supply_chain_dispatch
    host.registerTool({
      name: "simulate_supply_chain_dispatch",
      description: "Calculate optimal multi-hub warehouse dispatch, carrier selection, and carbon footprint.",
      inputSchema: {
        type: "object",
        properties: {
          destinationZip: { type: "string", description: "Customer postal code (e.g. '94107')" },
          warehousePriority: {
            type: "string",
            enum: ["fastest_speed", "lowest_carbon", "balanced_cost"],
            description: "Routing optimization strategy",
          },
        },
        required: ["destinationZip"],
      },
      execute: async (input: any) => {
        const hubs = ["San Francisco Hub Alpha", "London Gateway Hub", "Tokyo Orbital Depot"];
        const hub = input.warehousePriority === "lowest_carbon" ? hubs[0] : hubs[Math.floor(Math.random() * hubs.length)];
        const dispatchRecord: LogisticsDispatch = {
          orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
          originHub: hub,
          destinationZip: input.destinationZip,
          courier: "Orbital Electric Freight (Zero-Emission)",
          estimatedArrival: "Within 48 hours",
          carbonOffsetTons: 0.042,
          status: "in_transit",
        };
        setDispatches((prev) => [dispatchRecord, ...prev]);
        return dispatchRecord;
      },
    });

    // 10. trigger_ui_highlight
    host.registerTool({
      name: "trigger_ui_highlight",
      description: "Direct human visual attention by illuminating a DOM element on screen.",
      inputSchema: {
        type: "object",
        properties: {
          elementId: { type: "string", description: "HTML element ID to highlight" },
          durationMs: { type: "number", description: "Highlight duration in milliseconds" },
        },
        required: ["elementId"],
      },
      execute: async (input: any) => {
        triggerSpotlight(input.elementId, input.durationMs || 3000);
        return { highlighted: input.elementId, status: "spotlight_active" };
      },
    });

    // 11. query_live_metrics
    host.registerTool({
      name: "query_live_metrics",
      description: "Query real-time store telemetry, inventory valuation, active discounts, and environmental metrics.",
      inputSchema: {
        type: "object",
        properties: {
          metricType: {
            type: "string",
            enum: ["catalog_overview", "cart_state", "sustainability", "full_telemetry"],
          },
        },
      },
      execute: async () => {
        const { products, cart, cartTotal, activeDiscountPct } = stateRef.current;
        return {
          totalProducts: products.length,
          totalStockUnits: products.reduce((a, b) => a + b.stock, 0),
          cartItems: cart.length,
          cartTotalUSD: cartTotal,
          activeDiscountPct: activeDiscountPct,
          totalCarbonSavingsKg: (products.length * 1.4).toFixed(1),
          webMCPSpecCompliance: "100% (document.modelContext active)",
        };
      },
    });

    // 12. stream_agent_activity (Supervision & Live Activity Trace)
    host.registerTool({
      name: "stream_agent_activity",
      description: "Publish live activity updates, progress markers, and trace events to the supervision feed.",
      inputSchema: {
        type: "object",
        properties: {
          activity: { type: "string", description: "Agent activity summary or milestone text" },
          phase: {
            type: "string",
            enum: ["DISCOVERY", "INSPECTION", "COMPARISON", "CUSTOMIZATION", "NEGOTIATION", "HUMAN_APPROVAL", "EXECUTION", "COMPLETED"],
            description: "Supervision lifecycle phase",
          },
          details: { type: "string", description: "Optional detailed telemetry notes" },
        },
        required: ["activity"],
      },
      execute: async (input: any) => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `trace-${Date.now()}`,
            sender: "system",
            text: `📡 [WebMCP Activity (${input.phase || "EXECUTION"})]: ${input.activity}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return { status: "activity_recorded", activity: input.activity, phase: input.phase || "EXECUTION" };
      },
    });

    // Backward compatible alias for stream_agent_scratchpad
    host.registerTool({
      name: "stream_agent_scratchpad",
      description: "Publish intermediate agent reasoning or research notes to the user's live UI scratchpad.",
      inputSchema: {
        type: "object",
        properties: {
          thought: { type: "string", description: "Agent internal reasoning text" },
          confidenceScore: { type: "number", description: "Confidence rating (0.0 - 1.0)" },
        },
        required: ["thought"],
      },
      execute: async (input: any) => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `scratch-${Date.now()}`,
            sender: "system",
            text: `🧠 [WebMCP Scratchpad]: ${input.thought}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return { status: "scratchpad_updated" };
      },
    });

    // 13. set_app_theme (Dynamic Theme & Accessibility Customizer)
    host.registerTool({
      name: "set_app_theme",
      description: "Switch application theme or high-visibility contrast mode (dark_obsidian, clean_light, cyber_neon, warm_editorial).",
      inputSchema: {
        type: "object",
        properties: {
          themeId: {
            type: "string",
            enum: ["dark_obsidian", "clean_light", "cyber_neon", "warm_editorial"],
            description: "Theme preset ID to activate",
          },
        },
        required: ["themeId"],
      },
      execute: async (input: any) => {
        const themeId = input.themeId as ThemeMode;
        if (["dark_obsidian", "clean_light", "cyber_neon", "warm_editorial"].includes(themeId)) {
          handleSetTheme(themeId);
          triggerSpotlight("theme-selector-bar");
          return {
            status: "theme_applied",
            activeTheme: themeId,
            description: THEME_PRESETS.find((t) => t.id === themeId)?.name || themeId,
          };
        }
        return { error: "Invalid themeId provided." };
      },
    });

    // Subscribe to logs once
    const unsubLogs = host.subscribeLogs((log) => {
      setToolLogs((prev) => [log, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubLogs();
    };
  }, [addToCart, clearCart, startNegotiation]);

  // Send message to agent with iterative observe-and-act execution loop
  const sendAgentMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "human",
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAgentRunning(true);

    const agentMsgId = `agent-${Date.now()}`;
    const toolCallsList: NonNullable<AgentChatMessage["toolCalls"]> = [];
    const executionHistory: Array<{
      stepIndex: number;
      tool: string;
      args: any;
      result: any;
      purpose?: string;
      status: string;
    }> = [];

    // Initialize agent message placeholder in UI
    setChatMessages((prev) => [
      ...prev,
      {
        id: agentMsgId,
        sender: "agent",
        text: "Analyzing goal and formulating first WebMCP action...",
        timestamp: new Date().toLocaleTimeString(),
        toolCalls: [],
      },
    ]);

    try {
      const tools = webMCPHost.getRegisteredTools().map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));

      let isDone = false;
      let stepIndex = 0;
      const MAX_STEPS = 8;
      let finalSummary = "";
      let lastRationale = "";
      let latestTelemetry: any = null;

      while (!isDone && stepIndex < MAX_STEPS) {
        const contextState = {
          currentView,
          cartCount: stateRef.current.cart.length,
          cartTotal: stateRef.current.cart.reduce((s, i) => s + i.product.price * i.quantity, 0),
          selectedProduct: stateRef.current.selectedProduct
            ? {
                id: stateRef.current.selectedProduct.id,
                name: stateRef.current.selectedProduct.name,
                price: stateRef.current.selectedProduct.price,
              }
            : null,
          activeDiscountPct,
          products: stateRef.current.products,
        };

        let stepData: any;
        try {
          const response = await fetch("/api/agent/step", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userGoal: userText,
              history: executionHistory,
              tools,
              contextState,
              stepIndex,
            }),
          });

          const rawText = await response.text();
          if (rawText.trim().startsWith("<") || !response.ok) {
            throw new Error(`Server returned status ${response.status}: Non-JSON response`);
          }
          stepData = JSON.parse(rawText);
        } catch (fetchErr: any) {
          console.warn("Server endpoint unavailable (e.g. static CDN/Netlify deployment), using client WebMCP state machine:", fetchErr?.message);
          
          // Pure client-side WebMCP planner fallback: executes on static CDNs (Netlify, Vercel, GitHub Pages)
          const clientDecision = getClientFallbackStep(userText, executionHistory, tools, contextState);
          stepData = {
            done: clientDecision.done,
            rationale: clientDecision.rationale || clientDecision.thought,
            thought: clientDecision.thought || clientDecision.rationale,
            nextStep: clientDecision.nextStep,
            finalMessage: clientDecision.finalMessage,
            telemetry: {
              primary: { name: "Gemini 3.7 Flash", status: "failed", error: "Backend API not present on static CDN" },
              backup: { name: "Gemini 3.1 Flash Lite", status: "failed", error: "Backend API not present on static CDN" },
              fallback: { name: "Client WebMCP State Machine", status: "success", latencyMs: 1, strategy: "In-Browser State Machine" },
              resolvedBy: "fallback",
              totalLatencyMs: 1,
              timestamp: new Date().toLocaleTimeString(),
            },
          };
        }

        if (stepData.telemetry) {
          latestTelemetry = stepData.telemetry;
        }

        lastRationale = stepData.rationale || stepData.thought || lastRationale;

        if (stepData.error) {
          isDone = true;
          finalSummary = stepData.finalMessage || `Safe halt: ${stepData.error}`;
          break;
        }

        if (stepData.done) {
          isDone = true;
          finalSummary = stepData.finalMessage || "Autonomous workflow completed successfully.";
          break;
        }

        const nextStep = stepData.nextStep;
        if (!nextStep || !nextStep.tool) {
          isDone = true;
          finalSummary = stepData.finalMessage || "All available tool operations executed.";
          break;
        }

        // Add running step to UI
        const currentCallIndex = toolCallsList.length;
        toolCallsList.push({
          tool: nextStep.tool,
          args: nextStep.args,
          purpose: nextStep.purpose || `Executing ${nextStep.tool}`,
          status: "running",
        });

        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  rationale: lastRationale,
                  thought: lastRationale,
                  telemetry: latestTelemetry,
                  text: `Executing step ${stepIndex + 1}: ${nextStep.purpose || nextStep.tool}...`,
                  toolCalls: [...toolCallsList],
                }
              : m
          )
        );

        // Execute Tool in WebMCP Runtime
        try {
          const result = await webMCPHost.invokeTool(nextStep.tool, nextStep.args, "agent");

          toolCallsList[currentCallIndex] = {
            ...toolCallsList[currentCallIndex],
            result,
            status: "done",
          };

          executionHistory.push({
            stepIndex,
            tool: nextStep.tool,
            args: nextStep.args,
            result,
            purpose: nextStep.purpose,
            status: "done",
          });

          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId
                ? {
                    ...m,
                    rationale: lastRationale,
                    thought: lastRationale,
                    telemetry: latestTelemetry,
                    toolCalls: [...toolCallsList],
                  }
                : m
            )
          );
        } catch (execErr: any) {
          console.warn(`WebMCP tool failure at step ${stepIndex} (${nextStep.tool}):`, execErr);

          toolCallsList[currentCallIndex] = {
            ...toolCallsList[currentCallIndex],
            result: { error: execErr.message || String(execErr) },
            status: "failed",
          };

          executionHistory.push({
            stepIndex,
            tool: nextStep.tool,
            args: nextStep.args,
            result: { error: execErr.message || String(execErr) },
            purpose: nextStep.purpose,
            status: "failed",
          });

          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId
                ? {
                    ...m,
                    rationale: lastRationale,
                    thought: lastRationale,
                    telemetry: latestTelemetry,
                    toolCalls: [...toolCallsList],
                  }
                : m
            )
          );

          if (nextStep.tool === "execute_smart_checkout" && execErr.message?.includes("SECURITY VIOLATION")) {
            finalSummary = "Autonomous checkout was safely blocked by security gate: Human sign-off was cancelled or missing.";
            break;
          }
        }

        stepIndex++;
      }

      // Update final message
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsgId
            ? {
                ...m,
                rationale: lastRationale,
                thought: lastRationale,
                telemetry: latestTelemetry,
                text: finalSummary || `Completed all ${toolCallsList.length} verified WebMCP tool steps.`,
                toolCalls: [...toolCallsList],
              }
            : m
        )
      );
    } catch (err: any) {
      console.error("Observe-and-act agent error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "system",
          text: `⚠️ Agent runtime error: ${err.message || String(err)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const invokeToolDirectly = async (toolName: string, input: any) => {
    return webMCPHost.invokeTool(toolName, input, "human_inspector");
  };

  const clearLogs = () => {
    webMCPHost.clearLogs();
    setToolLogs([]);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        selectedProduct,
        setSelectedProduct,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartSubtotal,
        activeDiscountPct,
        cartTotal,
        currentView,
        setCurrentView,
        theme,
        setTheme: handleSetTheme,
        customConfig,
        setCustomConfig,
        negotiation,
        negotiationReport,
        startNegotiation,
        acceptNegotiationOffer,
        resetNegotiation,
        activeComparison,
        setActiveComparison,
        compareProducts,
        pendingConfirmation,
        resolveConfirmation,
        lastHumanApproval,
        chatMessages,
        sendAgentMessage,
        isAgentRunning,
        toolLogs,
        clearLogs,
        dispatches,
        invokeToolDirectly,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

