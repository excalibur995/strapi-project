/**
 * Seed: Add PascalCase `type` field to every existing UI component in all screens.
 *
 * Reads every screen (draft + published), iterates header/body/footer dynamic zones,
 * and sets the `type` field based on the component's __component identifier.
 *
 * Usage:
 *   SEED_DATA=component-types npm run develop
 */

import type { Core } from "@strapi/strapi";

type StrapiInstance = Core.Strapi;

// Same mapping as in mappers.ts — keep in sync
const COMPONENT_TYPE_MAP: Record<string, string> = {
  "ui.progress-bar": "ProgressBar",
  "ui.text": "Text",
  "ui.image-preview": "ImagePreview",
  "ui.banner": "Banner",
  "ui.tab-group": "TabGroup",
  "ui.radio-group": "RadioGroup",
  "ui.checkbox": "Checkbox",
  "ui.text-input": "TextInput",
  "ui.date-input": "DateInput",
  "ui.dropdown": "Dropdown",
  "ui.dropdown-async": "DropdownAsync",
  "ui.money-input": "MoneyInput",
  "ui.camera-capture": "CameraCapture",
  "ui.item-list": "ItemList",
  "ui.money-display": "MoneyDisplay",
  "ui.passcode-input": "PasscodeInput",
  "ui.rich-text": "RichText",
  "ui.link": "Link",
  "ui.divider": "Divider",
  "ui.review-card": "ReviewCard",
  "ui.slide-to-confirm": "SlideToConfirm",
  "ui.button": "Button",
  "ui.option": "Option",
};

const resolveComponentType = (component: string): string => {
  return COMPONENT_TYPE_MAP[component] ?? "Unknown";
};

/** Walk a dynamic-zone component array and inject `type` into each item */
function injectTypes(components: any[]): number {
  let count = 0;
  for (const comp of components) {
    if (!comp) continue;
    const __component = comp.__component as string | undefined;
    if (__component && !comp.type) {
      comp.type = resolveComponentType(__component);
      count++;
    }
    // Recurse into repeatable nested components (options, list-items, validations, etc.)
    for (const key of Object.keys(comp)) {
      const val = comp[key];
      if (Array.isArray(val)) {
        count += injectTypes(val);
      } else if (val && typeof val === "object" && "__component" in val) {
        count += injectTypes([val]);
      }
    }
  }
  return count;
}

export default {
  async seed(strapi: StrapiInstance) {
    console.log("[seed:component-types] Starting…");

    const screens = await strapi.documents("api::screen.screen").findMany({
      status: "draft",
      populate: {
        header: { populate: "*" },
        body: { populate: "*" },
        footer: { populate: "*" },
      },
    });

    let totalUpdated = 0;

    for (const screen of screens) {
      let screenChanged = false;

      for (const zone of ["header", "body", "footer"] as const) {
        const components = screen[zone] as any[];
        if (!components || components.length === 0) continue;
        const updated = injectTypes(components);
        if (updated > 0) {
          screenChanged = true;
          totalUpdated += updated;
        }
      }

      if (screenChanged) {
        await strapi.documents("api::screen.screen").update({
          documentId: screen.documentId,
          status: "draft",
          data: {
            header: screen.header as any,
            body: screen.body as any,
            footer: screen.footer as any,
          },
        });
        console.log(`[seed:component-types] Updated screen ${screen.screenId} (${screen.documentId})`);
      }
    }

    console.log(`[seed:component-types] Done. Injected ${totalUpdated} type fields.`);
  },
};
