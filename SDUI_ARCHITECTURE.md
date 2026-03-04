# SDUI Architecture

Server-Driven UI (SDUI) — the **backend owns what appears on each screen**, the **frontend owns how it looks**. No style props in Strapi. All presentation is handled by the frontend theme system.

---

## High-Level Flow

```
Frontend App
  ├── 1. GET /api/journeys/:documentId  → ordered screens[] + policies + initialState
  └── 2. GET /api/screens/:documentId   → page blocks for current screen
              ↓
        __component → maps to registered React Native widget
```

---

## Data Model

### `Journey` — Collection Type

| Field                 | Type               | Notes                                                                                      |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `journeyId`           | UID                | e.g. `ACCT_CA_APPLY` — public lookup key                                                   |
| `slug`                | UID                | Auto-generated from `name`, e.g. `apply-ca`                                                |
| `name`                | String (i18n)      | Display name                                                                               |
| `description`         | String (i18n)      | Internal description                                                                       |
| `schemaVersion`       | String             | e.g. `1.0` — for client cache invalidation                                                 |
| `bundleVersion`       | String             | e.g. `2026.03.01-001` — release tag                                                        |
| `productType`         | Enum               | `CARDS \| LOANS \| DEPOSITS \| ACCOUNTS \| TRANSFERS \| INVESTMENTS \| INSURANCE \| OTHER` |
| `segment`             | Enum               | `ETB \| NTB \| ALL`                                                                        |
| `owner`               | String             | e.g. `Accounts Business Team`                                                              |
| `idempotencyRequired` | Boolean            | Submit once, deduplicate on backend                                                        |
| `checkpointEnabled`   | Boolean            | Resume from last screen after crash/background                                             |
| `maxRetry`            | Integer            | Max retries for backend operations (default 3)                                             |
| `async`               | Boolean            | Is final submission asynchronous                                                           |
| `presentation`        | Enum               | `card \| modal \| fullScreenModal \| formSheet \| ...`                                     |
| `screens`             | oneToMany → Screen | Ordered screens linked to this journey                                                     |
| `initialState`        | JSON               | Default journey state shape                                                                |
| `onExit`              | `sdui.action`      | Action on journey dismissal                                                                |
| `analytics`           | JSON               | Journey-level tracking metadata                                                            |

**API:** `GET /api/journeys/id/:journeyId` → `data: {}` (custom `findBySlug` controller, published only)

---

### `Screen` — Collection Type

| Field      | Type               | Notes                                                          |
| ---------- | ------------------ | -------------------------------------------------------------- |
| `screenId` | UID                | e.g. `ACCT_CA_ACCOUNT_PURPOSE` — globally unique, never rename |
| `meta`     | `sdui.screen-meta` | Title, subtitle, back/close nav                                |
| `header`   | DynamicZone        | Top area: hero, banner, image-preview                          |
| `body`     | DynamicZone        | Main content — composable UI components                        |
| `footer`   | DynamicZone        | CTAs: slide-to-confirm, button, banner                         |

> Screens are linked to their Journey via the Journey's `screens` (oneToMany) relation. There is no back-reference on the Screen side.

**API:** `GET /api/screens/:documentId` → `data: {}` (overridden `findOne` — deep populated)

---

## Relations

```
Journey (1) ──oneToMany──▶ Screen (N)
                                │
                    ┌───────────┼───────────┐
                  meta        body        footer
                    │           │            │
             sdui.screen-meta  ui.*       ui.slide-to-confirm
                    │        components     ui.button
                 onBack ─▶ sdui.action      ui.banner { text }
                                │
                    ┌───────────┼───────────┐
                 binding    visibility   onComplete
                    │           │            │
             sdui.binding  sdui.visibility  sdui.on-complete
                        rule ─▶ rule-set       └─▶ sdui.action
                                           guards ─▶ rule-set[]
```

---

## Component Library

### `sdui.*` — Behaviour (never rendered directly)

| Component          | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `sdui.screen-meta` | Screen title, subtitle, back/close nav                                        |
| `sdui.action`      | navigate, api_call, open_modal, set_state, etc.                               |
| `sdui.binding`     | Two-way state binding for inputs                                              |
| `sdui.source`      | Read-only state path for display components                                   |
| `sdui.visibility`  | Conditional show/hide via rule-set                                            |
| `sdui.validation`  | Input validation rules                                                        |
| `sdui.on-complete` | Wrapper fired when component self-completes — contains a nested `sdui.action` |
| `sdui.data-source` | API endpoint config for async components                                      |

### `ui.*` — Renderable Blocks

**Inputs** — always require `sdui.binding`

| Component                                  | Captures                             |
| ------------------------------------------ | ------------------------------------ |
| `ui.text-input`                            | String                               |
| `ui.money-input`                           | Number (currency, min/max)           |
| `ui.radio-group` / `radio-group-async`     | Single select                        |
| `ui.checkbox-list` / `checkbox-list-async` | Multi-select                         |
| `ui.dropdown` / `dropdown-async`           | Select from list / API               |
| `ui.cascading-select`                      | Hierarchical select                  |
| `ui.account-selector`                      | Bank account picker from API         |
| `ui.passcode-input`                        | Numeric passcode (ephemeral)         |
| `ui.camera-capture`                        | Document / selfie / barcode → base64 |

**Display**

| Component                    | Shows                                  |
| ---------------------------- | -------------------------------------- |
| `ui.hero`                    | Illustration + title + subtitle        |
| `ui.banner`                  | info / warning / error / success strip |
| `ui.section-label`           | Section heading                        |
| `ui.text`                    | Body copy                              |
| `ui.image-preview`           | Base64 image from state                |
| `ui.item-list` / `list-item` | Tappable row list                      |
| `ui.review-card`             | Summary with key-value rows            |
| `ui.money-display`           | Formatted currency                     |
| `ui.badge`                   | Status badge                           |
| `ui.tab-group`               | Tab filter                             |

**Actions**

| Component             | Use when                                            |
| --------------------- | --------------------------------------------------- |
| `ui.slide-to-confirm` | High-stakes gesture (submit, sign)                  |
| `ui.button`           | Standard tap (primary / secondary / ghost / danger) |

---

## API

```bash
# Journey — by journeyId (custom findBySlug controller, published only)
GET /api/journeys/id/:journeyId
→ data: { journeyId, slug, schemaVersion, bundleVersion, productType, segment,
          idempotencyRequired, checkpointEnabled, presentation, screens[], initialState, ... }

# Journey — list all (Strapi default find, published + draft)
GET /api/journeys

# Screen — deep populated slots (overridden findOne)
GET /api/screens/:documentId
→ data: { screenId, meta, header[], body[], footer[] }

# Filter by screenId (for tooling)
GET /api/screens?filters[screenId][$eq]=ACCT_CA_ACCOUNT_PURPOSE
```

Both return `data: {}` and only serve **published** records.

---

## Journey State Contract

`initialState` declares the shape of shared journey state. All `sdui.binding.path` values must match declared keys.

```json
{
  "accountPurpose": null,
  "npwpImage": null,
  "npwpNumber": null,
  "sourceAccountId": null,
  "initialDepositAmount": null,
  "termsAccepted": []
}
```

---

## Reusability

| What           | How                                                                 |
| -------------- | ------------------------------------------------------------------- |
| **Screens**    | `screenKey` is globally unique — any journey can link to any screen |
| **Components** | Any `ui.*` block appears N times in body                            |
| **Rule sets**  | Shared across `sdui.action.guards` and `sdui.visibility.rule`       |
| **Copy**       | All labels i18n-localized — same structure, different locale        |

---

## Scalability

| Concern            | Solution                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| New journey        | Create Journey + Screens. Zero code.                                   |
| Reorder screens    | Change `order` field. No deploy.                                       |
| Cache invalidation | Bump `bundleVersion` — client detects and refetches                    |
| A/B test           | Two journeys pointing to different screen sets                         |
| New UI component   | Add JSON → add to DynamicZone → frontend registers renderer. 1 deploy. |
| New language       | `?locale=id` on any endpoint                                           |

---

## Governance

### Naming Conventions

| Item         | Format                 | Example                     |
| ------------ | ---------------------- | --------------------------- |
| Journey ID   | `SCREAMING_SNAKE_CASE` | `ACCT_CA_APPLY`             |
| Journey slug | `kebab-case`           | `apply-ca` (auto-generated) |
| Screen ID    | `SCREAMING_SNAKE_CASE` | `ACCT_CA_ACCOUNT_PURPOSE`   |
| Binding path | `camelCase`            | `accountPurpose`            |

### Immutable Rules

1. **No styling props** — frontend theme owns everything
2. **All inputs require `binding`** — no orphaned form fields
3. **`screenKey` is permanent** — never rename after going live
4. **Always Publish** — draft records not served by API
5. **State contract is binding** — `binding.path` must exist in journey `initialState`

### ⚠️ Never Edit via Content-Type Builder UI

Edit these JSON files directly — they have `manyToMany` relations the CTB UI can't handle:

- `src/components/sdui/action.json`
- `src/components/ui/slide-to-confirm.json`
- `src/components/ui/button.json`

---

## File Structure

```
src/
├── api/
│   ├── journey/
│   │   ├── content-types/journey/schema.json   ← Journey schema
│   │   ├── controllers/journey.ts              ← core factory (no overrides)
│   │   ├── routes/journey.ts                   ← core CRUD
│   │   └── services/journey.ts
│   ├── screen/
│   │   ├── content-types/screen/schema.json    ← Screen schema (3 dynamic zones)
│   │   ├── controllers/screen.ts               ← overrides findOne (deep populate)
│   │   ├── routes/screen.ts                    ← core CRUD
│   │   └── services/screen.ts
│   └── rule-set/                               ← shared business rules
└── components/
    ├── sdui/   ← 8 behaviour components
    └── ui/     ← 29 renderable UI blocks
```
