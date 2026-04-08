/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

// We must use the fragment API to populate nested components inside dynamic zones in Strapi v5.
// Rules:
//   - Only list components that are allowed in that specific dynamic zone.
//   - Only populate fields that actually exist on the component schema.
//   - JSON fields (action, icon, placement, valueSource, dataSource) need no deep populate.
//   - binding   → sdui.binding   — always explicit: { populate: "*" }
//   - validations → sdui.validation (repeatable) — always explicit: { populate: "*" }
//   - dynamic   → sdui.dynamic with nested sdui.dynamic-source — always explicit: DYNAMIC_POPULATE
//   - flat string / boolean / enum / json fields are returned automatically; never appear in populate.

// ── Shared populate shorthands ────────────────────────────────────────────────

const BINDING_POPULATE = { populate: "*" };
const VALIDATIONS_POPULATE = { populate: "*" };
// dynamic.source is a nested component (sdui.dynamic-source) — must be explicitly deep-populated.
const DYNAMIC_POPULATE = { populate: { source: { populate: "*" } } };

// ── Zone populate configs ─────────────────────────────────────────────────────

const HEADER_POPULATE = {
  populate: "*",
  on: {
    "ui.progress-bar": {
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.text": {
      // valueSource / placement are JSON — no deep populate needed for those
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.hero": {
      populate: {
        referenceSource: { populate: "*" },
        illustration: { populate: "*" },
        binding: BINDING_POPULATE,
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.banner": {
      populate: {
        onTap: { populate: "*" },
        visibility: { populate: "*" },
        binding: BINDING_POPULATE,
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.image-preview": {
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.section-label": {
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.subtitle-label-section": {
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.tab-group": {
      populate: {
        options: { populate: "*" },
        binding: BINDING_POPULATE,
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
  },
};

const FOOTER_POPULATE = {
  populate: "*",
  on: {
    "ui.slide-to-confirm": {
      populate: {
        guardRules: { populate: "*" }, // relation — must be explicit
        visibility: { populate: "*" },
        binding: BINDING_POPULATE,
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.button": {
      // action / icon are JSON — no deep populate needed
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
    "ui.banner": {
      populate: {
        onTap: { populate: "*" },
        visibility: { populate: "*" },
        binding: BINDING_POPULATE,
        validations: VALIDATIONS_POPULATE,
        dynamic: DYNAMIC_POPULATE,
      },
    },
    "ui.divider": {
      populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
    },
  },
};

const COMPONENT_POPULATE: Record<string, any> = {
  // ── Flat / JSON-only sub-fields (binding + validations + dynamic still need explicit populate) ──

  "ui.text": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.text-input": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.date-input": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.checkbox": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.card": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.divider": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.image-preview": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.button": {
    // action / icon / placement are JSON
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.review-card": {
    // options is JSON
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.dropdown-async": {
    // dataSource is JSON
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.section-label": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.local-state": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.progress-bar": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },

  // ── Components with additional SDUI sub-components ────────────────────────

  "ui.dropdown": {
    populate: {
      options: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.camera-capture": {
    populate: {
      onComplete: { populate: { action: { populate: "*" } } },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.banner": {
    populate: {
      onTap: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.icon-text": {
    populate: {
      icon: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.radio-group": {
    populate: {
      options: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.radio-group-async": {
    populate: {
      dataSource: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.checkbox-list": {
    populate: {
      options: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.checkbox-list-async": {
    populate: {
      dataSource: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.money-input": {
    populate: {
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.cascading-select": {
    populate: {
      tiers: { populate: { dataSource: { populate: "*" }, binding: BINDING_POPULATE } },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.rich-text": {
    populate: {
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.list-item": {
    populate: {
      icon: { populate: "*" },
      onTap: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.item-list": {
    populate: {
      options: {
        populate: {
          icon: { populate: "*" },
          onTap: { populate: "*" },
          visibility: { populate: "*" },
          binding: BINDING_POPULATE,
          validations: VALIDATIONS_POPULATE,
        },
      },
      filterBy: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.account-selector": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
  "ui.passcode-input": {
    populate: {
      onForgot: { populate: "*" },
      onComplete: { populate: { action: { populate: "*" } } },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.money-display": {
    populate: {
      source: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.badge": {
    populate: {
      source: { populate: "*" },
      visibility: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.tab-group": {
    populate: {
      options: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.link": {
    populate: {
      action: { populate: "*" },
      binding: BINDING_POPULATE,
      validations: VALIDATIONS_POPULATE,
      dynamic: DYNAMIC_POPULATE,
    },
  },
  "ui.subtitle-label-section": {
    populate: { binding: BINDING_POPULATE, validations: VALIDATIONS_POPULATE, dynamic: DYNAMIC_POPULATE },
  },
};

const BODY_POPULATE = {
  populate: "*",
  on: {
    ...COMPONENT_POPULATE,
    "ui.row": true,
  },
};

const MEDIA_STRIP_KEYS = new Set(["related", "createdAt", "updatedAt", "publishedAt"]);

function sanitizeMedia(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeMedia);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const isMedia = typeof obj.url === "string" && typeof obj.mime === "string";
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([k]) => !(isMedia && MEDIA_STRIP_KEYS.has(k)))
        .map(([k, v]) => [k, sanitizeMedia(v)])
    );
  }
  return value;
}

export default factories.createCoreController("api::screen.screen" as any, ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const entity = await (strapi as any).documents("api::screen.screen").findOne({
      documentId: id,
      ...sanitizedQuery,
      populate: {
        meta: { populate: "*" },
        header: HEADER_POPULATE,
        body: BODY_POPULATE,
        footer: FOOTER_POPULATE,
      },
    });

    if (!entity) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizeMedia(sanitizedEntity));
  },

  async findById(ctx) {
    const { screenId } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const results = await (strapi as any).documents("api::screen.screen").findMany({
      ...sanitizedQuery,
      filters: Object.assign({}, sanitizedQuery.filters, {
        screenId: { $eq: screenId },
      }),
      status: "published",
      populate: {
        meta: { populate: "*" },
        header: HEADER_POPULATE,
        body: BODY_POPULATE,
        footer: FOOTER_POPULATE,
      },
    });

    console.log({ results, screenId });
    if (!results || results.length === 0) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);
    const mapped = sanitizeMedia(sanitizedEntity);

    return this.transformResponse(mapped);
  },
}));
