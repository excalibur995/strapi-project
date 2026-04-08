# API Overview

There are two types of APIs for this app flow: **Journeys** and **Screens**.

---

## Journeys

A Journey represents a complete flow that a user progresses through — from start (e.g. filling in email) to completion. It contains a sequence of Screens.

**Key concepts:**

- Each Journey defines a **navigator** that tells the app which navigation stack to use.
- Every screen within a journey is defined by the journey's `screens` array, but the actual UI content is rendered dynamically by calling the corresponding Screen API.
- The app flow works as follows: static shell screen → Journey API to resolve the correct navigator → fetch the journey and use `screens[0]` as the initial/entry screen.
- While inside a journey session, users can jump between available screens within that journey.

**Example API:**
```
GET http://localhost:1337/api/journeys/apply_ca_journey
```

---

## Screens

A Screen is a dynamic, self-contained unit of UI. All form logic, validation, and rendering are driven by the API response.

**Key concepts:**

- All **validations** are defined at the input level — the submit/next button should reactively detect when all validations are satisfied.
- Architecture is split into two layers:
  - **UI components** — stateless presentational components (pure rendering, no side effects).
  - **Widgets** — stateful components used by the dynamic renderer to handle specific interactive tasks (e.g. camera capture, OTP input).
- A **Component Registry** is used to map component type identifiers (from the API response) to their corresponding React Native components at runtime.

**Example API:**
```
GET http://localhost:1337/api/screens/e_ktp_capture_screen
```

---

## Open Items / To Be Defined

The following should be confirmed or added to complete the spec:

- **Component Registry shape** — how component type keys map to widget/UI components.
- **Screen response schema** — field definitions, validation rules structure, button config.
- **Journey response schema** — navigator type, screens array, metadata.
- **Error handling** — what happens when a screen or journey fails to load mid-flow.
- **Navigation events** — how screens signal progression (next, back, skip, exit journey).
