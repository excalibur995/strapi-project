/**
 * screen controller
 */

import { factories } from "@strapi/strapi";
import { RawScreenEntity, mapScreenResponse } from "../mappers/mappers";
import { BODY_POPULATE, FOOTER_POPULATE, HEADER_POPULATE } from "./screen-constant";
import { sanitizeMedia } from "./screen-utils";

const SCREEN_POPULATE = {
  meta: { populate: "*" },
  header: HEADER_POPULATE,
  body: BODY_POPULATE,
  footer: FOOTER_POPULATE,
};

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

    if (!results || results.length === 0) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);
    const cleaned = sanitizeMedia(sanitizedEntity) as RawScreenEntity;
    const mapped = mapScreenResponse(cleaned);

    return this.transformResponse(mapped);
  },
}));
