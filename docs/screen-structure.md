# Screen Structure Reference

This document describes the SDUI screen schema — the content types, components, and every property they expose.

---

## Table of Contents

1. [Screen (Content Type)](#1-screen-content-type)
2. [Screen Meta (`sdui.screen-meta`)](#2-screen-meta)
3. [Common Properties (shared by all UI components)](#3-common-properties)
4. [SDUI Behavior Components](#4-sdui-behavior-components)
   - [Action](#41-action)
   - [Validation Rule](#42-validation-rule)
   - [Visibility](#43-visibility)
   - [Dynamic Injector](#44-dynamic-injector)
   - [Dynamic Source](#45-dynamic-source)
   - [Source (read-only state path)](#46-source)
   - [On Complete](#47-on-complete)
5. [UI Components — Header Zone](#5-ui-components--header-zone)
   - [Progress Bar](#51-progress-bar)
   - [Text](#52-text)
   - [Image Preview](#53-image-preview)
   - [Banner](#54-banner)
   - [Tab Group](#55-tab-group)
6. [UI Components — Body Zone](#6-ui-components--body-zone)
   - [Text Input](#61-text-input)
   - [Date Input](#62-date-input)
   - [Passcode Input](#63-passcode-input)
   - [Checkbox](#64-checkbox)
   - [Radio Group](#65-radio-group)
   - [Dropdown](#66-dropdown)
   - [Camera Capture](#67-camera-capture)
   - [Item List](#68-item-list)
   - [Review Card](#69-review-card)
   - [Rich Text](#610-rich-text)
   - [Link](#611-link)
   - [Divider](#612-divider)
7. [UI Components — Footer Zone](#7-ui-components--footer-zone)
   - [Button](#71-button)
   - [Slide To Confirm](#72-slide-to-confirm)
8. [Shared Sub-Component](#8-shared-sub-component)
   - [Option](#81-option)

---

## 1. Screen (Content Type)

**File:** `src/api/screen/content-types/screen/schema.json`

A screen is a single renderable page in a journey. It is composed of three ordered dynamic zones stacked vertically: `header → body → footer`.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `screenId` | String | ✓ | — | Unique identifier for this screen (e.g. `ektp_review`). Set manually. Used by journeys and navigation actions to reference this screen. |
| `screenKey` | String | ✓ | — | Human-readable key used internally (e.g. `ACCOUNT_OVERVIEW`). Must be unique per journey. |
| `meta` | Component (`sdui.screen-meta`) | ✓ | — | Title bar configuration — label, back/close buttons, analytics. |
| `header` | DynamicZone | — | — | Top section. Accepts: `progress-bar`, `text`, `image-preview`, `banner`, `tab-group`. |
| `body` | DynamicZone | — | — | Main content section. Accepts all input and display components. |
| `footer` | DynamicZone | — | — | Bottom action section. Accepts: `slide-to-confirm`, `button`, `banner`, `divider`. |
| `version` | Decimal | ✓ | `1` | Content version number. Increment when making breaking changes to invalidate client caches. |
| `isFullScreen` | Boolean | — | `false` | When `true`, the screen renders without a navigation bar (meta/header chrome is hidden). Used for immersive or onboarding screens. |
| `isHeaderNullInstead` | Boolean | — | `false` | When `true`, the API returns `null` for `header` instead of an empty array. Useful for screens that intentionally have no header. |
| `isFooterNullInstead` | Boolean | — | `false` | When `true`, the API returns `null` for `footer` instead of an empty array. Useful for screens that intentionally have no footer. |

---

## 2. Screen Meta

**Component:** `sdui.screen-meta`
**File:** `src/components/sdui/screen-meta.json`

Controls the navigation bar rendered at the top of every screen.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `label` | String | ✓ | — | Title text shown in the navigation bar. Leave empty to render a blank nav bar. |
| `enableBackButton` | Boolean | — | `true` | Shows the back chevron (`←`). Set to `false` on the first screen of a journey or screens that should not allow going back. |
| `enableCloseButton` | Boolean | — | `false` | Shows an `×` close button. Typically enabled on screens presented as a modal or sheet so the user can dismiss the flow entirely. |
| `analytics` | JSON | — | — | Free-form analytics event payload fired on screen view. |

---

## 3. Common Properties

Every UI component (in all three zones) shares this base set of properties. They are documented once here and omitted from individual component tables unless the component overrides the default.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `componentId` | String | — | — | Stable identifier used by the frontend to target this specific component (e.g. for focus management or test automation). |
| `testId` | String | — | — | Identifier injected as `testID` on the native element for E2E test selection. |
| `name` | String | — | — | State key under which this component's value is stored in the journey/local/server state object. Required on all interactive (input) components. |
| `label` | String / Text | ✓ | — | Human-readable label rendered above or alongside the component. |
| `defaultValue` | String | — | — | Initial value pre-populated when the screen loads. Can be overridden at runtime via `dynamic`. |
| `enabled` | Boolean | — | `true` | When `false`, the component is rendered but non-interactive (greyed out). |
| `editable` | Boolean | — | `true` | When `false`, the value is displayed but cannot be changed by the user. |
| `visible` | Boolean | — | `true` | Static initial visibility. Use `visibility` component for rule-based show/hide. |
| `required` | Boolean | — | `false` | Marks the field as mandatory. Pair with a `validations` entry of rule `required` for a user-facing error message. |
| `prefix` | String | — | — | Text or symbol displayed before the input value (e.g. `+62` for a phone prefix). |
| `suffix` | String | — | — | Text or symbol displayed after the input value (e.g. `%` or a unit). |
| `maxLength` | String | — | — | Maximum character/item length. Enforcement depends on component type. |
| `span` | Integer | — | — | Grid column span (1–12). Controls width in multi-column layouts. Defaults vary per component. |
| `scope` | Enum | — | `journeyState` | Which state bucket this component reads/writes. Options: `journeyState` (persisted across screens), `localState` (screen-scoped), `serverState` (read-only server data). |
| `toggleField` | Boolean | — | `false` | When `true`, this component acts as a toggle that shows/hides the field referenced by `toggleFieldReff`. |
| `toggleFieldReff` | String | — | — | The `name` of another component to show/hide when `toggleField` is `true`. |
| `toggleFieldCollapse` | Boolean | — | `false` | When `true`, toggling collapses the referenced field instead of hiding it entirely. |
| `collapsable` | Boolean | — | `false` | When `true`, this component can be collapsed (hidden) based on a condition. |
| `collapseCondition` | String | — | — | Expression or state path evaluated to determine if the component should collapse. |
| `dependsOn` | String | — | — | `name` of another component this one depends on. When the referenced component changes value, this component re-evaluates (re-fetches options, re-validates, resets value). |
| `cascadeResets` | String | — | — | Comma-separated `name`s of components whose values should be cleared when this component's value changes. |
| `dataSource` | JSON | — | — | Async data source configuration for fetching options or content at runtime (overrides static `options`). Shape: `{ "url": "https://...", "dependsOn": "<componentName> or null" }`. The `:code` segment in URLs is replaced at runtime with the value of the `dependsOn` component (e.g. `"https://api/regencies/:code.json"`). |
| `visibility` | Component (`sdui.visibility`) | — | — | Rule-based show/hide. When attached, the component's static `visible` flag is ignored. |
| `validations` | Component (`sdui.validation`, repeatable) | — | — | One entry per validation constraint. Evaluated on submit or blur. |
| `dynamic` | Component (`sdui.dynamic`) | — | — | Runtime injection of label, options, or value from state or a service. See [§4.4 Dynamic Injector](#44-dynamic-injector). |

---

## 4. SDUI Behavior Components

These are non-visual configuration components embedded inside UI components.

### 4.1 Action

**Component:** `sdui.action`
**File:** `src/components/sdui/action.json`

Describes a side-effect triggered by a user interaction (button tap, banner tap, link tap, slide completion).

| Property | Type | Required | Description |
|---|---|---|---|
| `key` | String | ✓ | Unique key identifying this action within the screen. Used for deduplication and analytics. |
| `type` | Enum | ✓ | What the action does. See values below. |
| `payload` | JSON | — | Arguments passed to the action handler. Shape depends on `type`. |
| `guards` | JSON | — | Conditions that must be true before the action fires. Evaluated client-side against current state. |
| `analytics` | JSON | — | Event payload sent to the analytics pipeline when the action is triggered. |
| `onSuccess` | JSON | — | Follow-up action definition executed after a successful `api_call` or `submit_journey`. |
| `onFailed` | JSON | — | Follow-up action definition executed when an `api_call` or `submit_journey` fails. |

**Action `type` values:**

| Value | Description |
|---|---|
| `navigate` | Push a new screen by `screenId`. |
| `start_journey` | Start a new journey from scratch. |
| `resume_journey` | Resume an in-progress journey at its last screen. |
| `api_call` | Fire an API request. Payload contains endpoint, method, and body mapping. |
| `open_modal` | Present a screen as a modal overlay. |
| `open_sheet` | Present a screen as a bottom sheet. |
| `open_confirm` | Show a confirmation dialog before proceeding. |
| `open_native` | Open a native system screen (e.g. camera permissions, biometrics). |
| `set_state` | Write a value directly into journey/local state without a network call. |
| `open_document` | Open a document viewer (PDF, URL). |
| `submit_journey` | Submit the current journey's accumulated state to the server. |

---

### 4.2 Validation Rule

**Component:** `sdui.validation` (repeatable)
**File:** `src/components/sdui/validation.json`

Each entry is one discrete validation constraint. Multiple entries can be attached to a single component.

| Property | Type | Required | Description |
|---|---|---|---|
| `rule` | Enum | ✓ | The constraint type. See values below. |
| `value` | String | — | The constraint parameter (e.g. `"8"` for `minLength`). Not needed for `required` or `ruleSet`. |
| `message` | String (i18n) | ✓ | Error message shown to the user when validation fails. |
| `ruleSet` | Relation (`rule-set`) | — | Links to a shared `RuleSet` entry. Used when `rule = ruleSet`. |

**Example validations array in API response:**

```json
"validations": [
  { "id": 838, "rule": "required", "value": null, "message": "e-KTP number is required", "ruleSet": null },
  { "id": 839, "rule": "pattern", "value": "^[0-9]{16}$", "message": "Must be exactly 16 digits", "ruleSet": null }
]
```

**`rule` values:**

| Value | Description |
|---|---|
| `required` | Field must not be empty. |
| `minLength` | Value must have at least `value` characters. |
| `maxLength` | Value must not exceed `value` characters. |
| `pattern` | Value must match the regex in `value`. |
| `match` | Value must equal the value of another field (referenced by `name` in `value`). Used for confirm-password patterns. |
| `ruleSet` | Delegates validation logic to a shared `RuleSet` entry. |

---

### 4.3 Visibility

**Component:** `sdui.visibility`
**File:** `src/components/sdui/visibility.json`

Controls whether a component is shown or hidden based on a rule set.

| Property | Type | Required | Description |
|---|---|---|---|
| `rule` | Relation (`rule-set`) | — | Links to a `RuleSet` entry whose logic is evaluated against current state. When the rule passes, the component is shown. |
| `elseHidden` | Boolean | — | Default `true`. When the rule fails (or is absent), whether the component is hidden (`true`) or shown (`false`). |

---

### 4.4 Dynamic Injector

**Component:** `sdui.dynamic`
**File:** `src/components/sdui/dynamic.json`

Overrides a static field of a UI component at runtime with a value from state or a service call.

| Property | Type | Required | Description |
|---|---|---|---|
| `enabled` | Boolean | ✓ | Master switch. Set to `false` to temporarily disable injection without removing the config. |
| `type` | Enum | ✓ | `CONTENT` — inject text into a label/placeholder field. `OPTIONS` — inject a list of options into a select/radio/dropdown. `VALUE` — prefill `defaultValue`. |
| `target` | Enum | ✓ | The specific field on the component to overwrite: `label`, `title`, `subtitle`, `placeholder`, `description`, `helperText`, `richTextContent`, `options`, `defaultValue`, `prefill`. |
| `source` | Component (`sdui.dynamic-source`) | ✓ | Describes where to pull the injected value from. |

**Example — prefill from state (FACT):**

```json
"dynamic": {
  "id": 82,
  "enabled": true,
  "type": "VALUE",
  "target": "defaultValue",
  "source": { "id": 82, "type": "FACT", "path": "myInfoFullName", "serviceCode": null }
}
```

**Example — inject options from a service (SERVICE):**

```json
"dynamic": {
  "id": 81,
  "enabled": true,
  "type": "OPTIONS",
  "target": "options",
  "source": { "id": 81, "type": "SERVICE", "path": null, "serviceCode": "GET_OCCUPATIONS" }
}
```

---

### 4.5 Dynamic Source

**Component:** `sdui.dynamic-source`
**File:** `src/components/sdui/dynamic-source.json`

Paired with `sdui.dynamic`, describes where the runtime value comes from.

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | Enum | ✓ | `FACT` — read from a dot-path in current state. `SERVICE` — fetch from a downstream service. |
| `path` | String | — | Dot-notation path into the state object. Used when `type = FACT` (e.g. `myInfoFullName`, `journeyState.user.name`). |
| `serviceCode` | String | — | Identifier of the downstream service to call. Used when `type = SERVICE`. |

---

### 4.6 Source

**Component:** `sdui.source`
**File:** `src/components/sdui/source.json`

A read-only state binding used by display components (e.g. `money-display`) to pull a live value from state.

| Property | Type | Required | Description |
|---|---|---|---|
| `path` | String | ✓ | Dot-notation path to the value in state (e.g. `journeyState.loanAmount`). |
| `scope` | Enum | — | Which state bucket to read from: `journeyState`, `localState`, `serverState`. Default `journeyState`. |
| `transform` | Enum | — | Optional transformation applied before display: `none`, `capitalize`, `uppercase`, `currency`, `date`, `mask`. |
| `format` | Enum | — | Formatting applied to the raw value: `none`, `currency`, `date`, `percent`. |
| `currency` | String | — | Currency code used when `format = currency` (e.g. `IDR`, `USD`). |

---

### 4.7 On Complete

**Component:** `sdui.on-complete`
**File:** `src/components/sdui/on-complete.json`

An action that fires automatically when a component reaches a terminal/complete state (e.g. passcode entry fills all digits, camera capture finishes).

| Property | Type | Required | Description |
|---|---|---|---|
| `action` | Component (`sdui.action`) | ✓ | The action to execute. Same schema as a regular action. |

---

## 5. UI Components — Header Zone

The header zone sits at the top of the screen, above the scrollable body. Typically used for progress indicators, hero imagery, or contextual banners.

### 5.1 Progress Bar

**Component:** `ui.progress-bar`
Shows multi-step journey progress.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `currentStep` | Integer | ✓ | — | The current step number (1-based). |
| `maxStep` | Integer | ✓ | — | Total number of steps in the journey. |
| `span` | Integer | — | `12` | Grid span (full width by default). |
| *(+ common properties)* | | | | |

---

### 5.2 Text

**Component:** `ui.text`
Static or dynamic text block.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | Enum | — | `body` | Typography style: `title`, `subtitle`, `body`, `note`, `caption`, `label`. |
| `placement` | JSON | — | — | Positioning hints for the frontend renderer (e.g. alignment). |
| *(+ common properties)* | | | | |

---

### 5.3 Image Preview

**Component:** `ui.image-preview`
Displays a static media asset or a base64 image from state.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `media` | Media | — | — | Static image/file asset uploaded in Strapi. Used for design-time images. |
| `editable` | Boolean | — | `false` | Always read-only by default (unlike other components). |
| `placement` | JSON | — | — | Positioning and sizing hints for the renderer. |
| *(+ common properties)* | | | | |

---

### 5.4 Banner

**Component:** `ui.banner`
Contextual strip for info, warnings, success, or error messages.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `variant` | Enum | — | `info` | Visual style: `info`, `warning`, `success`, `error`. Controls color and icon. |
| `media` | Media | — | — | Optional icon or image asset displayed inside the banner. |
| `action` | Component (`sdui.action`) | — | — | Action fired when the user taps the banner. |
| *(+ common properties)* | | | | |

---

### 5.5 Tab Group

**Component:** `ui.tab-group`
Horizontal tab switcher. The selected tab value is written to `name` in state and can be used by `item-list` or `visibility` rules to filter content.

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | String | ✓ | State key that holds the active tab value. |
| `defaultValue` | String | — | The tab value selected on initial render. |
| `dataSource` | JSON | — | Async source for tab labels/values (replaces hardcoded options). |
| *(+ common properties)* | | | |

---

## 6. UI Components — Body Zone

The body zone is scrollable. It contains all form inputs, display blocks, and lists.

### 6.1 Text Input

**Component:** `ui.text-input`
Single-line free-text field.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `placeholder` | String | ✓ | — | Ghost text shown when the field is empty. |
| `helperText` | String | ✓ | — | Subtitle hint shown below the field. |
| `inputMode` | Enum | — | `text` | Keyboard type: `text`, `numeric`, `email`, `phone`. |
| `minLength` | Integer | — | — | Minimum character count. |
| `maxLength` | Integer | — | — | Maximum character count (enforced as the user types). |
| *(+ common properties)* | | | | |

---

### 6.2 Date Input

**Component:** `ui.date-input`
Native date-picker field.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `placeholder` | String | ✓ | — | Ghost text shown when no date is selected. |
| `displayFormat` | String | — | `dd MMM yyyy` | How the selected date is shown to the user in the field. |
| `valueFormat` | String | — | `yyyy-MM-dd` | How the date value is stored in state and submitted. |
| *(+ common properties)* | | | | |

---

### 6.3 Passcode Input

**Component:** `ui.passcode-input`
Masked numeric PIN entry.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `length` | Integer | ✓ | `6` | Number of passcode digits. Renders that many input cells. |
| `masked` | Boolean | — | `true` | When `true`, entered digits are replaced with dots. |
| `keyboard` | Enum | — | `numpad` | Keyboard type: `numpad` (number-only keypad) or `default` (full keyboard). |
| `onComplete` | Component (`sdui.on-complete`) | ✓ | — | Action fired automatically once all `length` digits are entered. |
| `onForgot` | Component (`sdui.action`) | — | — | Action fired when the user taps a "Forgot passcode?" link rendered below the input. |
| *(+ common properties)* | | | | |

---

### 6.4 Checkbox

**Component:** `ui.checkbox`
Single boolean toggle with an optional section heading.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `title` | String | ✓ | — | Optional section heading rendered above the checkbox row. |
| `defaultValue` | Boolean | — | `false` | Initial checked state. |
| `span` | Integer | — | `12` | Full width by default. |
| *(+ common properties)* | | | | |

---

### 6.5 Radio Group

**Component:** `ui.radio-group`
Single-select list of radio options.

| Property | Type | Description |
|---|---|---|
| `dataSource` | JSON | Async source for option list (replaces static options). |
| `defaultValue` | String | The `value` of the option pre-selected on render. |
| *(+ common properties)* | | |

Options are injected at runtime via `dynamic` (type `OPTIONS`) or `dataSource`. Static options are not defined in this component's schema.

---

### 6.6 Dropdown

**Component:** `ui.dropdown`
Single-select picker presented as a bottom sheet or modal.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `placeholder` | String | ✓ | — | Ghost text shown before a selection is made. |
| `searchable` | Boolean | — | `false` | When `true`, renders a search field at the top of the picker list. |
| `options` | Component (`ui.option`, repeatable) | — | — | Static list of selectable options. Override with `dataSource` for dynamic lists. |
| *(+ common properties)* | | | | |

**Cascading dropdown pattern** — use `dependsOn` + `dataSource.dependsOn` + `cascadeResets` together:

```json
{ "__component": "ui.dropdown", "name": "ektpReviewProvince",
  "cascadeResets": "ektpReviewCity,ektpReviewSubDistrict",
  "dataSource": { "url": "https://wilayah.id/api/provinces.json", "dependsOn": null } },

{ "__component": "ui.dropdown", "name": "ektpReviewCity",
  "dependsOn": "ektpReviewProvince",
  "cascadeResets": "ektpReviewSubDistrict",
  "dataSource": { "url": "https://wilayah.id/api/regencies/:code.json", "dependsOn": "ektpReviewProvince" } },

{ "__component": "ui.dropdown", "name": "ektpReviewSubDistrict",
  "dependsOn": "ektpReviewCity",
  "dataSource": { "url": "https://wilayah.id/api/districts/:code.json", "dependsOn": "ektpReviewCity" } }
```

---

### 6.7 Camera Capture

**Component:** `ui.camera-capture`
Full-screen camera with a configurable overlay for document or selfie capture. On capture, the base64 image is saved to state under `name`.

| Property | Type | i18n | Default | Description |
|---|---|---|---|---|
| `overlayShape` | Enum | — | `rectangle` | Shape of the capture guide: `rectangle` (ID card), `circle` (selfie), `none`. |
| `overlayAspect` | String | — | — | Aspect ratio of the overlay (e.g. `"1.586"` for standard credit card ratio). |
| `overlayHint` | String | ✓ | — | Instruction text shown inside or below the overlay (e.g. "Align your ID card"). |
| `onComplete` | Component (`sdui.on-complete`) | ✓ | — | Action fired automatically after the user confirms the captured image. |
| *(+ common properties)* | | | | |

---

### 6.8 Item List

**Component:** `ui.item-list`
Tappable list of rows, optionally filtered by a tab group.

| Property | Type | Required | Description |
|---|---|---|---|
| `componentId` | String | ✓ | Must be unique. Used by the tab filter mechanism. |
| `filterBy` | String | — | The `name` of a `tab-group` component. When set, the list only shows items matching the active tab value. |
| `options` | Component (`ui.option`, repeatable) | — | Static row definitions. Override with `dataSource` for async lists. |
| *(+ common properties)* | | | |

---

### 6.9 Review Card

**Component:** `ui.review-card`
Read-only summary card, typically used on confirmation screens to show what the user entered across previous screens.

| Property | Type | Description |
|---|---|---|
| `items` | JSON | Array of row descriptors. Each row reads a value from state and displays it as a label/value pair. |
| *(+ common properties)* | | |

**`items` row shape:**

| Field | Type | Description |
|---|---|---|
| `label` | String | Display label for this row (e.g. `"Full name"`). |
| `path` | String | Dot-notation state path to read the value from (e.g. `"journeyState.fullName"`). |
| `format` | Enum | Optional formatting: `none`, `currency`, `date`, `mask`. |

**Example:**

```json
"items": [
  { "label": "Full name", "path": "journeyState.fullName", "format": "none" },
  { "label": "Date of birth", "path": "journeyState.dateOfBirth", "format": "date" }
]
```

---

### 6.10 Rich Text

**Component:** `ui.rich-text`
Renders Strapi block content (Markdown/rich text) as formatted native text.

| Property | Type | Required | Description |
|---|---|---|---|
| `content` | Blocks | ✓ | The rich-text body authored in the Strapi block editor. Supports headings, paragraphs, bold/italic, lists, and links. |
| *(+ common properties)* | | | |

---

### 6.11 Link

**Component:** `ui.link`
Inline tappable text link.

| Property | Type | Required | Description |
|---|---|---|---|
| `label` | String | ✓ | The link text displayed to the user. |
| `action` | Component (`sdui.action`) | — | Action fired when the user taps the link. |
| *(+ common properties)* | | | |

---

### 6.12 Divider

**Component:** `ui.divider`
Horizontal rule line with an optional centred label.

| Property | Type | Default | Description |
|---|---|---|---|
| `label` | String (i18n) | — | Optional text centred on the divider line (e.g. "or"). |
| `span` | Integer | `12` | Full width by default. |
| *(+ common properties)* | | | |

---

## 7. UI Components — Footer Zone

The footer zone is fixed at the bottom of the screen (does not scroll with body content).

### 7.1 Button

**Component:** `ui.button`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | String (i18n) | ✓ | — | Button text. |
| `variant` | Enum | — | `primary` | Visual style: `primary`, `secondary`, `ghost`, `danger`, `promo`. |
| `action` | JSON | — | — | Action fired on tap. Stored inline as JSON with the same shape as `sdui.action` (see [§4.1](#41-action)). Common shorthand values: `{ "type": "NEXT_SCREEN" }`, `{ "type": "PREV_SCREEN" }`. Full actions include `key`, `payload`, `guards`, etc. |
| `icon` | JSON | — | — | Icon descriptor. Shape: `{ "name": "<icon-name>", "position": "left" \| "right" }`. |
| `placement` | JSON | — | — | Layout hints (e.g. `{ "align": "left" \| "right" \| "full" }`). |
| *(+ common properties)* | | | | |

**Example:**

```json
{
  "__component": "ui.button",
  "label": "Next",
  "variant": "primary",
  "action": { "type": "NEXT_SCREEN" }
}
```

---

### 7.2 Slide To Confirm

**Component:** `ui.slide-to-confirm`
Swipe-to-submit gesture control. Prevents accidental submission.

| Property | Type | Required | Description |
|---|---|---|---|
| `label` | String (i18n) | ✓ | Instruction text overlaid on the track (e.g. "Slide to confirm transfer"). |
| `action` | Component (`sdui.action`) | ✓ | Action fired once the user drags the thumb to the end of the track. |
| `guardRules` | JSON | — | Client-side conditions that must be true before the slide gesture is enabled. When a guard fails, the control renders as disabled. |
| *(+ common properties)* | | | |

---

## 8. Shared Sub-Component

### 8.1 Option

**Component:** `ui.option`
A single selectable item used inside `dropdown`, `radio-group`, and `item-list`.

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | String | ✓ | — | The value written to state when this option is selected. |
| `label` | String (i18n) | — | — | Display text shown to the user. Falls back to `value` if omitted. |
| `disabled` | Boolean | — | `false` | When `true`, the option is rendered but cannot be selected. |
| `media` | Media (image) | — | — | Optional image displayed alongside the label (e.g. a flag for country selection). |
| `path` | String | — | — | State path used when the option represents a navigation target or dynamic value. |
| `visibility` | Component (`sdui.visibility`) | — | — | Rule-based show/hide for this specific option. |
| `validations` | Component (`sdui.validation`, repeatable) | — | — | Per-option validation rules. |
| `dependsOn` | String | — | — | Makes this option re-evaluate when the named component changes. |
| `dataSource` | JSON | — | — | Async data source for option content. Same shape as the parent component's `dataSource`. |

**Example option in API response:**

```json
{
  "id": 2921,
  "testId": null,
  "label": "Male",
  "value": "male",
  "disabled": false,
  "dependsOn": null,
  "type": null,
  "path": null,
  "dataSource": null,
  "media": null,
  "visibility": null,
  "validations": []
}
```
