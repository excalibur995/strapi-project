# SDUI Architecture

Server-Driven UI (SDUI) — the **backend owns what appears on each screen**, the **frontend owns how it looks**. No style props in Strapi. All presentation is handled by the frontend theme system.

---

## High-Level Flow

```
Frontend App
  ├── 1. GET /api/journeys/:documentId  → steps[] + policies + initialState
  └── 2. For each USER step: GET /api/screens/:documentId → page blocks
              ↓
        __component → maps to registered React Native widget
```

---

## Data Model

### `Journey` — Collection Type

| Field                 | Type          | Notes                                                                                      |
| --------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `slug`                | UID           | e.g. `apply-ca`                                                                            |
| `name`                | String (i18n) | Display name                                                                               |
| `schemaVersion`       | String        | e.g. `1.0` — CMS schema version                                                            |
| `bundleVersion`       | String        | e.g. `2026.03.01-001` — release tag for client cache invalidation                          |
| `productType`         | Enum          | `CARDS \| LOANS \| DEPOSITS \| ACCOUNTS \| TRANSFERS \| INVESTMENTS \| INSURANCE \| OTHER` |
| `segment`             | Enum          | `ETB \| NTB \| ALL`                                                                        |
| `owner`               | String        | e.g. `Accounts Business Team`                                                              |
| `idempotencyRequired` | Boolean       | Submit once, deduplicate on backend                                                        |
| `checkpointEnabled`   | Boolean       | Resume from last completed step after crash/background                                     |
| `maxRetry`            | Integer       | Max retries for SYSTEM steps (default 3)                                                   |
| `async`               | Boolean       | Is final submission asynchronous                                                           |
| `steps`               | DynamicZone   | Ordered mix of `sdui.step-user` and `sdui.step-system`                                     |
| `initialState`        | JSON          | Default journey state shape                                                                |
| `onExit`              | `sdui.action` | Action on journey dismissal                                                                |
| `analytics`           | JSON          | Journey-level tracking metadata                                                            |

### `Screen` — Collection Type

| Field       | Type               | Notes                                                           |
| ----------- | ------------------ | --------------------------------------------------------------- |
| `screenKey` | UID                | e.g. `apply-ca.intro` — globally unique, never rename once live |
| `meta`      | `sdui.screen-meta` | Title, subtitle, back/close nav                                 |
| `header`    | DynamicZone        | Top area: hero, banner, image-preview                           |
| `body`      | DynamicZone        | Main content — 24 composable UI components                      |
| `footer`    | DynamicZone        | CTAs: slide-to-confirm, button, banner                          |

---

## Step Types

### `sdui.step-user`

A step rendered to the user as a screen. Frontend blocks until the user submits.

| Field      | Type              | Notes                                         |
| ---------- | ----------------- | --------------------------------------------- |
| `stepCode` | String            | `SCREAMING_SNAKE_CASE`, unique within journey |
| `screen`   | oneToOne → Screen | The screen to render                          |
| `onSubmit` | JSON              | `{ "nextStep": "STEP_CODE" }`                 |
| `skip`     | `sdui.visibility` | Auto-skip this step if rule passes            |

### `sdui.step-system`

A backend operation executed without user interaction. Branches on result.

| Field       | Type    | Notes                                         |
| ----------- | ------- | --------------------------------------------- |
| `stepCode`  | String  | `SCREAMING_SNAKE_CASE`, unique within journey |
| `service`   | String  | e.g. `product-capabilities`                   |
| `operation` | String  | e.g. `checkEligibility`                       |
| `params`    | JSON    | Static params to pass to service              |
| `onSuccess` | JSON    | `{ "nextStep": "STEP_CODE" }`                 |
| `onFailure` | JSON    | `{ "nextStep": "STEP_CODE" }`                 |
| `maxRetry`  | Integer | Overrides journey-level `maxRetry`            |

---

## Relations

```
Journey (1)
  └── steps (DynamicZone)
        ├── sdui.step-system
        │     ├── onSuccess → { nextStep: "STEP_CODE" }
        │     └── onFailure → { nextStep: "STEP_CODE" }
        └── sdui.step-user
              ├── screen ──oneToOne──▶ Screen
              │                           │
              │               ┌───────────┼───────────┐
              │             meta         body        footer
              │               │           │            │
              │        sdui.screen-meta  ui.*       ui.slide-to-confirm
              │               │        components   ui.button
              │            onBack ─▶ sdui.action     ui.banner
              │                            │
              │               ┌────────────┼────────────┐
              │           binding      visibility     onTap
              │               │            │            │
              │        sdui.binding  sdui.visibility  sdui.action
              │                    rule ─▶ rule-set  guards ─▶ rule-set[]
              └── onSubmit → { nextStep: "STEP_CODE" }
```

---

## Component Library

### `sdui.*` — Behaviour (never rendered directly)

| Component          | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `sdui.screen-meta` | Screen title, subtitle, back/close nav            |
| `sdui.step-user`   | USER journey step → links to Screen               |
| `sdui.step-system` | SYSTEM journey step → service call with branching |
| `sdui.action`      | navigate, api_call, open_modal, set_state, etc.   |
| `sdui.binding`     | Two-way state binding for inputs                  |
| `sdui.source`      | Read-only state path for display components       |
| `sdui.visibility`  | Conditional show/hide via rule-set                |
| `sdui.validation`  | Input validation rules                            |
| `sdui.on-complete` | Action fired when component self-completes        |
| `sdui.data-source` | API endpoint config for async components          |

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
# Journey — all steps, policies, initialState
GET /api/journeys/:documentId
→ data: { slug, schemaVersion, bundleVersion, productType, segment, steps[], initialState, ... }

# Screen — deep populated slots (overridden findOne)
GET /api/screens/:documentId
→ data: { screenKey, meta, header[], body[], footer[] }

# Standard filter (for tooling)
GET /api/journeys?filters[slug][$eq]=apply-ca
GET /api/screens?filters[screenKey][$eq]=apply-ca.intro
```

Both return `data: {}` and only serve **published** records.

---

## Journey Execution Model

```
Frontend receives steps[]

For each step in order:
  if step.__component === "sdui.step-system"
    → BFF executes service.operation
    → on result, resolve nextStep from onSuccess / onFailure
  if step.__component === "sdui.step-user"
    → fetch Screen by step.screen.documentId
    → render page blocks
    → on user submit, resolve nextStep from onSubmit
    → if skip rule passes, auto-advance without rendering

Advance to step where stepCode === nextStep
```

---

## Journey State Contract

Each journey declares its state shape in `initialState`. All `sdui.binding.path` values must match declared keys.

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

| What          | How                                                                                |
| ------------- | ---------------------------------------------------------------------------------- |
| **Screens**   | Standalone — any journey can reference any screen via `sdui.step-user.screen`      |
| **Steps**     | SYSTEM steps define backend service calls; same operation reusable across journeys |
| **Rule sets** | Shared across `sdui.action.guards` and `sdui.visibility.rule`                      |
| **Copy**      | All labels i18n-localized — reuse structure with locale-specific content           |

---

## Scalability

| Concern                   | Solution                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------ |
| New journey               | Create Journey + Screens + link via steps. Zero code.                                |
| Reorder steps             | Drag steps in DynamicZone. No deploy.                                                |
| New branching path        | Add a USER step pointing to a new failure/fallback screen                            |
| Bundle cache invalidation | Bump `bundleVersion` — client detects and refetches                                  |
| A/B test                  | Two journeys, same screens, different step order/branching                           |
| New UI component          | Add JSON → add to `screen.body` DynamicZone → frontend registers renderer. 1 deploy. |
| New language              | Strapi i18n — `?locale=id` on any endpoint                                           |

---

## Governance

### Naming Conventions

| Item         | Format                         | Example             |
| ------------ | ------------------------------ | ------------------- |
| Journey slug | `kebab-case`                   | `apply-ca`          |
| Screen key   | `[journey-slug].[screen-slug]` | `apply-ca.intro`    |
| Step code    | `SCREAMING_SNAKE_CASE`         | `ELIGIBILITY_CHECK` |
| Binding path | `camelCase`                    | `accountPurpose`    |

### Immutable Rules

1. **No styling props** — zero visual props. Frontend theme owns everything.
2. **All inputs require `binding`** — no orphaned form fields.
3. **`screenKey` is permanent** — never rename after going live.
4. **`stepCode` is permanent** — may be stored in client checkpoint state.
5. **Always Publish** — draft records not served by API.
6. **State contract is binding** — `binding.path` must exist in journey `initialState`.

### ⚠️ Never Edit via Content-Type Builder UI

Components with `manyToMany` relations crash the CTB validator. Always edit JSON files directly:

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
│   │   ├── controllers/journey.ts              ← core factory
│   │   ├── routes/journey.ts                   ← core CRUD
│   │   └── services/journey.ts
│   ├── screen/
│   │   ├── content-types/screen/schema.json    ← Screen schema (3 dynamic zones)
│   │   ├── controllers/screen.ts               ← overrides findOne (deep populate)
│   │   ├── routes/screen.ts                    ← core CRUD
│   │   └── services/screen.ts
│   └── rule-set/                               ← shared business rules
└── components/
    ├── sdui/   ← 10 behaviour components
    │   ├── action.json
    │   ├── binding.json
    │   ├── data-source.json
    │   ├── on-complete.json
    │   ├── screen-meta.json
    │   ├── source.json
    │   ├── step-system.json       ← NEW
    │   ├── step-user.json         ← NEW
    │   ├── validation.json
    │   └── visibility.json
    └── ui/     ← 29 renderable UI blocks
```
