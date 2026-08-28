# ⚡ AuraCommerce: Autonomous Hardware Co-Design & Procurement Studio

> **Elevator Pitch:**
> *AuraCommerce is a WebMCP-native hardware studio where AI agents discover real inventory, customize 3D titanium specs, negotiate B2B discounts, and checkout with cryptographic human signoff.*

---

## 🏛️ Executive Summary & Architecture

AuraCommerce is an **agent-native e-commerce application** built on the **WebMCP (Web Model Context Protocol)** browser specification (`document.modelContext`). 

Rather than relying on brittle screen-scraping vision clicks or disconnected headless REST APIs, AuraCommerce exposes **14 schema-validated, reactive tools directly to AI browser agents inside the DOM** (11 autonomous commerce capabilities + 3 UI/observability tools).

```
                           ┌────────────────────────────────────────┐
                           │       AI Browser Agent (LLM)           │
                           └──────────────────┬─────────────────────┘
                                              │
                                   WebMCP JSON-RPC / Plans
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      AuraCommerce WebMCP Host (document.modelContext)                  │
 │                                                                                        │
 │  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────┐  │
 │  │ 🟢 GREEN_AUTO Tier     │  │ 🟡 YELLOW_GUARDRAILED  │  │ 🔴 RED_HITL_REQUIRED     │  │
 │  │ • search_catalog       │  │ • negotiate_discount   │  │ • request_human_signoff  │  │
 │  │ • inspect_details      │  │   (Margin Floor Cap:   │  │ • execute_smart_checkout │  │
 │  │ • compare_products     │  │    D_max ≤ 28%)        │  │   (Requires Cryptographic│  │
 │  │ • customize_spec       │  │                        │  │    Human Token)          │  │
 │  │ • add_to_cart          │  │                        │  │                          │  │
 │  │ • stage_bundle         │  │                        │  │                          │  │
 │  │ • dispatch_simulation  │  │                        │  │                          │  │
 │  │ • query_live_metrics   │  │                        │  │                          │  │
 │  │ • trigger_ui_highlight │  │                        │  │                          │  │
 │  │ • stream_scratchpad    │  │                        │  │                          │  │
 │  │ • set_app_theme        │  │                        │  │                          │  │
 │  └────────────────────────┘  └────────────────────────┘  └──────────────────────────┘  │
 └────────────────────────────────────────────┬───────────────────────────────────────────┘
                                              │
                                Reactive DOM / React State
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              Collaborative Frontend Views                              │
 │  • Storefront & Inventory Sourcing         • 3D Studio & Laser Engraver                │
 │  • Multi-Product Spec Matrix               • 15-Vector Agent Benchmark Suite           │
 │  • Real-Time Agent Activity Trace          • Interactive Protocol Inspector            │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Complete WebMCP Tool Registry (14 Tools)

AuraCommerce partitions its tool registry into **11 Autonomous Commerce & Hardware Capabilities** plus **3 UI & Observability Tools**:

### 📦 Commerce & Hardware Capabilities (11 Tools)

| # | Tool Name | Permission Tier | Description | Key Parameters |
|---|---|---|---|---|
| 1 | `search_catalog` | 🟢 `GREEN_AUTO` | Multi-parameter inventory search and filter | `query`, `category`, `maxPrice`, `sortBy` |
| 2 | `inspect_product_details` | 🟢 `GREEN_AUTO` | Fetch granular hardware specs, switch types, warehouse stock | `productId` |
| 3 | `compare_products` | 🟢 `GREEN_AUTO` | Side-by-side spec comparison matrix with AI value rankings | `productIds`, `criteria` |
| 4 | `customize_product_spec` | 🟢 `GREEN_AUTO` | Mutate 3D materials, laser engraving, accent glow, firmware | `productId`, `material`, `engravingText`, `accentGlow` |
| 5 | `add_to_cart` | 🟢 `GREEN_AUTO` | Add configured hardware unit to staged cart | `productId`, `quantity`, `customConfig` |
| 6 | `stage_procurement_bundle` | 🟢 `GREEN_AUTO` | Assemble multi-item hardware bundle with freight routing | `items: [{productId, quantity}]`, `shippingTier` |
| 7 | `negotiate_price_discount` | 🟡 `YELLOW_GUARDRAILED` | Algorithmic B2B discount negotiation with margin protection | `requestedDiscountPct`, `reasoning` |
| 8 | `simulate_supply_chain_dispatch` | 🟢 `GREEN_AUTO` | Multi-hub orbital freight routing optimizing for CO₂ | `destinationZip`, `warehousePriority` |
| 9 | `query_live_metrics` | 🟢 `GREEN_AUTO` | Real-time warehouse valuations and sustainability offsets | `metricType` |
| 10 | `request_human_confirmation` | 🔴 `RED_HITL_REQUIRED` | Pause execution and present interactive signoff modal | `action`, `title`, `details` |
| 11 | `execute_smart_checkout` | 🔴 `RED_HITL_REQUIRED` | Execute final financial lock. Requires cryptographic approval token | `customerNotes`, `paymentMethod` |

### 🖥️ UI & Observability Capabilities (3 Tools)

| # | Tool Name | Permission Tier | Description | Key Parameters |
|---|---|---|---|---|
| 12 | `trigger_ui_highlight` | 🟢 `GREEN_AUTO` | Illuminate and spotlight specific DOM elements on screen | `elementId`, `durationMs` |
| 13 | `stream_agent_scratchpad` | 🟢 `GREEN_AUTO` | Stream agent thought process to live UI scratchpad | `thought`, `confidenceScore` |
| 14 | `set_app_theme` | 🟢 `GREEN_AUTO` | Switch theme or high-contrast visibility modes | `themeId` (`dark_obsidian`, `clean_light`, etc.) |

---

## 🛡️ Security Architecture & Human-in-the-Loop (HITL)

AuraCommerce implements a **zero-trust security model** for autonomous agents:

### 1. Strict JSON Schema Validation
Every tool invocation on both backend and client undergoes strict schema validation against official JSON Schema Draft-07 specs. Invalid types, missing required properties, or out-of-range numerical parameters are cleanly rejected with actionable error diagnostics.

### 2. Cryptographic Human Signoff Token Gate
The `execute_smart_checkout` tool strictly checks for an unexpired, unused cryptographic signoff token issued by `request_human_confirmation`. If an agent attempts direct checkout without human authorization:
```json
{
  "error": "SECURITY VIOLATION [HITL-001]: Unauthorized financial transaction blocked. 'execute_smart_checkout' requires prior human authorization via 'request_human_confirmation'."
}
```

### 3. Algorithmic Margin Protection Ceiling
Discount negotiations are mathematically bounded by the formula:
$$\text{Discount}_{\text{approved}} = \min\left(D_{\text{max}}, \; \text{TierAllowance}(\text{Volume}, \text{Subtotal})\right)$$
where $D_{\text{max}} = 28\%$, preventing prompt-injection margin drain.

---

## 📊 15-Vector Benchmark Suite

The built-in **Benchmark Dashboard** (`/benchmark`) allows judges and developers to run 15 standardized evaluation tasks across:
- **Search & Discovery**: Query parsing, budget limits, planar audio specs.
- **Spec Comparison**: Side-by-side matrices and ranking.
- **3D Customization**: Laser engraving, firmware profiling, titanium finishes.
- **Procurement & Negotiation**: Bulk bundles, margin policy boundaries.
- **Logistics & Carbon**: Multi-hub routing, zero-emission freight.
- **Security & HITL**: Unauthorized checkout defense, escrow signoff.

---

## 🚀 Quickstart & Development

### 1. Installation
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The dev server starts on `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

---

## 🧑‍💻 Author & Submission
- **Author:** Ayamba Ronald (`ayambaronald490@gmail.com`)
- **Track:** WebMCP Hackathon 2026
- **License:** MIT
