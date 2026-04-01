# SDUI Content Guide — How to Fill Journey & Screen Records

> Step-by-step for content editors filling the **Apply Current Account** journey in Strapi Admin.

---

## Prerequisites

1. Start Strapi: `npm run develop`
2. Open Admin: `http://localhost:1337/admin`
3. Go to **Content Manager** in the left sidebar

---

## Step 1 — Create the Screens First

Screens must exist before you can link them inside Journey steps.

Create a **Screen** entry for each screen below. For each:

- Go to **Content Manager → Screen → Create new entry**
- Fill in `screenId`, `meta`, `body`, `footer` as shown
- **Save → Publish**

### Screen 1: `ACCT_CA_INTRO`

| Field      | Value          |
| ---------- | -------------- |
| Screen ID  | `ACCT_CA_INTRO` |

**Meta:**
| Field | Value |
|-------|-------|
| Title | `Apply Current Account` |
| Subtitle | `Open an account tailored to your needs` |
| Show Back | `false` |
| Show Close | `true` |

**Header → Add component → Hero:**
| Field | Value |
|-------|-------|
| Illustration | Upload hero image from Media Library |
| Title | `Start your application` |

**Body → Add component → Banner:**
| Field | Value |
|-------|-------|
| text | `You'll need your NPWP and a source account ready` |
| Variant | `info` |

---

### Screen 2: `ACCT_CA_ACCOUNT_PURPOSE`

| Field     | Value                      |
| --------- | -------------------------- |
| Screen ID | `ACCT_CA_ACCOUNT_PURPOSE`  |

**Meta:** Title: `How will you use this account?` · Subtitle: `This helps us personalise your experience` · Show Back: `true`

**Body → Section Label:**
| Label | `Select account purpose` |

**Body → Radio Group:**

- Binding: `path: accountPurpose` · `scope: journeyState`
- Options:
  - `key: business` · `label: Business` · `description: For running business operations, paying suppliers, and collections`
  - `key: personal` · `label: Personal` · `description: For your everyday personal banking needs`
- **Validation (sdui.validation — add 1 item):**
  - `rule: required` · `message: Please select an account purpose`

**Footer → Slide To Confirm:**

- Label: `Continue`
- Action: `key: next` · `type: navigate` · `payload: { "nextStep": "ACCOUNT_PURPOSE_DONE" }`

---

### Screen 3: `ACCT_CA_NPWP_CAPTURE`

| Field     | Value                  |
| --------- | ---------------------- |
| Screen ID | `ACCT_CA_NPWP_CAPTURE` |

**Meta:** Title: `Scan the front of your NPWP` · Subtitle: `Position your NPWP inside the frame and hold still` · Show Back: `true`

**Body → Section Label:** `Place your NPWP within the frame`

**Body → Camera Capture:**
| Field | Value |
|-------|-------|
| Mode | `document` |
| Overlay Shape | `rectangle` |
| Overlay Aspect | `1.586` |
| Overlay Hint | `Fit all 4 corners inside the frame` |
| Binding path | `npwpImage` · `scope: journeyState` |

- **On Complete (sdui.on-complete):**
  - **Action (sdui.action):**
    - `key: npwp-captured`
    - `type: navigate`
    - `payload: { "nextStep": "NPWP_CAPTURED" }`

---

### Screen 4: `ACCT_CA_NPWP_REVIEW`

| Field     | Value                 |
| --------- | --------------------- |
| Screen ID | `ACCT_CA_NPWP_REVIEW` |

**Meta:** Title: `Review your NPWP` · Subtitle: `Check that all details are clearly visible` · Show Back: `true`

**Body → Image Preview:**

- **Source (sdui.source):**
  - `path: npwpImage`
  - `scope: journeyState`

**Body → Text Input:**

| Field         | Value                                |
| ------------- | ------------------------------------ |
| Label         | `NPWP Number`                        |
| Placeholder   | `Enter your 15-digit NPWP number`    |
| Keyboard Type | `numeric`                            |
| Binding path  | `npwpNumber` · `scope: journeyState` |

- **Validation (sdui.validation — add 2 items):**
  1. `rule: required` · `message: NPWP number is required`
  2. `rule: pattern` · `value: ^[0-9]{15}$` · `message: Must be exactly 15 digits`

**Footer → Slide To Confirm:**

- Label: `Next`
- Action: `key: next` · `type: navigate` · `payload: { "nextStep": "DEPOSIT_SETUP" }`

---

### Remaining Screens (same pattern)

| Screen ID                    | Meta Title               | Key Body Component                                                               | Footer CTA                                   |
| ---------------------------- | ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------- |
| `ACCT_CA_DEPOSIT_SETUP`      | Add your initial deposit | Account Selector (`sourceAccountId`) + Money Input (`initialDepositAmount`, IDR) | Slide: `Next`                                |
| `ACCT_CA_TERMS`              | Terms & Conditions       | Checkbox List (`termsAccepted`)                                                  | Slide: `Confirm`                             |
| `ACCT_CA_CONFIRMATION`       | Review your application  | Review Card ×3                                                                   | Slide: `Slide to confirm`                    |
| `ACCT_CA_SUCCESS`            | Application successful   | Hero (success illustration)                                                      | —                                            |
| `ACCT_CA_INELIGIBLE`         | We're sorry              | Hero (error illustration) + Banner (`text`, `variant: error`)                    | Button: `Back to home`                       |
| `ACCT_CA_SUBMIT_FAILED`      | Something went wrong     | Hero (error illustration) + Banner (`text`, `variant: warning`)                  | Button: `Try again` · Button: `Back to home` |

> `ACCT_CA_INELIGIBLE` and `ACCT_CA_SUBMIT_FAILED` are fallback screens needed for SYSTEM step failure branching.

---

## Step 2 — Create the Journey

Go to **Content Manager → Journey → Create new entry**

### Identity

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Name**           | `Apply Current Account`                        |
| **Slug**           | `apply-ca` _(auto-generated)_                  |
| **Schema Version** | `1.0`                                          |
| **Bundle Version** | `2026.03.01-001`                               |
| **Description**    | `Multi-step journey to open a Current Account` |

### Metadata

| Field            | Value                    |
| ---------------- | ------------------------ |
| **Product Type** | `ACCOUNTS`               |
| **Segment**      | `ETB`                    |
| **Owner**        | `Accounts Business Team` |

### Policies

| Field                    | Value   |
| ------------------------ | ------- |
| **Idempotency Required** | `true`  |
| **Checkpoint Enabled**   | `true`  |
| **Max Retry**            | `3`     |
| **Async**                | `false` |

### Initial State

```json
{
  "accountPurpose": null,
  "npwpImage": null,
  "npwpNumber": null,
  "sourceAccountId": null,
  "initialDepositAmount": null,
  "termsAccepted": []
}
```

### Steps

Add steps in order using the **+ Add a component** button. All steps use the single **Steps** (`sdui.steps`) component — set the `Type` field to either `system` or `user`.

#### Step 1 — ELIGIBILITY_CHECK (system)

| Field      | Value                                 |
| ---------- | ------------------------------------- |
| Type       | `system`                              |
| Step Code  | `ELIGIBILITY_CHECK`                   |
| Service    | `product-capabilities`                |
| Operation  | `checkEligibility`                    |
| On Success | `{ "nextStep": "INTRO" }`             |
| On Failure | `{ "nextStep": "INELIGIBLE_SCREEN" }` |
| Max Retry  | `3`                                   |

#### Step 2 — INTRO (user)

| Field     | Value                               |
| --------- | ----------------------------------- |
| Type      | `user`                              |
| Step Code | `INTRO`                             |
| Screen    | Select `ACCT_CA_INTRO`              |
| On Submit | `{ "nextStep": "ACCOUNT_PURPOSE" }` |

#### Step 3 — ACCOUNT_PURPOSE (user)

| Field     | Value                                |
| --------- | ------------------------------------ |
| Type      | `user`                               |
| Step Code | `ACCOUNT_PURPOSE`                    |
| Screen    | Select `ACCT_CA_ACCOUNT_PURPOSE`     |
| On Submit | `{ "nextStep": "NPWP_CAPTURE" }`     |

#### Step 4 — NPWP_CAPTURE (user)

| Field     | Value                           |
| --------- | ------------------------------- |
| Type      | `user`                          |
| Step Code | `NPWP_CAPTURE`                  |
| Screen    | Select `ACCT_CA_NPWP_CAPTURE`   |
| On Submit | `{ "nextStep": "NPWP_REVIEW" }` |

#### Steps 5–8 (user) — follow the same pattern

| Step Code       | Screen                       | On Submit nextStep |
| --------------- | ---------------------------- | ------------------ |
| `NPWP_REVIEW`   | `ACCT_CA_NPWP_REVIEW`        | `DEPOSIT_SETUP`    |
| `DEPOSIT_SETUP` | `ACCT_CA_DEPOSIT_SETUP`      | `TERMS`            |
| `TERMS`         | `ACCT_CA_TERMS`              | `CONFIRMATION`     |
| `CONFIRMATION`  | `ACCT_CA_CONFIRMATION`       | `FINAL_SUBMISSION` |

#### Step 9 — FINAL_SUBMISSION (system)

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Type       | `system`                           |
| Step Code  | `FINAL_SUBMISSION`                 |
| Service    | `stp-core`                         |
| Operation  | `submitJourney`                    |
| On Success | `{ "nextStep": "SUCCESS_SCREEN" }` |
| On Failure | `{ "nextStep": "SUBMIT_FAILED" }`  |

#### Step 10 — SUCCESS_SCREEN (user)

| Field     | Value                   |
| --------- | ----------------------- |
| Type      | `user`                  |
| Step Code | `SUCCESS_SCREEN`        |
| Screen    | Select `ACCT_CA_SUCCESS` |

#### Step 11 — INELIGIBLE_SCREEN (user)

| Field     | Value                      |
| --------- | -------------------------- |
| Type      | `user`                     |
| Step Code | `INELIGIBLE_SCREEN`        |
| Screen    | Select `ACCT_CA_INELIGIBLE` |

#### Step 12 — SUBMIT_FAILED (user)

| Field     | Value                       |
| --------- | --------------------------- |
| Type      | `user`                      |
| Step Code | `SUBMIT_FAILED`             |
| Screen    | Select `ACCT_CA_SUBMIT_FAILED` |

---

**Save → Publish**

---

## Governance Quick Reference

| Rule              | Value                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Screen key format | `[journey-slug].[screen-slug]`                                                                  |
| Step code format  | `SCREAMING_SNAKE_CASE`                                                                          |
| All copy          | Set in `meta.title`, `meta.subtitle`, component `label`                                         |
| Styling           | None — frontend owns all styling                                                                |
| Navigation        | Use `nextStep` in `onSubmit` / `onSuccess` / `onFailure`                                        |
| Form fields       | Always set `binding.path` + `binding.scope: journeyState`                                       |
| Publishing        | Always **Publish** after Save                                                                   |
| CTB UI            | Never edit `sdui.action`, `ui.slide-to-confirm`, `ui.button` via admin CTB — edit JSON directly |
