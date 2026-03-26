/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

// We must use the fragment API to populate nested components inside dynamic zones in Strapi v5
// The 'on' parameter MUST ONLY contain components that are allowed in that specific dynamic zone,
// and MUST ONLY ask to populate fields that actually exist on that component schema.
const HEADER_POPULATE = {
  populate: "*",
  on: {
    "ui.hero": { populate: { referenceSource: { populate: "*" }, illustration: { populate: "*" } } },
    "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
    "ui.image-preview": { populate: { source: { populate: "*" } } }, // no visibility field!
    "ui.section-label": { populate: "*" }, // needs to be explicitly listed to not be omitted
  },
};

const FOOTER_POPULATE = {
  populate: "*",
  on: {
    "ui.slide-to-confirm": {
      populate: {
        action: { populate: "*" },
        guardRules: { populate: "*" }, // relation — must be explicit
        visibility: { populate: "*" },
      },
    },
    "ui.button": {
      populate: {
        action: { populate: "*" },
        guardRules: { populate: "*" }, // relation — must be explicit
        visibility: { populate: "*" },
      },
    },
    "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
  },
};

const BODY_POPULATE = {
  populate: "*", // populate 1st level (the ui. components)
  on: {
    "ui.camera-capture": {
      populate: {
        binding: { populate: "*" },
        onComplete: { populate: { action: { populate: "*" } } },
      },
      // camera-capture does not have visibility
    },
    "ui.banner": { populate: { onTap: { populate: "*" }, visibility: { populate: "*" } } },
    "ui.section-label": { populate: "*" }, // explicitly listed to avoid omission
    "ui.text-input": {
      populate: { binding: { populate: "*" }, validation: { populate: "*" }, visibility: { populate: "*" } },
    },
    "ui.icon-text": { populate: { icon: { populate: "*" }, visibility: { populate: "*" } } },
    "ui.radio-group": {
      populate: {
        binding: { populate: "*" },
        validation: { populate: "*" },
        options: { populate: "*" },
        visibility: { populate: "*" },
      },
    },
    "ui.money-input": {
      populate: { binding: { populate: "*" }, validation: { populate: "*" }, visibility: { populate: "*" } },
    },
    "ui.image-preview": { populate: { source: { populate: "*" } } }, // no visibility field!
    "ui.checkbox-list": {
      populate: {
        binding: { populate: "*" },
        validation: { populate: "*" },
        items: { populate: "*" },
        visibility: { populate: "*" },
      },
    },
    "ui.dropdown": {
      populate: {
        binding: { populate: "*" },
        validation: { populate: "*" },
        options: { populate: "*" },
        visibility: { populate: "*" },
      },
    },
    "ui.rich-text": {
      populate: {
        visibility: { populate: "*" },
      },
    },
    "ui.button": {
      populate: {
        action: { populate: "*" },
        guardRules: { populate: "*" }, // relation — must be explicit
        visibility: { populate: "*" },
      },
    },
    "ui.list-item": {
      populate: {
        icon: { populate: "*" },
        onTap: { populate: "*" },
        visibility: { populate: "*" },
      },
    },
    "ui.item-list": {
      populate: {
        items: {
          populate: {
            icon: { populate: "*" },
            onTap: { populate: "*" },
            visibility: { populate: "*" },
          },
        },
        filterBy: { populate: "*" },
      },
    },
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

    // Return the first match (should be exactly one based on unique slug)
    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
