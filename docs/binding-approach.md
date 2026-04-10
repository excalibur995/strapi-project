# SDUI Binding Approach

## Overview

The `sdui.binding` component has been removed from all UI components. State binding is now expressed directly as flat fields on each component, making the API response simpler and reducing nesting depth.

---

## Old Approach (removed)

Previously, each component carried a nested `binding` component:

```json
{
  "__component": "ui.text-input",
  "label": "Mobile number",
  "defaultValue": "",
  "binding": {
    "path": "mobileNumber",
    "scope": "journeyState",
    "defaultValue": ""
  }
}
```

Problems:
- Two sources of truth for `defaultValue` (component field vs `binding.defaultValue`)
- Extra nesting for simple state wiring
- `scope` buried inside a sub-object

---

## New Approach

State binding is expressed as two flat fields on the component itself:

| Field | Type | Purpose |
|---|---|---|
| `name` | `string` | The state key — equivalent to the old `binding.path` |
| `scope` | `enum` | The state scope — `"journeyState"` \| `"localState"` \| `"serverState"` |
| `defaultValue` | `string \| boolean` | Initial value — same field as before, no wrapper |

```json
{
  "__component": "ui.text-input",
  "label": "Mobile number",
  "name": "mobileNumber",
  "scope": "journeyState",
  "defaultValue": ""
}
```

---

## Frontend Implementation

### Reading state

```ts
// Old
const value = getState(component.binding.scope, component.binding.path);

// New
const value = getState(component.scope ?? "journeyState", component.name);
```

### Writing state (on change)

```ts
// Old
setState(component.binding.scope, component.binding.path, newValue);

// New
setState(component.scope ?? "journeyState", component.name, newValue);
```

### Default value

`defaultValue` is a plain field — use it directly to initialise state if the current state value is undefined:

```ts
const initialValue = getState(scope, name) ?? component.defaultValue ?? null;
```

---

## Scope values

| Value | Description |
|---|---|
| `"journeyState"` | Persisted across the journey flow (default) |
| `"localState"` | Screen-local, cleared on navigation |
| `"serverState"` | Read-only server-provided data |

If `scope` is absent, default to `"journeyState"`.

---

## Components that use name/scope for binding

All interactive input components:

- `ui.text-input`
- `ui.date-input`
- `ui.checkbox`
- `ui.dropdown`
- `ui.dropdown-async`
- `ui.money-input`
- `ui.radio-group`
- `ui.tab-group`
- `ui.camera-capture`
- `ui.passcode-input`

Display-only components (`ui.text`, `ui.image-preview`, `ui.review-card`, etc.) use `name` and `scope` for identifying their data source, but are read-only — they do not write to state.

---

## filterBy (ui.item-list)

`ui.item-list` has a `filterBy` field (plain string) that holds a state path used to filter the list by the active tab value:

```json
{
  "__component": "ui.item-list",
  "componentId": "tncList",
  "filterBy": "activeTab"
}
```

This replaces the old `filterBy: { path, scope }` binding component.
