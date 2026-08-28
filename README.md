# ⚡ AuraCommerce: Autonomous Hardware Co-Design & Procurement Studio

> **Elevator Pitch:**
> *AuraCommerce is a WebMCP-native hardware studio where AI agents discover real inventory, customize 3D titanium specs, negotiate B2B discounts, and checkout with cryptographic human signoff.*

---

## 🏛️ Executive Summary & Architecture

AuraCommerce is an **agent-native e-commerce application** built on the **WebMCP (Web Model Context Protocol)** browser specification (`document.modelContext`). 

Rather than relying on brittle screen-scraping vision clicks or disconnected headless REST APIs, AuraCommerce exposes **14 schema-validated, reactive tools directly to AI browser agents inside the DOM** (11 autonomous commerce capabilities + 3 UI & observability supervision tools).

### 🔄 Multi-Turn Iterative Observe-and-Act Loop
The agent executes an authentic **Observe-and-Act** loop:
```
User Goal ──► Agent Step API ──► Plan 1 Tool ──► JSON Schema Validator ──► WebMCP Host (DOM)
                    ▲                                                               │
                    └────── Real-Time Tool Return Data & DOM Observation ───────────┘
```
1. **Goal Formulation:** Agent receives user goal and reviews history of tool executions.
2. **Step Planning:** Formulates a single next tool action (or marks `done: true` when objectives are met).
3. **Strict Schema Gate:** Every payload is validated against JSON Schema Draft-07 before invocation.
4. **Execution on `document.modelContext`:** Tool executes directly in the browser DOM, mutating state, 3D canvases, or shopping cart.
5. **Observation:** Real output (e.g. candidate products, comparison matrices, discount approvals, or signoff tokens) is fed back into the agent for its next turn.

```
                           ┌────────────────────────────────────────┐
                           │   AI Browser Agent (Observe-and-Act)   │
                           └──────────────────┬─────────────────────┘
                                              │
                                   WebMCP JSON-RPC / Steps
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
 │  │ • stream_agent_activity│  │                        │  │                          │  │
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

## 🎬 90-Second Killer Demo Walkthrough

Click the **⚡ 90s Demo** button in the header or ask:
> *"Find 10 mechanical keyboards for my dev team under $2,000. Search catalog, inspect specs, compare candidates, configure Developer Fast-Macro profile with titanium finish, negotiate 15% discount, and prepare checkout with human confirmation."*

1. **Discovery (`search_catalog`)**: Discovers mechanical keyboards from the live catalog under $200 unit price.
2. **Inspection (`inspect_product_details`)**: Inspects switch types, actuation latency, and stock availability.
3. **Comparison (`compare_products`)**: Generates side-by-side spec comparison matrix with AI value rankings.
4. **Hardware Customization (`customize_product_spec`)**: Mutates 3D canvas with Aerospace Titanium finish, Cyan Neon accent glow, and custom laser engraving.
5. **Procurement Staging (`add_to_cart`)**: Stages 10 units into shopping cart ($1,890.00 subtotal).
6. **Policy Math Negotiation (`negotiate_price_discount`)**: Evaluates 15% discount against store margin floor ceiling ($D_{max} \le 28\%$).
7. **Security HITL Intercept (`request_human_confirmation`)**: Execution pauses; the browser presents a cryptographic Human-in-the-Loop authorization modal.
8. **Final Escrow Settlement (`execute_smart_checkout`)**: User clicks "Approve Order & Escrow". Agent locks payment and issues cryptographically signed receipt with confetti!

---

## 🛠️ Complete WebMCP Tool Registry (14 Tools)

AuraCommerce partitions its tool registry into **11 Autonomous Commerce & Hardware Capabilities** plus **3 UI & Observability Supervision Tools**:

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

### 🖥️ UI & Observability Supervision Tools (3 Tools)

| # | Tool Name | Permission Tier | Description | Key Parameters |
|---|---|---|---|---|
| 12 | `trigger_ui_highlight` | 🟢 `GREEN_AUTO` | Spotlight and illuminate specific DOM elements on screen | `elementId`, `durationMs` |
| 13 | `stream_agent_activity` | 🟢 `GREEN_AUTO` | Stream live agent activity events, progress markers, and trace | `activity`, `phase`, `details` |
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

## 📊 15-Vector Benchmark Suite & Telemetry

The built-in **Benchmark Dashboard** (`/benchmark`) allows judges and developers to run 15 standardized evaluation tasks with quantitative metrics:
- **Search & Discovery**: Query parsing, budget limits, planar audio specs.
- **Spec Comparison**: Side-by-side matrices and ranking.
- **3D Customization**: Laser engraving, firmware profiling, titanium finishes.
- **Procurement & Negotiation**: Bulk bundles, margin policy boundaries.
- **Logistics & Carbon**: Multi-hub routing, zero-emission freight.
- **Security & HITL**: Unauthorized checkout defense, escrow signoff.

Includes 1-click **"Export Audit Report"** to generate clean Markdown/JSON test results.

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
