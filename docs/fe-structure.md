# StrapiPoc — Frontend Architecture Guide

This document describes how the React Native app works end-to-end — from API data to rendered UI — so any agent or developer can understand and extend it confidently.

---

## Table of Contents

1. [High-Level Concept](#1-high-level-concept)
2. [Folder Structure](#2-folder-structure)
3. [API Layer](#3-api-layer)
4. [SDUI Type System](#4-sdui-type-system)
5. [Component Registry & Rendering Pipeline](#5-component-registry--rendering-pipeline)
6. [Journey Flow](#6-journey-flow)
7. [Session & State Management](#7-session--state-management)
8. [Validation System](#8-validation-system)
9. [Navigation](#9-navigation)
10. [Widget Anatomy](#10-widget-anatomy)
11. [Data Flow End-to-End](#11-data-flow-end-to-end)
12. [Key Conventions](#12-key-conventions)

---

## 1. High-Level Concept

The app is **Server-Driven UI (SDUI)**. The server (Strapi) describes _what_ to render — every screen's layout, inputs, labels, validations, and button actions — and the mobile app renders it without hardcoded screen logic.

Two types of API resources drive everything:

| Resource | Purpose |
|---|---|
| **Journey** | A multi-step flow (e.g. apply for current account). Contains an ordered list of screen IDs. |
| **Screen** | A single page within a journey. Contains three render zones: `header`, `body`, `footer`. Each zone is a list of SDUI component blocks. |

The app never hardcodes form fields or page structure. Adding a new screen or field only requires a Strapi change.

---

## 2. Folder Structure

```
src/
├── components/
│   ├── core/               # SDUI rendering engine + validation
│   │   ├── DynamicScreenZone.tsx      # Screen shell: loads data, owns ValidationProvider
│   │   ├── DynamicZoneRenderer.tsx    # Renders a zone (header/body/footer) as a 12-col grid
│   │   ├── ScreenHeader.tsx           # Nav bar driven by SduiScreenMeta
│   │   └── ValidationContext.tsx      # Context: register/validate/error fields
│   ├── registry/
│   │   └── ComponentRegistry.ts       # Maps "ui.button" → ButtonWidget, etc.
│   └── widget/             # One file per SDUI component type (~30 widgets)
├── hooks/
│   ├── useJourneyNavigation.ts        # Navigate between screens, manage loading state
│   └── useDynamicScreenState.ts       # Screen-level: validate before advance, exit alert
├── navigator/
│   ├── MainNavigator.tsx              # Root navigator, QueryClientProvider
│   └── CurrentAccountJourneyNavigator.tsx  # Dynamic journey stack
├── screens/                # Non-SDUI screens (Login, Dashboard, Splash, etc.)
├── store/
│   └── useJourneyStore.ts             # Zustand + MMKV: journey session persistence
├── types/
│   └── sdui.types.ts                  # All SDUI interfaces (Journey, Screen, every widget type)
└── utils/
    ├── api/
    │   ├── client.ts                  # Axios + ETag caching
    │   └── journey.ts                 # fetchJourney(), fetchScreen()
    ├── queries/
    │   └── journey-queries.ts         # React Query hooks: useJourney, useScreen
    ├── config/
    │   └── fallbackJourney.ts         # Offline fallback journey config
    ├── helpers.ts                     # getimageuri() — prepends Strapi base URL
    ├── evaluateVisibility.ts          # Evaluates SduiVisibility rules
    └── storage.ts                     # MMKV storage instances
```

---

## 3. API Layer

### Endpoints

```
GET /api/journeys/:journeyId    → Journey
GET /api/screens/:screenId      → Screen
```

Example:
```
GET http://localhost:1337/api/journeys/apply_ca_journey
GET http://localhost:1337/api/screens/e_ktp_capture_screen
```

### Caching

- **Journey config**: `staleTime: Infinity` — static, never re-fetched during session.
- **Screen data**: `staleTime: 0` — always fresh, but ETag header prevents re-download if unchanged.
- React Query is used for all data fetching (`useJourney`, `useScreen`).
- `preloadJourney()` prefetches a journey before the user enters it.

### Image URIs

All Strapi media URLs are relative (e.g. `/uploads/file.svg`). Use:
```typescript
import { getimageuri } from '../../utils/helpers';
const fullUri = getimageuri(media.url); // → "http://localhost:1337/uploads/file.svg"
```

For production, update the base URL in `helpers.ts`.

---

## 4. SDUI Type System

All types live in `src/types/sdui.types.ts`.

### Core Primitives

| Type | Purpose |
|---|---|
| `SduiBinding` | Maps a component's value to a path in journey state. `path` is the key in `journeyState`. |
| `SduiValidationRule` | Single rule: `required`, `email`, `minLength`, `maxLength`, `pattern`, `match`, `ruleSet`. |
| `SduiVisibility` | Conditional show/hide rule evaluated against journey state. |
| `SduiAction` | Button action: `navigate`, `api_call`, `open_modal`, etc. |
| `SduiScreenMeta` | Nav bar config: `label`, `enableBackButton`, `enableCloseButton`. |
| `StrapiMedia` | Strapi media object with `url`, `mime`, `width`, `height`, etc. |

### Screen Structure

```typescript
interface Screen {
  screenId: string;
  meta: SduiScreenMeta;
  header: HeaderComponent[];   // Progress bar, hero, banners
  body: BodyComponent[];       // Inputs, text, lists
  footer: FooterComponent[];   // Buttons, slide-to-confirm
}
```

### Component Block Shape

Every block in a zone has:
- `__component`: string key (e.g. `"ui.text-input"`) used to look up the widget
- `id`, `componentId`, `testId`, `span`: base fields
- `binding`: maps the component's value → `journeyState[binding.path]`
- `validations`: array of validation rules
- `dynamic`: runtime injection config
- `visibility`: conditional display rule
- Component-specific fields (`label`, `placeholder`, `options`, etc.)

---

## 5. Component Registry & Rendering Pipeline

### Registry (`ComponentRegistry.ts`)

Maps SDUI type strings to React Native components:

```typescript
const registry = {
  'ui.text':            TextWidget,
  'ui.text-input':      TextInputWidget,
  'ui.button':          ButtonWidget,
  'ui.checkbox':        CheckboxWidget,
  'ui.image-preview':   ImagePreviewWidget,
  // ... ~30 total
};

getComponent('ui.button') // → ButtonWidget
```

To add a new widget: create the component, import it, add the mapping.

### Rendering Pipeline

```
DynamicScreenZone
  └─ ValidationProvider (wraps whole screen)
      ├─ ScreenHeader (from meta)
      └─ ScrollView
          ├─ DynamicZoneRenderer (header blocks)
          ├─ DynamicZoneRenderer (body blocks)
          └─ DynamicZoneRenderer (footer blocks)  ← sticky, outside ScrollView
```

**DynamicZoneRenderer** iterates blocks in a 12-column flex grid:

```typescript
// Each block gets width = (span / 12) * 100%
// Default span: 12 (full width)
// ui.row columns default to span 6
```

**DynamicBlock** for each block:
1. `evaluateVisibility(block.visibility, journeyId)` — skip render if false
2. `getComponent(block.__component)` — look up widget
3. Render: `<Component {...block} journeyId onNavigate isLoading isExecuting />`

The spread `{...block}` passes all SDUI fields directly as props to the widget.

---

## 6. Journey Flow

### Lifecycle

```
User taps "Start Journey"
  → CurrentAccountJourneyNavigator loads
  → useJourney(journeyId) fetches journey config
  → initialRouteName = screens[0].screenId
  → React Navigation renders first screen

Per screen:
  → DynamicScreenZone mounts
  → useScreen(screenId) fetches screen data
  → Renders header / body / footer zones
  → User fills inputs (updates journeyState)
  → User taps Next → validation → navigate forward
  → Repeat for each screen

Last screen or FINISH_JOURNEY:
  → clearSession(journeyId)
  → navigation.reset() back to preStartScreen (e.g. Dashboard)
```

### Navigation Actions

Buttons fire these action types via `onNavigate`:

| Type | Behaviour |
|---|---|
| `NEXT_SCREEN` | Validate all fields → advance to next screen |
| `PREV_SCREEN` | Go back, **no validation** |
| `FINISH_JOURNEY` | Clear session → reset to entry point |
| `SOCIAL_LOGIN` | Run OAuth mock (Google/Apple) → store token → advance |
| `{ target: "screenId" }` | Jump directly to a named screen |

### Back Button vs Forward Button

`useDynamicScreenState.handleNavigate()` checks:

```typescript
const isBack = action.type === 'PREV_SCREEN';
if (!isBack) {
  const isValid = validateAll();
  if (!isValid) return; // block navigation
}
navigate(action);
```

Back always passes. Forward is gated by validation.

---

## 7. Session & State Management

### `useJourneyStore` (Zustand + MMKV)

Stores per-journey sessions. Survives navigation, background, and app restarts.

```typescript
interface JourneySession {
  currentScreenIndex: number;
  journeyState: Record<string, unknown>;  // All form field values
}
```

**Reading a value:**
```typescript
const session = useJourneyStore(state => state.getSession(journeyId));
const value = session?.journeyState[bindingPath] ?? defaultValue;
```

**Writing a value (widget onChange):**
```typescript
const updateSession = useJourneyStore(state => state.updateSession);
updateSession(journeyId, {
  journeyState: {
    ...session?.journeyState,
    [bindingPath]: newValue,
  },
});
```

**Clearing (on finish/exit):**
```typescript
clearSession(journeyId); // removes from Zustand + MMKV
```

### State Scopes

`SduiBinding.scope` describes where to read/write:
- `journeyState` — the main form state (most common)
- `localState` — screen-local, not persisted
- `serverState` — read-only, fetched from server

---

## 8. Validation System

### How it works

`ValidationProvider` wraps each screen. Widgets register their rules on mount and unregister on unmount.

```typescript
// Widget registers on mount:
useEffect(() => {
  registerValidation(bindingPath, validations);
  return () => unregisterValidation(bindingPath);
}, [bindingPath, validations]);
```

**On blur** (field-level):
```typescript
validateField(bindingPath, currentValue); // runs rules, sets error
```

**On Next button press** (screen-level):
```typescript
const isValid = validateAll(); // reads ALL fields from journeyState, returns false if any fail
if (!isValid) return; // block navigation
```

### Rule types

| Rule | Behaviour |
|---|---|
| `required` | Fails if value is `undefined`, `null`, `false`, or `""` |
| `email` | Must match email regex |
| `minLength` / `maxLength` | String length |
| `pattern` | Regex test against value |
| `match` | Value must equal `journeyState[rule.value]` |

### Displaying errors

Widgets read errors from context:
```typescript
const { errors } = useValidation();
const error = errors[bindingPath]; // string | undefined
// Render: {error && <Text style={errorStyle}>{error}</Text>}
```

---

## 9. Navigation

### Stack Setup

```
MainNavigator (NativeStack)
  ├─ SplashScreen
  ├─ LoginScreen
  ├─ Dashboard
  └─ CurrentAccountJourneyNavigator (NativeStack)
       ├─ screen_1_id  → DynamicScreenZone (screenId="screen_1_id")
       ├─ screen_2_id  → DynamicScreenZone
       └─ ...
```

`CurrentAccountJourneyNavigator` dynamically builds its route map from `journey.screens`:

```typescript
screens.map(screen => (
  <Stack.Screen
    key={screen.screenId}
    name={screen.screenId}
    component={DynamicScreenZone}
    initialParams={{ journeyId, screenId: screen.screenId }}
  />
))
```

### Per-Component Loading State

Only the pressed button spins. Other buttons stay enabled.

```typescript
const isLoading = isActionExecuting(block.componentId); // true only for THIS block
<Component isLoading={isLoading} ... />
```

`isExecuting` (global) is `true` if any component is loading — use it to block the whole screen for critical ops.

---

## 10. Widget Anatomy

Every widget follows the same pattern:

```typescript
export const MyWidget: React.FC<MyWidgetProps> = ({
  binding,
  validations,
  journeyId,
  label,
  testId,
  // ... component-specific props
}) => {
  // 1. Validation context
  const { registerValidation, unregisterValidation, errors, clearError, validateField } = useValidation();

  // 2. Session read/write
  const updateSession = useJourneyStore(state => state.updateSession);
  const session = useJourneyStore(state => state.getSession(journeyId));
  const bindingPath = binding?.path ?? '';
  const value = session?.journeyState[bindingPath] ?? binding?.defaultValue ?? '';
  const error = errors[bindingPath];

  // 3. Register validation rules on mount
  useEffect(() => {
    if (bindingPath && validations?.length) registerValidation(bindingPath, validations);
    return () => { if (bindingPath) unregisterValidation(bindingPath); };
  }, [bindingPath, validations]);

  // 4. Handle change → write to session
  const handleChange = (newValue) => {
    updateSession(journeyId, { journeyState: { ...session?.journeyState, [bindingPath]: newValue } });
    if (error) clearError(bindingPath);
  };

  // 5. Handle blur → validate field
  const handleBlur = () => validateField(bindingPath, value);

  // 6. Render
  return (
    <View>
      <TextInput value={value} onChangeText={handleChange} onBlur={handleBlur} />
      {error && <Text>{error}</Text>}
    </View>
  );
};
```

### Media Rendering (SVG vs raster)

Use `SvgUri` for SVGs, `Image` for everything else. Check `mime` or file extension:

```typescript
import { SvgUri } from 'react-native-svg';
import { getimageuri } from '../../utils/helpers';

const uri = getimageuri(media.url);
const isSvg = media.mime === 'image/svg+xml' || media.url?.endsWith('.svg');

isSvg
  ? <SvgUri uri={uri} width={24} height={24} />
  : <Image source={{ uri }} style={...} />
```

### Conditional Visibility

Components are hidden/shown via `SduiVisibility`. The renderer calls `evaluateVisibility()` before rendering — widgets don't need to handle this themselves.

---

## 11. Data Flow End-to-End

```
Strapi CMS
  ↓  GET /api/journeys/:id
Journey config (screens[], navigator, preInitiateScreen)
  ↓  CurrentAccountJourneyNavigator builds route map
React Navigation stack with one route per screenId
  ↓  Navigate to screens[0]
DynamicScreenZone mounts
  ↓  GET /api/screens/:screenId
Screen data (meta, header[], body[], footer[])
  ↓  ValidationProvider wraps content
  ↓  DynamicZoneRenderer for each zone
  ↓  DynamicBlock for each component
  ↓  evaluateVisibility() — skip hidden blocks
  ↓  getComponent(block.__component) → Widget
  ↓  <Widget {...block} journeyId onNavigate />
Widget renders, registers validation, reads from journeyState
  ↓  User types / selects
  ↓  updateSession(journeyId, { journeyState: { field: value } })
  ↓  MMKV persists
  ↓  User taps Next
  ↓  validateAll() reads journeyState, runs all registered rules
  ↓  If invalid: show errors, block navigation
  ↓  If valid: mockResolveNavigation() → target screenId
  ↓  updateSession({ currentScreenIndex: next })
  ↓  navigation.navigate(targetScreenId, { journeyId })
Next screen renders ↑ (repeat)
  ↓  FINISH_JOURNEY or last screen
clearSession(journeyId) — wipes Zustand + MMKV
navigation.reset() → Dashboard
```

---

## 12. Key Conventions

| Convention | Detail |
|---|---|
| **`binding.path`** | The key in `journeyState` for this field. Widgets must use this as the read/write key. |
| **`onNavigate` prop** | Passed to every widget by the renderer. Buttons must call this (not `onPress` directly) so validation runs. |
| **`journeyId` prop** | Every widget receives this. Required to access the correct session. |
| **`testId` prop** | Maps to `testID` on the root element for automated testing. |
| **`span` prop** | 1–12. Width = `(span / 12) * 100%`. Default is 12. |
| **`visible` / `enabled`** | Check these in widget render. Return `null` if `!visible`. |
| **Error display** | Always render `{error && <Text style={errorStyle}>{error}</Text>}` below the input. |
| **SVG images** | Use `SvgUri` from `react-native-svg`. Detect via `mime === 'image/svg+xml'` or `.svg` extension. |
| **Image URIs** | Always pass through `getimageuri(url)` to prepend the Strapi base URL. |
| **New widget** | 1) Create file in `src/components/widget/`. 2) Add to `ComponentRegistry.ts`. 3) Add type to `sdui.types.ts` if needed. |
