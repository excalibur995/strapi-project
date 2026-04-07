/**
 * Seed v2: Apply Current Account — Mobile Number & Email screens
 *
 * Populates screens using the new baseline component structure:
 *   - Flat fields (name, inputMode, validations JSON, conditions JSON)
 *   - No SDUI binding/validation/visibility sub-components
 *   - ui.progress-bar in header, ui.divider in footer
 *   - meta uses enableBackButton / enableCloseButton
 *
 * Usage (via bootstrap):
 *   SEED_DATA=apply-ca-v2 npm run develop
 */

import type { Core } from "@strapi/strapi";

type StrapiInstance = Core.Strapi;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function findScreen(strapi: StrapiInstance, screenId: string) {
  const results = await strapi.documents("api::screen.screen").findMany({
    filters: { screenId: { $eq: screenId } },
    status: "draft",
    limit: 1,
  });
  return results[0] ?? null;
}

async function createAndPublishScreen(
  strapi: StrapiInstance,
  data: Record<string, unknown>
) {
  const screenId = data.screenId as string;
  const existing = await findScreen(strapi, screenId);

  if (existing) {
    console.log(`[seed-v2] Screen already exists — skipping: ${screenId}`);
    return existing;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await strapi.documents("api::screen.screen").create({ data: data as any });
  await strapi.documents("api::screen.screen").publish({ documentId: created.documentId });

  console.log(`[seed-v2] ✓ Screen created & published: ${screenId}`);
  return created;
}

// ---------------------------------------------------------------------------
// Screen definitions
// ---------------------------------------------------------------------------

const screens = [
  // -------------------------------------------------------------------------
  // Step 1 — Mobile Number
  // Ref: docs/apply-ca-1.png
  // -------------------------------------------------------------------------
  {
    screenId: "mobile_number_form",
    screenKey: "MOBILE_NUMBER_FORM",
    version: 1,
    meta: {
      label: "Apply",
      enableBackButton: false,
      enableCloseButton: true,
    },
    header: [
      {
        __component: "ui.progress-bar",
        name: "progressBar",
        currentStep: 1,
        maxStep: 11,
        enabled: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.text",
        label: "",
        name: "productName",
        variant: "subtitle",
        enabled: true,
        visible: true,
        valueSource: { type: "binding", path: "product.name" },
        span: 12,
      },
      {
        __component: "ui.text",
        label: "Enter your mobile number",
        name: "screenTitle",
        variant: "title",
        enabled: true,
        visible: true,
        span: 12,
      },
    ],
    body: [
      {
        __component: "ui.text-input",
        label: "Mobile number",
        name: "mobileNumber",
        placeholder: "Enter mobile number",
        prefix: "+62",
        inputMode: "numeric",
        defaultValue: "",
        maxLength: 13,
        required: true,
        enabled: true,
        editable: true,
        visible: true,
        validations: [
          {
            type: "REGEX",
            pattern: "^[0-9]{8,13}$",
            message: "Enter a valid Indonesian mobile number",
          },
        ],
        span: 12,
      },
      {
        __component: "ui.text",
        label: "Disclaimer:",
        name: "disclaimerLabel",
        variant: "label",
        enabled: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.text",
        label:
          "Maybank collects your mobile number for purposes including, but not limited to, security feature activation, ATM card activation, sending SMS TAC codes and Mobile App registration. SMS TACs will be sent to your registered mobile number. Your information will be stored securely in Maybank's system, which protects the confidentiality of customer data.",
        name: "disclaimerText",
        variant: "body",
        enabled: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.checkbox",
        title: "I hereby declare:",
        label:
          "I have read and understood the above use of my mobile number. I agree to provide my mobile number and consent to it being used for these purposes.",
        name: "mobileConsent",
        defaultValue: false,
        required: true,
        enabled: true,
        editable: true,
        visible: true,
        span: 12,
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        name: "nextButton",
        variant: "primary",
        enabled: true,
        visible: true,
        action: { type: "NEXT_SCREEN" },
        span: 12,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 2 — Email Registration
  // Ref: docs/apply-ca-2.png
  // -------------------------------------------------------------------------
  {
    screenId: "email_form",
    screenKey: "EMAIL_FORM",
    version: 1,
    meta: {
      label: "Apply",
      enableBackButton: true,
      enableCloseButton: true,
    },
    header: [
      {
        __component: "ui.progress-bar",
        name: "progressBar",
        currentStep: 2,
        maxStep: 11,
        enabled: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.text",
        label: "",
        name: "productName",
        variant: "subtitle",
        enabled: true,
        visible: true,
        valueSource: { type: "binding", path: "product.name" },
        span: 12,
      },
      {
        __component: "ui.text",
        label: "Your email address",
        name: "screenTitle",
        variant: "title",
        enabled: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.text",
        label: "Fill in your email address",
        name: "screenSubtitle",
        variant: "subtitle",
        enabled: true,
        visible: true,
        span: 12,
      },
    ],
    body: [
      {
        __component: "ui.text-input",
        label: "Email address",
        name: "emailAddress",
        placeholder: "Enter email address",
        inputMode: "email",
        defaultValue: "",
        maxLength: 200,
        required: true,
        enabled: true,
        editable: true,
        visible: true,
        span: 12,
      },
      {
        __component: "ui.text-input",
        label: "Confirm email address",
        name: "confirmEmailAddress",
        placeholder: "Re-enter email address",
        inputMode: "email",
        defaultValue: "",
        maxLength: 200,
        required: true,
        enabled: true,
        editable: true,
        visible: true,
        validations: [
          {
            type: "MATCH_FIELD",
            field: "emailAddress",
            message: "Email addresses do not match",
          },
        ],
        span: 12,
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        name: "nextButton",
        variant: "primary",
        enabled: true,
        visible: true,
        action: { type: "NEXT_SCREEN" },
        span: 12,
      },
      {
        __component: "ui.divider",
        label: "Or continue with an account",
        name: "footerDivider",
        visible: true,
        span: 12,
      },
      {
        __component: "ui.button",
        label: "Continue with Google",
        name: "googleAccountButton",
        variant: "secondary",
        enabled: true,
        visible: true,
        icon: { name: "googleLogo", position: "left" },
        action: { type: "SOCIAL_LOGIN", provider: "GOOGLE" },
        span: 12,
      },
      {
        __component: "ui.button",
        label: "Continue with Apple",
        name: "appleAccountButton",
        variant: "secondary",
        enabled: true,
        visible: true,
        icon: { name: "appleLogo", position: "left" },
        action: { type: "SOCIAL_LOGIN", provider: "APPLE" },
        span: 12,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed entry point
// ---------------------------------------------------------------------------

export async function seedApplyCaV2(strapi: StrapiInstance) {
  console.log("[seed-v2] Starting apply-ca-v2 seed…");

  for (const screenData of screens) {
    await createAndPublishScreen(strapi, screenData);
  }

  console.log("[seed-v2] Done.");
}
