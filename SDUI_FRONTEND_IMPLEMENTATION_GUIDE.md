# SDUI Frontend Implementation Guide (React Native + TypeScript)

This guide is designed for developers (and AI agents) to construct the Frontend layer of the Server-Driven UI (SDUI) architecture using React Native and TypeScript.

The frontend has a strict responsibility: **Render what the backend sends, and style it according to the local theme system.** It does not define business logic, navigation flows, or screen content.

---

## 1. Core Architecture Pattern

### The Rendering Pipeline

1. **Fetch Journey Definition**: `GET /api/journeys/id/:journeyId` gives you the configuration (which screens to show, validations, async steps).
2. **Fetch Screen Definition**: `GET /api/screens/:documentId` gives you a tree of `__component` objects inside slots (`meta`, `header`, `body`, `footer`).
3. **Parse & Render**: The `DynamicRenderer` takes the JSON tree, looks up the `__component` string in the **Component Registry**, and renders the corresponding React Native component.
4. **State Management**: Form inputs interact with a global `JourneyState` store via `sdui.binding`.
5. **Event Execution**: Buttons and triggers execute `sdui.action` payloads.

---

## 2. Global State & Context

The entire journey relies on a shared state dictionary. A library like `zustand` or React Context is ideal here.

```typescript
// store/journeyStore.ts

export type JourneyState = Record<string, any>;

interface JourneyStore {
  state: JourneyState;

  // Update a specific path in the journey state (tied to sdui.binding)
  updateField: (path: string, value: any) => void;

  // Get a specific value (used by resolving sdui.binding & sdui.source)
  getValue: (path: string) => any;

  // Entire Journey definition
  steps: any[];
  currentStepIndex: number;
}
```

---

## 3. Core TypeScript Interfaces

Define strict types for your components early to leverage TypeScript across the registry.

```typescript
// types/sdui.ts

export interface SDUIBaseComponent {
  id: number;
  __component: string;
}

// === Behavioural Components (sdui.*) ===

export interface SDUIBinding {
  id: number;
  path: string; // e.g., "accountPurpose", "npwpNumber"
  scope: "journeyState" | "localState" | "globalState";
}

export interface SDUIAction {
  id: number;
  key: string;
  type: "navigate" | "api_call" | "set_state" | "open_modal" | "submit";
  payload?: Record<string, any>;
  guards?: any[]; // For rule evaluation before execution
}

export interface SDUIVisibility {
  id: number;
  action: "show" | "hide";
  rule: any; // Rule engine definition
}

export interface SDUIOnComplete {
  id: number;
  action: SDUIAction; // nested sdui.action — not flat key/type/payload
}

// === UI Components (ui.*) ===

export interface UIBanner extends SDUIBaseComponent {
  __component: "ui.banner";
  text: string; // was `value` — renamed in schema
  variant: "info" | "warning" | "success" | "error";
  onTap?: SDUIAction;
  visibility?: SDUIVisibility;
}

export interface UIText extends SDUIBaseComponent {
  __component: "ui.text";
  text: string; // was `value` — renamed in schema
  variant?: "title" | "body" | "caption" | "label";
  visibility?: SDUIVisibility;
}

export interface UIButton extends SDUIBaseComponent {
  __component: "ui.button";
  label: string;
  variant: "primary" | "secondary" | "ghost" | "danger";
  action: SDUIAction;
  visibility?: SDUIVisibility;
}

export interface UITextInput extends SDUIBaseComponent {
  __component: "ui.text-input";
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  binding: SDUIBinding;
  validation?: any[];
  visibility?: SDUIVisibility;
}

export interface UIHero extends SDUIBaseComponent {
  __component: "ui.hero";
  title: string;
  subtitle?: string;
  illustration?: any; // Contains Strapi Media object
}

// Utility union of all possible UI components
export type AnyUIComponent = UIButton | UITextInput | UIHero; /* | ...others */
```

---

## 4. The Component Registry

The Registry maps the backend `__component` string to your concrete React Native implementation.

```tsx
// registry/ComponentRegistry.ts
import { ComponentType } from "react";
import ButtonComponent from "../components/ui/ButtonComponent";
import TextInputComponent from "../components/ui/TextInputComponent";
import HeroComponent from "../components/ui/HeroComponent";

// Every component registered here must accept its own Strapi props
const registry: Record<string, ComponentType<any>> = {
  "ui.button": ButtonComponent,
  "ui.text-input": TextInputComponent,
  "ui.hero": HeroComponent,
  // Add 20+ more here...
};

export const getComponent = (componentName: string) => {
  const Component = registry[componentName];
  if (!Component) {
    console.warn(`[SDUI] Unregistered component: ${componentName}`);
    return null; /* Or return a Fallback/ErrorComponent */
  }
  return Component;
};
```

---

## 5. The Dynamic Renderer

This is the engine that iterates over Strapi slots (`header`, `body`, `footer`) and mounts the components.

```tsx
// components/core/DynamicRenderer.tsx
import React from "react";
import { View } from "react-native";
import { getComponent } from "../../registry/ComponentRegistry";
import { useVisibilityEvaluator } from "../../hooks/useVisibilityEvaluator";

export const DynamicBlock: React.FC<{ block: any }> = ({ block }) => {
  const { __component, visibility } = block;

  // 1. Evaluate Visibility Rule (sdui.visibility)
  const isVisible = useVisibilityEvaluator(visibility);
  if (!isVisible) return null;

  // 2. Fetch from Registry
  const Component = getComponent(__component);
  if (!Component) return null;

  // 3. Render and pass through the Strapi props
  return <Component {...block} />;
};

export const DynamicZoneRenderer: React.FC<{ blocks: any[] }> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <View style={{ gap: 16 }}>
      {blocks.map((block, index) => (
        <DynamicBlock key={`${block.__component}-${block.id || index}`} block={block} />
      ))}
    </View>
  );
};
```

---

## 6. Implementation Patterns: Inputs & Bindings

Inputs _must_ connect to the global state via `sdui.binding`.

```tsx
// components/ui/TextInputComponent.tsx
import React from "react";
import { TextInput, View, Text } from "react-native";
import { UITextInput } from "../../types/sdui";
import { useJourneyStore } from "../../store/journeyStore";
import { useTheme } from "../../theme/ThemeProvider"; // Local styling only!

const TextInputComponent: React.FC<UITextInput> = (props) => {
  const { binding, placeholder, keyboardType } = props;
  const theme = useTheme();

  // Subscribe to the global journey state using the binding path
  const value = useJourneyStore((state) => state.getValue(binding.path));
  const updateField = useJourneyStore((state) => state.updateField);

  return (
    <View style={theme.styles.inputContainer}>
      <TextInput
        style={theme.styles.input}
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={value || ""}
        onChangeText={(text) => updateField(binding.path, text)}
      />
    </View>
  );
};

export default TextInputComponent;
```

---

## 7. Implementation Patterns: The Action Engine

When a user taps a button, it executes an `sdui.action`.

```typescript
// utils/actionExecutor.ts
import { SDUIAction } from "../types/sdui";
import { evaluateGuards } from "./ruleEngine";
import { navigateToStep } from "./navigation";

export const executeAction = async (action: SDUIAction) => {
  if (!action) return;

  // 1. Evaluate Guards (Rules)
  if (action.guards && action.guards.length > 0) {
    const passed = evaluateGuards(action.guards);
    if (!passed) {
      // Handle blocked action (e.g., show inline error via validation engine)
      return;
    }
  }

  // 2. Execute Action based on type
  switch (action.type) {
    case "navigate":
      const nextStepCode = action.payload?.nextStep;
      if (nextStepCode) navigateToStep(nextStepCode);
      break;

    case "api_call":
      // Execute side-effect API call with payload
      break;

    case "set_state":
      // Update local or global state directly
      break;

    case "submit":
      // Resolve the current sdui.step-user with the payload
      break;

    default:
      console.warn(`[SDUI Action Engine] Unknown action type: ${action.type}`);
  }
};
```

Using it inside a component:

```tsx
// components/ui/ButtonComponent.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { UIButton } from "../../types/sdui";
import { executeAction } from "../../utils/actionExecutor";
import { useTheme } from "../../theme/ThemeProvider";

const ButtonComponent: React.FC<UIButton> = ({ label, variant, action }) => {
  const theme = useTheme();
  const styles = theme.getButtonStylesFor(variant);

  const handlePress = () => {
    executeAction(action);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
```

---

## 8. Agent Development Strategy

When instructing an AI to build components using this architecture, provide it with the following workflow:

1. **Analyze Schema**: Give the Agent the schema definitions (e.g., `src/components/ui/money-input.json`).
2. **Generate TypeScript Interface**: Agent must first create the `interface UIMoneyInput extends SDUIBaseComponent` matching the Strapi JSON schema.
3. **Build the React Component**:
   - The component takes the interface as its `Props`.
   - Apply constraints (e.g., no hardcoded styles, only use the design system / theme context).
   - If it's an input, import the `useJourneyStore` hook and wire up the `binding.path`.
   - If it's triggerable, import `executeAction` and wire it up.
4. **Register**: Add the new component to the `ComponentRegistry.ts`.

### Strict Agent Directives:

- **NO INLINE STYLES**: Agents must use the injected `theme` context or a StyleSheet reference.
- **NO STATELESS INPUTS**: Input components that don't hook into `sdui.binding` via the `updateField` utility are considered broken.
- **GRACEFUL FALLBACKS**: If `binding` or `action` is missing but required by the component, do not crash. Return a developer warning view.
