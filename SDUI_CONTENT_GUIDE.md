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
- Fill in `screenKey`, `meta`, `body`, `footer` as shown
- **Save → Publish**

### Screen 1: `apply-ca.intro`

| Field      | Value            |
| ---------- | ---------------- |
| Screen Key | `apply-ca.intro` |

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

### Screen 2: `apply-ca.account-purpose`

| Field      | Value                      |
| ---------- | -------------------------- |
| Screen Key | `apply-ca.account-purpose` |

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

### Screen 3: `apply-ca.npwp-capture`

| Field      | Value                   |
| ---------- | ----------------------- |
| Screen Key | `apply-ca.npwp-capture` |

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

### Screen 4: `apply-ca.npwp-review`

| Field      | Value                  |
| ---------- | ---------------------- |
| Screen Key | `apply-ca.npwp-review` |

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

| Screen Key               | Meta Title               | Key Body Component                                                               | Footer CTA                                   |
| ------------------------ | ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------- |
| `apply-ca.deposit-setup` | Add your initial deposit | Account Selector (`sourceAccountId`) + Money Input (`initialDepositAmount`, IDR) | Slide: `Next`                                |
| `apply-ca.terms`         | Terms & Conditions       | Checkbox List (`termsAccepted`)                                                  | Slide: `Confirm`                             |
| `apply-ca.confirmation`  | Review your application  | Review Card ×3                                                                   | Slide: `Slide to confirm`                    |
| `apply-ca.success`       | Application successful   | Hero (success illustration)                                                      | —                                            |
| `apply-ca.ineligible`    | We're sorry              | Hero (error illustration) + Banner (`text`, `variant: error`)                    | Button: `Back to home`                       |
| `apply-ca.submit-failed` | Something went wrong     | Hero (error illustration) + Banner (`text`, `variant: warning`)                  | Button: `Try again` · Button: `Back to home` |

> Note `apply-ca.ineligible` and `apply-ca.submit-failed` are new fallback screens needed for SYSTEM step failure branching.

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

Add steps in order using the **+ Add a component** button. Pick `Step - System` or `Step - User`.

#### Step 1 — ELIGIBILITY_CHECK (System)

- Component: **Step - System**

| Field      | Value                                 |
| ---------- | ------------------------------------- |
| Step Code  | `ELIGIBILITY_CHECK`                   |
| Service    | `product-capabilities`                |
| Operation  | `checkEligibility`                    |
| On Success | `{ "nextStep": "INTRO" }`             |
| On Failure | `{ "nextStep": "INELIGIBLE_SCREEN" }` |
| Max Retry  | `3`                                   |

#### Step 2 — INTRO (User)

- Component: **Step - User**

| Field     | Value                               |
| --------- | ----------------------------------- |
| Step Code | `INTRO`                             |
| Screen    | Select `apply-ca.intro`             |
| On Submit | `{ "nextStep": "ACCOUNT_PURPOSE" }` |

#### Step 3 — ACCOUNT_PURPOSE (User)

| Field     | Value                             |
| --------- | --------------------------------- |
| Step Code | `ACCOUNT_PURPOSE`                 |
| Screen    | Select `apply-ca.account-purpose` |
| On Submit | `{ "nextStep": "NPWP_CAPTURE" }`  |

#### Step 4 — NPWP_CAPTURE (User)

| Field     | Value                           |
| --------- | ------------------------------- |
| Step Code | `NPWP_CAPTURE`                  |
| Screen    | Select `apply-ca.npwp-capture`  |
| On Submit | `{ "nextStep": "NPWP_REVIEW" }` |

#### Step 5—8 (User) — follow the same pattern

| Step Code       | Screen                   | On Submit nextStep |
| --------------- | ------------------------ | ------------------ |
| `NPWP_REVIEW`   | `apply-ca.npwp-review`   | `DEPOSIT_SETUP`    |
| `DEPOSIT_SETUP` | `apply-ca.deposit-setup` | `TERMS`            |
| `TERMS`         | `apply-ca.terms`         | `CONFIRMATION`     |
| `CONFIRMATION`  | `apply-ca.confirmation`  | `FINAL_SUBMISSION` |

#### Step 9 — FINAL_SUBMISSION (System)

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Step Code  | `FINAL_SUBMISSION`                 |
| Service    | `stp-core`                         |
| Operation  | `submitJourney`                    |
| On Success | `{ "nextStep": "SUCCESS_SCREEN" }` |
| On Failure | `{ "nextStep": "SUBMIT_FAILED" }`  |

#### Step 10 — SUCCESS_SCREEN (User)

| Field     | Value                     |
| --------- | ------------------------- |
| Step Code | `SUCCESS_SCREEN`          |
| Screen    | Select `apply-ca.success` |

#### Step 11 — INELIGIBLE_SCREEN (User)

| Field     | Value                        |
| --------- | ---------------------------- |
| Step Code | `INELIGIBLE_SCREEN`          |
| Screen    | Select `apply-ca.ineligible` |

#### Step 12 — SUBMIT_FAILED (User)

| Field     | Value                           |
| --------- | ------------------------------- |
| Step Code | `SUBMIT_FAILED`                 |
| Screen    | Select `apply-ca.submit-failed` |

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
