/**
 * screen controller
 */

import { factories } from "@strapi/strapi";
import { RawScreenEntity, mapScreenResponse } from "../mappers/mappers";

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

const HEADER_POPULATE = {
  populate: "*",
};

const FOOTER_POPULATE = {
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
const BASE_POPULATE = {
  visibility: { populate: "*" },
  validations: VALIDATIONS_POPULATE,
  dynamic: DYNAMIC_POPULATE,
};

const COMPONENT_POPULATE: Record<string, any> = {
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

const BODY_POPULATE = {
  populate: "*",
  on: {
    ...COMPONENT_POPULATE,
  },
};

// ── Reusable screen-level populate ──

const SCREEN_POPULATE = {
  meta: { populate: "*" },
  header: HEADER_POPULATE,
  body: BODY_POPULATE,
  footer: FOOTER_POPULATE,
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
        .map(([k, v]) => [k, sanitizeMedia(v)]),
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
      populate: SCREEN_POPULATE,
    });

    if (!entity) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    const cleaned = sanitizeMedia(sanitizedEntity) as RawScreenEntity;
    const mapped = mapScreenResponse(cleaned);

    return this.transformResponse(mapped);
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
      populate: SCREEN_POPULATE,
    });

    console.log({ results, screenId });
    if (!results || results.length === 0) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);
    const cleaned = sanitizeMedia(sanitizedEntity) as RawScreenEntity;
    const mapped = mapScreenResponse(cleaned);

    return this.transformResponse(mapped);
  },
}));
