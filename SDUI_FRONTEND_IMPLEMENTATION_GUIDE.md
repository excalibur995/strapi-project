# SDUI Frontend Implementation Guide (React Native + TypeScript)

This guide is for developers and AI agents building the frontend layer of the Server-Driven UI architecture using React Native and TypeScript.

**Core contract:** Render what the backend sends, style it with the local theme system. No business logic, navigation flow, or screen content belongs in the frontend.

---

## 1. Core Architecture Pattern

### The Rendering Pipeline

1. **Fetch Journey** — `GET /api/journeys/id/:journeyId`
   Returns the flow config: `journeyId`, `preInitiateScreen`, ordered `screens`, `steps`, `initialState`, `version`.

2. **Fetch Screen** — `GET /api/screens/:documentId` or by `screenKey`
   Returns `screenId`, `screenKey`, `meta`, and three component arrays: `header`, `body`, `footer`.

3. **Parse & Render** — `DynamicRenderer` iterates each zone, looks up `__component` in the Component Registry, renders the matching React Native component.

4. **State Management** — Input components read/write `JourneyState` using the component's `name` field as the state key.

5. **Action Execution** — `action` is a plain JSON object (`{ type, ...payload }`) on buttons and other triggers. The host screen resolves the intent.

---

## 2. Global State & Context

All inputs in a journey share a single state dictionary. Use `zustand` or React Context.

```typescript
// store/journeyStore.ts

export type JourneyState = Record<string, any>;

interface JourneyStore {
  state: JourneyState;

  // Read a field — keyed by the component's `name`
  getValue: (name: string) => any;

  // Write a field — keyed by the component's `name`
  updateField: (name: string, value: any) => void;

  // Journey definition
  journey: Journey | null;
  currentScreenKey: string | null;
}
```

---

## 3. Core TypeScript Interfaces

See `README.md` for the complete interface catalogue. The key interfaces for the rendering pipeline:

```typescript
// types/sdui.ts

// Action is plain JSON — no sub-component hydration
interface Action {
  type: string;
  [key: string]: any;
}

interface Journey {
  journeyId: string;
  preInitiateScreen: string;   // screenKey of the first screen
  screens: Screen[];
  steps: Step[];
  initialState: Record<string, any>;
  presentation: string;
  navigator?: string;
  version: number;
}

interface Screen {
  screenId: string;
  screenKey: string;
  version: number;
  meta: ScreenMeta;
  header: AnyUIComponent[];
  body:   AnyUIComponent[];
  footer: AnyUIComponent[];
}

interface ScreenMeta {
  label?: string;
  title?: string;
  subtitle?: string;
  enableBackButton: boolean;
  enableCloseButton: boolean;
  onBack?: Action;
}
```

---

## 4. The Component Registry

Maps the backend `__component` string to the concrete React Native implementation.

```typescript
// registry/ComponentRegistry.ts
import { ComponentType } from 'react';

const registry: Record<string, ComponentType<any>> = {};

export const registerComponent = (name: string, component: ComponentType<any>) => {
  registry[name] = component;
};

export const getComponent = (name: string): ComponentType<any> | null => {
  const Component = registry[name];
  if (!Component) {
    console.warn(`[SDUI] Unregistered component: ${name}`);
    return null;
  }
  return Component;
};
```

Register all components at app entry:

```typescript
// All components that appear in the header, body, or footer dynamic zones
registerComponent('ui.progress-bar',     ProgressBarComponent);
registerComponent('ui.text',             TextComponent);
registerComponent('ui.text-input',       TextInputComponent);
registerComponent('ui.date-input',       DateInputComponent);
registerComponent('ui.checkbox',         CheckboxComponent);
registerComponent('ui.checkbox-list',    CheckboxListComponent);
registerComponent('ui.button',           ButtonComponent);
registerComponent('ui.divider',          DividerComponent);
registerComponent('ui.card',             CardComponent);
registerComponent('ui.review-card',      ReviewCardComponent);
registerComponent('ui.dropdown',         DropdownComponent);
registerComponent('ui.dropdown-async',   DropdownAsyncComponent);
registerComponent('ui.banner',           BannerComponent);
registerComponent('ui.section-label',    SectionLabelComponent);
registerComponent('ui.hero',             HeroComponent);
registerComponent('ui.image-preview',    ImagePreviewComponent);
registerComponent('ui.camera-capture',   CameraCaptureComponent);
registerComponent('ui.cascading-select', CascadingSelectComponent);
registerComponent('ui.radio-group',      RadioGroupComponent);
registerComponent('ui.item-list',        ItemListComponent);
registerComponent('ui.money-input',      MoneyInputComponent);
registerComponent('ui.money-display',    MoneyDisplayComponent);
registerComponent('ui.passcode-input',   PasscodeInputComponent);
registerComponent('ui.slide-to-confirm', SlideToConfirmComponent);
registerComponent('ui.tab-group',        TabGroupComponent);
registerComponent('ui.rich-text',        RichTextComponent);
registerComponent('ui.link',             LinkComponent);
registerComponent('ui.badge',            BadgeComponent);
registerComponent('ui.local-state',      LocalStateComponent);
registerComponent('ui.icon-text',        IconTextComponent);
registerComponent('ui.row',              RowComponent);
```

---

## 5. The Dynamic Renderer

Iterates over a zone array and mounts each component.

```tsx
// components/core/DynamicRenderer.tsx
import React from 'react';
import { View } from 'react-native';
import { getComponent } from '../../registry/ComponentRegistry';

export const DynamicBlock: React.FC<{ block: any }> = ({ block }) => {
  const { __component, visible } = block;

  // Visibility is a flat boolean on the component — no hook required
  if (visible === false) return null;

  const Component = getComponent(__component);
  if (!Component) return null;

  return <Component {...block} />;
};

export const DynamicZoneRenderer: React.FC<{ blocks: any[] }> = ({ blocks }) => {
  if (!blocks?.length) return null;

  return (
    <View style={{ gap: 16 }}>
      {blocks.map((block, index) => (
        <DynamicBlock key={`${block.__component}-${block.id ?? index}`} block={block} />
      ))}
    </View>
  );
};
```

---

## 6. Implementation Patterns: Inputs

Inputs use the component `name` field as the `JourneyState` key. There is no SDUI `binding` sub-component — the flat `name` string is the contract.

```tsx
// components/ui/TextInputComponent.tsx
import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { useJourneyStore } from '../../store/journeyStore';
import { useTheme } from '../../theme/ThemeProvider';
import { validateField } from '../../utils/validator';

const TextInputComponent: React.FC<TextInputWidget> = (props) => {
  const {
    label, name, placeholder, inputMode,
    prefix, helperText, required,
    enabled, editable, validations,
  } = props;

  const theme = useTheme();
  const value   = useJourneyStore((s) => s.getValue(name));
  const update  = useJourneyStore((s) => s.updateField);

  const handleChange = (text: string) => {
    if (!editable || !enabled) return;
    update(name, text);
  };

  const errors = validations
    ? validateField(value, validations)
    : [];

  return (
    <View style={theme.styles.inputContainer}>
      <Text style={theme.styles.label}>{label}{required ? ' *' : ''}</Text>
      {prefix && <Text style={theme.styles.prefix}>{prefix}</Text>}
      <TextInput
        style={[theme.styles.input, !enabled && theme.styles.disabled]}
        placeholder={placeholder}
        keyboardType={inputMode === 'email' ? 'email-address'
                    : inputMode === 'numeric' ? 'numeric'
                    : inputMode === 'phone' ? 'phone-pad'
                    : 'default'}
        value={value ?? ''}
        editable={editable && enabled}
        onChangeText={handleChange}
      />
      {helperText && <Text style={theme.styles.helper}>{helperText}</Text>}
      {errors.map((err, i) => (
        <Text key={i} style={theme.styles.error}>{err}</Text>
      ))}
    </View>
  );
};

export default TextInputComponent;
```

### Inline Validation

`validations` is a JSON array on the component — parse and run locally:

```typescript
// utils/validator.ts
import { ValidationRule } from '../types/sdui';

export function validateField(value: any, rules: ValidationRule[]): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'REGEX':
        if (!new RegExp(rule.pattern!).test(value ?? ''))
          errors.push(rule.message);
        break;
      case 'MATCH_FIELD':
        // Compare against another field — read from JourneyStore
        break;
      case 'MIN_AGE':
      case 'MAX_AGE':
      case 'NO_FUTURE_DATE':
        // Date-specific validation
        break;
    }
  }

  return errors;
}
```

### Conditional Visibility

`conditions` is a flat JSON object on the component. Evaluate it against JourneyState to decide whether to mount:

```typescript
// utils/conditionEvaluator.ts
import { VisibilityCondition } from '../types/sdui';

export function evaluateCondition(
  condition: VisibilityCondition | undefined,
  getState: (key: string) => any,
): boolean {
  if (!condition) return true;

  const { field, operator, value } = condition.visibility;
  const stateValue = getState(field);

  switch (operator) {
    case 'NOT_EMPTY': return stateValue !== null && stateValue !== undefined && stateValue !== '';
    case 'EMPTY':     return !stateValue;
    case 'EQUALS':    return stateValue === value;
    case 'NOT_EQUALS':return stateValue !== value;
    default:          return true;
  }
}
```

Usage in `DynamicBlock`:

```tsx
const isVisible = evaluateCondition(block.conditions, getValue);
if (block.visible === false || !isVisible) return null;
```

---

## 7. Implementation Patterns: Actions

`action` is a plain JSON object directly on the component. No SDUI sub-component hydration required.

```typescript
// utils/actionExecutor.ts
import { Action } from '../types/sdui';

export const executeAction = async (action: Action, context: ActionContext) => {
  if (!action) return;

  switch (action.type) {
    case 'NEXT_SCREEN':
      context.navigateNext();
      break;

    case 'SOCIAL_LOGIN':
      await context.socialLogin(action.provider);
      break;

    case 'EMIT_EVENT':
      context.emit(action.params?.eventName, action.params);
      break;

    case 'CONFIRM_APPLY':
      await context.submitJourney();
      break;

    default:
      console.warn(`[SDUI] Unknown action type: ${action.type}`);
  }
};
```

Button component:

```tsx
// components/ui/ButtonComponent.tsx
import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import { ButtonWidget } from '../../types/sdui';
import { executeAction } from '../../utils/actionExecutor';
import { useTheme } from '../../theme/ThemeProvider';
import { useActionContext } from '../../hooks/useActionContext';

const ButtonComponent: React.FC<ButtonWidget> = ({
  label, variant, enabled, visible, action, icon,
}) => {
  const theme   = useTheme();
  const context = useActionContext();
  const styles  = theme.getButtonStyles(variant);

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.container, !enabled && styles.disabled]}
      onPress={() => enabled && executeAction(action, context)}
      disabled={!enabled}
    >
      {icon?.position === 'left' && <Image source={{ uri: icon.name }} style={styles.icon} />}
      <Text style={styles.label}>{label}</Text>
      {icon?.position === 'right' && <Image source={{ uri: icon.name }} style={styles.icon} />}
    </TouchableOpacity>
  );
};

export default ButtonComponent;
```

---

## 8. Screen Meta Rendering

`meta` drives the title bar — it is NOT a component in the header zone, it's a separate object on the screen.

```tsx
// components/core/ScreenHeader.tsx
const ScreenHeader: React.FC<{ meta: ScreenMeta }> = ({ meta }) => {
  const { label, title, subtitle, enableBackButton, enableCloseButton, onBack } = meta;
  const context = useActionContext();

  return (
    <View>
      {/* Title bar */}
      <View style={styles.titleBar}>
        {enableBackButton && (
          <TouchableOpacity onPress={() => onBack ? executeAction(onBack, context) : context.goBack()}>
            <BackIcon />
          </TouchableOpacity>
        )}
        {label && <Text style={styles.barLabel}>{label}</Text>}
        {enableCloseButton && (
          <TouchableOpacity onPress={context.closeJourney}>
            <CloseIcon />
          </TouchableOpacity>
        )}
      </View>
      {/* Screen title / subtitle sit below the title bar */}
      {title    && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};
```

---

## 9. Agent Development Strategy

When instructing an AI to build components using this architecture:

1. **Read the schema** — check `src/components/ui/<component>.json` for the exact field list.
2. **Generate the TypeScript interface** — extend `SduiNode<'ui.component-name'>`.
3. **Build the React Native component**:
   - Use `name` as the `JourneyStore` key for any input.
   - Use `visible: boolean` directly — no `useVisibilityEvaluator` hook.
   - Evaluate `conditions` (if present) using `evaluateCondition()`.
   - Parse `validations` array locally using `validateField()`.
   - Pass `action` directly to `executeAction()` — it is plain JSON.
4. **Register** the component in `ComponentRegistry.ts`.

### Strict Agent Directives

- **NO INLINE STYLES** — use theme context or `StyleSheet` only.
- **INPUT STATE KEY IS `name`** — always `useJourneyStore(s => s.getValue(name))`. Never look for a `binding` object on flat components.
- **VISIBILITY IS FLAT** — check `block.visible === false` and `evaluateCondition(block.conditions, getValue)`. Do not use `sdui.visibility` sub-component logic on new components.
- **VALIDATIONS ARE JSON** — `validations` is an array on the component itself. Run locally with `validateField()`.
- **ACTIONS ARE JSON** — `action` is `{ type, ...payload }`. Pass directly to `executeAction()`. No sub-component hydration.
- **`valueSource` IS JSON** — `{ type: 'binding', path: 'some.path' }`. Resolve by calling `getValue(valueSource.path)` from JourneyStore.
- **GRACEFUL FALLBACKS** — if a required field (`name`, `label`) is missing, render a dev-warning view, never crash.
