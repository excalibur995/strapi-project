/**
 * journey controller
 */

import { factories } from "@strapi/strapi";
import { RawScreenEntity } from "../../screen/mappers/mappers";

// Matches the fragment populate used in the screen controller so that
// screens embedded in a journey response are fully hydrated.
// JSON fields (action, icon, placement, valueSource, conditions, validations, dataSource)
// need no deep populate — only nested component relations do.

const SCREENS_POPULATE = {
  screens: {
    populate: {
      // meta: { populate: "*" },
      // header: { populate: "*", on: SCREEN_HEADER_ON },
      // body: { populate: "*", on: SCREEN_BODY_ON },
      // footer: { populate: "*", on: SCREEN_FOOTER_ON },
    },
  },
};

const STEPS_POPULATE = {
  screens: SCREENS_POPULATE.screens,
};

export default factories.createCoreController("api::journey.journey" as any, ({ strapi }) => ({
  async find(ctx) {
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const docs = (strapi as any).documents("api::journey.journey");

    const [results, total] = await Promise.all([
      docs.findMany({ ...sanitizedQuery, populate: "*" }),
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
      populate: { ...SCREENS_POPULATE },
    });

    if (!entity) {
      return ctx.notFound(`Journey not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async findBySlug(ctx) {
    const { journeyId } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const results = await (strapi as any).documents("api::journey.journey").findMany({
      ...sanitizedQuery,
      filters: Object.assign({}, sanitizedQuery.filters, {
        journeyId: { $eq: journeyId },
      }),
      status: "published",
      populate: STEPS_POPULATE,
    });

    console.log({ results, journeyId });
    if (!results || results.length === 0) {
      return ctx.notFound(`Journey not found`);
    }

    // Return the first match (should be exactly one based on unique slug)
    const sanitizedEntity = (await this.sanitizeOutput(results[0], ctx)) as {
      screens: RawScreenEntity[];
    };

    // Re-index steps as a map keyed by actionId so the FE can look up
    // the correct step for any button tap via: steps[componentId]
    // const rawSteps: Array<Record<string, unknown>> = sanitizedEntity.steps ?? [];
    // const stepsMap: Record<string, unknown> = {};
    // for (const step of rawSteps) {
    //   const actionId = step.actionId as string | undefined;
    //   if (actionId) {
    //     stepsMap[actionId] = step;
    //   }
    // }
    // sanitizedEntity.steps = stepsMap as any;

    return this.transformResponse(sanitizedEntity);
  },
}));
