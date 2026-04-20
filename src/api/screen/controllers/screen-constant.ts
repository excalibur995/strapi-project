// We must use the fragment API to populate nested components inside dynamic zones in Strapi v5.
// Rules:
//   - Only list components that are allowed in that specific dynamic zone.
//   - Only populate fields that actually exist on the component schema.
//   - JSON fields (action, icon, placement, valueSource, dataSource) need no deep populate.
//   - binding is removed — state wiring uses flat `name` + `scope` fields on each component.
//   - validations → sdui.validation (repeatable) — always explicit: { populate: "*" }
//   - dynamic   → sdui.dynamic with nested sdui.dynamic-source — always explicit: DYNAMIC_POPULATE
//   - flat string / boolean / enum / json fields are returned automatically; never appear in populate.

// ── Shared populate shorthands ────────────────────────────────────────────────

const VALIDATIONS_POPULATE = { populate: "*" };
// dynamic.source is a nested component (sdui.dynamic-source) — must be explicitly deep-populated.
const DYNAMIC_POPULATE = { populate: { source: { populate: "*" } } };

// ── Zone populate configs ─────────────────────────────────────────────────────

export const HEADER_POPULATE = {
  populate: "*",
};

export const FOOTER_POPULATE = {
  populate: "*",
  on: {
    "ui.slide-to-confirm": {
      populate: {
        visibility: { populate: "*" },
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.button": {
      // action / icon are JSON — no deep populate needed
      populate: { validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.banner": {
      populate: {
        action: { populate: "*" },
        visibility: { populate: "*" },
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.divider": {
      populate: { validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
  },
};

// Shared populate for all components: visibility + validations + dynamic
export const BASE_POPULATE = {
  visibility: { populate: "*" },
  validations: VALIDATIONS_POPULATE,
  dynamic: DYNAMIC_POPULATE,
};

export const COMPONENT_POPULATE: Record<string, any> = {
  "ui.text": { populate: { ...BASE_POPULATE } },
  "ui.text-input": { populate: { ...BASE_POPULATE } },
  "ui.date-input": { populate: { ...BASE_POPULATE } },
  "ui.checkbox": { populate: { ...BASE_POPULATE } },
  "ui.divider": { populate: { ...BASE_POPULATE } },
  "ui.progress-bar": { populate: { ...BASE_POPULATE } },
  "ui.radio-group": { populate: { ...BASE_POPULATE } },
  "ui.tab-group": { populate: { ...BASE_POPULATE } },
  "ui.button": { populate: { ...BASE_POPULATE } },
  "ui.money-input": { populate: { ...BASE_POPULATE } },
  "ui.rich-text": { populate: { ...BASE_POPULATE } },
  "ui.review-card": { populate: { ...BASE_POPULATE } },
  "ui.image-preview": {
    populate: { media: { populate: "*" }, ...BASE_POPULATE },
  },
  "ui.dropdown": {
    populate: { options: { populate: "*" }, ...BASE_POPULATE },
  },
  "ui.item-list": {
    populate: { options: { populate: "*" }, ...BASE_POPULATE },
  },
  "ui.camera-capture": {
    populate: { onComplete: { populate: { action: { populate: "*" } } }, ...BASE_POPULATE },
  },
  "ui.banner": {
    populate: { action: { populate: "*" }, ...BASE_POPULATE },
  },
  "ui.passcode-input": {
    populate: {
      onForgot: { populate: "*" },
      onComplete: { populate: { action: { populate: "*" } } },
      ...BASE_POPULATE,
    },
  },
  "ui.money-display": {
    populate: { source: { populate: "*" }, ...BASE_POPULATE },
  },
  "ui.link": {
    populate: { action: { populate: "*" }, ...BASE_POPULATE },
  },
};

export const BODY_POPULATE = {
  populate: "*",
  on: {
    ...COMPONENT_POPULATE,
  },
};

export const MEDIA_STRIP_KEYS = new Set(["related", "createdAt", "updatedAt", "publishedAt"]);
