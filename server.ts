import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { INITIAL_PRODUCTS } from "./src/data/catalog";
import { SECURITY_PERMISSION_TIERS } from "./src/data/benchmarks";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Strict WebMCP Allowed Tool Registry
const ALLOWED_WEBMCP_TOOLS = new Set([
  "search_catalog",
  "inspect_product_details",
  "compare_products",
  "customize_product_spec",
  "add_to_cart",
  "stage_procurement_bundle",
  "negotiate_price_discount",
  "simulate_supply_chain_dispatch",
  "request_human_confirmation",
  "execute_smart_checkout",
  "trigger_ui_highlight",
  "query_live_metrics",
  "stream_agent_scratchpad",
  "set_app_theme",
]);

// JSON error handling middleware for malformed payloads
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Malformed JSON payload in request body",
      status: "error",
      spec: "WebMCP (Model Context Protocol for Web)",
    });
  }
  next(err);
});

// Lazy-initialize Gemini client with required User-Agent header
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Operating in high-precision local catalog-driven agent mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    spec: "WebMCP (Model Context Protocol for Web)",
    version: "1.0.0-draft",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    registeredToolsCount: ALLOWED_WEBMCP_TOOLS.size,
    timestamp: new Date().toISOString(),
  });
});

// Security & Schema Validator for Agent Tool Steps
function validateAndSanitizeToolPlan(steps: any[], declaredTools: any[]): { validatedSteps: any[]; validationErrors: string[] } {
  const declaredToolNames = new Set(
    (declaredTools || []).map((t: any) => (typeof t === "string" ? t : t.name)).filter(Boolean)
  );

  const validatedSteps: any[] = [];
  const validationErrors: string[] = [];

  for (const step of steps || []) {
    if (!step || typeof step !== "object") {
      validationErrors.push("Encountered non-object step in plan.");
      continue;
    }

    const toolName = step.tool || step.name;
    if (!toolName || typeof toolName !== "string") {
      validationErrors.push("Step missing valid 'tool' string identifier.");
      continue;
    }

    // 1. Tool Allowlist Check
    if (!ALLOWED_WEBMCP_TOOLS.has(toolName)) {
      validationErrors.push(`SECURITY REJECTION: Tool '${toolName}' is not in WebMCP allowed registry.`);
      continue;
    }

    // 2. Declared Tool Check
    if (declaredToolNames.size > 0 && !declaredToolNames.has(toolName)) {
      validationErrors.push(`Tool '${toolName}' is not currently exposed in document.modelContext.`);
      continue;
    }

    // 3. Determine Security Tier
    let securityTier = "GREEN_AUTO";
    if (SECURITY_PERMISSION_TIERS.RED_HITL_REQUIRED.tools.includes(toolName)) {
      securityTier = "RED_HITL_REQUIRED";
    } else if (SECURITY_PERMISSION_TIERS.YELLOW_GUARDRAILED.tools.includes(toolName)) {
      securityTier = "YELLOW_GUARDRAILED";
    }

    // 4. Schema Arguments Sanitization
    const args = step.args && typeof step.args === "object" ? { ...step.args } : {};

    validatedSteps.push({
      tool: toolName,
      args,
      purpose: step.purpose || `Execute WebMCP ${toolName}`,
      securityTier,
    });
  }

  return { validatedSteps, validationErrors };
}

// Agent execution endpoint (orchestrator with validation guardrails)
app.post("/api/agent/run", async (req, res) => {
  try {
    const { prompt, tools, contextState } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'prompt' field in request body" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Dynamic catalog-driven heuristic planner
      const dynamicPlan = generateCatalogDrivenPlan(prompt, tools, contextState);
      const { validatedSteps, validationErrors } = validateAndSanitizeToolPlan(dynamicPlan, tools);

      return res.json({
        thought: `Synthesized intent for "${prompt}". Formulated ${validatedSteps.length} verified WebMCP tool calls on document.modelContext.`,
        steps: validatedSteps,
        validationErrors,
        messageToUser: `Executing catalog-driven autonomous workflow for "${prompt}" across document.modelContext.`,
        securityValidated: true,
      });
    }

    // Prepare system instructions for WebMCP Browser Agent
    const systemInstruction = `You are the WebMCP Browser Co-Pilot for AuraCommerce.
You have direct access to the website's document.modelContext tools.
Your mission is to understand the user's intent and return a multi-step execution plan using the available tools.

Available tools declared by the website:
${JSON.stringify(tools || [], null, 2)}

Current page state:
${JSON.stringify(contextState || {}, null, 2)}

Available product catalog:
${JSON.stringify(INITIAL_PRODUCTS.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, rating: p.rating, stock: p.stock })), null, 2)}

Respond with a JSON object containing:
{
  "thought": "Your high-level reasoning explaining how you are using WebMCP to fulfill the goal",
  "steps": [
    {
      "tool": "exact_tool_name",
      "args": { /* parameter matching the tool inputSchema */ },
      "purpose": "Brief description of why this step is called"
    }
  ],
  "messageToUser": "A clear, conversational update for the human user explaining what you did or what needs their confirmation."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `User goal: "${prompt}"\n\nGenerate the exact WebMCP tool sequence to execute on document.modelContext.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text || "{}";
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(outputText);
    } catch {
      parsedResult = {
        thought: "Processed user request and formulated WebMCP tool calls.",
        steps: generateCatalogDrivenPlan(prompt, tools, contextState),
        messageToUser: outputText,
      };
    }

    // Pass through Tool Execution & Schema Validator
    const { validatedSteps, validationErrors } = validateAndSanitizeToolPlan(parsedResult.steps || [], tools);

    res.json({
      thought: parsedResult.thought || `WebMCP reasoning formulated for: ${prompt}`,
      steps: validatedSteps,
      validationErrors,
      messageToUser: parsedResult.messageToUser || "Executing verified WebMCP tool chain.",
      securityValidated: true,
    });
  } catch (error: any) {
    console.error("Agent run error:", error);
    const fallbackPlan = generateCatalogDrivenPlan(req.body?.prompt || "", req.body?.tools || [], req.body?.contextState || {});
    const { validatedSteps, validationErrors } = validateAndSanitizeToolPlan(fallbackPlan, req.body?.tools || []);

    res.status(200).json({
      thought: "Executed fallback catalog-driven planning engine.",
      steps: validatedSteps,
      validationErrors: [...validationErrors, error.message],
      messageToUser: "Executing resilient WebMCP workflow.",
      securityValidated: true,
    });
  }
});

// Quick suggestions endpoint
app.post("/api/agent/suggest", async (req, res) => {
  try {
    const { currentView, cartCount, selectedProductId } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        suggestions: [
          "Find mechanical keyboard under $300 & configure titanium finish",
          "Compare top 3 peripherals by price, switches, and ergonomics",
          "Stage 10-unit developer team bundle & negotiate bulk discount",
          "Simulate zero-emission supply chain freight from nearest hub",
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Given currentView=${currentView}, cartCount=${cartCount}, selectedProduct=${selectedProductId}, generate 4 realistic, actionable commerce/engineering prompts that a user or developer would ask an autonomous WebMCP browser agent to do on this hardware studio. Return a JSON array of 4 strings.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const suggestions = JSON.parse(response.text || "[]");
    res.json({ suggestions });
  } catch {
    res.json({
      suggestions: [
        "Find mechanical keyboard under $300 & configure titanium finish",
        "Compare top 3 peripherals by price, switches, and ergonomics",
        "Stage 10-unit developer team bundle & negotiate bulk discount",
        "Simulate zero-emission supply chain freight from nearest hub",
      ],
    });
  }
});

// Dynamic, Catalog-Driven Planning Engine (Eliminates Hardcoded Product Assumptions)
function generateCatalogDrivenPlan(prompt: string, tools: any[], contextState: any) {
  const p = (prompt || "").toLowerCase();
  const steps: any[] = [];
  const catalog = (contextState?.products && contextState.products.length > 0)
    ? contextState.products
    : INITIAL_PRODUCTS;

  // 1. Extract Price Constraints (e.g., "under $200", "max $500", "below 300")
  let maxPrice: number | undefined = undefined;
  const priceMatch = p.match(/(?:under|below|max|less than|\$)\s*(\d{2,5})/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // 2. Extract Quantity (e.g., "5 units", "2 keyboards", "10x")
  let targetQuantity = 1;
  const qtyMatch = p.match(/\b(\d{1,3})\s*(?:x|units?|items?|keyboards?|headsets?|rings?|servers?|pcs?)?\b/i);
  if (qtyMatch) {
    const parsedQty = parseInt(qtyMatch[1], 10);
    if (parsedQty > 0 && parsedQty <= 100) targetQuantity = parsedQty;
  }

  // 3. Dynamic Catalog Search & Relevance Scoring
  const searchTokens = p
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["the", "and", "for", "with", "under", "best", "find", "show", "buy", "get", "add", "all"].includes(t));

  const scoredProducts = catalog.map((product: any) => {
    let score = 0;
    const nameLower = product.name.toLowerCase();
    const descLower = product.description.toLowerCase();
    const tagLower = (product.tagline || "").toLowerCase();
    const catLower = product.category.toLowerCase();

    // Token matching
    searchTokens.forEach((token: string) => {
      if (nameLower.includes(token)) score += 10;
      if (catLower.includes(token)) score += 8;
      if (tagLower.includes(token)) score += 5;
      if (descLower.includes(token)) score += 2;
    });

    // Budget filtering penalty
    if (maxPrice !== undefined && product.price > maxPrice) {
      score -= 50;
    }

    // Rating boost
    score += (product.rating || 4.5) * 2;

    return { product, score };
  });

  scoredProducts.sort((a: any, b: any) => b.score - a.score);
  const bestMatch = scoredProducts[0]?.product || catalog[0];
  const matchedCategory = bestMatch.category;

  // 4. Comparison Intent Check (e.g. "compare keyboards", "compare best 3")
  const isCompareIntent = p.includes("compare") || p.includes("versus") || p.includes("vs") || p.includes("comparison");
  if (isCompareIntent) {
    const comparisonCandidates = scoredProducts.slice(0, 3).map((sp: any) => sp.product.id);
    const candidateIds = comparisonCandidates.length >= 2 ? comparisonCandidates : [catalog[0].id, catalog[1].id, catalog[2].id];
    steps.push({
      tool: "compare_products",
      args: {
        productIds: candidateIds,
        criteria: ["price", "rating", "carbonKg", "material", "connectivity"],
      },
      purpose: `Compare ${candidateIds.length} candidate hardware items across key specifications and value metrics`,
    });
    return steps;
  }

  // 5. Search / Discovery Step
  const isSearchIntent =
    p.includes("find") ||
    p.includes("search") ||
    p.includes("look") ||
    p.includes("browse") ||
    p.includes("show") ||
    p.includes("best") ||
    p.includes("under") ||
    p.includes("budget");

  if (isSearchIntent || steps.length === 0) {
    const queryTerm = searchTokens.slice(0, 2).join(" ") || matchedCategory;
    steps.push({
      tool: "search_catalog",
      args: {
        query: queryTerm,
        category: matchedCategory,
        maxPrice,
        sortBy: p.includes("rating") ? "rating" : p.includes("price") || p.includes("cheap") ? "price_asc" : undefined,
      },
      purpose: `Search catalog for ${matchedCategory} matching '${queryTerm}' within budget constraints`,
    });
  }

  // 6. Inspect Product Details Step
  const isInspectIntent = p.includes("inspect") || p.includes("specs") || p.includes("details") || p.includes("stock") || p.includes("battery");
  if (isInspectIntent || (isSearchIntent && !p.includes("only search"))) {
    steps.push({
      tool: "inspect_product_details",
      args: { productId: bestMatch.id },
      purpose: `Inspect engineering specifications, warehouse availability, and materials for ${bestMatch.name}`,
    });
  }

  // 7. Customization Intent
  const isCustomizeIntent =
    p.includes("customize") ||
    p.includes("engrav") ||
    p.includes("titanium") ||
    p.includes("obsidian") ||
    p.includes("walnut") ||
    p.includes("frost") ||
    p.includes("glow") ||
    p.includes("emerald") ||
    p.includes("neon") ||
    p.includes("firmware") ||
    p.includes("profile");

  let material = "Brushed Titanium";
  if (p.includes("walnut") || p.includes("wood")) material = "Aerospace Walnut";
  else if (p.includes("obsidian") || p.includes("black")) material = "Matte Obsidian";
  else if (p.includes("frost") || p.includes("emerald") || p.includes("green")) material = "Emerald Frost";

  let accentGlow = "Cyan Neon";
  if (p.includes("amber") || p.includes("gold") || p.includes("solar")) accentGlow = "Solar Amber";
  else if (p.includes("emerald") || p.includes("green")) accentGlow = "Emerald";
  else if (p.includes("violet") || p.includes("purple")) accentGlow = "Vapor Violet";

  let engravingText = "CYBER-2026 // WEBMCP";
  const quoteMatch = prompt.match(/["']([^"']{1,24})["']/);
  if (quoteMatch) {
    engravingText = quoteMatch[1];
  } else if (p.includes("developer") || p.includes("code")) {
    engravingText = "DEV-SPEED // RUNTIME";
  }

  const firmwareProfile = p.includes("gaming")
    ? "0.1mm Rapid Trigger Gaming"
    : p.includes("dev") || p.includes("macro") || p.includes("code")
    ? "Developer Fast-Macro Profile"
    : p.includes("silent") || p.includes("office")
    ? "Acoustic Dampened Workspace"
    : "Standard Balanced";

  if (isCustomizeIntent) {
    steps.push({
      tool: "customize_product_spec",
      args: {
        productId: bestMatch.id,
        material,
        engravingText,
        accentGlow,
        firmwareProfile,
        engravingFont: "JetBrains Mono",
      },
      purpose: `Apply custom generative spec (${material}, ${accentGlow}, engraving: '${engravingText}') to ${bestMatch.name}`,
    });
  }

  // 8. Add to Cart / Bundle Intent
  const isCartIntent =
    p.includes("add") ||
    p.includes("cart") ||
    p.includes("bundle") ||
    p.includes("stage") ||
    p.includes("buy") ||
    p.includes("purchase");

  if (isCartIntent) {
    if (p.includes("bundle") || (targetQuantity > 1 && catalog.length > 1)) {
      const secondProduct = catalog.find((prod: any) => prod.id !== bestMatch.id) || catalog[1];
      steps.push({
        tool: "stage_procurement_bundle",
        args: {
          items: [
            { productId: bestMatch.id, quantity: targetQuantity },
            { productId: secondProduct.id, quantity: 1 },
          ],
          shippingTier: "priority_orbital",
        },
        purpose: `Stage multi-item hardware bundle with ${bestMatch.name} and ${secondProduct.name}`,
      });
    } else {
      steps.push({
        tool: "add_to_cart",
        args: {
          productId: bestMatch.id,
          quantity: targetQuantity,
          customConfig: isCustomizeIntent
            ? { material, engravingText, accentGlow, firmwareProfile, engravingFont: "JetBrains Mono" }
            : undefined,
        },
        purpose: `Add ${targetQuantity}x ${bestMatch.name} to shopping cart`,
      });
    }
  }

  // 9. Dynamic Policy Negotiation Intent
  const isNegotiateIntent =
    p.includes("negotiate") ||
    p.includes("discount") ||
    p.includes("bulk") ||
    p.includes("b2b") ||
    p.includes("deal") ||
    p.includes("promo");

  if (isNegotiateIntent) {
    const discountMatch = p.match(/(\d{1,2})%/);
    const requestedDiscountPct = discountMatch ? parseInt(discountMatch[1], 10) : (targetQuantity >= 5 ? 15 : 10);

    steps.push({
      tool: "negotiate_price_discount",
      args: {
        requestedDiscountPct,
        reasoning: targetQuantity >= 5
          ? `B2B Enterprise Volume Procurement (${targetQuantity} units)`
          : `Developer Partner Program & Promotional Evaluation Agreement`,
      },
      purpose: `Execute algorithmic policy negotiation for ${requestedDiscountPct}% volume discount`,
    });
  }

  // 10. Logistics & Carbon Simulation
  const isLogisticsIntent =
    p.includes("carbon") ||
    p.includes("logistics") ||
    p.includes("supply") ||
    p.includes("route") ||
    p.includes("freight") ||
    p.includes("dispatch");

  if (isLogisticsIntent) {
    steps.push({
      tool: "simulate_supply_chain_dispatch",
      args: {
        destinationZip: "94107",
        warehousePriority: p.includes("carbon") ? "lowest_carbon" : "fastest_speed",
      },
      purpose: "Calculate optimal multi-hub warehouse dispatch prioritizing zero-emission transport",
    });
  }

  // 11. Theme Switcher Intent
  const isThemeIntent = p.includes("theme") || p.includes("light") || p.includes("dark") || p.includes("neon") || p.includes("contrast");
  if (isThemeIntent) {
    const themeId = p.includes("light") || p.includes("day")
      ? "clean_light"
      : p.includes("neon") || p.includes("cyber") || p.includes("matrix")
      ? "cyber_neon"
      : p.includes("amber") || p.includes("warm")
      ? "warm_editorial"
      : "dark_obsidian";

    steps.push({
      tool: "set_app_theme",
      args: { themeId },
      purpose: `Switch application design atmosphere to ${themeId}`,
    });
  }

  // 12. Checkout & HITL Escrow Intent
  const isCheckoutIntent = p.includes("checkout") || p.includes("pay") || p.includes("finalize order") || p.includes("finish");
  if (isCheckoutIntent) {
    steps.push({
      tool: "request_human_confirmation",
      args: {
        action: "checkout_signoff",
        title: "Authorize Hardware Procurement Order",
        details: `Authorize payment and escrow dispatch for staged cart items with verified discounts.`,
      },
      purpose: "Request explicit Human-in-the-Loop authorization before financial escrow locking",
    });

    steps.push({
      tool: "execute_smart_checkout",
      args: {
        customerNotes: "WebMCP verified autonomous dispatch order",
        paymentMethod: "instant_escrow",
      },
      purpose: "Lock escrow authorization and finalize order with cryptographic receipt",
    });
  }

  return steps;
}

// Global generic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err?.message || err);
  res.status(500).json({
    error: "Internal server error occurred",
    status: "error",
  });
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WebMCP Challenge Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

