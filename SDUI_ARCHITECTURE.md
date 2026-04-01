# SDUI Architecture

Server-Driven UI (SDUI) — the **backend owns what appears on each screen**, the **frontend owns how it looks**. No style props in Strapi. All presentation is handled by the frontend theme system.

---

## High-Level Flow

```
Frontend App
  ├── 1. GET /api/journeys/id/:journeyId  → ordered steps[] + screens[] + initialState
  └── 2. GET /api/screens/:documentId     → page blocks for current screen
              ↓
        __component → maps to registered React Native widget
```

---

## Data Model

### `Journey` — Collection Type

| Field               | Type                        | Notes                                                                                      |
| ------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `journeyId`         | UID                         | e.g. `ACCT_CA_APPLY` — public lookup key                                                   |
| `slug`              | UID (auto from `name`)      | e.g. `apply-ca` — auto-generated                                                           |
| `name`              | String (i18n)               | Display name                                                                               |
| `description`       | String (i18n)               | Internal description                                                                       |
| `segment`           | Enum                        | `ETB \| NTB \| ALL`                                                                        |
| `checkpointEnabled` | Boolean                     | Resume from last screen after crash/background                                             |
| `presentation`      | Enum (i18n)                 | `card \| modal \| transparentModal \| containedModal \| containedTransparentModal \| fullScreenModal \| formSheet` |
| `navigator`         | Enum (i18n)                 | Native navigator stack: `CurrentAccountJourneyNavigator \| ETBOnboardCCRegisterJourney`   |
| `preInitiateScreen` | String (i18n, required)     | Screen shown before journey initialises (e.g. eligibility gate)                            |
| `screens`           | oneToMany → Screen          | Ordered screens linked to this journey                                                     |
| `steps`             | `sdui.steps[]` (i18n)       | Ordered step definitions (user + system steps)                                             |
| `initialState`      | JSON                        | Default journey state shape                                                                |
| `analytics`         | JSON                        | Journey-level tracking metadata                                                            |
| `api_version`       | String (required, default `v1`) | Schema/structural version                                                              |
| `content_version`   | Integer (required, default `1`) | Copy/media version                                                                     |

**API:** `GET /api/journeys/id/:journeyId` → `data: {}` (custom `findBySlug` controller, published only)

---

### `Screen` — Collection Type

| Field             | Type               | Notes                                                          |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| `screenId`        | UID                | e.g. `ACCT_CA_ACCOUNT_PURPOSE` — globally unique, never rename |
| `api_version`     | String (required, default `v1`)  | Schema/structural version                        |
| `content_version` | Integer (required, default `1`)  | Copy/media version                               |
| `hideProgressBar` | Boolean (i18n, default `false`)  | Hides the journey progress indicator            |
| `meta`            | `sdui.screen-meta` | Title, subtitle, back/close nav                                |
| `header`          | DynamicZone        | Top area: hero, banner, image-preview, section-label, tab-group, subtitle-label-section |
| `body`            | DynamicZone        | Main content — composable UI components                        |
| `footer`          | DynamicZone        | CTAs: slide-to-confirm, button, banner                         |

> Screens are linked to their Journey via the Journey's `screens` (oneToMany) relation. There is no back-reference on the Screen side.

**API:** `GET /api/screens/:documentId` → `data: {}` (overridden `findOne` — deep populated)

---

### `sdui.steps` — Repeatable Component (on Journey)

A unified step component covering both user-facing and system steps via the `type` discriminator.

| Field             | Type                  | Notes                                                      |
| ----------------- | --------------------- | ---------------------------------------------------------- |
| `type`            | Enum (required)       | `system \| user`                                           |
| `stepCode`        | String (required)     | e.g. `ELIGIBILITY_CHECK`, `ACCT_CA_MOBILE_NUMBER`          |
| `screen`          | oneToOne → Screen     | **User steps only** — screen to render                     |
| `onSubmit`        | JSON                  | **User steps only** — `{ "nextStep": "..." }`              |
| `skip`            | `sdui.visibility`     | Optional — skip this step when condition is met            |
| `skipValidation`  | Boolean (default `false`) | Bypass validation guards for this step                 |
| `actionId`        | String                | Optional — matches button `actionId` for branching         |
| `service`         | String                | **System steps only** — downstream service name            |
| `operation`       | String                | **System steps only** — operation to invoke                |
| `params`          | JSON                  | **System steps only** — request payload                    |
| `onSuccess`       | JSON                  | **System steps only** — `{ "nextStep": "..." }`            |
| `onFailure`       | JSON                  | **System steps only** — `{ "nextStep": "..." }`            |
| `maxRetry`        | Integer (default `3`) | **System steps only** — max retries before failure         |

---

## Relations

```
Journey (1) ──oneToMany──▶ Screen (N)
     │                          │
     │ steps[]           ┌──────┼──────────┐
     │ (sdui.steps)     meta    body      footer
     │    ├── type        │       │           │
     │    ├── screen ──▶ sdui.  ui.*       ui.slide-to-confirm
     │    ├── onSubmit   screen- components  ui.button
     │    ├── skip       meta               ui.banner
     │    ├── service        │
     │    ├── onSuccess   onBack ─▶ sdui.action
     │    └── onFailure          │
     │                 ┌─────────┼──────────┐
     │              binding   visibility  onComplete
     │                 │          │           │
     │          sdui.binding  sdui.vis..  sdui.on-complete
     │                  rule ─▶ rule-set     └─▶ sdui.action
     │                                   guards ─▶ rule-set[]
     └── initialState (JSON)
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
| `sdui.steps`       | Unified journey step definition (user + system)                               |

### `ui.*` — Renderable Blocks

**Header zone** — allowed in `screen.header`

| Component                  | Use                                  |
| -------------------------- | ------------------------------------ |
| `ui.hero`                  | Illustration + title + subtitle      |
| `ui.banner`                | info / warning / error / success strip |
| `ui.image-preview`         | Base64 image from state              |
| `ui.section-label`         | Section heading                      |
| `ui.tab-group`             | Tab filter                           |
| `ui.subtitle-label-section` | Subtitle with supplementary label   |

**Inputs** — always require `sdui.binding`; allowed in `screen.body`

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

**Display** — allowed in `screen.body`

| Component                    | Shows                                  |
| ---------------------------- | -------------------------------------- |
| `ui.hero`                    | Illustration + title + subtitle        |
| `ui.banner`                  | info / warning / error / success strip |
| `ui.section-label`           | Section heading                        |
| `ui.text`                    | Body copy                              |
| `ui.icon-text`               | Icon + text row                        |
| `ui.row`                     | Generic horizontal layout row          |
| `ui.image-preview`           | Base64 image from state                |
| `ui.item-list` / `list-item` | Tappable row list                      |
| `ui.review-card`             | Summary with key-value rows            |
| `ui.kv-row`                  | Single key-value row (inside review-card) |
| `ui.money-display`           | Formatted currency                     |
| `ui.badge`                   | Status badge                           |
| `ui.tab-group`               | Tab filter                             |
| `ui.rich-text`               | Rendered markdown / HTML content       |
| `ui.link`                    | Text-based actionable link             |
| `ui.local-state`             | Non-visual local UI state definition   |

**Actions** — allowed in `screen.footer`

| Component             | Use when                                            |
| --------------------- | --------------------------------------------------- |
| `ui.slide-to-confirm` | High-stakes gesture (submit, sign)                  |
| `ui.button`           | Standard tap (primary / secondary / ghost / danger) |
| `ui.banner`           | Contextual strip in footer                          |

---

## API

```bash
# Journey — by journeyId (custom findBySlug controller, published only)
GET /api/journeys/id/:journeyId
→ data: { journeyId, slug, segment, checkpointEnabled, presentation, navigator,
          preInitiateScreen, screens[], steps[], initialState, analytics,
          api_version, content_version, ... }

# Journey — list all (Strapi default find)
GET /api/journeys

# Screen — deep populated slots (overridden findOne)
GET /api/screens/:documentId
→ data: { screenId, meta, header[], body[], footer[], hideProgressBar,
          api_version, content_version }

# Filter by screenId (for tooling)
GET /api/screens?filters[screenId][$eq]=ACCT_CA_ACCOUNT_PURPOSE

# Lang — localisation strings
GET /api/langs

# Static Screen — static screen variants
GET /api/static-screens/:documentId
```

All endpoints return `data: {}` and serve only **published** records.

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
| **Screens**    | `screenId` is globally unique — any journey can link to any screen  |
| **Components** | Any `ui.*` block appears N times in body                            |
| **Rule sets**  | Shared across `sdui.action.guards` and `sdui.visibility.rule`       |
| **Copy**       | All labels i18n-localized — same structure, different locale        |

---

## Scalability

| Concern            | Solution                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| New journey        | Create Journey + Screens. Zero code.                                   |
| Reorder screens    | Change step order in Journey `steps[]`. No deploy.                     |
| Cache invalidation | Bump `content_version` — client detects and refetches                  |
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
| Step code    | `SCREAMING_SNAKE_CASE` | `ELIGIBILITY_CHECK`         |
| Binding path | `camelCase`            | `accountPurpose`            |

### Immutable Rules

1. **No styling props** — frontend theme owns everything
2. **All inputs require `binding`** — no orphaned form fields
3. **`screenId` is permanent** — never rename after going live
4. **Always Publish** — draft records not served by API
5. **State contract is binding** — `binding.path` must exist in journey `initialState`
6. **Required Version Bump on Publish** — `api_version` or `content_version` must be incremented before publishing a draft update for `screen`, `journey`, or `rule-set`

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
│   │   ├── controllers/journey.ts              ← find, findOne, findBySlug
│   │   ├── routes/journey.ts                   ← core CRUD
│   │   └── services/journey.ts
│   ├── screen/
│   │   ├── content-types/screen/schema.json    ← Screen schema (3 dynamic zones)
│   │   ├── controllers/screen.ts               ← overrides findOne (deep populate)
│   │   ├── mappers/                            ← response transformation
│   │   ├── routes/screen.ts                    ← core CRUD
│   │   └── services/screen.ts
│   ├── rule-set/                               ← shared business rules
│   ├── lang/                                   ← localisation strings
│   └── static-screen/                          ← static screen variants
└── components/
    ├── sdui/   ← 9 behaviour components (incl. sdui.steps)
    └── ui/     ← 30+ renderable UI blocks
```
