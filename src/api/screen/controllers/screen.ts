/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

// We must use the fragment API to populate nested components inside dynamic zones in Strapi v5.
// Rules:
//   - Only list components that are allowed in that specific dynamic zone.
//   - Only populate fields that actually exist on the component schema.
//   - JSON fields (action, icon, placement, valueSource, conditions, validations, dataSource) need no deep populate.
//   - SDUI sub-components (binding, validation, visibility, source) were removed from:
//       ui.text-input, ui.button, ui.image-preview, ui.review-card, ui.dropdown, ui.dropdown-async

const HEADER_POPULATE = {
  populate: "*",
  on: {
    "ui.progress-bar": { populate: "*" }, // new — all flat fields
    "ui.text": { populate: "*" }, // valueSource / placement are JSON — no deep populate
    "ui.hero": { populate: { referenceSource: { populate: "*" }, illustration: { populate: "*" } } },
    "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
    "ui.image-preview": { populate: "*" }, // valueSource / placement are JSON — source removed
    "ui.section-label": { populate: "*" },
    "ui.subtitle-label-section": { populate: "*" },
    "ui.tab-group": { populate: { options: { populate: "*" }, binding: { populate: "*" } } },
  },
};

const FOOTER_POPULATE = {
  populate: "*",
  on: {
    "ui.slide-to-confirm": {
      populate: {
        guardRules: { populate: "*" }, // relation — must be explicit
        visibility: { populate: "*" },
      },
    },
    "ui.button": { populate: "*" }, // action / icon / placement are JSON — no sub-components
    "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
    "ui.divider": { populate: "*" }, // new — all flat fields
  },
};

const COMPONENT_POPULATE: Record<string, any> = {
  // ── New baseline components (all flat / JSON fields) ────────────────────
  "ui.text": { populate: "*" }, // valueSource / placement are JSON
  "ui.text-input": { populate: "*" }, // name / inputMode / validations / conditions are JSON — no SDUI sub-components
  "ui.date-input": { populate: "*" }, // new — validations / conditions are JSON
  "ui.checkbox": { populate: "*" }, // new — all flat
  "ui.card": { populate: "*" }, // new — valueSource is JSON
  "ui.divider": { populate: "*" }, // new — all flat
  "ui.image-preview": { populate: "*" }, // valueSource / placement are JSON — source removed
  "ui.button": { populate: "*" }, // action / icon / placement are JSON — guardRules / visibility removed
  "ui.review-card": { populate: "*" }, // options is now JSON — no SDUI sub-components
  "ui.dropdown": {
    // binding / validation / visibility removed; options (ui.option) still a component
    populate: { options: { populate: "*" } },
  },
  "ui.dropdown-async": { populate: "*" }, // dataSource is now JSON — no SDUI sub-components

  // ── Unchanged components (still use SDUI sub-components) ────────────────
  "ui.camera-capture": {
    populate: {
      binding: { populate: "*" },
      onComplete: { populate: { action: { populate: "*" } } },
    },
  },
  "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
  "ui.section-label": { populate: "*" },
  "ui.icon-text": { populate: { icon: { populate: "*" }, visibility: { populate: "*" } } },
  "ui.radio-group": {
    populate: {
      binding: { populate: "*" },
      validation: { populate: "*" },
      options: { populate: "*" },
      visibility: { populate: "*" },
    },
  },
  "ui.radio-group-async": {
    populate: {
      dataSource: { populate: "*" },
      binding: { populate: "*" },
      validation: { populate: "*" },
      visibility: { populate: "*" },
    },
  },
  "ui.checkbox-list": {
    populate: {
      binding: { populate: "*" },
      validation: { populate: "*" },
      options: { populate: "*" },
      visibility: { populate: "*" },
    },
  },
  "ui.checkbox-list-async": {
    populate: {
      dataSource: { populate: "*" },
      binding: { populate: "*" },
      validation: { populate: "*" },
      visibility: { populate: "*" },
    },
  },
  "ui.money-input": {
    populate: { binding: { populate: "*" }, validation: { populate: "*" }, visibility: { populate: "*" } },
  },
  "ui.cascading-select": {
    populate: {
      tiers: { populate: { dataSource: { populate: "*" }, binding: { populate: "*" } } },
      validation: { populate: "*" },
    },
  },
  "ui.rich-text": { populate: { visibility: { populate: "*" } } },
  "ui.list-item": {
    populate: {
      icon: { populate: "*" },
      onTap: { populate: "*" },
      visibility: { populate: "*" },
    },
  },
  "ui.item-list": {
    populate: {
      options: {
        populate: {
          icon: { populate: "*" },
          onTap: { populate: "*" },
          visibility: { populate: "*" },
        },
      },
      filterBy: { populate: "*" },
    },
  },
  "ui.account-selector": { populate: { binding: { populate: "*" } } },
  "ui.passcode-input": {
    populate: {
      binding: { populate: "*" },
      onForgot: { populate: "*" },
      onComplete: { populate: { action: { populate: "*" } } },
    },
  },
  "ui.money-display": { populate: { source: { populate: "*" } } },
  "ui.badge": { populate: { visibility: { populate: "*" } } },
  "ui.tab-group": { populate: { options: { populate: "*" }, binding: { populate: "*" } } },
  "ui.link": {
    populate: {
      action: { populate: "*" },
      validation: { populate: "*" },
    },
  },
  "ui.local-state": { populate: "*" },
  "ui.progress-bar": { populate: "*" },
};

const BODY_POPULATE = {
  populate: "*",
  on: {
    ...COMPONENT_POPULATE,
    "ui.row": true,
  },
};

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
    return this.transformResponse(sanitizedEntity);
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
    const mapped = sanitizedEntity;
    // const mapped = mapScreenResponse(sanitizedEntity as RawScreenEntity);

    return this.transformResponse(mapped);
  },
}));
