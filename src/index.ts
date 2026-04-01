import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { seedApplyCa, updateApplyCaJourney } from "./seeds/apply-ca";
const { ValidationError } = errors;

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      const targetUids = ["api::screen.screen", "api::journey.journey", "api::rule-set.rule-set"];

      if (context.action === "publish" && targetUids.includes(context.uid)) {
        const uid = context.uid as any;
        const documentId = context.params.documentId;

        const currentPublished = await strapi.documents(uid).findOne({
          documentId,
          status: "published",
        });

        if (currentPublished) {
          const incomingDraft = await strapi.documents(uid).findOne({
            documentId,
            status: "draft",
          });

          if (incomingDraft) {
            const oldApi = currentPublished.api_version;
            const oldContent = currentPublished.content_version;

            const newApi = incomingDraft.api_version;
            const newContent = incomingDraft.content_version;

            if (oldApi === newApi && oldContent === newContent) {
              throw new ValidationError(
                "Before publishing, increase either the api_version or content_version. Publishing is blocked because both versions are unchanged.",
              );
            }
          }
        }
      }

      // Continue to next middleware or standard execution
      return next();
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Seeding (creates screens + journey if not present):
   *   SEED_DATA=apply-ca npm run develop
   *   SEED_DATA=true npm run develop
   *
   * Updating (patches existing journey steps + screen relations):
   *   UPDATE_JOURNEY=apply-ca npm run develop
   *   UPDATE_JOURNEY=true npm run develop
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const seedFlag = process.env.SEED_DATA;
    if (seedFlag === "true" || seedFlag === "apply-ca") {
      await seedApplyCa(strapi);
    }

    const updateFlag = process.env.UPDATE_JOURNEY;
    if (updateFlag === "true" || updateFlag === "apply-ca") {
      await updateApplyCaJourney(strapi);
    }
  },
};
