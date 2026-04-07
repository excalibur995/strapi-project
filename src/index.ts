import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { seedApplyCa, updateApplyCaJourney } from "./seeds/apply-ca";
import { seedApplyCaV2 } from "./seeds/apply-ca-v2";

const { ValidationError } = errors;

export default {
  /**
   * Runs before the application is initialized.
   * Used to register middleware and extend Strapi behaviour.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Block publish if neither api_version nor content_version has changed.
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
            if (currentPublished.version === incomingDraft.version) {
              throw new ValidationError(
                "Before publishing, increase the version. Publishing is blocked because the version is unchanged.",
              );
            }
          }
        }
      }

      return next();
    });
  },

  /**
   * Runs before the application starts.
   *
   * Seeding — creates screens + journey if not already present:
   *   SEED_DATA=apply-ca      npm run develop   (legacy SDUI structure)
   *   SEED_DATA=apply-ca-v2   npm run develop   (baseline flat structure)
   *   SEED_DATA=true          npm run develop   (alias for apply-ca)
   *
   * Updating — patches existing journey steps + screen relations:
   *   UPDATE_JOURNEY=apply-ca npm run develop
   *   UPDATE_JOURNEY=true     npm run develop
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const seedFlag = process.env.SEED_DATA;

    if (seedFlag === "true" || seedFlag === "apply-ca") {
      await seedApplyCa(strapi);
    }

    if (seedFlag === "apply-ca-v2") {
      await seedApplyCaV2(strapi);
    }

    const updateFlag = process.env.UPDATE_JOURNEY;

    if (updateFlag === "true" || updateFlag === "apply-ca") {
      await updateApplyCaJourney(strapi);
    }
  },
};
