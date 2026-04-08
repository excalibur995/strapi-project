# Task: Update Component Structure in Strapi

## Objective

Update all screen components in Strapi to support the `dynamic` field schema and ensure each component also includes `binding`, `validation`, and `back` fields.

---

## Background

The frontend uses a dynamic rendering engine in React Native. Each component field can optionally be driven at runtime by a `dynamic` config block. There are three source types:

- `FACT` — value is pulled from a `dynamicFacts` object passed at runtime (e.g. user profile data, session context).
- `SERVICE` — value is fetched from a downstream service identified by `serviceCode`.

---

## Dynamic Field Schema

Every component field that supports dynamic behavior must accept the following shape alongside its static value:

```json
{
  "dynamic": {
    "enabled": true,
    "type": "CONTENT" | "OPTIONS" | "VALUE",
    "target": "<field_name_to_override>",
    "source": {
      "type": "FACT" | "SERVICE",
      "path": "<fact_key>",          // used when type is FACT
      "serviceCode": "<SERVICE_CODE>" // used when type is SERVICE
    }
  }
}
```

---

## Dynamic Type Reference

### `CONTENT` — Interpolate a string field from a FACT

Replaces `{placeholder}` tokens inside string fields (e.g. `label`, `placeholder`) using a value from `dynamicFacts`.

```json
{
  "label": "Mobile number for {customerName}",
  "dynamic": {
    "enabled": true,
    "type": "CONTENT",
    "target": "label",
    "source": {
      "type": "FACT",
      "path": "customerName"
    }
  }
}
```

```json
{
  "placeholder": "Enter number with {countryCode}",
  "dynamic": {
    "enabled": true,
    "type": "CONTENT",
    "target": "placeholder",
    "source": {
      "type": "FACT",
      "path": "countryCode"
    }
  }
}
```

---

### `OPTIONS` — Populate a dropdown/select from a downstream SERVICE

The static `options` array should be empty (`[]`). At runtime, it is replaced by the response from the specified service.

```json
{
  "options": [],
  "dynamic": {
    "enabled": true,
    "type": "OPTIONS",
    "target": "options",
    "source": {
      "type": "SERVICE",
      "serviceCode": "GET_PROVINCES"
    }
  }
}
```

---

### `VALUE` — Pre-fill a field's default value from a FACT

Sets the `defaultValue` of a field using data from `dynamicFacts`.

```json
{
  "binding": {
    "path": "mobileNumber"
  },
  "dynamic": {
    "enabled": true,
    "type": "VALUE",
    "target": "defaultValue",
    "source": {
      "type": "FACT",
      "path": "mobileNumber"
    }
  }
}
```

---

## Required Fields for Every Component

In addition to `dynamic`, ensure the following fields are present on **every** component in Strapi:

### `binding`
Maps the component's value to the form state object.

```json
{
  "binding": {
    "path": "fieldKey"
  }
}
```

- `path` — the key used to read/write the value in the form data object.
- Required for all input components. Can be `null` for display-only components.

---

### `validation`
Defines the rules used to validate the field before allowing the journey to progress.

```json
{
  "validation": {
    "required": true,
    "rules": [
      {
        "type": "MIN_LENGTH",
        "value": 8,
        "message": "Must be at least 8 characters"
      },
      {
        "type": "REGEX",
        "value": "^[0-9]+$",
        "message": "Only numbers are allowed"
      }
    ]
  }
}
```

- `required` — whether the field must be filled before proceeding.
- `rules` — array of validation rule objects. Can be empty `[]` if no additional rules apply.

---

### `back`
Controls the back navigation behavior when this component is active.

```json
{
  "back": {
    "enabled": true,
    "target": "previous" | "<screen_id>"
  }
}
```

- `enabled` — whether the back button is shown.
- `target` — `"previous"` to go to the last screen, or a specific screen ID to jump to.

---

## Agent Instructions

1. Go through every component definition under the relevant Strapi content type (screens / components).
2. For each component, add or update:
   - [ ] `dynamic` field support (per type: `CONTENT`, `OPTIONS`, `VALUE`)
   - [ ] `binding` field
   - [ ] `validation` field
   - [ ] `back` field
3. Ensure the schema in Strapi matches the structure defined in this document.
4. Do not remove existing static fields — `dynamic` is always additive and optional.
5. After updating, verify by hitting the Screen API and confirming the new fields appear in the response:
   ```
   GET http://localhost:1337/api/screens/<screen_id>
   ```

---

## Notes

- `dynamic.enabled: false` should be treated as a no-op — the static field value is used as-is.
- `FACT` values come from a `dynamicFacts` object injected at journey session start.
- `SERVICE` calls are made by the frontend at render time using `serviceCode` as the identifier.
- Token interpolation format for `CONTENT` type is `{factKey}` within the string value.
