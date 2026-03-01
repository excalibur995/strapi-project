/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::screen.screen" as any, ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await (strapi as any).documents("api::screen.screen").findOne({
      documentId: id,
      status: "published",
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

    return this.transformResponse(entity);
  },
}));
