# BuildMate AI: Snapshot-to-Checkout DIY & Building Assistant

BuildMate AI is an intelligent contractor and DIY assistant that diagnoses building, renovation, and repair jobs from scenario snapshots, conducts adaptive diagnostic questioning, generates precision step-by-step repair guides, and provides an interactive bill of materials with an integrated store locator, live pickup availability, real-time price comparison, and 1-click instant ordering for missing inventory.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices & Architectural Focus:**
> - **Store Locator & Pickup Focus**: As confirmed by your response, the comparison and checkout interface prioritizes an interactive store locator with live map visualization, distance calculations, and real-time in-store pickup availability (Aisle/Bay location, in-stock count, ready in 2 hours), alongside delivery options.
> - **Multimodal Vision & Diagnosis**: Accepts direct camera snapshots, uploaded photos, or high-fidelity preloaded real-world DIY scenario presets (e.g., drywall anchor tear-out, PEX/copper plumbing pipe leak, subfloor squeak repair, pendant light electrical install, tile grout crack).
> - **Inventory State Engine**: Items are dynamically categorized into "Have in Toolbox" vs. "Need to Buy", updating total cart costs, store route planning, and savings in real time.
> - **Live Retailer Comparison**: Compares verified pricing across major home improvement chains (Home Depot, Lowe's, Ace Hardware, Harbor Freight, Menards) with price-match badge alerts, bundle discounts, and instant 1-click basket reservation.

---

## 1. Overview & Core Concept

- **What It Does**: Enables homeowners, DIY enthusiasts, and handypeople to snap a photo of any damaged or unfinished project scenario. BuildMate AI inspects the physical context (materials, dimensions, fitting types, damage severity), asks 2–3 targeted follow-up clarifying questions to eliminate safety hazards and guesswork, outputs a structured plan with tools/materials, lets users toggle items they already own, and finds the closest hardware stores with real-time price comparisons and 1-click curbside or delivery ordering.
- **Target Audience / Persona**: Homeowners, renters, DIYers, makers, property managers, and apprentice handymen who want professional-grade job guidance without wasting trips to the hardware store for missing parts.
- **Key Value**: Eliminates the "3 trips to the hardware store for one plumbing fix" syndrome by combining visual computer vision diagnosis, tailored tool/material checklists, and immediate nearby inventory sourcing in one fluid workflow.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Job Capture & Snapshot**:
   - User opens the app on mobile or desktop; selects "Take Photo", "Upload Snapshot", or picks an instant realistic job scenario preset (e.g., *Plumbing Under-Sink Trap Leak*, *Heavy Shelf Anchoring in Hollow Drywall*, *Bathroom Floor Tile Crack*, *GFCI Outlet Replacement*).
   - Instant visual preview with zoom, area crop, and scenario description input.
2. **AI Visual Triage & Diagnostic Questions**:
   - BuildMate analyzes the snapshot and surfaces detected components (e.g., "1/2 inch copper pipe with pinhole corrosion", "5/8 inch drywall with sheared plastic toggle").
   - Agent presents 2–3 concise diagnostic questions with single-click options (e.g., "Is the main shutoff valve functional?", "What is the wall substrate behind the sheetrock?").
3. **Actionable DIY Guide & Bill of Materials**:
   - Generates an interactive 3-tab workbench:
     - **Execution Steps**: Sequenced steps with safety warnings (PPE, power/water shutoff), required skill rating, and estimated time.
     - **Interactive Checklist**: Organized into *Power & Hand Tools* and *Materials & Fasteners*. Each item has a toggle: `[I Have This]` / `[Need to Buy]`.
     - **Nearby Store Locator & Best Deals**: Live comparison matrix displaying nearest stores on an interactive map, item prices, bundle totals, aisle/shelf locations, and pickup readiness.
4. **Price Comparison, Store Locator & 1-Click Ordering**:
   - Map and list view of nearby stores (e.g., Home Depot 1.8 mi, Lowe's 2.4 mi, Ace Hardware 0.9 mi).
   - Clear breakdown of individual missing item prices, total basket cost, and potential savings ($ saved vs. average).
   - "1-Click Order All Missing Items" button opens a streamlined checkout drawer to reserve for curbside pickup or expedited delivery, complete with confirmation receipt and in-store pickup barcode.

### Visual Identity & Theme

- **Aesthetic Direction**: Modern industrial workbench aesthetic—functional, clean, rugged, and legible. Inspired by premium workshop tools and professional engineering dashboards.
- **Color Palette**:
  - Dominant Canvas (60%): Deep slate / obsidian background (`#0B0F17`) with crisp contrast, or warm workshop paper tone in light mode.
  - Structural Surfaces (30%): Subdued gunmetal cards (`#151C28`), hairline zinc dividers (`#222F44`), muted cool gray text (`#94A3B8`).
  - High-Intent Accent (10%): Safety amber / cobalt utility blue (`#F59E0B` and `#3B82F6`) for primary CTAs, active filters, and lowest-price indicators.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` bold, confident geometry.
  - Body Text: `Plus Jakarta Sans` clean, open apertures for high legibility under workshop lighting.
  - Data, Aisles, Measurements & Prices: `font-mono tabular-nums` (`JetBrains Mono` / `Space Mono`) for aligned pricing, distance numbers, and stock counts.
- **Zero-Pill Restraint**: Metadata (distance, store status, difficulty, time) uses clean unboxed typography with bullet (`·`) separators rather than colored pill sandwiches.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini 3.8 Flash Vision Integration**
  - *Chosen Approach*: Server-side endpoint (`/api/analyze-job`) using `@google/genai` SDK with `gemini-3.8-flash` to handle multimodal image inputs, diagnostic logic, and structured JSON output.
  - *Why*: High speed, accurate visual reasoning for physical hardware components, and clean JSON schema adherence without client API key exposure.
- **Decision 2: Realistic Hardware Retail Catalog & Distance Engine**
  - *Chosen Approach*: Comprehensive local store simulator covering major national brands (Home Depot, Lowe's, Ace Hardware, Harbor Freight) with realistic stock numbers, aisle/bay indices, distance calculations from user's simulated or geolocation coordinates, and dynamic price comparison.
  - *Why*: Delivers an immediate, fully functional end-to-end purchasing experience with real store brand context, without brittle third-party scraper dependencies.
- **Decision 3: Persistent Session & Offline-Friendly Checklist**
  - *Chosen Approach*: State persists in local storage so users can walk into the store, check off items as they grab them in the aisle, or inspect the repair steps hands-free.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUILDMATE CLIENT (REACT)                        │
├──────────────────┬───────────────────────┬─────────────────────────────┤
│  Snapshot Triage │  Diagnostic Questions │   Interactive Checklist     │
│  - Camera Capture│  - Adaptive Q&A       │   - "Have" vs "Need" State  │
│  - Preset Scenarios- Clarifying Responses│   - Quantity & Specs        │
└─────────┬────────┴───────────┬───────────┴──────────────┬──────────────┘
          │                    │                          │
          ▼                    ▼                          │
┌────────────────────────────────────────────────────────┐│
│             EXPRESS BACKEND (/api/*)                   ││
│  - POST /api/analyze-job   (Multimodal Vision)         ││
│  - POST /api/diagnose-step (Adaptive Q&A resolution)   ││
│  - GET  /api/stores-nearby (Location & pricing matrix) ││
│  - POST /api/checkout-order (1-click reservation)      ││
└──────────────────────────┬─────────────────────────────┘│
                           │                              │
                           ▼                              ▼
                 ┌──────────────────┐           ┌────────────────────┐
                 │ Google GenAI SDK │           │ Store & Cart Engine│
                 │ gemini-3.8-flash │           │ - Price Comparison │
                 │ Vision & Schema  │           │ - Store Map & Aisle│
                 └──────────────────┘           │ - Pickup Status    │
                                                └────────────────────┘
```

### Data Model & State Entities

- **JobScenario**: `id`, `title`, `category`, `imageUrl`, `description`, `difficulty`, `estimatedTime`, `detectedIssues[]`.
- **DiagnosticQuestion**: `id`, `question`, `options[]`, `selectedAnswer?`, `hint`.
- **InventoryItem**: `id`, `name`, `category` (tool | material), `requiredQuantity`, `unit`, `estimatedPrice`, `userHasItem` (boolean), `specifications`, `priority` (critical | recommended | optional).
- **StoreStock**: `storeId`, `storeName`, `chain`, `distanceMiles`, `address`, `coordinates`, `itemPrices: Record<string, { price: number, inStock: boolean, aisle: string, bay: string }>`, `totalMissingCost`, `pickupReadyHours`.
- **OrderReservation**: `orderId`, `store`, `items[]`, `totalAmount`, `pickupCode`, `timestamp`, `status`.
