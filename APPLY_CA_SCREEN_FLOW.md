# Apply Current Account — Screen Flow (Steps 1–10)

> End-to-end walkthrough of every user-facing screen in the `apply-ca` journey, mapped to screen IDs, step codes, UI components, and state bindings.
> Reference images: `docs/apply-ca-1.png` → `docs/apply-ca-10.png`
>
> **Naming convention:** Screen IDs follow `{DOMAIN}_{MODULE}_{SCREEN}` in `SCREAMING_SNAKE_CASE`.
> All screens in this journey use the `ACCT_CA_` prefix.

---

## Journey Overview

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Journey ID**     | `ACCT_CA_APPLY`                                |
| **Slug**           | `apply-ca`                                     |
| **Product Type**   | `ACCOUNTS`                                     |
| **Segment**        | `ETB`                                          |
| **Schema Version** | `1.0`                                          |
| **Bundle Version** | `2026.03.01-001`                               |
| **Presentation**   | `fullScreenModal`                              |

### High-Level Flow

```
[ELIGIBILITY_CHECK] ──fail──▶ [ACCT_CA_INELIGIBLE]
        │
       pass
        ▼
[1. ACCT_CA_MOBILE_NUMBER]
        ▼
[2. ACCT_CA_EMAIL_REGISTRATION]
        ▼
[3a. ACCT_CA_EKTP_INSTRUCTIONS]
        ▼
[3b. ACCT_CA_EKTP_CAPTURE]
        ▼
[3c. ACCT_CA_EKTP_REVIEW]
        ▼
[4. ACCT_CA_NPWP_DETAILS]
        ▼
[5. ACCT_CA_EMPLOYMENT_DETAILS]
        ▼
[6. ACCT_CA_FINANCIAL_DETAILS]
        ▼
[7. ACCT_CA_RESIDENTIAL_DETAILS]
        ▼
[8a. ACCT_CA_EKYC_INSTRUCTIONS]
        ▼
[8b. ACCT_CA_EKYC_SELFIE]
        ▼
[9. ACCT_CA_STATEMENT_OF_CONSENT]
        ▼
[10. ACCT_CA_CONFIRMATION] ──▶ [FINAL_SUBMISSION]
                                       │
                            success ───┤──── fail ──▶ [ACCT_CA_SUBMIT_FAILED]
                                       ▼
                               [ACCT_CA_SUCCESS]
```

### Journey State Contract

```json
{
  "mobileNumber": null,
  "mobileConsent": false,
  "emailAddress": null,
  "ektpImage": null,
  "ektpNumber": null,
  "fullName": null,
  "dateOfBirth": null,
  "placeOfBirth": null,
  "religion": null,
  "maritalStatus": null,
  "occupation": null,
  "address": null,
  "province": null,
  "city": null,
  "district": null,
  "subDistrict": null,
  "rt": null,
  "rw": null,
  "postcode": null,
  "npwpNumber": null,
  "employmentOccupation": null,
  "employmentIndustry": null,
  "employmentCompanyName": null,
  "employmentJobTitle": null,
  "employmentCompanyCategory": null,
  "employmentStatus": null,
  "employmentPhone": null,
  "employmentJoinDate": null,
  "employmentOfficeAddress": null,
  "employmentProvince": null,
  "employmentCity": null,
  "employmentDistrict": null,
  "employmentSubDistrict": null,
  "employmentRt": null,
  "employmentRw": null,
  "employmentPostcode": null,
  "sourceOfIncome": null,
  "numberOfDependents": null,
  "monthlyIncome": null,
  "purposeOfFunds": null,
  "monthlyTransactionAmount": null,
  "monthlyTransactionFrequency": null,
  "residentialAddress": null,
  "residentialOwnershipStatus": null,
  "correspondenceAddress": null,
  "selfieImage": null,
  "termsAccepted": false,
  "consentDocumentsDownloaded": false
}
```

---

## Step 1 — Mobile Number

> **Image:** `docs/apply-ca-1.png`

### What the user sees

The user is asked to enter their mobile number before anything else. A disclaimer explains how Maybank will use the number (security TACs, ATM card activation, SMS TAC, app registration). A consent checkbox must be ticked before proceeding.

### Screen configuration

| Field       | Value                        |
| ----------- | ---------------------------- |
| **Screen ID** | `ACCT_CA_MOBILE_NUMBER`    |
| **Slug**    | `apply-ca.mobile-number`     |
| **Step Code** | `MOBILE_NUMBER`            |
| Step Type   | User                         |
| On Submit   | `{ "nextStep": "EMAIL_REGISTRATION" }` |

**Meta**

| Field       | Value                       |
| ----------- | --------------------------- |
| Title       | `Enter your mobile number`  |
| Subtitle    | `Global Access Account`     |
| Show Back   | `false`                     |
| Show Close  | `true`                      |
| Progress    | Step 1 of 9                 |

**Body components**

| Component          | Config                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `ui.text-input`    | Label: `Mobile number` · Placeholder: `Enter mobile number` · Keyboard: `phone-pad` · Prefix: `+62` · Binding: `mobileNumber` / `journeyState` |
| `ui.rich-text`     | **Disclaimer** block — Maybank data usage statement                                            |
| `ui.checkbox-list` | Label: `I hereby declare:` · Option: `I have read and understood the above use of my mobile number. I agree to provide my mobile number and consent to it being used for these purposes.` · Binding: `mobileConsent` / `journeyState` |

**Validation**

| Field           | Rule       | Message                                               |
| --------------- | ---------- | ----------------------------------------------------- |
| `mobileNumber`  | `required` | Mobile number is required                             |
| `mobileNumber`  | `pattern`  | `^[0-9]{8,13}$` — Enter a valid Indonesian mobile number |
| `mobileConsent` | `required` | You must agree to continue                            |

**Footer**

| Component   | Label  | Action                                                                  |
| ----------- | ------ | ----------------------------------------------------------------------- |
| `ui.button` | `Next` | `type: navigate` · `payload: { "nextStep": "EMAIL_REGISTRATION" }` |

---

## Step 2 — Email Registration

> **Image:** `docs/apply-ca-2.png`

### What the user sees

The user fills in their email address (entered twice to confirm), or continues using their Google or Apple account via SSO. The progress bar advances to step 2.

### Screen configuration

| Field         | Value                           |
| ------------- | ------------------------------- |
| **Screen ID** | `ACCT_CA_EMAIL_REGISTRATION`    |
| **Slug**      | `apply-ca.email-registration`   |
| **Step Code** | `EMAIL_REGISTRATION`            |
| Step Type     | User                            |
| On Submit     | `{ "nextStep": "EKTP_INSTRUCTIONS" }` |

**Meta**

| Field      | Value                         |
| ---------- | ----------------------------- |
| Title      | `Your email address`          |
| Subtitle   | `Fill in your email address`  |
| Show Back  | `true`                        |
| Show Close | `true`                        |
| Progress   | Step 2 of 9                   |

**Body components**

| Component       | Config                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| `ui.text-input` | Label: `Email address` · Placeholder: `Enter email address` · Keyboard: `email-address` · Binding: `emailAddress` / `journeyState` |
| `ui.text-input` | Label: `Confirm email address` · Placeholder: `Re-enter email address` · Keyboard: `email-address` · Binding: `emailAddressConfirm` / `journeyState` |

**Validation**

| Field                 | Rule       | Message                                              |
| --------------------- | ---------- | ---------------------------------------------------- |
| `emailAddress`        | `required` | Email address is required                            |
| `emailAddress`        | `pattern`  | `^[^\s@]+@[^\s@]+\.[^\s@]+$` — Enter a valid email  |
| `emailAddressConfirm` | `match`    | `emailAddress` — Email addresses do not match        |

**Footer**

| Component   | Label                  | Action / Notes                                          |
| ----------- | ---------------------- | ------------------------------------------------------- |
| `ui.button` | `Next`                 | `type: navigate` · `payload: { "nextStep": "EKTP_INSTRUCTIONS" }` |
| `ui.button` | `Continue with Google` | `type: api_call` · SSO trigger                          |
| `ui.button` | `Continue with Apple`  | `type: api_call` · SSO trigger                          |

---

## Step 3 — e-KTP Capture & Review

> **Image:** `docs/apply-ca-3.png`

### What the user sees

This step spans three sub-screens:

1. **Instructions** — explains what an e-KTP is, shows a sample image, and lists photo requirements (face visible, all 4 corners in frame, no flash glare, no image alterations).
2. **Camera capture** — opens the device camera with a rectangular overlay. The user holds their KTP inside the frame and taps the shutter.
3. **Review / Details form** — the captured image is shown at the top. OCR pre-fills KTP fields (ID number, full name, date/place of birth, gender, blood type, address, religion, marital status, occupation, nationality). The user reviews and edits any field before submitting.

---

### 3a — e-KTP Instructions

| Field         | Value                          |
| ------------- | ------------------------------ |
| **Screen ID** | `ACCT_CA_EKTP_INSTRUCTIONS`    |
| **Slug**      | `apply-ca.ektp-instructions`   |
| **Step Code** | `EKTP_INSTRUCTIONS`            |
| Step Type     | User                           |
| On Submit     | `{ "nextStep": "EKTP_CAPTURE" }` |

**Meta:** Title: `e-KTP photo conditions` · Show Back: `true` · Progress: Step 3 of 9

**Body components**

| Component          | Config                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| `ui.section-label` | `e-KTP photo conditions`                                                  |
| `ui.icon-text`     | Icon: camera · Text: `Ensure your face is clearly visible`                |
| `ui.icon-text`     | Icon: id-card · Text: `Capture a clear photo of your e-KTP so the system can identify your identity` |
| `ui.icon-text`     | Icon: check · Text: `Ensure all text on the e-KTP is clearly readable`    |
| `ui.image-preview` | Static sample e-KTP illustration (from Media Library)                     |

**Footer:** `ui.button` — Label: `Get started` → `nextStep: EKTP_CAPTURE`

---

### 3b — e-KTP Capture

| Field         | Value                    |
| ------------- | ------------------------ |
| **Screen ID** | `ACCT_CA_EKTP_CAPTURE`   |
| **Slug**      | `apply-ca.ektp-capture`  |
| **Step Code** | `EKTP_CAPTURE`           |
| Step Type     | User                     |

**Body components**

| Component           | Config                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| `ui.camera-capture` | Mode: `document` · Overlay shape: `rectangle` · Aspect ratio: `1.586` · Hint: `Please ensure your e-KTP details are visible in the frame` · Binding: `ektpImage` / `journeyState` |

**On Complete:** `type: api_call` → OCR service → pre-fill KTP fields in state → `nextStep: EKTP_REVIEW`

---

### 3c — e-KTP Review

| Field         | Value                    |
| ------------- | ------------------------ |
| **Screen ID** | `ACCT_CA_EKTP_REVIEW`    |
| **Slug**      | `apply-ca.ektp-review`   |
| **Step Code** | `EKTP_REVIEW`            |
| Step Type     | User                     |
| On Submit     | `{ "nextStep": "NPWP_DETAILS" }` |

**Meta:** Title: `Your e-KTP details` · Show Back: `true` · Progress: Step 3 of 9

**Header:** `ui.image-preview` — Source: `ektpImage` / `journeyState`

**Body components (KTP fields)**

| Component             | Label                              | Binding path     |
| --------------------- | ---------------------------------- | ---------------- |
| `ui.text-input`       | `e-KTP number`                     | `ektpNumber`     |
| `ui.text-input`       | `Full name`                        | `fullName`       |
| `ui.text-input`       | `Place of birth`                   | `placeOfBirth`   |
| `ui.text-input`       | `Date of birth`                    | `dateOfBirth`    |
| `ui.dropdown`         | `Gender`                           | `gender`         |
| `ui.dropdown`         | `Religion`                         | `religion`       |
| `ui.dropdown`         | `Marital status`                   | `maritalStatus`  |
| `ui.text-input`       | `Address`                          | `address`        |
| `ui.text-input`       | `Neighbourhood / RT`               | `rt`             |
| `ui.text-input`       | `Community unit / RW`              | `rw`             |
| `ui.cascading-select` | `Province / City / District / Sub-district` | `province`, `city`, `district`, `subDistrict` |
| `ui.text-input`       | `Postcode`                         | `postcode`       |
| `ui.dropdown`         | `Occupation`                       | `occupation`     |

**Footer:** `ui.button` — Label: `Next` → `nextStep: NPWP_DETAILS`
**Retake link:** `ui.link` — Label: `Retake` → `nextStep: EKTP_CAPTURE`

---

## Step 4 — NPWP Details

> **Image:** `docs/apply-ca-4.png`

### What the user sees

The user is asked to enter their NPWP (Indonesian tax ID). The field is **optional** — users without an NPWP can tap Next to skip. A helper link `Perform NIK – NPWP Matching` triggers the backend to auto-look up the NPWP tied to their KTP number. A disclaimer references the Ministry of Finance regulation requiring the NPWP.

### Screen configuration

| Field         | Value                    |
| ------------- | ------------------------ |
| **Screen ID** | `ACCT_CA_NPWP_DETAILS`   |
| **Slug**      | `apply-ca.npwp-details`  |
| **Step Code** | `NPWP_DETAILS`           |
| Step Type     | User                     |
| On Submit     | `{ "nextStep": "EMPLOYMENT_DETAILS" }` |

**Meta**

| Field      | Value                                                   |
| ---------- | ------------------------------------------------------- |
| Title      | `NPWP details`                                          |
| Subtitle   | `Enter your NPWP information. This is optional.`        |
| Show Back  | `true`                                                  |
| Progress   | Step 4 of 9                                             |

**Body components**

| Component       | Config                                                                             |
| --------------- | ---------------------------------------------------------------------------------- |
| `ui.text-input` | Label: `NPWP number` · Placeholder: `Optional` · Keyboard: `numeric` · Binding: `npwpNumber` / `journeyState` |
| `ui.link`       | Label: `Perform NIK – NPWP Matching ›` · Action: `type: api_call` · Service: `tax-service` · Operation: `matchNikNpwp` |
| `ui.rich-text`  | Disclaimer — Ministry of Finance regulation No. 112/2022 reference                |

**Validation** — none required (optional field)

**Footer:** `ui.button` — Label: `Next` → `nextStep: EMPLOYMENT_DETAILS`

---

## Step 5 — Employment Details

> **Image:** `docs/apply-ca-5.png`

### What the user sees

The user fills in their employment information. The occupation dropdown is shown first with a PEP (Politically Exposed Person) disclaimer pre-checked. Once an industry is selected, additional fields cascade in: company name, job title, company category, employment status, office phone, join date, and full office address (including province, city, district, sub-district, RT/RW, and postcode).

### Screen configuration

| Field         | Value                          |
| ------------- | ------------------------------ |
| **Screen ID** | `ACCT_CA_EMPLOYMENT_DETAILS`   |
| **Slug**      | `apply-ca.employment-details`  |
| **Step Code** | `EMPLOYMENT_DETAILS`           |
| Step Type     | User                           |
| On Submit     | `{ "nextStep": "FINANCIAL_DETAILS" }` |

**Meta**

| Field      | Value                  |
| ---------- | ---------------------- |
| Title      | `Employment details`   |
| Show Back  | `true`                 |
| Progress   | Step 5 of 9            |

**Body components**

| Component             | Label                       | Binding path                 |
| --------------------- | --------------------------- | ---------------------------- |
| `ui.dropdown`         | `Occupation`                | `employmentOccupation`       |
| `ui.dropdown-async`   | `Industry category`         | `employmentIndustry`         |
| `ui.text-input`       | `Company name`              | `employmentCompanyName`      |
| `ui.text-input`       | `Position/Job title`        | `employmentJobTitle`         |
| `ui.dropdown`         | `Company category`          | `employmentCompanyCategory`  |
| `ui.dropdown`         | `Employment status`         | `employmentStatus`           |
| `ui.text-input`       | `Office phone number`       | `employmentPhone`            |
| `ui.text-input`       | `Date joined`               | `employmentJoinDate`         |
| `ui.text-input`       | `Office address`            | `employmentOfficeAddress`    |
| `ui.cascading-select` | `Province / City / District / Sub-district` | `employmentProvince`, `employmentCity`, `employmentDistrict`, `employmentSubDistrict` |
| `ui.text-input`       | `RT`                        | `employmentRt`               |
| `ui.text-input`       | `RW`                        | `employmentRw`               |
| `ui.text-input`       | `Postcode`                  | `employmentPostcode`         |
| `ui.checkbox-list`    | PEP declaration             | `pepDeclaration`             |

**Validation**

| Field                  | Rule       | Message                        |
| ---------------------- | ---------- | ------------------------------ |
| `employmentOccupation` | `required` | Occupation is required         |
| `employmentIndustry`   | `required` | Industry category is required  |
| `employmentStatus`     | `required` | Employment status is required  |

**Footer:** `ui.button` — Label: `Next` → `nextStep: FINANCIAL_DETAILS`

---

## Step 6 — Financial Details

> **Image:** `docs/apply-ca-6.png`

### What the user sees

The user declares their financial profile: source of income, number of dependents, monthly income (IDR amount entered via numeric keypad — keyboard is dismissible via a "Done" button), purpose of funds, estimated monthly transaction amount, and monthly transaction frequency. A platform note documents that tapping Done closes the keyboard without navigating.

### Screen configuration

| Field         | Value                          |
| ------------- | ------------------------------ |
| **Screen ID** | `ACCT_CA_FINANCIAL_DETAILS`    |
| **Slug**      | `apply-ca.financial-details`   |
| **Step Code** | `FINANCIAL_DETAILS`            |
| Step Type     | User                           |
| On Submit     | `{ "nextStep": "RESIDENTIAL_DETAILS" }` |

**Meta**

| Field      | Value                |
| ---------- | -------------------- |
| Title      | `Financial details`  |
| Show Back  | `true`               |
| Progress   | Step 6 of 9          |

**Body components**

| Component        | Label                           | Binding path                    |
| ---------------- | ------------------------------- | ------------------------------- |
| `ui.dropdown`    | `Source of income`              | `sourceOfIncome`                |
| `ui.dropdown`    | `Number of dependents`          | `numberOfDependents`            |
| `ui.money-input` | `Monthly income`                | `monthlyIncome`                 |
| `ui.dropdown`    | `Purpose of funds`              | `purposeOfFunds`                |
| `ui.money-input` | `Monthly transaction amount`    | `monthlyTransactionAmount`      |
| `ui.dropdown`    | `Monthly transaction frequency` | `monthlyTransactionFrequency`   |

**Notes on `ui.money-input`:** Currency: `IDR` · Keyboard type: `numeric` · User taps **Done** to dismiss keyboard without triggering navigation.

**Validation**

| Field                         | Rule       | Message                                   |
| ----------------------------- | ---------- | ----------------------------------------- |
| `sourceOfIncome`              | `required` | Source of income is required              |
| `numberOfDependents`          | `required` | Number of dependents is required          |
| `monthlyIncome`               | `required` | Monthly income is required                |
| `purposeOfFunds`              | `required` | Purpose of funds is required              |
| `monthlyTransactionAmount`    | `required` | Monthly transaction amount is required    |
| `monthlyTransactionFrequency` | `required` | Monthly transaction frequency is required |

**Footer:** `ui.button` — Label: `Next` → `nextStep: RESIDENTIAL_DETAILS`

---

## Step 7 — Residential Details

> **Image:** `docs/apply-ca-7.png`

### What the user sees

The user selects their residential address. They can either confirm the address pre-filled from their e-KTP (step 3) or enter a different address. A bottom sheet presents two options: *Same as e-KTP address* or *Other address*. Once selected, residential ownership status is chosen (Owner / Renter / Family). The user then fills in the correspondence address — again with the option to reuse the e-KTP address or provide a new one. All address fields use cascading selects for Province → City/Regency → District → Sub-district/Village.

### Screen configuration

| Field         | Value                            |
| ------------- | -------------------------------- |
| **Screen ID** | `ACCT_CA_RESIDENTIAL_DETAILS`    |
| **Slug**      | `apply-ca.residential-details`   |
| **Step Code** | `RESIDENTIAL_DETAILS`            |
| Step Type     | User                             |
| On Submit     | `{ "nextStep": "EKYC_INSTRUCTIONS" }` |

**Meta**

| Field      | Value                   |
| ---------- | ----------------------- |
| Title      | `Residential details`   |
| Show Back  | `true`                  |
| Progress   | Step 7 of 9             |

**Body components**

| Component             | Label                          | Binding path / Notes                                     |
| --------------------- | ------------------------------ | -------------------------------------------------------- |
| `ui.dropdown`         | `Select residential address`   | Bottom sheet: `Same as e-KTP address` / `Other address` · Binding: `residentialAddressSource` |
| `ui.text-input`       | `Address`                      | `residentialAddress` — pre-filled if KTP option selected |
| `ui.cascading-select` | Province / City / District / Sub-district | `residentialProvince`, `residentialCity`, `residentialDistrict`, `residentialSubDistrict` |
| `ui.dropdown`         | `Residential ownership status` | Options: `Owner`, `Renter`, `Family` · Binding: `residentialOwnershipStatus` |
| `ui.dropdown`         | `Correspondence address`       | Same as e-KTP address / Other · Binding: `correspondenceAddressSource` |
| `ui.text-input`       | `Correspondence address`       | `correspondenceAddress` — pre-filled if KTP option selected |

**Validation**

| Field                        | Rule       | Message                               |
| ---------------------------- | ---------- | ------------------------------------- |
| `residentialAddress`         | `required` | Residential address is required       |
| `residentialOwnershipStatus` | `required` | Ownership status is required          |
| `correspondenceAddress`      | `required` | Correspondence address is required    |

**Footer:** `ui.button` — Label: `Next` → `nextStep: EKYC_INSTRUCTIONS`

---

## Step 8 — eKYC Selfie

> **Image:** `docs/apply-ca-8.png`

### What the user sees

This step has two sub-screens:

1. **Selfie instructions** — a list of requirements (good lighting, no glasses, no hats, neutral expression, face centred). A single CTA launches the camera.
2. **Active face capture** — a circular viewport guides the user through a liveness sequence: turn left → turn right → smile → processing. Progress is shown with animated icons. On success, the captured selfie is stored in state.

---

### 8a — eKYC Instructions

| Field         | Value                          |
| ------------- | ------------------------------ |
| **Screen ID** | `ACCT_CA_EKYC_INSTRUCTIONS`    |
| **Slug**      | `apply-ca.ekyc-instructions`   |
| **Step Code** | `EKYC_INSTRUCTIONS`            |
| Step Type     | User                           |
| On Submit     | `{ "nextStep": "EKYC_SELFIE" }` |

**Meta:** Title: `Selfie instructions` · Show Back: `true` · Progress: Step 8 of 9

**Body:** `ui.icon-text` × 5 — liveness requirements list

**Footer:** `ui.button` — Label: `Get started` → `nextStep: EKYC_SELFIE`

---

### 8b — eKYC Selfie Capture

| Field         | Value                    |
| ------------- | ------------------------ |
| **Screen ID** | `ACCT_CA_EKYC_SELFIE`    |
| **Slug**      | `apply-ca.ekyc-selfie`   |
| **Step Code** | `EKYC_SELFIE`            |
| Step Type     | User                     |

**Body**

| Component           | Config                                                                          |
| ------------------- | ------------------------------------------------------------------------------- |
| `ui.camera-capture` | Mode: `selfie` · Overlay shape: `circle` · Liveness prompts: `["Turn face left", "Turn face right", "Smile"]` · Binding: `selfieImage` / `journeyState` |

**On Complete**

```
type: api_call
service: ekyc-service
operation: verifyLiveness
payload: { "selfieImage": "{{selfieImage}}", "ektpImage": "{{ektpImage}}" }
onSuccess: { "nextStep": "STATEMENT_OF_CONSENT" }
onFailure: { "nextStep": "EKYC_INSTRUCTIONS" }   ← retries from instructions
```

---

## Step 9 — Statement of Consent

> **Image:** `docs/apply-ca-9.png`

### What the user sees

A full-screen scrollable consent document. The user must:

1. Review a collapsible list of T&C documents (BPAT Product and Feature Terms & Conditions, Terms & Conditions Savings Account, Terms & Conditions Global Access, Terms & Conditions MAE).
2. Review a PEP Verified Data Declaration section.
3. Optionally review a list of Other Bank Product Offers.
4. Tap **Review** to open the downloadable PDF — this triggers an OS file-access permission prompt. The file downloads and a `Download successful` toast is shown.
5. Tick the agreement checkbox and tap **I agree & consent** to proceed.

### Screen configuration

| Field         | Value                            |
| ------------- | -------------------------------- |
| **Screen ID** | `ACCT_CA_STATEMENT_OF_CONSENT`   |
| **Slug**      | `apply-ca.tnc`                   |
| **Step Code** | `STATEMENT_OF_CONSENT`           |
| Step Type     | User                             |
| On Submit     | `{ "nextStep": "CONFIRMATION" }` |

**Meta**

| Field      | Value                    |
| ---------- | ------------------------ |
| Title      | `Statement of Consent`   |
| Show Back  | `true`                   |
| Progress   | Step 9 of 9              |

**Body components**

| Component          | Config                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| `ui.section-label` | `BPAT Product Terms & Conditions`                                         |
| `ui.item-list`     | Expandable rows — each T&C document with a `Review` download action       |
| `ui.section-label` | `Pernyataan Verified Data (Data Verification Statement)`                   |
| `ui.rich-text`     | PEP declaration text (pre-filled name)                                    |
| `ui.section-label` | `Other Bank Product Offers (Optional)`                                    |
| `ui.rich-text`     | Optional product offer text                                               |
| `ui.rich-text`     | Full consent declaration copy                                             |
| `ui.checkbox-list` | Label: `I agree & consent` · Binding: `termsAccepted` / `journeyState`   |

**Permission flow** (platform-native, not SDUI-controlled): OS file-access prompt fires on first **Review** tap. On grant → download → `Download successful` toast. Sets `consentDocumentsDownloaded: true` in state.

**Validation**

| Field           | Rule       | Message                                  |
| --------------- | ---------- | ---------------------------------------- |
| `termsAccepted` | `required` | You must agree to the terms to continue  |

**Footer:** `ui.button` — Label: `Next` → `nextStep: CONFIRMATION`

---

## Step 10 — Confirmation

> **Image:** `docs/apply-ca-10.png`

### What the user sees

A full summary of every piece of data collected across steps 1–9, grouped into review cards. A `ui.slide-to-confirm` at the bottom must be swiped to submit the application.

Review cards shown:

- **Apply for:** Global Access Account (Savings Account)
- **Account info:** Mobile number, email
- **e-KTP details:** ID number, full name, DOB, gender, blood type, marital status, occupation, address, province / city / district / sub-district, RT/RW, postcode
- **NPWP details:** NPWP number _(hidden via `sdui.visibility` if null)_
- **Employment details:** Occupation, industry, company, job title, category, status, phone, join date, office address
- **Financial details:** Source of income, dependents, monthly income, purpose of funds, transaction amount, transaction frequency
- **Residential details:** Residential address, ownership status, correspondence address

### Screen configuration

| Field         | Value                      |
| ------------- | -------------------------- |
| **Screen ID** | `ACCT_CA_CONFIRMATION`     |
| **Slug**      | `apply-ca.confirmation`    |
| **Step Code** | `CONFIRMATION`             |
| Step Type     | User                       |
| On Submit     | `{ "nextStep": "FINAL_SUBMISSION" }` |

**Meta**

| Field      | Value            |
| ---------- | ---------------- |
| Title      | `Confirmation`   |
| Show Back  | `true`           |
| Show Close | `true`           |

**Header**

| Component        | Config                                                                |
| ---------------- | --------------------------------------------------------------------- |
| `ui.review-card` | Label: `Global Access Account` · Sub-label: `Savings Account`        |

**Body — Review Cards**

| Card Label           | `ui.kv-row` fields                                                   |
| -------------------- | -------------------------------------------------------------------- |
| `Account info`       | Mobile number, Email address                                         |
| `e-KTP details`      | e-KTP number, Full name, DOB, Gender, Blood type, Marital status, Occupation, Address, Province, City, District, Sub-district, RT/RW, Postcode |
| `NPWP details`       | NPWP number — `sdui.visibility` hides card if `npwpNumber` is null   |
| `Employment details` | Occupation, Industry, Company, Job title, Category, Status, Phone, Join date, Office address |
| `Financial details`  | Source of income, Dependents, Monthly income, Purpose of funds, Transaction amount, Frequency |
| `Residential details`| Residential address, Ownership status, Correspondence address        |

**Footer**

| Component             | Config                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| `ui.slide-to-confirm` | Label: `Slide to confirm` · Action: `type: navigate` · `payload: { "nextStep": "FINAL_SUBMISSION" }` |

---

## Post-Submission Steps (System)

These steps run automatically after step 10 — no user-facing screens.

### FINAL_SUBMISSION (System)

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Step Code  | `FINAL_SUBMISSION`                 |
| Step Type  | System                             |
| Service    | `stp-core`                         |
| Operation  | `submitJourney`                    |
| On Success | `{ "nextStep": "SUCCESS_SCREEN" }` |
| On Failure | `{ "nextStep": "SUBMIT_FAILED" }`  |
| Max Retry  | `3`                                |

### Success Screen

| Field         | Value               |
| ------------- | ------------------- |
| **Screen ID** | `ACCT_CA_SUCCESS`   |
| **Slug**      | `apply-ca.success`  |
| Step Code     | `SUCCESS_SCREEN`    |
| Notes         | Hero + success illustration |

### Submit Failed

| Field         | Value                    |
| ------------- | ------------------------ |
| **Screen ID** | `ACCT_CA_SUBMIT_FAILED`  |
| **Slug**      | `apply-ca.submit-failed` |
| Step Code     | `SUBMIT_FAILED`          |
| Notes         | Hero + warning banner + Try again / Back to home buttons |

### Ineligible Screen

| Field         | Value                   |
| ------------- | ----------------------- |
| **Screen ID** | `ACCT_CA_INELIGIBLE`    |
| **Slug**      | `apply-ca.ineligible`   |
| Step Code     | `INELIGIBLE_SCREEN`     |
| Notes         | Hero + error banner + Back to home button |

---

## Quick Reference

### Screen IDs & Step Codes

| #   | Screen ID                       | Slug                            | Step Code               | Type   |
| --- | ------------------------------- | ------------------------------- | ----------------------- | ------ |
| —   | _(system check)_                | —                               | `ELIGIBILITY_CHECK`     | System |
| 1   | `ACCT_CA_MOBILE_NUMBER`         | `apply-ca.mobile-number`        | `MOBILE_NUMBER`         | User   |
| 2   | `ACCT_CA_EMAIL_REGISTRATION`    | `apply-ca.email-registration`   | `EMAIL_REGISTRATION`    | User   |
| 3a  | `ACCT_CA_EKTP_INSTRUCTIONS`     | `apply-ca.ektp-instructions`    | `EKTP_INSTRUCTIONS`     | User   |
| 3b  | `ACCT_CA_EKTP_CAPTURE`          | `apply-ca.ektp-capture`         | `EKTP_CAPTURE`          | User   |
| 3c  | `ACCT_CA_EKTP_REVIEW`           | `apply-ca.ektp-review`          | `EKTP_REVIEW`           | User   |
| 4   | `ACCT_CA_NPWP_DETAILS`          | `apply-ca.npwp-details`         | `NPWP_DETAILS`          | User   |
| 5   | `ACCT_CA_EMPLOYMENT_DETAILS`    | `apply-ca.employment-details`   | `EMPLOYMENT_DETAILS`    | User   |
| 6   | `ACCT_CA_FINANCIAL_DETAILS`     | `apply-ca.financial-details`    | `FINANCIAL_DETAILS`     | User   |
| 7   | `ACCT_CA_RESIDENTIAL_DETAILS`   | `apply-ca.residential-details`  | `RESIDENTIAL_DETAILS`   | User   |
| 8a  | `ACCT_CA_EKYC_INSTRUCTIONS`     | `apply-ca.ekyc-instructions`    | `EKYC_INSTRUCTIONS`     | User   |
| 8b  | `ACCT_CA_EKYC_SELFIE`           | `apply-ca.ekyc-selfie`          | `EKYC_SELFIE`           | User   |
| 9   | `ACCT_CA_STATEMENT_OF_CONSENT`  | `apply-ca.tnc`                  | `STATEMENT_OF_CONSENT`  | User   |
| 10  | `ACCT_CA_CONFIRMATION`          | `apply-ca.confirmation`         | `CONFIRMATION`          | User   |
| —   | _(system submit)_               | —                               | `FINAL_SUBMISSION`      | System |
| —   | `ACCT_CA_SUCCESS`               | `apply-ca.success`              | `SUCCESS_SCREEN`        | User   |
| —   | `ACCT_CA_INELIGIBLE`            | `apply-ca.ineligible`           | `INELIGIBLE_SCREEN`     | User   |
| —   | `ACCT_CA_SUBMIT_FAILED`         | `apply-ca.submit-failed`        | `SUBMIT_FAILED`         | User   |

### State Binding Cheatsheet

| State path                    | Captured at step | Type    |
| ----------------------------- | ---------------- | ------- |
| `mobileNumber`                | 1                | String  |
| `mobileConsent`               | 1                | Boolean |
| `emailAddress`                | 2                | String  |
| `ektpImage`                   | 3b               | Base64  |
| `ektpNumber`                  | 3c               | String  |
| `fullName`                    | 3c               | String  |
| `dateOfBirth`                 | 3c               | Date    |
| `placeOfBirth`                | 3c               | String  |
| `gender`                      | 3c               | Enum    |
| `religion`                    | 3c               | Enum    |
| `maritalStatus`               | 3c               | Enum    |
| `occupation`                  | 3c               | Enum    |
| `address`, `province`, …      | 3c               | String  |
| `npwpNumber`                  | 4                | String? |
| `employmentOccupation`, …     | 5                | String  |
| `sourceOfIncome`, …           | 6                | Enum    |
| `monthlyIncome`               | 6                | Number  |
| `residentialAddress`, …       | 7                | String  |
| `residentialOwnershipStatus`  | 7                | Enum    |
| `selfieImage`                 | 8b               | Base64  |
| `termsAccepted`               | 9                | Boolean |

---

## Governance Notes

| Rule               | Value                                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| Screen ID format   | `{DOMAIN}_{MODULE}_{SCREEN}` in `SCREAMING_SNAKE_CASE` — e.g. `ACCT_CA_MOBILE_NUMBER` |
| Slug format        | `[journey-slug].[screen-slug]` in `kebab-case` — e.g. `apply-ca.mobile-number` |
| Step code format   | `SCREAMING_SNAKE_CASE`                                                         |
| Screen ID is immutable | Never rename after publishing — breaks routing, analytics, and CMS mapping |
| All copy           | Set in `meta.title`, `meta.subtitle`, component `label`                        |
| Optional fields    | Use `sdui.visibility` to show/hide based on state (e.g. NPWP card on confirmation) |
| Back navigation    | All user steps show back button except step 1 (`Show Back: false`)             |
| Camera steps       | Always use `ui.camera-capture` with appropriate `mode` — never raw file input  |
| Version bump       | Increment `content_version` on copy changes; `api_version` on structural changes |
| Always Publish     | Draft records are not served by API                                            |
