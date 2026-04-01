/**
 * static-screen controller
 */

import { factories } from "@strapi/strapi";
import { mapStaticScreenResponse, RawStaticScreenEntity } from "../mappers/static-screen-mapper";

const SCREENS_POPULATE = {
  contents: {
    populate: "*",
  },
};

// How long (in seconds) the FE should trust a locally cached content block
const CONTENT_TTL_SECONDS = 3600;

export default factories.createCoreController("api::static-screen.static-screen", ({ strapi }) => ({
  async findBySlug(ctx) {
    const { screenId } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const results = await (strapi as any).documents("api::static-screen.static-screen").findMany({
      ...sanitizedQuery,
      filters: Object.assign({}, sanitizedQuery.filters, {
        screenId: { $eq: screenId },
      }),
      status: "published",
      populate: SCREENS_POPULATE,
    });

    if (!results || results.length === 0) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(results[0], ctx);

    // mapped.context is empty here — BE layer is responsible for enriching it
    // with user session data (account name, balance, etc.) before returning to FE
    const mapped = mapStaticScreenResponse(sanitizedEntity as RawStaticScreenEntity);

    ctx.body = {
      data: mapped,
      meta: {
        requestId: crypto.randomUUID(),
        contentCachedAt: new Date().toISOString(),
        ttl: CONTENT_TTL_SECONDS,
      },
    };
  },
}));
