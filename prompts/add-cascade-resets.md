# Agent Prompt: Add `cascadeResets` to Cascading Components

## Goal
Wire up cascading reset behaviour on a set of dependent components (dropdowns, inputs, radio groups, etc.) so that when a parent component's value changes, all child and grandchild fields are cleared atomically from `journeyState`.

## Context
This project uses a Server-Driven UI (SDUI) pattern. Components are defined in Strapi and consumed by a React Native frontend. `cascadeResets` is a base-level field available on **every** UI component. It tells the FE which `journeyState` keys to clear when this component's value changes.

- `dependsOn` (string, dropdown-only) — the parent field name a dropdown watches for **option filtering**
- `cascadeResets` (string[], all components) — the list of field names to **clear** in `journeyState` when this component's value changes

Rule: every component that has dependants must declare `cascadeResets`. Leaf nodes (no children) do not need it.

---

## Step 1 — Identify the dependency chain

Read the relevant seed file under `src/seeds/` and locate the components that form the cascade chain. For each component note:
- its `name` field (the `journeyState` key)
- which other fields depend on it

Example chain:
```
ektpReviewProvince  →  ektpReviewCity  →  ektpReviewSubDistrict
```

---

## Step 2 — Confirm `cascadeResets` exists on component schemas

`cascadeResets` is already defined on all components in `src/components/ui/`. Do NOT add it again. If working with a component type that is NOT in `src/components/ui/`, add it:

```json
"cascadeResets": {
  "type": "json"
}
```

---

## Step 3 — Confirm `cascadeResets` exists in `src/types/sdui.ts`

`cascadeResets` is already on `UiBase`, so it is inherited by every component interface. Do NOT add it to individual interfaces. If missing from `UiBase`, add it here:

```ts
interface UiBase {
  // ... existing fields
  /** Field names to clear in journeyState when this component's value changes */
  cascadeResets?: string[];
}
```

---

## Step 4 — Update the seed file

For each **non-leaf** component in the chain, add `cascadeResets` listing **all descendants** (not just the direct child):

```ts
// Root — resets all descendants
name: "ektpReviewProvince",
cascadeResets: ["ektpReviewCity", "ektpReviewSubDistrict"],

// Middle — resets its own descendants
name: "ektpReviewCity",
dependsOn: "ektpReviewProvince",
cascadeResets: ["ektpReviewSubDistrict"],

// Leaf — no cascadeResets needed
name: "ektpReviewSubDistrict",
dependsOn: "ektpReviewCity",
```

Place `cascadeResets` on the **component object**, not inside any option or child object.

---

## Step 5 — Update the widget component on the FE

For any widget that writes to `journeyState` (dropdown, text input, radio group, checkbox, etc.), add `cascadeResets` to its props and clear children atomically in its change handler:

```tsx
export interface WidgetProps {
  // ... existing props unchanged
  cascadeResets?: string[]; // ← add this
}

export const Widget: React.FC<WidgetProps> = ({
  // ... existing destructure unchanged
  cascadeResets = [],
}) => {

  const handleChange = (value: string) => {
    if (statePath && journeyId) {
      const cleared = Object.fromEntries(
        cascadeResets.map(key => [key, ''])
      );
      updateSession(journeyId, {
        journeyState: {
          ...session?.journeyState,
          ...cleared,         // clear all children first
          [statePath]: value, // then set self
        },
      });
    } else {
      setLocalValue(value);
    }
  };

};
```

---

## Checklist

- [ ] All relevant seed component objects have `cascadeResets` (non-leaf only)
- [ ] `cascadeResets` lists **all** descendants, not just the direct child
- [ ] `cascadeResets` is on the component object — not on individual options
- [ ] Leaf components have no `cascadeResets`
- [ ] Each affected FE widget has `cascadeResets?: string[]` in its props interface
- [ ] Each affected FE widget clears all `cascadeResets` keys atomically before setting its own value

---

## Do NOT touch

- Individual option objects — `cascadeResets` belongs on the component, not on options
- `dependsOn` on option objects — those drive **filtering**, not resetting
- `dependsOn` on dropdown component level — that drives **disable state**, not resetting
- `src/components/ui/*.json` schemas — `cascadeResets` is already present on all components
- `UiBase` in `sdui.ts` — `cascadeResets` is already inherited by all component interfaces
