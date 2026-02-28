# SDUI Content Guide — How to Fill Journey & Screen Records

> Step-by-step instructions for content editors to create the **Apply Current Account** journey in the Strapi Admin Panel.

---

## Prerequisites

1. Start Strapi: `npm run develop`
2. Open Admin: `http://localhost:1337/admin`
3. Go to **Content Manager** in the left sidebar

---

## Step 1 — Create the Journey

1. In Content Manager, click **Journey** → **Create new entry**
2. Fill in:

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Name**          | `Apply Current Account`                             |
| **Slug**          | `apply-ca` _(auto-generated from name, confirm it)_ |
| **Initial State** | Paste the JSON below                                |
| **Description**   | `Multi-step journey to open a Current Account`      |

**Initial State JSON:**

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

3. Click **Save** then **Publish**

> ⚠️ **Do not create Screen records yet.** You'll link them to this journey in the next steps.

---

## Step 2 — Create Screen: `apply-ca.intro`

1. Click **Screen** → **Create new entry**
2. Fill in the top fields:

| Field          | Value                          |
| -------------- | ------------------------------ |
| **Screen Key** | `apply-ca.intro`               |
| **Order**      | `1`                            |
| **Journey**    | Select `Apply Current Account` |

3. **Meta** section:

| Field      | Value                                    |
| ---------- | ---------------------------------------- |
| Title      | `Apply Current Account`                  |
| Subtitle   | `Open an account tailored to your needs` |
| Show Back  | `false`                                  |
| Show Close | `true`                                   |

4. **Header** slot → Add component → pick **Hero**:

| Field             | Value                                    |
| ----------------- | ---------------------------------------- |
| Illustration      | Upload the hero image from Media Library |
| Title             | `Start your application`                 |
| Subtitle Template | _(leave empty)_                          |

5. **Body** slot → Add component → pick **Banner**:

| Field   | Value                                              |
| ------- | -------------------------------------------------- |
| Value   | `You'll need your NPWP and a source account ready` |
| Variant | `info`                                             |

6. **Footer** slot → _(leave empty — this screen uses a primary button in the header/hero)_

7. Click **Save** → **Publish**

---

## Step 3 — Create Screen: `apply-ca.account-purpose`

1. Click **Screen** → **Create new entry**
2. Top fields:

| Field          | Value                          |
| -------------- | ------------------------------ |
| **Screen Key** | `apply-ca.account-purpose`     |
| **Order**      | `2`                            |
| **Journey**    | Select `Apply Current Account` |

3. **Meta** section:

| Field      | Value                                       |
| ---------- | ------------------------------------------- |
| Title      | `How will you use this account?`            |
| Subtitle   | `This helps us personalise your experience` |
| Show Back  | `true`                                      |
| Show Close | `false`                                     |

4. **Header** slot → _(leave empty)_

5. **Body** slot → Add component → pick **Section Label**:

| Field | Value                    |
| ----- | ------------------------ |
| Label | `Select account purpose` |

6. **Body** slot → Add another component → pick **Radio Group**:

| Field | Value           |
| ----- | --------------- |
| Label | _(leave empty)_ |

- **Options** → Add 2 items:

  **Option 1:**
  | Field | Value |
  |-------|-------|
  | Key | `business` |
  | Label | `Business` |
  | Description | `For running business operations, paying suppliers, and collections` |

  **Option 2:**
  | Field | Value |
  |-------|-------|
  | Key | `personal` |
  | Label | `Personal` |
  | Description | `For your everyday personal banking needs` |

- **Binding**:

  | Field         | Value            |
  | ------------- | ---------------- |
  | Path          | `accountPurpose` |
  | Scope         | `journeyState`   |
  | Default Value | `null`           |

- **Validation** → Add item:

  | Field                 | Value      |
  | --------------------- | ---------- |
  | _(set required rule)_ | `required` |

7. **Footer** slot → Add component → pick **Slide To Confirm**:

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| Label            | `Continue`                                 |
| Action → Key     | `next`                                     |
| Action → Type    | `navigate`                                 |
| Action → Payload | `{ "screenKey": "apply-ca.npwp-capture" }` |

8. Click **Save** → **Publish**

---

## Step 4 — Create Screen: `apply-ca.npwp-capture`

1. Click **Screen** → **Create new entry**
2. Top fields:

| Field          | Value                          |
| -------------- | ------------------------------ |
| **Screen Key** | `apply-ca.npwp-capture`        |
| **Order**      | `3`                            |
| **Journey**    | Select `Apply Current Account` |

3. **Meta** section:

| Field      | Value                                                |
| ---------- | ---------------------------------------------------- |
| Title      | `Scan the front of your NPWP`                        |
| Subtitle   | `Position your NPWP inside the frame and hold still` |
| Show Back  | `true`                                               |
| Show Close | `false`                                              |

4. **Header** slot → _(leave empty)_

5. **Body** slot → Add component → pick **Section Label**:

| Field | Value                              |
| ----- | ---------------------------------- |
| Label | `Place your NPWP within the frame` |

6. **Body** slot → Add another component → pick **Camera Capture**:

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Mode           | `document`                           |
| Overlay Shape  | `rectangle`                          |
| Overlay Aspect | `1.586` _(standard card ratio)_      |
| Overlay Hint   | `Fit all 4 corners inside the frame` |

- **Binding**:

  | Field | Value          |
  | ----- | -------------- |
  | Path  | `npwpImage`    |
  | Scope | `journeyState` |

- **On Complete**:

  | Field   | Value                                     |
  | ------- | ----------------------------------------- |
  | Key     | `npwp-captured`                           |
  | Type    | `navigate`                                |
  | Payload | `{ "screenKey": "apply-ca.npwp-review" }` |

7. **Footer** slot → _(leave empty — Camera Capture auto-navigates on complete)_

8. Click **Save** → **Publish**

---

## Remaining Screens (follow same pattern)

| Order | Screen Key               | Key Body Components                                                              | Footer CTA                                    |
| ----- | ------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------- |
| 4     | `apply-ca.npwp-review`   | Image Preview (`npwpImage`) + Text Input (`npwpNumber`)                          | Slide: `Next` → `apply-ca.deposit-setup`      |
| 5     | `apply-ca.deposit-setup` | Account Selector (`sourceAccountId`) + Money Input (`initialDepositAmount`, IDR) | Slide: `Next` → `apply-ca.terms`              |
| 6     | `apply-ca.terms`         | Checkbox List (`termsAccepted`)                                                  | Slide: `Confirm` → `apply-ca.confirmation`    |
| 7     | `apply-ca.confirmation`  | Review Card ×3 (account, NPWP, deposit)                                          | Slide: `Slide to confirm` → `api_call` submit |
| 8     | `apply-ca.passcode`      | Passcode Input (length: 6, binding: `passcode`)                                  | _(auto-submits on complete)_                  |
| 9     | `apply-ca.success`       | Hero (success illustration)                                                      | _(none — has Done button in hero)_            |

---

## Governance Rules (Quick Reference)

| Rule              | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Screen key format | `[journey-slug].[screen-slug]`                                    |
| All copy          | Set in `meta.title`, `meta.subtitle`, or component `label` fields |
| Styling           | None — frontend owns all styling                                  |
| Navigation        | Use `sdui.action` type `navigate` with `payload.screenKey`        |
| Form fields       | Always set `binding.path` + `binding.scope: journeyState`         |
| Publishing        | Always **Publish** after Save — drafts are not served by the API  |
