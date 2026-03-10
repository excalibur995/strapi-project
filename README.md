# React Native SDUI (Server-Driven UI) Engine

A Server-Driven UI engine for React Native. Designed to allow headless CMS backends (Strapi) to dynamically generate and render application native UIs via JSON payloads, based on defined component schemas.

## Core Component Interfaces

Based on the Strapi component mappings in `src/components/ui`, here are the core Typescript interfaces that the frontend expects when receiving the SDUI payload.

### Common Types

```typescript
// Shared SDUI Base Type
export interface SduiNode<T = string, P = any> {
  __component: T; // e.g. 'ui.button', 'ui.text'
  id: number;
  // Specific component properties will be spread here or inside a props object
}

// Common Visibility / Logic
export interface SduiVisibility {
  // Logic to determine if component should be visible
}

export interface SduiAction {
  // Action details (e.g. NAVIGATE, SUBMIT)
}

export interface SduiBinding {
  // Form/State binding details
}
```

### UI Components

#### 1. Text (`ui.text`)
Static text block.
```typescript
export interface TextWidget extends SduiNode<'ui.text'> {
  text: string;
  variant: 'title' | 'body' | 'caption' | 'label'; // defaults to 'body'
  visibility?: SduiVisibility;
}
```

#### 2. Button (`ui.button`)
Standard action trigger.
```typescript
export interface ButtonWidget extends SduiNode<'ui.button'> {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'; // defaults to 'primary'
  action: SduiAction;
  guardRules?: any[]; // Array of rule-sets
  visibility?: SduiVisibility;
}
```

#### 3. Text Input (`ui.text-input`)
Single-line text input for forms.
```typescript
export interface TextInputWidget extends SduiNode<'ui.text-input'> {
  label: string;
  placeholder?: string;
  keyboard: 'default' | 'number-pad' | 'email' | 'phone'; // defaults to 'default'
  secured: boolean; // defaults to false
  binding: SduiBinding;
  validation?: any[];
  visibility?: SduiVisibility;
}
```

#### 4. Item List & List Item
Generic tappable list with optional tab filtering.

```typescript
export interface ItemListWidget extends SduiNode<'ui.item-list'> {
  label?: string;
  filterBy?: SduiBinding;
  items: ListItemWidget[];
}

export interface ListItemWidget extends SduiNode<'ui.list-item'> {
  key: string;
  label: string;
  description?: string;
  icon?: any; // Media type
  tab?: string;
  onTap: SduiAction;
  visibility?: SduiVisibility;
}
```

#### 5. Badge (`ui.badge`)
Conditional label badge.
```typescript
export interface BadgeWidget extends SduiNode<'ui.badge'> {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'error'; // defaults to 'info'
  source?: any; // sdui.source
  visibility?: SduiVisibility;
#### 6. Rich Text (`ui.rich-text`)
Dynamic formatted text blocks. (Note: React Native does not support rich text natively. Recommended library: `react-native-render-html` or `react-native-markdown-display`)
```typescript
export interface RichTextWidget extends SduiNode<'ui.rich-text'> {
  text: any[]; // Array of structured rich text blocks
  visibility?: SduiVisibility;
}
```

#### 7. Dropdown (`ui.dropdown`)
Single-select from static options. (Note: For native-feeling dropdowns, consider `@react-native-picker/picker` or `react-native-dropdown-picker`)
```typescript
export interface DropdownWidget extends SduiNode<'ui.dropdown'> {
  label?: string;
  placeholder?: string;
  searchable: boolean; // defaults to false
  options: any[]; // Array of ui.option components
  binding: SduiBinding;
  validation?: any[];
  visibility?: SduiVisibility;
}
```

#### 8. Link (`ui.link`)
Text-based actionable link (similar to a ghost button).
```typescript
export interface LinkWidget extends SduiNode<'ui.link'> {
  text: string;
  action?: SduiAction;
  validation?: any;
}
```

#### 9. Radio Group (`ui.radio-group`)
Single-select option group.
```typescript
export interface RadioGroupWidget extends SduiNode<'ui.radio-group'> {
  label?: string;
  options: any[]; // Array of ui.option components
  binding: SduiBinding;
  validation?: any[];
  visibility?: SduiVisibility;
}
```

#### 10. Checkbox List (`ui.checkbox-list`)
Multi-select checkbox group. (Note: For checkboxes, consider `expo-checkbox` or `@react-native-community/checkbox`)
```typescript
export interface CheckboxListWidget extends SduiNode<'ui.checkbox-list'> {
  label?: string;
  items?: any[]; // Array of ui.option components
  binding: SduiBinding;
  validation?: any[];
  visibility?: SduiVisibility;
}
```

#### 11. Section Label (`ui.section-label`)
Visual section divider.
```typescript
export interface SectionLabelWidget extends SduiNode<'ui.section-label'> {
  title: string;
  subtitle?: string;
}
```

#### 12. Hero (`ui.hero`)
Illustrative success/error hero block.
```typescript
export interface HeroWidget extends SduiNode<'ui.hero'> {
  illustration: any; // Media type
  title: string;
  subtitleTemplate?: string;
  subtitleFields?: any; // JSON object containing dynamic fields
  referenceLabel?: string;
  referenceSource?: any; // sdui.source
}
```

#### 13. Banner (`ui.banner`)
Contextual alert/banner.
```typescript
export interface BannerWidget extends SduiNode<'ui.banner'> {
  text: string;
  variant: 'info' | 'warning' | 'success' | 'error'; // defaults to 'info'
  icon?: any; // Media type
  label?: string;
  onTap?: SduiAction;
  visibility?: SduiVisibility;
}
```

#### 14. Account Selector (`ui.account-selector`)
Live account picker from API.
```typescript
export interface AccountSelectorWidget extends SduiNode<'ui.account-selector'> {
  label?: string;
  endpoint: string;
  params?: any;
  display?: any;
  allowChange: boolean; // defaults to true
  binding: SduiBinding;
}
```

#### 15. Camera Capture (`ui.camera-capture`)
Document camera with overlay.
```typescript
export interface CameraCaptureWidget extends SduiNode<'ui.camera-capture'> {
  mode: 'document' | 'selfie' | 'barcode'; // defaults to 'document'
  overlayShape: 'rectangle' | 'circle' | 'none'; // defaults to 'rectangle'
  overlayAspect?: string;
  overlayHint?: string;
  binding: SduiBinding;
  onComplete: SduiAction; // sdui.on-complete
}
```

#### 16. Cascading Select (`ui.cascading-select`)
Linked dropdowns e.g. country > city > district.
```typescript
export interface CascadingSelectWidget extends SduiNode<'ui.cascading-select'> {
  tiers: CascadingSelectTierWidget[];
  validation?: any[];
  visibility?: SduiVisibility;
}

export interface CascadingSelectTierWidget extends SduiNode<'ui.cascading-select-tier'> {
  key: string;
  label?: string;
  placeholder?: string;
  dependsOn?: string;
  dataSource: any; // sdui.data-source
  binding: SduiBinding;
}
```

#### 17. Async Selectors (`ui.checkbox-list-async`, `ui.dropdown-async`, `ui.radio-group-async`)
Multi-select, searchable dropdown, and radio groups powered by live API data.
```typescript
export interface AsyncSelectorWidget extends SduiNode<'ui.checkbox-list-async' | 'ui.dropdown-async' | 'ui.radio-group-async'> {
  label?: string;
  placeholder?: string; // specific to dropdown
  searchable?: boolean; // specific to dropdown (default true)
  dataSource: any; // sdui.data-source
  binding: SduiBinding;
  validation?: any[];
  visibility?: SduiVisibility;
}
```

#### 18. Icon Text (`ui.icon-text`)
A row displaying an icon alongside text.
```typescript
export interface IconTextWidget extends SduiNode<'ui.icon-text'> {
  text: string;
  icon: any; // Media type
  visibility?: SduiVisibility;
}
```

#### 19. Image Preview (`ui.image-preview`)
Displays a base64 image from state.
```typescript
export interface ImagePreviewWidget extends SduiNode<'ui.image-preview'> {
  label?: string;
  source: any; // sdui.source
}
```

#### 20. Review Card (`ui.review-card` & `ui.kv-row`)
Summary section with rows and optional edit.
```typescript
export interface ReviewCardWidget extends SduiNode<'ui.review-card'> {
  label?: string;
  rows: KVRowWidget[];
  badges?: BadgeWidget[];
  allowChange: boolean; // default false
  onEdit?: SduiAction;
  visibility?: SduiVisibility;
}

export interface KVRowWidget extends SduiNode<'ui.kv-row'> {
  label?: string;
  value?: string;
  source?: any; // sdui.source
}
```

#### 21. Local State (`ui.local-state`)
Non-visual component to define local UI state.
```typescript
export interface LocalStateWidget extends SduiNode<'ui.local-state'> {
  key: string;
  initial: string;
  allowedStates: any; // JSON object of states
}
```

#### 22. Money (`ui.money-display` & `ui.money-input`)
Currency formatting components.
```typescript
export interface MoneyDisplayWidget extends SduiNode<'ui.money-display'> {
  label?: string;
  currency: string; // defaults to IDR
  source: any; // sdui.source
}

export interface MoneyInputWidget extends SduiNode<'ui.money-input'> {
  label?: string;
  currency?: string;
  min?: number;
  max?: number;
  binding: SduiBinding;
  validation?: any;
  visibility?: SduiVisibility;
}
```

#### 23. Option (`ui.option`)
Single selectable option item for dropdowns and radios.
```typescript
export interface OptionWidget extends SduiNode<'ui.option'> {
  key: string;
  label: string;
  description?: string;
  icon?: any; // Media type
  onTap?: SduiAction;
}
```

#### 24. Passcode Input (`ui.passcode-input`)
Masked numeric passcode entry.
```typescript
export interface PasscodeInputWidget extends SduiNode<'ui.passcode-input'> {
  length: number; // defaults to 6
  masked: boolean; // defaults to true
  keyboard: 'numpad' | 'default'; // defaults to numpad
  binding: SduiBinding;
  onForgot?: SduiAction;
  onComplete: SduiAction; // sdui.on-complete
}
```

#### 25. Slide To Confirm (`ui.slide-to-confirm`)
Swipe gesture action trigger.
```typescript
export interface SlideToConfirmWidget extends SduiNode<'ui.slide-to-confirm'> {
  label: string;
  action: SduiAction;
  guardRules?: any[];
  visibility?: SduiVisibility;
}
```

#### 26. Tab Group (`ui.tab-group`)
Horizontal tab switcher.
```typescript
export interface TabGroupWidget extends SduiNode<'ui.tab-group'> {
  options: OptionWidget[];
  binding: SduiBinding;
}
```

## Setup & Registration

Before rendering an SDUI payload, register your base components globally. This usually happens at the app entry point.

```typescript
import { ComponentRegistry } from './sdui/ComponentRegistry';
import { ButtonWidget, TextWidget, ItemListWidget } from './sdui/components';

// Map JSON "__component" strings to actual React Native components
ComponentRegistry.register('ui.button', ButtonWidget);
ComponentRegistry.register('ui.text', TextWidget);
ComponentRegistry.register('ui.item-list', ItemListWidget);
```

## Action Handling Strategy

Do not embed domain logic (like `useNavigation` or `fetch`) directly inside SDUI widgets. Instead, use the `onAction` callback pattern. 

The backend defines the *intent* in the `sdui.action` payload, and the wrapper screen resolves the action. This keeps widgets pure and highly reusable.
