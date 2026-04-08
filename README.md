# React Native SDUI (Server-Driven UI) Engine

A Server-Driven UI engine for React Native. The Strapi backend dynamically defines screens and journeys as JSON; the frontend renders them using a component registry — no screen-level code changes required for content updates.

---

## Core Concepts

| Term | Description |
|---|---|
| **Journey** | A named multi-screen flow (`journeyId`, ordered `screens`, `steps`, `version`) |
| **Screen** | A single page with three dynamic zones: `header`, `body`, `footer` |
| **Component** | A renderable UI node identified by `__component` (e.g. `"ui.button"`) |
| **`name`** | Stable identifier on each component — used as the `JourneyState` key for inputs |
| **`version`** | Single decimal on both Journey and Screen — bump before publishing |

---

## Journey Shape

```typescript
interface Journey {
  journeyId: string;           // unique journey identifier
  preInitiateScreen: string;   // screenKey of the first screen to show
  screens: Screen[];           // ordered list of screens in the flow
  steps: Step[];               // system/user step definitions
  initialState: Record<string, any>;
  presentation: 'card' | 'modal' | 'transparentModal' | 'containedModal'
              | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet';
  navigator?: string;
  version: number;
}
```

---

## Screen Shape

```typescript
interface Screen {
  screenId: string;    // uid — unique across all screens
  screenKey: string;   // enum-style constant, e.g. "EMAIL_FORM"
  version: number;
  meta: ScreenMeta;
  header: AnyUIComponent[];
  body:   AnyUIComponent[];
  footer: AnyUIComponent[];
}

interface ScreenMeta {
  label?: string;             // title bar label text
  title?: string;             // screen title (below title bar)
  subtitle?: string;
  enableBackButton: boolean;  // default true
  enableCloseButton: boolean; // default false
  onBack?: Action;
  analytics?: Record<string, any>;
}
```

---

## TypeScript Interfaces

### Base

```typescript
interface SduiNode<T extends string = string> {
  __component: T;
  id: number;
  componentId?: string;
  testId?: string;
}

// Action is plain JSON — no sub-component hydration required
interface Action {
  type: string;          // e.g. "NEXT_SCREEN", "SOCIAL_LOGIN", "EMIT_EVENT"
  [key: string]: any;   // provider, params, etc.
}
```

---

### New Components (added in baseline refactor)

#### Progress Bar (`ui.progress-bar`) — header zone
```typescript
interface ProgressBarWidget extends SduiNode<'ui.progress-bar'> {
  name?: string;
  currentStep: number;
  maxStep: number;
  enabled: boolean;
  visible: boolean;
  span?: number;
}
```

#### Date Input (`ui.date-input`)
```typescript
interface DateInputWidget extends SduiNode<'ui.date-input'> {
  label: string;
  name?: string;
  placeholder?: string;
  displayFormat?: string;   // e.g. "dd MMM yyyy"
  valueFormat?: string;     // e.g. "yyyy-MM-dd"
  defaultValue?: string;
  required: boolean;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  validations?: ValidationRule[];
  conditions?: VisibilityCondition;
  span?: number;
}
```

#### Divider (`ui.divider`)
```typescript
interface DividerWidget extends SduiNode<'ui.divider'> {
  label?: string;
  name?: string;
  visible: boolean;
  span?: number;
}
```

#### Checkbox (`ui.checkbox`)
Single standalone checkbox (distinct from `ui.checkbox-list`).
```typescript
interface CheckboxWidget extends SduiNode<'ui.checkbox'> {
  label: string;
  name?: string;
  title?: string;        // section heading above the checkbox
  defaultValue: boolean;
  required: boolean;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  span?: number;
}
```

#### Card (`ui.card`)
Product/info card. Dynamic fields come from `valueSource` bindings.
```typescript
interface CardWidget extends SduiNode<'ui.card'> {
  name?: string;
  variant: 'default' | 'compact';
  title?: string;
  subtitle?: string;
  icon?: string;
  valueSource?: Record<string, { type: 'binding'; path: string }>;
  enabled: boolean;
  visible: boolean;
  span?: number;
}
```

---

### Updated Components

#### Text (`ui.text`)
`text` renamed to `label`. Bindings and placement are flat JSON. No SDUI `visibility` sub-component.
```typescript
interface TextWidget extends SduiNode<'ui.text'> {
  label: string;
  name?: string;
  variant: 'title' | 'subtitle' | 'body' | 'note' | 'caption' | 'label';
  enabled: boolean;
  visible: boolean;
  valueSource?: { type: 'binding'; path: string };
  placement?: { horizontal?: 'left' | 'center' | 'right' };
  span?: number;
}
```

#### Button (`ui.button`)
`action`, `icon`, `placement` are plain JSON. No `guardRules` or SDUI `visibility`.
```typescript
interface ButtonWidget extends SduiNode<'ui.button'> {
  label: string;
  name?: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'promo';
  enabled: boolean;
  visible: boolean;
  action: Action;
  icon?: { name: string; position: 'left' | 'right' };
  placement?: { horizontal?: string; vertical?: string };
  span?: number;
}
```

#### Text Input (`ui.text-input`)
Flat fields. No SDUI `binding`/`validation`/`visibility` sub-components. Use `name` as JourneyState key.
```typescript
interface TextInputWidget extends SduiNode<'ui.text-input'> {
  label: string;
  name?: string;
  placeholder?: string;
  helperText?: string;
  prefix?: string;
  inputMode: 'text' | 'numeric' | 'email' | 'phone';
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  required: boolean;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  validations?: ValidationRule[];
  conditions?: VisibilityCondition;
  span?: number;
}
```

#### Image Preview (`ui.image-preview`)
`source` (sdui.source) replaced by flat `valueSource` JSON.
```typescript
interface ImagePreviewWidget extends SduiNode<'ui.image-preview'> {
  label?: string;
  name?: string;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  valueSource?: { type: 'binding'; path: string };
  placement?: { horizontal?: string };
  span?: number;
}
```

#### Review Card (`ui.review-card`)
`rows` (ui.kv-row[]) replaced by `options` — a flat JSON array. No SDUI sub-components.
```typescript
interface ReviewCardWidget extends SduiNode<'ui.review-card'> {
  label?: string;
  name?: string;
  enabled: boolean;
  visible: boolean;
  options: Array<{ id: string; label: string; value: string }>;
  span?: number;
}
```

#### Dropdown (`ui.dropdown`)
Static options list. No SDUI `binding`/`validation`/`visibility`. Use `name` as state key.
```typescript
interface DropdownWidget extends SduiNode<'ui.dropdown'> {
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  searchable: boolean;
  required: boolean;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  options: OptionWidget[];
  conditions?: VisibilityCondition;
  span?: number;
}
```

#### Dropdown Async (`ui.dropdown-async`)
`dataSource` is now flat JSON. No SDUI sub-components.
```typescript
interface DropdownAsyncWidget extends SduiNode<'ui.dropdown-async'> {
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  searchable: boolean;
  required: boolean;
  enabled: boolean;
  editable: boolean;
  visible: boolean;
  dataSource?: {
    type: 'reference';
    endpoint: string;
    valueKey: string;
    displayKey: string;
    dependencies?: Array<{ field: string; param: string }>;
  };
  conditions?: VisibilityCondition;
  span?: number;
}
```

---

### Unchanged Components

#### Banner (`ui.banner`)
```typescript
interface BannerWidget extends SduiNode<'ui.banner'> {
  text: string;
  variant: 'info' | 'warning' | 'success' | 'error';
  label?: string;
  icon?: any;
  onTap?: Action;
  visibility?: any;
}
```

#### Hero (`ui.hero`)
```typescript
interface HeroWidget extends SduiNode<'ui.hero'> {
  illustration: any;
  title: string;
  subtitleTemplate?: string;
  subtitleFields?: any;
  referenceLabel?: string;
  referenceSource?: any;
}
```

#### Section Label (`ui.section-label`)
```typescript
interface SectionLabelWidget extends SduiNode<'ui.section-label'> {
  title: string;
  subtitle?: string;
}
```

#### Radio Group (`ui.radio-group`)
```typescript
interface RadioGroupWidget extends SduiNode<'ui.radio-group'> {
  label?: string;
  options: OptionWidget[];
  binding: { path: string; scope: string };
  validation?: any[];
  visibility?: any;
}
```

#### Checkbox List (`ui.checkbox-list`)
```typescript
interface CheckboxListWidget extends SduiNode<'ui.checkbox-list'> {
  label?: string;
  options: OptionWidget[];
  binding: { path: string; scope: string };
  validation?: any[];
  visibility?: any;
}
```

#### Option (`ui.option`)
```typescript
interface OptionWidget extends SduiNode<'ui.option'> {
  key: string;
  label: string;
  description?: string;
  icon?: any;
  onTap?: Action;
}
```

#### Item List (`ui.item-list`)
```typescript
interface ItemListWidget extends SduiNode<'ui.item-list'> {
  label?: string;
  filterBy?: any;
  options: ListItemWidget[];
}

interface ListItemWidget extends SduiNode<'ui.list-item'> {
  key: string;
  label: string;
  description?: string;
  icon?: any;
  tab?: string;
  onTap: Action;
  visibility?: any;
}
```

#### Cascading Select (`ui.cascading-select`)
```typescript
interface CascadingSelectWidget extends SduiNode<'ui.cascading-select'> {
  tiers: CascadingSelectTierWidget[];
  validation?: any[];
}

interface CascadingSelectTierWidget extends SduiNode<'ui.cascading-select-tier'> {
  key: string;
  label?: string;
  placeholder?: string;
  dependsOn?: string;
  dataSource: any;
  binding: { path: string; scope: string };
}
```

#### Camera Capture (`ui.camera-capture`)
```typescript
interface CameraCaptureWidget extends SduiNode<'ui.camera-capture'> {
  mode: 'document' | 'selfie' | 'barcode';
  overlayShape: 'rectangle' | 'circle' | 'none';
  overlayAspect?: string;
  overlayHint?: string;
  binding: { path: string; scope: string };
  onComplete: { action: Action };
}
```

#### Money Display & Money Input
```typescript
interface MoneyDisplayWidget extends SduiNode<'ui.money-display'> {
  label?: string;
  currency: string;
  source: any;
}

interface MoneyInputWidget extends SduiNode<'ui.money-input'> {
  label?: string;
  currency?: string;
  binding: { path: string; scope: string };
  validation?: any;
  visibility?: any;
}
```

#### Passcode Input (`ui.passcode-input`)
```typescript
interface PasscodeInputWidget extends SduiNode<'ui.passcode-input'> {
  length: number;
  masked: boolean;
  keyboard: 'numpad' | 'default';
  binding: { path: string; scope: string };
  onForgot?: Action;
  onComplete: { action: Action };
}
```

#### Slide To Confirm (`ui.slide-to-confirm`)
```typescript
interface SlideToConfirmWidget extends SduiNode<'ui.slide-to-confirm'> {
  label: string;
  action: Action;
  visibility?: any;
}
```

#### Tab Group (`ui.tab-group`)
```typescript
interface TabGroupWidget extends SduiNode<'ui.tab-group'> {
  options: OptionWidget[];
  binding: { path: string; scope: string };
}
```

#### Rich Text (`ui.rich-text`)
```typescript
interface RichTextWidget extends SduiNode<'ui.rich-text'> {
  text: any[];
  visibility?: any;
}
```

#### Row (`ui.row`)
Layout-only container. Row grouping is controlled by `span` (out of 12 columns) on sibling body components.
```typescript
interface RowWidget extends SduiNode<'ui.row'> {
  rowGroup?: string;
}
```

#### Local State (`ui.local-state`)
```typescript
interface LocalStateWidget extends SduiNode<'ui.local-state'> {
  key: string;
  initial: string;
  allowedStates: any;
}
```

#### Icon Text (`ui.icon-text`)
```typescript
interface IconTextWidget extends SduiNode<'ui.icon-text'> {
  label: string;
  icon: any;
  visibility?: any;
}
```

#### Badge (`ui.badge`)
```typescript
interface BadgeWidget extends SduiNode<'ui.badge'> {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'error';
  source?: any;
  visibility?: any;
}
```

---

### Shared Utility Types

```typescript
interface ValidationRule {
  type: string;            // "REGEX", "MATCH_FIELD", "MIN_AGE", "MAX_AGE", "NO_FUTURE_DATE"
  pattern?: string;
  field?: string;          // for MATCH_FIELD
  value?: number | string;
  message: string;
}

interface VisibilityCondition {
  visibility: {
    field: string;
    operator: 'NOT_EMPTY' | 'EMPTY' | 'EQUALS' | 'NOT_EQUALS';
    value?: any;
  };
}
```

---

## Setup & Registration

Register components at app entry point mapping `__component` strings to React Native components.

```typescript
import { ComponentRegistry } from './sdui/ComponentRegistry';

ComponentRegistry.register('ui.progress-bar', ProgressBarComponent);
ComponentRegistry.register('ui.text',         TextComponent);
ComponentRegistry.register('ui.text-input',   TextInputComponent);
ComponentRegistry.register('ui.date-input',   DateInputComponent);
ComponentRegistry.register('ui.button',       ButtonComponent);
ComponentRegistry.register('ui.checkbox',     CheckboxComponent);
ComponentRegistry.register('ui.divider',      DividerComponent);
ComponentRegistry.register('ui.card',         CardComponent);
ComponentRegistry.register('ui.review-card',  ReviewCardComponent);
ComponentRegistry.register('ui.dropdown',     DropdownComponent);
ComponentRegistry.register('ui.dropdown-async', DropdownAsyncComponent);
// ... all other components
```

---

## Action Handling Strategy

Actions are **plain JSON objects** on the component — no SDUI sub-component hydration needed.

```typescript
// button.action, slide-to-confirm.action, etc.
{ type: 'NEXT_SCREEN' }
{ type: 'SOCIAL_LOGIN', provider: 'GOOGLE' }
{ type: 'EMIT_EVENT', params: { eventName: 'RETAKE_EKTP_IMAGE' } }
```

Do not embed domain logic inside widgets. Use the `onAction` callback pattern — the backend defines *intent*, the host screen resolves it.
