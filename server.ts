import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// JSON error handling middleware for malformed payloads (Bug 6 fix)
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
    console.warn("GEMINI_API_KEY is not set. Operating in high-precision local deterministic agent mode.");
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
    timestamp: new Date().toISOString(),
  });
});

// Agent execution endpoint (orchestrator)
app.post("/api/agent/run", async (req, res) => {
  try {
    const { prompt, tools, contextState } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'prompt' field in request body" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback local smart heuristic planner if API key not present
      const heuristicPlan = generateLocalHeuristicPlan(prompt, tools, contextState);
      return res.json({
        thought: `Synthesized intent for "${prompt}". Formulated ${heuristicPlan.length} WebMCP tool calls on document.modelContext.`,
        steps: heuristicPlan,
        messageToUser: `Executing autonomous workflow for "${prompt}" across document.modelContext.`,
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
    let parsedResult;
    try {
      parsedResult = JSON.parse(outputText);
    } catch {
      parsedResult = {
        thought: "Processed user request and formulated WebMCP tool calls.",
        steps: generateLocalHeuristicPlan(prompt, tools, contextState),
        messageToUser: outputText,
      };
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error("Agent run error:", error);
    res.status(500).json({
      error: error.message || "Failed to execute agent reasoning",
      fallbackPlan: generateLocalHeuristicPlan(req.body?.prompt || "", req.body?.tools || [], req.body?.contextState || {}),
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
          "Find best audio gear & negotiate 15% discount",
          "Customize titanium keyboard with laser engraving & stage checkout",
          "Run carbon-neutral supply chain analysis on catalog",
          "Compare high-speed SSD arrays across all warehouse hubs",
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Given currentView=${currentView}, cartCount=${cartCount}, selectedProduct=${selectedProductId}, generate 4 short, highly compelling action prompts that a human user would ask their browser WebMCP agent to do on this commerce studio. Return a JSON array of 4 strings.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const suggestions = JSON.parse(response.text || "[]");
    res.json({ suggestions });
  } catch {
    res.json({
      suggestions: [
        "Find best audio gear & negotiate 15% discount",
        "Customize titanium keyboard with laser engraving & stage checkout",
        "Run carbon-neutral supply chain analysis on catalog",
        "Compare high-speed SSD arrays across all warehouse hubs",
      ],
    });
  }
});

// Intelligent, prompt-aware local heuristic fallback planner (Bug 4 fix)
function generateLocalHeuristicPlan(prompt: string, tools: any[], contextState: any) {
  const p = (prompt || "").toLowerCase();
  const steps: any[] = [];

  // 1. Identify target product & category from prompt or context
  let targetProductId = contextState?.selectedProduct?.id || "prod-keyboard-01";
  let targetCategory: string | undefined = undefined;
  let targetProductName = "Aura Hardware";

  if (p.includes("audio") || p.includes("deck") || p.includes("sound") || p.includes("speaker") || p.includes("headphone") || p.includes("spatial")) {
    targetProductId = "prod-audio-02";
    targetCategory = "audio";
    targetProductName = "Aura Spatial Pulse Audio Deck";
  } else if (p.includes("ring") || p.includes("wearable") || p.includes("biosync") || p.includes("health") || p.includes("neural")) {
    targetProductId = "prod-wear-03";
    targetCategory = "wearables";
    targetProductName = "Aura BioSync Neural Ring";
  } else if (p.includes("server") || p.includes("blade") || p.includes("compute") || p.includes("workstation") || p.includes("gpu") || p.includes("obsidian")) {
    targetProductId = "prod-comp-04";
    targetCategory = "computing";
    targetProductName = "Aura Obsidian Blade Server";
  } else if (p.includes("controller") || p.includes("stream") || p.includes("studio") || p.includes("creator") || p.includes("quantum")) {
    targetProductId = "prod-stud-05";
    targetCategory = "studio";
    targetProductName = "Aura Quantum Stream Controller";
  } else if (p.includes("ssd") || p.includes("storage") || p.includes("nvme") || p.includes("array") || p.includes("drive") || p.includes("hyperdrive")) {
    targetProductId = "prod-comp-06";
    targetCategory = "computing";
    targetProductName = "Aura HyperDrive Gen5 NVMe Array";
  } else if (p.includes("keyboard") || p.includes("cyberclaw") || p.includes("switches") || p.includes("peripherals")) {
    targetProductId = "prod-keyboard-01";
    targetCategory = "peripherals";
    targetProductName = "Aura CyberClaw Pro Keyboard";
  }

  // 2. Extract requested discount percentage if mentioned
  const discountMatch = p.match(/(\d{1,2})%/);
  const requestedDiscountPct = discountMatch ? parseInt(discountMatch[1], 10) : 15;

  // 3. Extract quantity if specified
  const qtyMatch = p.match(/\b(\d{1,2})\s*(x|units?|items?|pcs?)?\b/);
  const targetQuantity = qtyMatch && parseInt(qtyMatch[1], 10) > 0 && parseInt(qtyMatch[1], 10) < 50 ? parseInt(qtyMatch[1], 10) : 1;

  // 4. Extract customization attributes
  const material = p.includes("walnut")
    ? "Aerospace Walnut"
    : p.includes("obsidian")
    ? "Matte Obsidian"
    : p.includes("copper")
    ? "Forged Copper"
    : "Brushed Titanium";

  const accentGlow = p.includes("emerald") || p.includes("green")
    ? "Emerald"
    : p.includes("amber") || p.includes("orange") || p.includes("gold")
    ? "Solar Amber"
    : p.includes("purple") || p.includes("violet")
    ? "Ultraviolet"
    : "Cyan Neon";

  // Extract engraving if in quotes or words
  let engravingText = "CYBER-2026 // WEBMCP";
  const quoteMatch = prompt.match(/["']([^"']{1,24})["']/);
  if (quoteMatch) {
    engravingText = quoteMatch[1];
  } else if (p.includes("hackathon")) {
    engravingText = "WEBMCP // 2026 WIN";
  }

  const firmwareProfile = p.includes("gaming")
    ? "Ultra-Low Latency Gaming"
    : p.includes("developer") || p.includes("code") || p.includes("macro")
    ? "Developer Fast-Macro Profile"
    : p.includes("audio") || p.includes("studio")
    ? "Studio Audio Stream Profile"
    : "Standard Balanced";

  // 5. Search / Catalog query
  const isSearchIntent =
    p.includes("search") ||
    p.includes("find") ||
    p.includes("show") ||
    p.includes("browse") ||
    p.includes("list") ||
    p.includes("look for") ||
    p.includes("filter");

  if (isSearchIntent) {
    // Extract actual query terms
    const cleanQuery = prompt.replace(/(search|find|show|browse|list|look for|filter|for|me|the|a)/gi, "").trim();
    steps.push({
      tool: "search_catalog",
      args: {
        query: cleanQuery || (targetCategory ? "" : "pro"),
        category: targetCategory,
        maxPrice: p.includes("under") || p.includes("max") ? 800 : undefined,
      },
      purpose: `Search catalog for matching ${targetCategory || "hardware"} items`,
    });
  }

  // 6. Inspect product details intent
  const isInspectIntent = p.includes("inspect") || p.includes("specs") || p.includes("details") || p.includes("stock");
  if (isInspectIntent) {
    steps.push({
      tool: "inspect_product_details",
      args: { productId: targetProductId },
      purpose: `Inspect engineering specifications and warehouse stock for ${targetProductName}`,
    });
  }

  // 7. Customization intent
  const isCustomizeIntent =
    p.includes("customize") ||
    p.includes("engrav") ||
    p.includes("walnut") ||
    p.includes("titanium") ||
    p.includes("obsidian") ||
    p.includes("glow") ||
    p.includes("emerald") ||
    p.includes("neon") ||
    p.includes("color") ||
    p.includes("firmware");

  if (isCustomizeIntent) {
    steps.push({
      tool: "customize_product_spec",
      args: {
        productId: targetProductId,
        material,
        engravingText,
        accentGlow,
        firmwareProfile,
        engravingFont: "JetBrains Mono",
      },
      purpose: `Apply generative customization (${material}, ${accentGlow}, engraving: '${engravingText}') in Studio`,
    });
  }

  // 8. Add to cart / Stage bundle intent (Bug 4 fix: actively supports add_to_cart)
  const isCartIntent =
    p.includes("add to cart") ||
    p.includes("add") ||
    p.includes("cart") ||
    p.includes("stage") ||
    p.includes("bundle") ||
    p.includes("buy") ||
    p.includes("order") ||
    p.includes("purchase");

  if (isCartIntent) {
    if (p.includes("bundle") || (targetQuantity > 1 && p.includes("audio"))) {
      steps.push({
        tool: "stage_procurement_bundle",
        args: {
          items: [
            { productId: targetProductId, quantity: targetQuantity },
            { productId: "prod-audio-02", quantity: 1 },
          ],
          shippingTier: "priority_orbital",
        },
        purpose: `Stage multi-item procurement bundle with ${targetProductName} into cart`,
      });
    } else {
      steps.push({
        tool: "add_to_cart",
        args: {
          productId: targetProductId,
          quantity: targetQuantity,
          customConfig: isCustomizeIntent
            ? {
                material,
                engravingText,
                accentGlow,
                firmwareProfile,
                engravingFont: "JetBrains Mono",
              }
            : undefined,
        },
        purpose: `Add ${targetQuantity}x ${targetProductName} to active shopping cart`,
      });
    }
  }

  // 9. Negotiate discount intent
  const isNegotiateIntent =
    p.includes("negotiate") ||
    p.includes("discount") ||
    p.includes("deal") ||
    p.includes("offer") ||
    p.includes("coupon") ||
    p.includes("promo") ||
    p.includes("b2b") ||
    p.includes("bulk");

  if (isNegotiateIntent) {
    steps.push({
      tool: "negotiate_price_discount",
      args: {
        requestedDiscountPct: requestedDiscountPct,
        reasoning: p.includes("hackathon")
          ? "WebMCP Hackathon Challenge Partner Procurement Agreement"
          : "B2B Volume Procurement and Enterprise Synergy Discount",
      },
      purpose: `Initiate algorithmic B2B negotiation for ${requestedDiscountPct}% discount`,
    });
  }

  // 10. Checkout & Human confirmation intent (Ensures HITL gate is paired with checkout)
  const isCheckoutIntent =
    p.includes("checkout") ||
    p.includes("order") ||
    p.includes("pay") ||
    p.includes("finish") ||
    p.includes("finalize");

  if (isCheckoutIntent) {
    // Human in the loop confirmation step
    steps.push({
      tool: "request_human_confirmation",
      args: {
        action: "checkout_signoff",
        title: "Approve Hardware Order Placement",
        details: `Authorize payment for staged cart with negotiated ${requestedDiscountPct}% discount.`,
      },
      purpose: "Execute Human-in-the-Loop authorization protocol before financial escrow",
    });

    // Execute checkout step (which is cryptographically verified by the context gate)
    steps.push({
      tool: "execute_smart_checkout",
      args: {
        customerNotes: "WebMCP verified autonomous dispatch order",
        paymentMethod: "instant_escrow",
      },
      purpose: "Finalize payment and lock escrow authorization",
    });
  }

  // 11. Logistics & Carbon calculation intent
  const isLogisticsIntent =
    p.includes("carbon") ||
    p.includes("logistics") ||
    p.includes("supply") ||
    p.includes("dispatch") ||
    p.includes("route") ||
    p.includes("freight") ||
    p.includes("ship");

  if (isLogisticsIntent) {
    steps.push({
      tool: "simulate_supply_chain_dispatch",
      args: {
        destinationZip: "94107",
        warehousePriority: p.includes("carbon") ? "lowest_carbon" : "fastest_speed",
      },
      purpose: "Simulate multi-hub warehouse routing with zero-emission freight",
    });
  }

  // Fallback if no specific trigger matched: exploratory search + metrics
  if (steps.length === 0) {
    steps.push({
      tool: "search_catalog",
      args: { query: p.length > 0 ? p.split(" ")[0] : "pro" },
      purpose: "Search catalog for hardware matching query",
    });
    steps.push({
      tool: "query_live_metrics",
      args: { metricType: "catalog_overview" },
      purpose: "Query live system state and telemetry",
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

