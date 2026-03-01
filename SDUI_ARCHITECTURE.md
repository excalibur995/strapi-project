# SDUI Architecture

Server-Driven UI (SDUI) — the **backend owns what appears on each screen**, the **frontend owns how it looks**. Zero style props in Strapi. All presentation is handled by the frontend theme system.

---

## High-Level Flow

```
Frontend App
  ├── 1. GET /api/journeys/:documentId  → ordered screen list + initialState
  └── 2. GET /api/screens/:documentId   → page blocks for current screen
              ↓
        __component → maps to registered React Native widget
```

---

## Data Model

### `Journey` — Collection Type

One end-to-end user flow (e.g. Apply Current Account, KYC, Onboarding).

| Field          | Type               | Notes                           |
| -------------- | ------------------ | ------------------------------- |
| `slug`         | UID                | e.g. `apply-ca`                 |
| `name`         | String (i18n)      | Display name                    |
| `screens`      | oneToMany → Screen | Ordered by `screen.order`       |
| `initialState` | JSON               | Default journey state shape     |
| `onExit`       | `sdui.action`      | Action on journey dismissal     |
| `analytics`    | JSON               | Journey-level tracking metadata |

### `Screen` — Collection Type

One step in a journey. Fully composed from dynamic zone blocks — no hardcoded layout.

| Field       | Type                | Notes                                                           |
| ----------- | ------------------- | --------------------------------------------------------------- |
| `screenKey` | UID                 | e.g. `apply-ca.intro` — globally unique, never rename once live |
| `order`     | Integer             | Sort order within journey                                       |
| `journey`   | manyToOne → Journey | Parent journey                                                  |
| `meta`      | `sdui.screen-meta`  | Title, subtitle, back/close nav, analytics                      |
| `header`    | DynamicZone         | Top area: hero, banner, image-preview                           |
| `body`      | DynamicZone         | Main content — 24 composable UI components                      |
| `footer`    | DynamicZone         | CTAs: slide-to-confirm, button, banner                          |

---

## Relations

```
Journey (1) ──oneToMany──▶ Screen (N)
                                │
                    ┌───────────┼───────────┐
                  meta        body        footer
                    │           │            │
             sdui.screen-meta  ui.*       ui.slide-to-confirm
                    │        components   ui.button
                 onBack ─▶ sdui.action    ui.banner
                                │
                    ┌───────────┼───────────┐
                 binding    visibility   onTap/onComplete
                    │           │            │
             sdui.binding  sdui.visibility  sdui.action
                         rule ─▶ rule-set  guards ─▶ rule-set[]
```

---

## Component Library

### `sdui.*` — Behaviour (never rendered directly)

| Component          | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `sdui.screen-meta` | Screen title, subtitle, back/close nav             |
| `sdui.action`      | Navigate, api_call, open_modal, set_state, etc.    |
| `sdui.binding`     | Two-way state binding for inputs (`path`, `scope`) |
| `sdui.source`      | Read-only state path for display components        |
| `sdui.visibility`  | Conditional show/hide driven by `rule-set`         |
| `sdui.validation`  | Input validation rules                             |
| `sdui.on-complete` | Action fired when a component self-completes       |
| `sdui.data-source` | API endpoint config for async components           |

### `ui.*` — Renderable Blocks (in body/header/footer)

**Inputs** — always require `sdui.binding`

| Component                                  | Captures                                    |
| ------------------------------------------ | ------------------------------------------- |
| `ui.text-input`                            | String                                      |
| `ui.money-input`                           | Number (with currency, min/max)             |
| `ui.radio-group` / `radio-group-async`     | Single select                               |
| `ui.checkbox-list` / `checkbox-list-async` | Multi-select                                |
| `ui.dropdown` / `dropdown-async`           | Select from list/API                        |
| `ui.cascading-select`                      | Hierarchical select                         |
| `ui.account-selector`                      | Bank account picker from API                |
| `ui.passcode-input`                        | Numeric passcode (ephemeral)                |
| `ui.camera-capture`                        | Document / selfie / barcode camera → base64 |

**Display** — read from state via `sdui.source`

| Component                    | Shows                                   |
| ---------------------------- | --------------------------------------- |
| `ui.hero`                    | Illustration + title + subtitle         |
| `ui.banner`                  | info / warning / error / success strip  |
| `ui.section-label`           | Section heading                         |
| `ui.text`                    | Body copy                               |
| `ui.image-preview`           | Base64 image from state                 |
| `ui.item-list` / `list-item` | Tappable row list                       |
| `ui.review-card`             | Summary section with key-value rows     |
| `ui.kv-row`                  | Key-value row (used inside review-card) |
| `ui.money-display`           | Formatted currency amount               |
| `ui.badge`                   | Status badge                            |
| `ui.tab-group`               | Tab filter                              |

**Actions**

| Component             | Use when                                            |
| --------------------- | --------------------------------------------------- |
| `ui.slide-to-confirm` | High-stakes confirmation (submit, sign)             |
| `ui.button`           | Standard tap (primary / secondary / ghost / danger) |

---

## API

```bash
# Journey — Strapi default findOne
GET /api/journeys/:documentId
→ data: {}  (includes screens[] ordered by `order`)

# Screen — overridden findOne with deep populate
GET /api/screens/:documentId
→ data: { meta, header[], body[], footer[] }

# Standard list/filter (for tooling, admin automation)
GET /api/journeys?filters[slug][$eq]=apply-ca
GET /api/screens?filters[screenKey][$eq]=apply-ca.intro
```

Both single-item endpoints return `data: {}` and only serve **published** records.

---

## Journey State Contract

Each journey declares its state shape in `initialState` JSON. All `sdui.binding.path` values in every screen **must match** declared keys.

Example for `apply-ca`:

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

The frontend initialises `journeyState` from this object when the journey starts.

---

## Reusability

| What           | How                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Screens**    | `screenKey` is globally unique — any journey can link to any screen                                              |
| **Components** | Any `ui.*` block appears N times in body. 2 radio groups, 3 review cards — all valid                             |
| **Rule sets**  | `api::rule-set.rule-set` records are shared across all `sdui.action.guards` and `sdui.visibility.rule` relations |
| **Copy**       | All `label`, `title`, `description` fields are `i18n: localized: true` — reuse structure with localised variants |

---

## Scalability

| Concern                     | Solution                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| New journey                 | Create 1 Journey + N Screen records. Zero code.                                                      |
| Reorder screens             | Change `order` field. No deploy.                                                                     |
| Screen in multiple journeys | Screens are independent — any journey can reference same `documentId`                                |
| A/B testing                 | Point two journey variants to different screen records                                               |
| New UI component            | Add `ui.newwidget.json` → add to `screen.body` dynamic zone → frontend registers renderer. 1 deploy. |
| New language                | Strapi i18n — same API with `?locale=id` param                                                       |

---

## Governance

### Naming Conventions

| Item           | Format                         | Example            |
| -------------- | ------------------------------ | ------------------ |
| Journey slug   | `kebab-case`                   | `apply-ca`         |
| Screen key     | `[journey-slug].[screen-slug]` | `apply-ca.intro`   |
| Binding path   | `camelCase`                    | `accountPurpose`   |
| Component file | `kebab-case.json`              | `radio-group.json` |

### Immutable Rules

1. **No styling props** — zero visual props in any schema. Frontend theme owns everything.
2. **All inputs require `binding`** — no orphaned form fields.
3. **All navigation via `sdui.action`** — no hardcoded route strings.
4. **`screenKey` is permanent** — never rename after going live. Clients may cache it.
5. **Always Publish** — draft records are not served by the API.
6. **State contract is binding** — `binding.path` must exist in journey `initialState`.

### ⚠️ Don't use Content-Type Builder UI for these components

Components with `manyToMany` relations break the CTB admin UI validator. Edit their `.json` files directly:

- `src/components/sdui/action.json` — `guards: manyToMany`
- `src/components/ui/slide-to-confirm.json` — `guardRules: manyToMany`
- `src/components/ui/button.json` — `guardRules: manyToMany`

---

## File Structure

```
src/
├── api/
│   ├── journey/
│   │   ├── content-types/journey/schema.json
│   │   ├── controllers/journey.ts        ← core factory (default findOne)
│   │   ├── routes/journey.ts             ← core CRUD
│   │   └── services/journey.ts
│   ├── screen/
│   │   ├── content-types/screen/schema.json
│   │   ├── controllers/screen.ts         ← overrides findOne with deep populate
│   │   ├── routes/screen.ts              ← core CRUD
│   │   └── services/screen.ts
│   └── rule-set/                         ← shared business rules
└── components/
    ├── sdui/   ← 8 behaviour components
    └── ui/     ← 29 renderable UI blocks
```
