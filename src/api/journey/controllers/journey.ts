/**
 * journey controller
 */

import { factories } from "@strapi/strapi";

const SCREENS_POPULATE = {
  screens: {
    populate: {
      meta: { populate: "*" },
      header: { populate: "*" },
      body: { populate: "*" },
      footer: { populate: "*" },
    },
    sort: ["order:asc"],
  },
  onExit: true,
};

export default factories.createCoreController("api::journey.journey" as any, ({ strapi }) => ({
  async find(ctx) {
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const docs = (strapi as any).documents("api::journey.journey");

    const [results, total] = await Promise.all([
      docs.findMany({ ...sanitizedQuery, populate: SCREENS_POPULATE }),
      docs.count({ ...sanitizedQuery }),
    ]);

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    const page = Number(sanitizedQuery.page) || 1;
    const pageSize = Number(sanitizedQuery.pageSize) || 25;

    return this.transformResponse(sanitizedResults, {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const entity = await (strapi as any).documents("api::journey.journey").findOne({
      documentId: id,
      ...sanitizedQuery,
      populate: SCREENS_POPULATE,
    });

    if (!entity) {
      return ctx.notFound(`Journey not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const results = await (strapi as any).documents("api::journey.journey").findMany({
      ...sanitizedQuery,
      filters: Object.assign({}, sanitizedQuery.filters, {
        slug: { $eq: slug },
      }),
      status: "published",
      populate: "*",
    });

    if (!results || results.length === 0) {
      return ctx.notFound(`Journey not found`);
    }

    // Return the first match (should be exactly one based on unique slug)
    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
