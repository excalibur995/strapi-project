/**
 * Seed: Apply Current Account (apply-ca)
 * Journey ID : ACCT_CA_APPLY
 *
 * Creates all Screens then the Journey in one pass.
 * Safe to re-run — skips any screen/journey that already exists by screenId / journeyId.
 *
 * Usage (via bootstrap):
 *   SEED_DATA=apply-ca npm run develop
 *   SEED_DATA=true npm run develop
 */

import type { Core } from "@strapi/strapi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type StrapiInstance = Core.Strapi;

/** Converts a plain string into Strapi blocks (rich-text) format */
function blocks(text: string) {
  return [{ type: "paragraph", children: [{ type: "text", text }] }];
}

async function findScreen(strapi: StrapiInstance, screenId: string) {
  const results = await strapi.documents("api::screen.screen").findMany({
    filters: { screenId: { $eq: screenId } },
    status: "draft",
    limit: 1,
  });
  return results[0] ?? null;
}

async function findJourney(strapi: StrapiInstance, journeyId: string) {
  const results = await strapi.documents("api::journey.journey").findMany({
    filters: { journeyId: { $eq: journeyId } },
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
    console.log(`[seed] Screen already exists — skipping: ${screenId}`);
    return existing;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await strapi.documents("api::screen.screen").create({ data: data as any });
  await strapi
    .documents("api::screen.screen")
    .publish({ documentId: created.documentId });

  console.log(`[seed] ✓ Screen created & published: ${screenId}`);
  return created;
}

// ---------------------------------------------------------------------------
// Screen definitions
// ---------------------------------------------------------------------------

const screens = [
  // -------------------------------------------------------------------------
  // Step 1 — Mobile Number
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_MOBILE_NUMBER",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Enter your mobile number",
      subtitle: "Global Access Account",
      showBack: false,
      showClose: true,
    },
    body: [
      {
        __component: "ui.text-input",
        label: "Mobile number",
        placeholder: "Enter mobile number",
        keyboard: "phone",
        binding: { path: "mobileNumber", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Mobile number is required" },
          {
            rule: "pattern",
            value: "^[0-9]{8,13}$",
            message: "Enter a valid Indonesian mobile number",
          },
        ],
      },
      {
        __component: "ui.rich-text",
        // ui.rich-text.text is type "blocks" — must be a Strapi blocks array
        text: blocks(
          "Maybank collects your mobile number for purposes including, but not limited to, security feature activation, ATM card activation, sending SMS TAC codes and Mobile App registration. SMS TACs will be sent to your registered mobile number. Your information will be stored securely in Maybank's system, which protects the confidentiality of customer data."
        ),
      },
      {
        __component: "ui.checkbox-list",
        label: "I hereby declare:",
        items: [
          {
            key: "mobileConsent",
            label:
              "I have read and understood the above use of my mobile number. I agree to provide my mobile number and consent to it being used for these purposes.",
          },
        ],
        binding: { path: "mobileConsent", scope: "journeyState" },
        validation: [
          { rule: "required", message: "You must agree to continue" },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "mobile-number-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 2 — Email Registration
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EMAIL_REGISTRATION",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Your email address",
      subtitle: "Fill in your email address",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.text-input",
        label: "Email address",
        placeholder: "Enter email address",
        keyboard: "email",
        binding: { path: "emailAddress", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Email address is required" },
          {
            rule: "pattern",
            value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "Enter a valid email address",
          },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Confirm email address",
        placeholder: "Re-enter email address",
        keyboard: "email",
        binding: { path: "emailAddressConfirm", scope: "journeyState" },
        validation: [
          {
            rule: "match",
            value: "emailAddress",
            message: "Email addresses do not match",
          },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "email-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
      {
        __component: "ui.button",
        label: "Continue with Google",
        variant: "secondary",
        action: {
          key: "sso-google",
          type: "api_call",
          payload: { provider: "google" },
        },
      },
      {
        __component: "ui.button",
        label: "Continue with Apple",
        variant: "secondary",
        action: {
          key: "sso-apple",
          type: "api_call",
          payload: { provider: "apple" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 3a — e-KTP Instructions
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EKTP_INSTRUCTIONS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "e-KTP photo conditions",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.section-label",
        // ui.section-label uses "title", not "label"
        title: "e-KTP photo conditions",
      },
      // ui.icon-text requires a media upload for "icon" — using ui.text instead
      {
        __component: "ui.text",
        text: "• Ensure your face is clearly visible",
        variant: "body",
      },
      {
        __component: "ui.text",
        text: "• Capture a clear photo of your e-KTP so the system can identify your identity",
        variant: "body",
      },
      {
        __component: "ui.text",
        text: "• Ensure all text on the e-KTP is clearly readable",
        variant: "body",
      },
      {
        __component: "ui.text",
        text: "• Do not alter or edit the e-KTP image in any way",
        variant: "body",
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Get started",
        variant: "primary",
        action: {
          key: "start-ektp",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 3b — e-KTP Capture
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EKTP_CAPTURE",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Capture your e-KTP",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.camera-capture",
        mode: "document",
        overlayShape: "rectangle",
        overlayAspect: "1.586",
        overlayHint:
          "Please ensure your e-KTP details are visible in the frame",
        binding: { path: "ektpImage", scope: "journeyState" },
        // sdui.on-complete wraps a single sdui.action
        onComplete: {
          action: {
            key: "ektp-captured",
            type: "api_call",
            payload: {
              service: "ocr-service",
              operation: "extractKtp",
              actionId: "ektp-captured",
            },
          },
        },
      },
    ],
    footer: [],
  },

  // -------------------------------------------------------------------------
  // Step 3c — e-KTP Review
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EKTP_REVIEW",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Your e-KTP details",
      showBack: true,
      showClose: true,
    },
    header: [
      {
        __component: "ui.image-preview",
        // sdui.source: path + scope
        source: { path: "ektpImage", scope: "journeyState" },
      },
    ],
    body: [
      {
        __component: "ui.text-input",
        label: "e-KTP number",
        placeholder: "16-digit KTP number",
        keyboard: "number-pad",
        binding: { path: "ektpNumber", scope: "journeyState" },
        validation: [
          { rule: "required", message: "e-KTP number is required" },
          {
            rule: "pattern",
            value: "^[0-9]{16}$",
            message: "Must be exactly 16 digits",
          },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Full name",
        placeholder: "Full name as on e-KTP",
        binding: { path: "fullName", scope: "journeyState" },
        validation: [{ rule: "required", message: "Full name is required" }],
      },
      {
        __component: "ui.text-input",
        label: "Place of birth",
        placeholder: "Place of birth",
        binding: { path: "placeOfBirth", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Place of birth is required" },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Date of birth",
        placeholder: "DD MM YYYY",
        binding: { path: "dateOfBirth", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Date of birth is required" },
        ],
      },
      {
        __component: "ui.dropdown",
        label: "Gender",
        // ui.dropdown.options is required — pass static options or empty array for dynamic
        options: [
          { key: "male", label: "Male" },
          { key: "female", label: "Female" },
        ],
        binding: { path: "gender", scope: "journeyState" },
        validation: [{ rule: "required", message: "Gender is required" }],
      },
      {
        __component: "ui.dropdown",
        label: "Religion",
        options: [
          { key: "islam", label: "Islam" },
          { key: "christian", label: "Christian" },
          { key: "catholic", label: "Catholic" },
          { key: "hindu", label: "Hindu" },
          { key: "buddhist", label: "Buddhist" },
          { key: "confucian", label: "Confucian" },
          { key: "other", label: "Other" },
        ],
        binding: { path: "religion", scope: "journeyState" },
      },
      {
        __component: "ui.dropdown",
        label: "Marital status",
        options: [
          { key: "single", label: "Single" },
          { key: "married", label: "Married" },
          { key: "divorced", label: "Divorced" },
          { key: "widowed", label: "Widowed" },
        ],
        binding: { path: "maritalStatus", scope: "journeyState" },
      },
      {
        __component: "ui.text-input",
        label: "Address",
        placeholder: "Street address",
        binding: { path: "address", scope: "journeyState" },
        validation: [{ rule: "required", message: "Address is required" }],
      },
      {
        __component: "ui.text-input",
        label: "RT",
        placeholder: "000",
        binding: { path: "rt", scope: "journeyState" },
        rowGroup: "rt-rw",
      },
      {
        __component: "ui.text-input",
        label: "RW",
        placeholder: "000",
        binding: { path: "rw", scope: "journeyState" },
        rowGroup: "rt-rw",
      },
      {
        __component: "ui.cascading-select",
        // tiers is required — each tier needs key, dataSource (with mapping), and binding
        tiers: [
          {
            key: "province",
            label: "Province",
            placeholder: "Select province",
            dataSource: { endpoint: "/api/lookup/provinces", method: "GET", mapping: { key: "code", label: "name" } },
            binding: { path: "province", scope: "journeyState" },
          },
          {
            key: "city",
            label: "City / Regency",
            placeholder: "Select city",
            dependsOn: "province",
            dataSource: { endpoint: "/api/lookup/cities", method: "GET", params: { provinceCode: "{{province}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "city", scope: "journeyState" },
          },
          {
            key: "district",
            label: "District",
            placeholder: "Select district",
            dependsOn: "city",
            dataSource: { endpoint: "/api/lookup/districts", method: "GET", params: { cityCode: "{{city}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "district", scope: "journeyState" },
          },
          {
            key: "subDistrict",
            label: "Sub-district / Village",
            placeholder: "Select sub-district",
            dependsOn: "district",
            dataSource: { endpoint: "/api/lookup/sub-districts", method: "GET", params: { districtCode: "{{district}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "subDistrict", scope: "journeyState" },
          },
        ],
        validation: [{ rule: "required", message: "Province is required" }],
      },
      {
        __component: "ui.text-input",
        label: "Postcode",
        placeholder: "Postcode",
        keyboard: "number-pad",
        binding: { path: "postcode", scope: "journeyState" },
      },
      {
        __component: "ui.dropdown",
        label: "Occupation",
        // Dynamic list — empty for now; populated from backend lookup
        options: [],
        binding: { path: "occupation", scope: "journeyState" },
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "ektp-review-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
      {
        __component: "ui.button",
        label: "Retake",
        variant: "ghost",
        action: {
          key: "retake",
          type: "navigate",
          payload: { direction: "back", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 4 — NPWP Details
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_NPWP_DETAILS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "NPWP details",
      subtitle: "Enter your NPWP information. This is optional.",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.text-input",
        label: "NPWP number",
        placeholder: "Optional",
        keyboard: "number-pad",
        binding: { path: "npwpNumber", scope: "journeyState" },
      },
      {
        __component: "ui.link",
        // ui.link uses "text", not "label"
        text: "Perform NIK – NPWP Matching",
        action: {
          key: "nik-npwp-match",
          type: "api_call",
          payload: { service: "tax-service", operation: "matchNikNpwp" },
        },
      },
      {
        __component: "ui.rich-text",
        text: blocks(
          "In line with the Ministry of Finance Regulation No. 112/2022, resident individual taxpayers (Indonesian citizens and foreign nationals with a valid identity card) use their National Identification Number (NIK) as their Taxpayer Identification Number (NPWP)."
        ),
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "npwp-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 5 — Employment Details
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EMPLOYMENT_DETAILS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Employment details",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.dropdown",
        label: "Occupation",
        options: [
          { key: "expert_admin", label: "Expert Administration" },
          { key: "employee", label: "Employee" },
          { key: "self_employed", label: "Self Employed" },
          { key: "professional", label: "Professional" },
          { key: "entrepreneur", label: "Entrepreneur" },
          { key: "retired", label: "Retired" },
          { key: "student", label: "Student" },
          { key: "housewife", label: "Housewife" },
          { key: "other", label: "Other" },
        ],
        binding: { path: "employmentOccupation", scope: "journeyState" },
        validation: [{ rule: "required", message: "Occupation is required" }],
      },
      {
        __component: "ui.dropdown-async",
        label: "Industry category",
        binding: { path: "employmentIndustry", scope: "journeyState" },
        // sdui.data-source requires endpoint + mapping
        dataSource: {
          endpoint: "/api/lookup/industries",
          method: "GET",
          mapping: { key: "code", label: "name" },
        },
        validation: [
          { rule: "required", message: "Industry category is required" },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Company name",
        placeholder: "Enter company name",
        binding: { path: "employmentCompanyName", scope: "journeyState" },
      },
      {
        __component: "ui.text-input",
        label: "Position / Job title",
        placeholder: "Enter job title",
        binding: { path: "employmentJobTitle", scope: "journeyState" },
      },
      {
        __component: "ui.dropdown",
        label: "Company category",
        options: [
          { key: "1", label: "#1" },
          { key: "2", label: "#2" },
          { key: "3", label: "#3" },
        ],
        binding: { path: "employmentCompanyCategory", scope: "journeyState" },
      },
      {
        __component: "ui.dropdown",
        label: "Employment status",
        options: [
          { key: "permanent", label: "Permanent" },
          { key: "contract", label: "Contract" },
          { key: "part_time", label: "Part Time" },
          { key: "probation", label: "Probation" },
        ],
        binding: { path: "employmentStatus", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Employment status is required" },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Office phone number",
        placeholder: "+62",
        keyboard: "phone",
        binding: { path: "employmentPhone", scope: "journeyState" },
      },
      {
        __component: "ui.text-input",
        label: "Date joined",
        placeholder: "DD MM YYYY",
        binding: { path: "employmentJoinDate", scope: "journeyState" },
      },
      {
        __component: "ui.text-input",
        label: "Office address",
        placeholder: "Street address",
        binding: { path: "employmentOfficeAddress", scope: "journeyState" },
      },
      {
        __component: "ui.cascading-select",
        tiers: [
          {
            key: "employmentProvince",
            label: "Province",
            placeholder: "Select province",
            dataSource: { endpoint: "/api/lookup/provinces", method: "GET", mapping: { key: "code", label: "name" } },
            binding: { path: "employmentProvince", scope: "journeyState" },
          },
          {
            key: "employmentCity",
            label: "City / Regency",
            placeholder: "Select city",
            dependsOn: "employmentProvince",
            dataSource: { endpoint: "/api/lookup/cities", method: "GET", params: { provinceCode: "{{employmentProvince}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "employmentCity", scope: "journeyState" },
          },
          {
            key: "employmentDistrict",
            label: "District",
            placeholder: "Select district",
            dependsOn: "employmentCity",
            dataSource: { endpoint: "/api/lookup/districts", method: "GET", params: { cityCode: "{{employmentCity}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "employmentDistrict", scope: "journeyState" },
          },
          {
            key: "employmentSubDistrict",
            label: "Sub-district / Village",
            placeholder: "Select sub-district",
            dependsOn: "employmentDistrict",
            dataSource: { endpoint: "/api/lookup/sub-districts", method: "GET", params: { districtCode: "{{employmentDistrict}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "employmentSubDistrict", scope: "journeyState" },
          },
        ],
      },
      {
        __component: "ui.text-input",
        label: "RT",
        placeholder: "000",
        binding: { path: "employmentRt", scope: "journeyState" },
        rowGroup: "emp-rt-rw",
      },
      {
        __component: "ui.text-input",
        label: "RW",
        placeholder: "000",
        binding: { path: "employmentRw", scope: "journeyState" },
        rowGroup: "emp-rt-rw",
      },
      {
        __component: "ui.text-input",
        label: "Postcode",
        keyboard: "number-pad",
        binding: { path: "employmentPostcode", scope: "journeyState" },
      },
      {
        __component: "ui.checkbox-list",
        label: "Declaration:",
        items: [
          {
            key: "pepDeclaration",
            label:
              "I hereby declare that I have no relationship with any government/state officials, politicians or public figures.",
          },
        ],
        binding: { path: "pepDeclaration", scope: "journeyState" },
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "employment-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 6 — Financial Details
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_FINANCIAL_DETAILS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Financial details",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.dropdown",
        label: "Source of income",
        options: [
          { key: "salary", label: "Salary" },
          { key: "business", label: "Business" },
          { key: "investment", label: "Investment" },
          { key: "pension", label: "Pension" },
          { key: "other", label: "Other" },
        ],
        binding: { path: "sourceOfIncome", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Source of income is required" },
        ],
      },
      {
        __component: "ui.dropdown",
        label: "Number of dependents",
        options: [
          { key: "0", label: "0" },
          { key: "lt100", label: "Less than 100" },
          { key: "gte100", label: "100 or more" },
        ],
        binding: { path: "numberOfDependents", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Number of dependents is required" },
        ],
      },
      {
        __component: "ui.money-input",
        label: "Monthly income",
        currency: "IDR",
        binding: { path: "monthlyIncome", scope: "journeyState" },
        validation: { rule: "required", message: "Monthly income is required" },
      },
      {
        __component: "ui.dropdown",
        label: "Purpose of funds",
        options: [
          { key: "savings", label: "Savings" },
          { key: "investment", label: "Investment" },
          { key: "business", label: "Business" },
          { key: "education", label: "Education" },
          { key: "other", label: "Other" },
        ],
        binding: { path: "purposeOfFunds", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Purpose of funds is required" },
        ],
      },
      {
        __component: "ui.money-input",
        label: "Monthly transaction amount",
        currency: "IDR",
        binding: { path: "monthlyTransactionAmount", scope: "journeyState" },
        validation: {
          rule: "required",
          message: "Monthly transaction amount is required",
        },
      },
      {
        __component: "ui.dropdown",
        label: "Monthly transaction frequency",
        options: [
          { key: "lt10", label: "IDR 0 – 10 Million" },
          { key: "lt20", label: "IDR 10 – 20 Million" },
          { key: "gte20", label: "IDR 20 Million+" },
        ],
        binding: {
          path: "monthlyTransactionFrequency",
          scope: "journeyState",
        },
        validation: [
          {
            rule: "required",
            message: "Monthly transaction frequency is required",
          },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "financial-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 7 — Residential Details
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_RESIDENTIAL_DETAILS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Residential details",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.dropdown",
        label: "Select residential address",
        options: [
          { key: "same_as_ktp", label: "Same as e-KTP address" },
          { key: "other", label: "Other address" },
        ],
        binding: { path: "residentialAddressSource", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Residential address is required" },
        ],
      },
      {
        __component: "ui.text-input",
        label: "Address",
        placeholder: "Street address",
        binding: { path: "residentialAddress", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Residential address is required" },
        ],
      },
      {
        __component: "ui.cascading-select",
        tiers: [
          {
            key: "residentialProvince",
            label: "Province",
            placeholder: "Select province",
            dataSource: { endpoint: "/api/lookup/provinces", method: "GET", mapping: { key: "code", label: "name" } },
            binding: { path: "residentialProvince", scope: "journeyState" },
          },
          {
            key: "residentialCity",
            label: "City / Regency",
            placeholder: "Select city",
            dependsOn: "residentialProvince",
            dataSource: { endpoint: "/api/lookup/cities", method: "GET", params: { provinceCode: "{{residentialProvince}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "residentialCity", scope: "journeyState" },
          },
          {
            key: "residentialDistrict",
            label: "District",
            placeholder: "Select district",
            dependsOn: "residentialCity",
            dataSource: { endpoint: "/api/lookup/districts", method: "GET", params: { cityCode: "{{residentialCity}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "residentialDistrict", scope: "journeyState" },
          },
          {
            key: "residentialSubDistrict",
            label: "Sub-district / Village",
            placeholder: "Select sub-district",
            dependsOn: "residentialDistrict",
            dataSource: { endpoint: "/api/lookup/sub-districts", method: "GET", params: { districtCode: "{{residentialDistrict}}" }, mapping: { key: "code", label: "name" } },
            binding: { path: "residentialSubDistrict", scope: "journeyState" },
          },
        ],
      },
      {
        __component: "ui.dropdown",
        label: "Residential ownership status",
        options: [
          { key: "owner", label: "Owner" },
          { key: "renter", label: "Renter" },
          { key: "family", label: "Family" },
        ],
        binding: { path: "residentialOwnershipStatus", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Ownership status is required" },
        ],
      },
      {
        __component: "ui.dropdown",
        label: "Correspondence address",
        options: [
          { key: "same_as_ktp", label: "Same as e-KTP address" },
          { key: "same_as_residential", label: "Same as residential address" },
          { key: "other", label: "Other address" },
        ],
        binding: {
          path: "correspondenceAddressSource",
          scope: "journeyState",
        },
      },
      {
        __component: "ui.text-input",
        label: "Correspondence address",
        placeholder: "Street address",
        binding: { path: "correspondenceAddress", scope: "journeyState" },
        validation: [
          { rule: "required", message: "Correspondence address is required" },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "residential-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 8a — eKYC Instructions
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EKYC_INSTRUCTIONS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Selfie instructions",
      showBack: true,
      showClose: true,
    },
    body: [
      // ui.icon-text requires media for icon — using ui.text instead
      { __component: "ui.text", text: "• Ensure you are in a well-lit area", variant: "body" },
      { __component: "ui.text", text: "• Remove glasses before taking your selfie", variant: "body" },
      { __component: "ui.text", text: "• Remove hats or head coverings", variant: "body" },
      { __component: "ui.text", text: "• Keep a neutral expression and look directly at the camera", variant: "body" },
      { __component: "ui.text", text: "• Ensure your face is fully within the circle frame", variant: "body" },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Get started",
        variant: "primary",
        action: {
          key: "start-ekyc",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 8b — eKYC Selfie Capture
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_EKYC_SELFIE",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Take your selfie",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.camera-capture",
        mode: "selfie",
        overlayShape: "circle",
        overlayHint: "Turn face left, then right, then smile",
        binding: { path: "selfieImage", scope: "journeyState" },
        onComplete: {
          action: {
            key: "ekyc-complete",
            type: "api_call",
            payload: {
              service: "ekyc-service",
              operation: "verifyLiveness",
              // On success FE resolves actionId "ekyc-complete" → direction "next"
              // On failure FE resolves actionId "ekyc-failed" → direction "jump" to EKYC_INSTRUCTIONS
              // Both actionIds are declared in step.onSubmit[]
            },
          },
        },
      },
    ],
    footer: [],
  },

  // -------------------------------------------------------------------------
  // Step 9 — Statement of Consent
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_STATEMENT_OF_CONSENT",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Statement of Consent",
      subtitle:
        "By continuing, you are providing all information and documents.",
      showBack: true,
      showClose: true,
    },
    body: [
      {
        __component: "ui.section-label",
        title: "BPAT Product Terms & Conditions",
      },
      {
        __component: "ui.item-list",
        // ui.item-list uses ui.list-item: key + label + onTap (required)
        items: [
          {
            key: "tnc-bpat",
            label: "BPAT Personal Product and Feature Terms & Conditions",
            onTap: {
              key: "review-tnc-bpat",
              type: "open_native",
              payload: { document: "tnc_bpat" },
            },
          },
          {
            key: "tnc-savings",
            label: "Terms & Conditions Savings Account",
            onTap: {
              key: "review-tnc-savings",
              type: "open_native",
              payload: { document: "tnc_savings" },
            },
          },
          {
            key: "tnc-global",
            label: "Terms & Conditions Global Access",
            onTap: {
              key: "review-tnc-global",
              type: "open_native",
              payload: { document: "tnc_global" },
            },
          },
          {
            key: "tnc-mae",
            label: "Terms & Conditions MAE",
            onTap: {
              key: "review-tnc-mae",
              type: "open_native",
              payload: { document: "tnc_mae" },
            },
          },
        ],
      },
      {
        __component: "ui.section-label",
        title: "Pernyataan Verified Data (Data Verification Statement)",
      },
      {
        __component: "ui.rich-text",
        text: blocks(
          "I hereby declare that the information I have provided is accurate and complete, and I consent to Maybank processing my data in accordance with the Privacy Policy."
        ),
      },
      {
        __component: "ui.section-label",
        title: "Other Bank Product Offers (Optional)",
      },
      {
        __component: "ui.rich-text",
        text: blocks(
          "By ticking the box below, I declare that I agree to receive information on other Maybank products and services."
        ),
      },
      {
        __component: "ui.checkbox-list",
        label: "I agree & consent",
        items: [
          {
            key: "termsConsent",
            label:
              "I have read, understood, and agree to the Terms & Conditions and consent to Maybank processing my personal data.",
          },
        ],
        binding: { path: "termsAccepted", scope: "journeyState" },
        validation: [
          {
            rule: "required",
            message: "You must agree to the terms to continue",
          },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Next",
        variant: "primary",
        action: {
          key: "consent-next",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Step 10 — Confirmation
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_CONFIRMATION",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Confirmation",
      subtitle: "Apply for",
      showBack: true,
      showClose: true,
    },
    header: [
      {
        __component: "ui.section-label",
        title: "Global Access Account — Savings Account",
      },
    ],
    body: [
      {
        __component: "ui.review-card",
        label: "Account info",
        // ui.review-card.rows uses ui.kv-row: { label, value?, source? }
        rows: [
          { label: "Mobile number", source: { path: "mobileNumber", scope: "journeyState" } },
          { label: "Email address", source: { path: "emailAddress", scope: "journeyState" } },
        ],
      },
      {
        __component: "ui.review-card",
        label: "e-KTP details",
        rows: [
          { label: "e-KTP number", source: { path: "ektpNumber", scope: "journeyState" } },
          { label: "Full name", source: { path: "fullName", scope: "journeyState" } },
          { label: "Date of birth", source: { path: "dateOfBirth", scope: "journeyState" } },
          { label: "Place of birth", source: { path: "placeOfBirth", scope: "journeyState" } },
          { label: "Gender", source: { path: "gender", scope: "journeyState" } },
          { label: "Religion", source: { path: "religion", scope: "journeyState" } },
          { label: "Marital status", source: { path: "maritalStatus", scope: "journeyState" } },
          { label: "Occupation", source: { path: "occupation", scope: "journeyState" } },
          { label: "Address", source: { path: "address", scope: "journeyState" } },
          { label: "Province", source: { path: "province", scope: "journeyState" } },
          { label: "RT / RW", source: { path: "rt", scope: "journeyState" } },
          { label: "Postcode", source: { path: "postcode", scope: "journeyState" } },
        ],
      },
      {
        __component: "ui.review-card",
        label: "NPWP details",
        rows: [
          { label: "NPWP number", source: { path: "npwpNumber", scope: "journeyState" } },
        ],
      },
      {
        __component: "ui.review-card",
        label: "Employment details",
        rows: [
          { label: "Occupation", source: { path: "employmentOccupation", scope: "journeyState" } },
          { label: "Industry", source: { path: "employmentIndustry", scope: "journeyState" } },
          { label: "Company", source: { path: "employmentCompanyName", scope: "journeyState" } },
          { label: "Job title", source: { path: "employmentJobTitle", scope: "journeyState" } },
          { label: "Status", source: { path: "employmentStatus", scope: "journeyState" } },
          { label: "Join date", source: { path: "employmentJoinDate", scope: "journeyState" } },
          { label: "Office address", source: { path: "employmentOfficeAddress", scope: "journeyState" } },
        ],
      },
      {
        __component: "ui.review-card",
        label: "Financial details",
        rows: [
          { label: "Source of income", source: { path: "sourceOfIncome", scope: "journeyState" } },
          { label: "Dependents", source: { path: "numberOfDependents", scope: "journeyState" } },
          { label: "Monthly income", source: { path: "monthlyIncome", scope: "journeyState", format: "currency", currency: "IDR" } },
          { label: "Purpose of funds", source: { path: "purposeOfFunds", scope: "journeyState" } },
          { label: "Transaction amount", source: { path: "monthlyTransactionAmount", scope: "journeyState", format: "currency", currency: "IDR" } },
          { label: "Transaction frequency", source: { path: "monthlyTransactionFrequency", scope: "journeyState" } },
        ],
      },
      {
        __component: "ui.review-card",
        label: "Residential details",
        rows: [
          { label: "Residential address", source: { path: "residentialAddress", scope: "journeyState" } },
          { label: "Ownership status", source: { path: "residentialOwnershipStatus", scope: "journeyState" } },
          { label: "Correspondence address", source: { path: "correspondenceAddress", scope: "journeyState" } },
        ],
      },
    ],
    footer: [
      {
        __component: "ui.slide-to-confirm",
        label: "Slide to confirm",
        action: {
          key: "submit",
          type: "navigate",
          payload: { direction: "next", navigation_type: "push" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Success Screen
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_SUCCESS",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Application successful",
      showBack: false,
      showClose: false,
    },
    body: [
      // ui.hero requires a media upload for illustration — using ui.banner instead
      {
        __component: "ui.banner",
        text: "Your Global Access Account application has been submitted successfully.",
        variant: "success",
      },
    ],
    footer: [],
  },

  // -------------------------------------------------------------------------
  // Ineligible Screen
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_INELIGIBLE",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "We're sorry",
      showBack: false,
      showClose: true,
    },
    body: [
      {
        __component: "ui.banner",
        text: "Unfortunately you do not meet the criteria for this product. Please contact our support team for more information.",
        variant: "error",
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Back to home",
        variant: "primary",
        action: {
          key: "back-home",
          type: "navigate",
          payload: { direction: "finish", navigation_type: "reset" },
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Submit Failed Screen
  // -------------------------------------------------------------------------
  {
    screenId: "ACCT_CA_SUBMIT_FAILED",
    api_version: "v1",
    content_version: 1,
    meta: {
      title: "Something went wrong",
      showBack: false,
      showClose: true,
    },
    body: [
      {
        __component: "ui.banner",
        text: "We couldn't submit your application. If the problem persists, please contact support.",
        variant: "warning",
      },
    ],
    footer: [
      {
        __component: "ui.button",
        label: "Try again",
        variant: "primary",
        action: {
          key: "retry",
          type: "navigate",
          payload: { direction: "back", navigation_type: "push" },
        },
      },
      {
        __component: "ui.button",
        label: "Back to home",
        variant: "secondary",
        action: {
          key: "back-home",
          type: "navigate",
          payload: { direction: "finish", navigation_type: "reset" },
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Journey definition
// ---------------------------------------------------------------------------

function buildJourneyData(screenDocIds: Record<string, string>) {
  const s = screenDocIds;

  return {
    journeyId: "ACCT_CA_APPLY",
    name: "Apply Current Account",
    slug: "apply-ca",
    description: "Multi-step journey to open a Global Access Current Account",
    schemaVersion: "1.0",
    bundleVersion: "2026.03.01-001",
    productType: "ACCOUNTS",
    segment: "ETB",
    owner: "Accounts Business Team",
    idempotencyRequired: true,
    checkpointEnabled: true,
    maxRetry: 3,
    async: false,
    presentation: "fullScreenModal",
    navigator: "CurrentAccountJourneyNavigator",
    preInitiateScreen: "ACCT_CA_MOBILE_NUMBER",
    api_version: "v1",
    content_version: 1,
    initialState: {
      mobileNumber: null,
      mobileConsent: false,
      emailAddress: null,
      ektpImage: null,
      ektpNumber: null,
      fullName: null,
      dateOfBirth: null,
      placeOfBirth: null,
      religion: null,
      maritalStatus: null,
      occupation: null,
      address: null,
      province: null,
      city: null,
      district: null,
      subDistrict: null,
      rt: null,
      rw: null,
      postcode: null,
      npwpNumber: null,
      employmentOccupation: null,
      employmentIndustry: null,
      employmentCompanyName: null,
      employmentJobTitle: null,
      employmentCompanyCategory: null,
      employmentStatus: null,
      employmentPhone: null,
      employmentJoinDate: null,
      employmentOfficeAddress: null,
      employmentProvince: null,
      employmentCity: null,
      employmentDistrict: null,
      employmentSubDistrict: null,
      employmentRt: null,
      employmentRw: null,
      employmentPostcode: null,
      sourceOfIncome: null,
      numberOfDependents: null,
      monthlyIncome: null,
      purposeOfFunds: null,
      monthlyTransactionAmount: null,
      monthlyTransactionFrequency: null,
      residentialAddress: null,
      residentialOwnershipStatus: null,
      correspondenceAddress: null,
      selfieImage: null,
      termsAccepted: false,
      consentDocumentsDownloaded: false,
    },
    steps: [
      // ── System: eligibility check (runs before first screen) ────────────
      // onSuccess.direction "next" → advances to next screen in journey.screens[]
      // onFailure.direction "jump" + target → finds ACCT_CA_INELIGIBLE by screenId
      {
        type: "system",
        stepCode: "ELIGIBILITY_CHECK",
        service: "product-capabilities",
        operation: "checkEligibility",
        onSuccess: { direction: "next" },
        onFailure: { direction: "jump", target: "ACCT_CA_INELIGIBLE" },
        maxRetry: 3,
      },

      // ── User steps: onSubmit is an array resolved by actionId ────────────
      // FE: currentStep.onSubmit.find(a => a.actionId === action.actionId)
      // direction "next"  → currentIndex + 1 in journey.screens[]
      // direction "back"  → currentIndex - 1  (same as goBack)
      // direction "jump"  → find by target screenId in journey.screens[]
      // direction "finish"→ clearSession + navigation.reset to preStartScreen

      { type: "user", stepCode: "MOBILE_NUMBER",
        screen: s["ACCT_CA_MOBILE_NUMBER"],
        onSubmit: [{ actionId: "mobile-number-next", direction: "next" }],
      },
      { type: "user", stepCode: "EMAIL_REGISTRATION",
        screen: s["ACCT_CA_EMAIL_REGISTRATION"],
        onSubmit: [{ actionId: "email-next", direction: "next" }],
      },
      { type: "user", stepCode: "EKTP_INSTRUCTIONS",
        screen: s["ACCT_CA_EKTP_INSTRUCTIONS"],
        onSubmit: [{ actionId: "start-ektp", direction: "next" }],
      },
      { type: "user", stepCode: "EKTP_CAPTURE",
        screen: s["ACCT_CA_EKTP_CAPTURE"],
        onSubmit: [{ actionId: "ektp-captured", direction: "next" }],
      },
      // EKTP_REVIEW has two exits: Next (forward) and Retake (back to camera)
      { type: "user", stepCode: "EKTP_REVIEW",
        screen: s["ACCT_CA_EKTP_REVIEW"],
        onSubmit: [
          { actionId: "ektp-review-next", direction: "next" },
          { actionId: "retake",           direction: "back" },
        ],
      },
      { type: "user", stepCode: "NPWP_DETAILS",
        screen: s["ACCT_CA_NPWP_DETAILS"],
        onSubmit: [{ actionId: "npwp-next", direction: "next" }],
      },
      { type: "user", stepCode: "EMPLOYMENT_DETAILS",
        screen: s["ACCT_CA_EMPLOYMENT_DETAILS"],
        onSubmit: [{ actionId: "employment-next", direction: "next" }],
      },
      { type: "user", stepCode: "FINANCIAL_DETAILS",
        screen: s["ACCT_CA_FINANCIAL_DETAILS"],
        onSubmit: [{ actionId: "financial-next", direction: "next" }],
      },
      { type: "user", stepCode: "RESIDENTIAL_DETAILS",
        screen: s["ACCT_CA_RESIDENTIAL_DETAILS"],
        onSubmit: [{ actionId: "residential-next", direction: "next" }],
      },
      { type: "user", stepCode: "EKYC_INSTRUCTIONS",
        screen: s["ACCT_CA_EKYC_INSTRUCTIONS"],
        onSubmit: [{ actionId: "start-ekyc", direction: "next" }],
      },
      // EKYC_SELFIE: camera fires api_call; on FE result, actionId routes here
      { type: "user", stepCode: "EKYC_SELFIE",
        screen: s["ACCT_CA_EKYC_SELFIE"],
        onSubmit: [
          { actionId: "ekyc-complete", direction: "next" },
          { actionId: "ekyc-failed",   direction: "jump", target: "ACCT_CA_EKYC_INSTRUCTIONS" },
        ],
      },
      { type: "user", stepCode: "STATEMENT_OF_CONSENT",
        screen: s["ACCT_CA_STATEMENT_OF_CONSENT"],
        onSubmit: [{ actionId: "consent-next", direction: "next" }],
      },
      // CONFIRMATION: slide-to-confirm triggers "submit" → next screen is the
      // system step's associated screen (FINAL_SUBMISSION runs automatically)
      { type: "user", stepCode: "CONFIRMATION",
        screen: s["ACCT_CA_CONFIRMATION"],
        onSubmit: [{ actionId: "submit", direction: "next" }],
      },

      // ── System: final submission ─────────────────────────────────────────
      // jump to terminal screens by screenId so order in screens[] doesn't matter
      {
        type: "system",
        stepCode: "FINAL_SUBMISSION",
        service: "stp-core",
        operation: "submitJourney",
        onSuccess: { direction: "jump", target: "ACCT_CA_SUCCESS" },
        onFailure: { direction: "jump", target: "ACCT_CA_SUBMIT_FAILED" },
        maxRetry: 3,
      },

      // ── Terminal screens (no onSubmit — journey ends here) ───────────────
      { type: "user", stepCode: "SUCCESS_SCREEN",    screen: s["ACCT_CA_SUCCESS"] },
      { type: "user", stepCode: "INELIGIBLE_SCREEN", screen: s["ACCT_CA_INELIGIBLE"] },
      { type: "user", stepCode: "SUBMIT_FAILED",     screen: s["ACCT_CA_SUBMIT_FAILED"] },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

export async function seedApplyCa(strapi: StrapiInstance) {
  console.log("[seed] Starting apply-ca seed...");

  // 1. Create all screens and collect their documentIds
  const screenDocIds: Record<string, string> = {};

  for (const screenData of screens) {
    const doc = await createAndPublishScreen(strapi, screenData as Record<string, unknown>);
    screenDocIds[screenData.screenId] = doc.documentId;
  }

  // 2. Check if journey already exists
  const existingJourney = await findJourney(strapi, "ACCT_CA_APPLY");
  if (existingJourney) {
    console.log("[seed] Journey already exists — skipping: ACCT_CA_APPLY");
    console.log("[seed] Done.");
    return;
  }

  // 3. Build journey with screen relations (Strapi v5: relation via documentId)
  const base = buildJourneyData(screenDocIds);
  const stepsWithRelations = base.steps.map((step) => {
    if ("screen" in step && step.screen) {
      return { ...step, screen: { documentId: step.screen } };
    }
    return step;
  });

  const journeyData = { ...base, steps: stepsWithRelations };

  // 4. Create & publish journey
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const journey = await strapi
    .documents("api::journey.journey")
    .create({ data: journeyData as any });

  await strapi
    .documents("api::journey.journey")
    .publish({ documentId: journey.documentId });

  console.log(`[seed] ✓ Journey created & published: ACCT_CA_APPLY`);
  console.log("[seed] Done.");
}

// ---------------------------------------------------------------------------
// Update journey — resolves all screen documentIds from DB and patches the
// existing ACCT_CA_APPLY journey's steps + screens relation.
//
// Usage:
//   UPDATE_JOURNEY=apply-ca npm run develop
// ---------------------------------------------------------------------------

const SCREEN_IDS = [
  "ACCT_CA_MOBILE_NUMBER",
  "ACCT_CA_EMAIL_REGISTRATION",
  "ACCT_CA_EKTP_INSTRUCTIONS",
  "ACCT_CA_EKTP_CAPTURE",
  "ACCT_CA_EKTP_REVIEW",
  "ACCT_CA_NPWP_DETAILS",
  "ACCT_CA_EMPLOYMENT_DETAILS",
  "ACCT_CA_FINANCIAL_DETAILS",
  "ACCT_CA_RESIDENTIAL_DETAILS",
  "ACCT_CA_EKYC_INSTRUCTIONS",
  "ACCT_CA_EKYC_SELFIE",
  "ACCT_CA_STATEMENT_OF_CONSENT",
  "ACCT_CA_CONFIRMATION",
  "ACCT_CA_SUCCESS",
  "ACCT_CA_INELIGIBLE",
  "ACCT_CA_SUBMIT_FAILED",
];

export async function updateApplyCaJourney(strapi: StrapiInstance) {
  console.log("[update] Resolving screen documentIds from database...");

  // 1. Look up every screen by screenId and collect documentId
  const screenDocIds: Record<string, string> = {};
  const missing: string[] = [];

  for (const screenId of SCREEN_IDS) {
    const screen = await findScreen(strapi, screenId);
    if (screen) {
      screenDocIds[screenId] = screen.documentId;
      console.log(`[update]   ✓ ${screenId} → ${screen.documentId}`);
    } else {
      missing.push(screenId);
      console.warn(`[update]   ✗ NOT FOUND: ${screenId}`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[update] Aborting — ${missing.length} screen(s) missing. Run SEED_DATA=apply-ca first.`
    );
    return;
  }

  // 2. Find the journey
  const journey = await findJourney(strapi, "ACCT_CA_APPLY");
  if (!journey) {
    console.error("[update] Journey ACCT_CA_APPLY not found. Run SEED_DATA=apply-ca first.");
    return;
  }
  console.log(`[update] Found journey: ${journey.documentId}`);

  // 3. Build steps with screen relations
  const base = buildJourneyData(screenDocIds);
  const steps = base.steps.map((step) => {
    if ("screen" in step && step.screen) {
      return { ...step, screen: { documentId: step.screen } };
    }
    return step;
  });

  // 4. Also build the screens[] relation (oneToMany on Journey)
  const screensRelation = SCREEN_IDS.filter((id) => screenDocIds[id]).map(
    (id) => ({ documentId: screenDocIds[id] })
  );

  // 5. Update the journey draft
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await strapi.documents("api::journey.journey").update({
    documentId: journey.documentId,
    data: {
      steps,
      screens: screensRelation,
    } as any,
  });

  console.log("[update] ✓ Journey draft updated with steps + screen relations.");

  // 6. Republish — bump content_version to pass the version guard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await strapi.documents("api::journey.journey").update({
    documentId: journey.documentId,
    data: { content_version: (journey.content_version ?? 1) + 1 } as any,
  });

  await strapi
    .documents("api::journey.journey")
    .publish({ documentId: journey.documentId });

  console.log("[update] ✓ Journey republished: ACCT_CA_APPLY");
  console.log("[update] Done.");
}
