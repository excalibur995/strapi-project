/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::screen.screen" as any, ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const entity = await (strapi as any).documents("api::screen.screen").findOne({
      documentId: id,
      ...sanitizedQuery,
      populate: {
        meta: { populate: "*" },
        header: { populate: "*" },
        body: { populate: "*" },
        footer: { populate: "*" },
      },
    });

    if (!entity) {
      return ctx.notFound(`Screen not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
