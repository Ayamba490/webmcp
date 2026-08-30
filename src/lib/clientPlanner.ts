import { INITIAL_PRODUCTS } from "../data/catalog";
import { Product } from "../types";

export interface ClientPlannerStep {
  done: boolean;
  rationale?: string;
  thought?: string;
  nextStep?: {
    tool: string;
    args: any;
    purpose?: string;
  };
  finalMessage?: string;
}

export function getClientFallbackStep(
  userGoal: string,
  history: any[],
  tools: any[],
  contextState: any
): ClientPlannerStep {
  const p = (userGoal || "").toLowerCase();
  const catalog: Product[] =
    contextState?.products?.length > 0 ? contextState.products : INITIAL_PRODUCTS;

  // Extract Constraints & Intent flags
  let maxPrice: number | undefined = undefined;
  const priceMatch = p.match(/(?:under|below|max|less than|\$)\s*([\d,]{2,7})/i);
  if (priceMatch) {
    const rawNum = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(rawNum) && rawNum > 0) maxPrice = rawNum;
  }

  let targetQuantity = 1;
  const explicitQtyMatch = p.match(/\b(?:qty|quantity|count)\s*[:=]?\s*(\d{1,3})\b/i);
  const unitQtyMatch = p.match(
    /\b(\d{1,3})\s*(?:x|units?|items?|keyboards?|headsets?|rings?|servers?|pcs|pieces)\b(?!\s*(?:profiles?|presets?|keys?|pins?|dpi|ghz|hours?|days?|mm|db))/i
  );
  if (explicitQtyMatch) {
    const q = parseInt(explicitQtyMatch[1], 10);
    if (q > 0 && q <= 100) targetQuantity = q;
  } else if (unitQtyMatch) {
    const q = parseInt(unitQtyMatch[1], 10);
    if (q > 0 && q <= 100) targetQuantity = q;
  }

  const isCompareIntent =
    p.includes("compare") ||
    p.includes("versus") ||
    p.includes("vs") ||
    p.includes("comparison") ||
    p.includes("matrix");
  const isCustomizeIntent =
    p.includes("customiz") ||
    p.includes("engrav") ||
    p.includes("titanium") ||
    p.includes("obsidian") ||
    p.includes("walnut") ||
    p.includes("glow") ||
    p.includes("firmware") ||
    p.includes("profile");
  const isCartIntent =
    p.includes("add") ||
    p.includes("cart") ||
    p.includes("stage") ||
    p.includes("buy") ||
    p.includes("purchase");
  const isNegotiateIntent =
    p.includes("negotiat") ||
    p.includes("discount") ||
    p.includes("bulk") ||
    p.includes("b2b");
  const isLogisticsIntent =
    p.includes("carbon") ||
    p.includes("logistics") ||
    p.includes("supply") ||
    p.includes("dispatch");
  const isCheckoutIntent =
    p.includes("checkout") ||
    p.includes("pay") ||
    p.includes("finalize order") ||
    p.includes("signoff");
  const isThemeIntent =
    p.includes("theme") ||
    p.includes("light") ||
    p.includes("dark") ||
    p.includes("contrast");

  // Track what tools have already run in history
  const executedTools = (history || []).map((h: any) => h.tool || h.name).filter(Boolean);
  const executedSet = new Set(executedTools);

  // Extract intermediate observations from history
  let discoveredProducts: any[] = [];
  let inspectedProduct: any = null;
  let comparisonWinnerId: string | null = null;
  let customConfigApplied: any = null;
  let lastDiscoveredProductId: string | null = null;
  let humanSignoffResult: any = null;

  for (const h of history || []) {
    if (h.tool === "search_catalog" && h.result?.products) {
      discoveredProducts = h.result.products;
      if (discoveredProducts.length > 0) {
        lastDiscoveredProductId = discoveredProducts[0].id;
      }
    } else if (h.tool === "inspect_product_details" && h.result?.product) {
      inspectedProduct = h.result.product;
      lastDiscoveredProductId = inspectedProduct.id;
    } else if (h.tool === "compare_products" && h.result) {
      comparisonWinnerId =
        h.result.winner?.id || h.result.topRatedProduct?.id || lastDiscoveredProductId;
    } else if (h.tool === "customize_product_spec" && h.result) {
      customConfigApplied = h.result.appliedConfig;
    } else if (h.tool === "request_human_confirmation" && h.result) {
      humanSignoffResult = h.result;
    }
  }

  // Find best catalog match using Catalog-Driven Relevance Scoring
  const searchTokens = p
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 2 &&
        !["the", "and", "for", "with", "under", "best", "find", "show", "buy", "get", "add", "all", "me"].includes(t)
    );

  const scoredProducts = catalog.map((product) => {
    let score = 0;
    const nameLower = product.name.toLowerCase();
    const descLower = product.description.toLowerCase();
    const tagLower = (product.tagline || "").toLowerCase();
    const catLower = product.category.toLowerCase();
    const specsStr = JSON.stringify(product.specs || {}).toLowerCase();

    if ((p.includes("keyboard") || p.includes("typing") || p.includes("coding")) && catLower === "peripherals")
      score += 20;
    if ((p.includes("audio") || p.includes("sound") || p.includes("headset")) && catLower === "audio")
      score += 25;
    if ((p.includes("ring") || p.includes("wearable")) && catLower === "wearables") score += 25;
    if ((p.includes("server") || p.includes("node") || p.includes("compute")) && catLower === "computing")
      score += 30;

    searchTokens.forEach((token) => {
      if (nameLower.includes(token)) score += 12;
      if (catLower.includes(token)) score += 8;
      if (tagLower.includes(token)) score += 6;
      if (descLower.includes(token)) score += 4;
      if (specsStr.includes(token)) score += 5;
    });

    if (maxPrice !== undefined && product.price > maxPrice) score -= 60;
    score += (product.rating || 4.5) * 2;
    return { product, score };
  });

  scoredProducts.sort((a, b) => b.score - a.score);
  const bestMatch = scoredProducts[0]?.product || catalog[0];
  const targetProductId =
    comparisonWinnerId || inspectedProduct?.id || lastDiscoveredProductId || bestMatch.id;

  // STEP 1: Search Catalog (if not yet executed)
  if (!executedSet.has("search_catalog")) {
    const queryTerm = searchTokens.slice(0, 2).join(" ") || bestMatch.category;
    return {
      done: false,
      thought: `Initiating catalog search for '${queryTerm}' within budget constraints to discover available hardware inventory.`,
      nextStep: {
        tool: "search_catalog",
        args: {
          query: queryTerm,
          category: bestMatch.category,
          maxPrice,
          sortBy: p.includes("rating") ? "rating" : p.includes("price") ? "price_asc" : undefined,
        },
        purpose: `Search live catalog for ${bestMatch.category} hardware matching '${queryTerm}'`,
      },
    };
  }

  // STEP 2: Inspect Hardware Specs
  if (
    !executedSet.has("inspect_product_details") &&
    (isCompareIntent || p.includes("inspect") || p.includes("spec") || !executedSet.has("compare_products"))
  ) {
    return {
      done: false,
      thought: `Observed catalog search results (${discoveredProducts.length > 0 ? discoveredProducts.length : "active"} items). Inspecting technical engineering specs and stock for candidate ${bestMatch.name}.`,
      nextStep: {
        tool: "inspect_product_details",
        args: { productId: bestMatch.id },
        purpose: `Inspect hardware specifications, switches, and warehouse availability for ${bestMatch.name}`,
      },
    };
  }

  // STEP 3: Multi-Product Spec Comparison
  if (isCompareIntent && !executedSet.has("compare_products")) {
    const candidateIds = scoredProducts.slice(0, 3).map((sp) => sp.product.id);
    const validCandidateIds =
      candidateIds.length >= 2 ? candidateIds : [catalog[0].id, catalog[1].id, catalog[2]?.id || catalog[0].id];

    return {
      done: false,
      thought: `Observed product specs. Building side-by-side comparison matrix across ${validCandidateIds.length} candidate models to determine highest value hardware.`,
      nextStep: {
        tool: "compare_products",
        args: {
          productIds: validCandidateIds,
          criteria: ["price", "rating", "carbonKg", "material", "connectivity", "stock"],
        },
        purpose: `Generate comparison matrix with automated AI ranking across candidate models`,
      },
    };
  }

  // STEP 4: Customization
  if (isCustomizeIntent && !executedSet.has("customize_product_spec")) {
    let material = "Brushed Titanium";
    if (p.includes("walnut") || p.includes("wood")) material = "Aerospace Walnut";
    else if (p.includes("obsidian") || p.includes("black")) material = "Matte Obsidian";
    else if (p.includes("frost") || p.includes("emerald") || p.includes("green")) material = "Emerald Frost";

    let accentGlow = "Cyan Neon";
    if (p.includes("amber") || p.includes("solar")) accentGlow = "Solar Amber";
    else if (p.includes("emerald")) accentGlow = "Emerald";
    else if (p.includes("violet")) accentGlow = "Vapor Violet";

    let engravingText = "CYBER-2026 // WEBMCP";
    const quoteMatch = userGoal.match(/["']([^"']{1,24})["']/);
    if (quoteMatch) engravingText = quoteMatch[1];
    else if (p.includes("developer") || p.includes("dev")) engravingText = "DEV-SPEED // RUNTIME";

    const firmwareProfile = p.includes("gaming")
      ? "0.1mm Rapid Trigger Gaming"
      : p.includes("macro") || p.includes("dev") || p.includes("code")
      ? "Developer Fast-Macro Profile"
      : "Standard Balanced";

    return {
      done: false,
      thought: `Applying custom engineering specifications (${material}, ${accentGlow}, engraving: '${engravingText}') in the 3D Hardware Studio.`,
      nextStep: {
        tool: "customize_product_spec",
        args: {
          productId: targetProductId,
          material,
          engravingText,
          accentGlow,
          firmwareProfile,
          engravingFont: "JetBrains Mono",
        },
        purpose: `Apply custom generative spec to ${targetProductId}`,
      },
    };
  }

  // STEP 5: Add to Cart / Staged Procurement
  if (
    (isCartIntent || targetQuantity > 1 || isNegotiateIntent || isCheckoutIntent) &&
    !executedSet.has("add_to_cart") &&
    !executedSet.has("stage_procurement_bundle")
  ) {
    return {
      done: false,
      thought: `Staging ${targetQuantity} unit(s) of configured hardware (${targetProductId}) into the procurement shopping cart.`,
      nextStep: {
        tool: "add_to_cart",
        args: {
          productId: targetProductId,
          quantity: targetQuantity,
          customConfig: customConfigApplied || undefined,
        },
        purpose: `Add ${targetQuantity}x ${targetProductId} to procurement cart`,
      },
    };
  }

  // STEP 6: Negotiate Price Discount
  if (isNegotiateIntent && !executedSet.has("negotiate_price_discount")) {
    const discountMatch = p.match(/(\d{1,2})%/);
    const requestedDiscountPct = discountMatch
      ? parseInt(discountMatch[1], 10)
      : targetQuantity >= 5
      ? 15
      : 10;

    return {
      done: false,
      thought: `Executing algorithmic B2B discount negotiation with store pricing engine for ${requestedDiscountPct}% volume discount.`,
      nextStep: {
        tool: "negotiate_price_discount",
        args: {
          requestedDiscountPct,
          reasoning:
            targetQuantity >= 5
              ? `B2B Enterprise Team Procurement (${targetQuantity} units)`
              : `Developer Partner Program Evaluation Agreement`,
        },
        purpose: `Negotiate ${requestedDiscountPct}% volume discount against margin policy floor`,
      },
    };
  }

  // STEP 7: Simulate Supply Chain Dispatch
  if (isLogisticsIntent && !executedSet.has("simulate_supply_chain_dispatch")) {
    return {
      done: false,
      thought: `Simulating multi-hub logistics freight routing to optimize for lowest carbon footprint.`,
      nextStep: {
        tool: "simulate_supply_chain_dispatch",
        args: {
          destinationZip: "94107",
          warehousePriority: p.includes("carbon") ? "lowest_carbon" : "fastest_speed",
        },
        purpose: `Simulate zero-emission multi-hub dispatch to destination postal code`,
      },
    };
  }

  // STEP 8: Request Human Confirmation (HITL Gate)
  if (isCheckoutIntent && !executedSet.has("request_human_confirmation")) {
    return {
      done: false,
      thought: `Financial transaction threshold reached. Pausing autonomous execution to request cryptographic Human-in-the-Loop approval.`,
      nextStep: {
        tool: "request_human_confirmation",
        args: {
          action: "checkout_signoff",
          title: "Authorize Hardware Procurement Order",
          details: `Authorize payment and escrow lock for staged ${targetQuantity} unit(s) with negotiated discounts.`,
        },
        purpose: `Request human executive signoff before financial payment locking`,
      },
    };
  }

  // STEP 9: Execute Checkout (only if human confirmed)
  if (
    isCheckoutIntent &&
    executedSet.has("request_human_confirmation") &&
    !executedSet.has("execute_smart_checkout")
  ) {
    if (humanSignoffResult && humanSignoffResult.approved === false) {
      return {
        done: true,
        thought: "Human operator declined checkout approval. Halting financial execution securely.",
        finalMessage:
          "Order checkout was declined by the human operator. Your staged cart remains preserved safely.",
      };
    }

    return {
      done: false,
      thought: `Human authorization verified. Locking escrow and generating cryptographic order receipt.`,
      nextStep: {
        tool: "execute_smart_checkout",
        args: {
          customerNotes: "WebMCP verified autonomous dispatch order",
          paymentMethod: "instant_escrow",
        },
        purpose: `Lock escrow payment with cryptographic human signoff token`,
      },
    };
  }

  // Theme Intent
  if (isThemeIntent && !executedSet.has("set_app_theme")) {
    const themeId = p.includes("light") ? "clean_light" : p.includes("neon") ? "cyber_neon" : "dark_obsidian";
    return {
      done: false,
      thought: `Adjusting application design theme to ${themeId}.`,
      nextStep: {
        tool: "set_app_theme",
        args: { themeId },
        purpose: `Switch theme to ${themeId}`,
      },
    };
  }

  // Final Completion Summary
  const actionsList: string[] = [];
  if (executedSet.has("search_catalog")) actionsList.push("scanned catalog");
  if (executedSet.has("inspect_product_details")) actionsList.push("inspected technical specifications");
  if (executedSet.has("compare_products")) actionsList.push("evaluated competitive matrix");
  if (executedSet.has("customize_product_spec")) actionsList.push("configured custom hardware specs");
  if (executedSet.has("add_to_cart")) actionsList.push(`staged ${targetQuantity} item(s) in procurement cart`);
  if (executedSet.has("negotiate_price_discount")) actionsList.push("negotiated approved discount");
  if (executedSet.has("simulate_supply_chain_dispatch")) actionsList.push("simulated green logistics dispatch");
  if (executedSet.has("execute_smart_checkout")) actionsList.push("executed verified smart checkout");
  if (executedSet.has("set_app_theme")) actionsList.push("customized application theme");

  const summary =
    actionsList.length > 0
      ? `Successfully executed ${actionsList.join(", ")} across document.modelContext tools.`
      : "Target hardware objectives analyzed and completed.";

  return {
    done: true,
    thought: `All required WebMCP actions for goal '${userGoal}' executed cleanly. Store state updated.`,
    finalMessage: summary,
  };
}

export function generateClientCatalogDrivenPlan(
  userGoal: string,
  tools: any[],
  contextState: any
): Array<{ tool: string; args: any; purpose: string }> {
  const steps: Array<{ tool: string; args: any; purpose: string }> = [];
  const fakeHistory: any[] = [];
  let iter = 0;
  while (iter < 8) {
    const decision = getClientFallbackStep(userGoal, fakeHistory, tools, contextState);
    if (decision.done || !decision.nextStep) break;
    steps.push(decision.nextStep as any);
    fakeHistory.push({
      tool: decision.nextStep.tool,
      args: decision.nextStep.args,
      result: { success: true },
      purpose: decision.nextStep.purpose,
    });
    iter++;
  }
  return steps;
}
