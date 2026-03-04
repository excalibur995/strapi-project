# Dynamic UI Configuration CMS - Enterprise Architecture Document

## 1. Document Purpose & Scope

### 1.1 Document Purpose

This document defines the architecture, design decisions, and system boundaries for the Dynamic UI Configuration Content Management System (built on Strapi v5). It serves as the definitive reference for engineering, architecture, and content teams integrating with this ecosystem.

### 1.2 Architectural Strategy

This system follows a **Headless Configuration-Driven Strategy**.

- It completely decouples the frontend client presentation layer (MFE) from backend business logic (STP).
- It provides semantic, JSON-based payload configurations (`journeys` and `screens`) that orchestrate _what_ elements appear on a client application, while leaving the _how_ (styling, rendering) to the frontend's local design system.
- It delegates business logic execution and state orchestration to a dedicated STP (Straight-Through Processing) service or workflow orchestration engine.

### 1.3 System and Boundaries Included

- **Configuration CMS Application:** Strapi v5 Node.js application serving the Admin interface and REST APIs.
- **Relational Database:** PostgreSQL cluster storing content schemas, configuration components, and publish states.
- **Static Media Storage:** Local or Cloud Object Storage (e.g., AWS S3) for static assets (images, icons).

### 1.4 Out of Scope Clarifications

- **Frontend Rendering Engine (MFE):** The React Native/Web client libraries parsing the JSON configurations are out of scope for this document.
- **Journey Orchestration & State Tracking (STP):** The execution of system-level transaction steps, user progress caching, and business logic execution are handled by the STP layer, not this Configuration CMS.
- **Core Domain Services:** Underlying product APIs (e.g., Account creation, KYC logic processing) are out of scope.

---

## 2. CMS Architecture Overview

### 2.1 High-Level Domain Context

- **Why the CMS exists in this architecture:** To provide a centralised, non-technical interface for Product teams to rapidly deploy interface structures and journey configurations without requiring frontend code releases.
- **What problems it solves:** It solves the bottleneck of hardcoded UI flows by moving screen definitions to a database, enabling instant regional rollouts, A/B testing variations, and real-time copy updates.
- **What it is NOT responsible for:** Executing business rules, managing user session state, holding customer data, or validating transaction eligibility.

### 2.2 Domain Responsibilities

The CMS domain is responsible for the management, storage, and delivery of configurable content that supports UI rendering and journey orchestration.

It provides structured, versioned, and localised static content to consuming domains (e.g., MFE, STP), but it does not perform business logic execution or runtime processing.

The purpose of clearly defining responsibilities is to prevent domain overlap, enforce architectural boundaries, and avoid future scope creep.

#### 2.2.1 In Scope

The CMS domain is responsible for the following capabilities:

##### 1. Static UI Content

The CMS manages all static content required to render user interface screens. This includes:

- Screen titles, headings and subheadings
- Labels and field descriptions
- Button text
- Help text and tooltips
- Informational banners
- Error message templates
- Rich text content and media references
- Images and Icons

This content is:

- Environment-managed (e.g., DEV/UAT/PROD separation)
- Version-controlled (via CMS governance)
- Localisation-aware
- Delivered via structured API responses

The CMS does **not** determine when content should be displayed based on runtime business conditions; it only stores and delivers configured content.

The CMS does **not** own or define domain-specific content structures. Content models and structural definitions remain the responsibility of the consuming domain; again, it only stores and delivers configured content.

##### 2. Journey Configuration Metadata

The CMS stores the configuration that defines how a STP journey should be structured and processed by the STP service.

This configuration enables the STP to:

- Retrieve configurable journey definitions
- Interpret content structure
- Assemble screen responses for downstream consumers

The CMS provides STP journey configuration data but does not:

- Execute the journey
- Maintain runtime state
- Enforce business rule logic

All runtime orchestration decisions remain the responsibility of the consuming domain.

##### 3. Localisation Content

The CMS manages multilingual variants of static content, initially this includes translations for English and Bahasa Indonesia. The CMS can be extended to handle translations for additional languages.

The CMS is responsible for:

- Storing and versioning translated content
- Providing locale-specific responses based on request parameters

The CMS is **not** responsible for:

- Translating dynamic data
- Localising runtime calculated values

Localisation of dynamic data remains the responsibility of the appropriate domain.

#### 2.2.2 Out of Scope

The following capabilities are explicitly outside the responsibility of the CMS domain.

##### 1. Business Validation

The CMS does not:

- Enforce business rules
- Validate customer eligibility
- Perform rule-based decisioning
- Evaluate regulatory constraints
- Validate field-level user input

All business validation must be performed by the owning domain.
The CMS may store static error message templates, but it does not determine when those messages should be triggered.

##### 2. Dynamic Data Processing

The CMS does not:

- Retrieve live customer data
- Calculate financial values
- Execute pricing logic
- Perform data transformations
- Stitch dynamic data into static content at runtime

Dynamic data retrieval and processing is the responsibility of consuming services.
If dynamic values are rendered within UI content, those values must be injected by the consuming domain after CMS content retrieval.

##### 3. Transaction State Management

The CMS does not:

- Maintain user session state
- Persist transaction progress
- Store in-flight application data
- Track workflow state
- Handle retries or compensation logic

The CMS is stateless in runtime consumption contexts.
Transaction management and state persistence are handled by the relevant business domain services.

### 2.3 Boundary Enforcement Principles

To maintain architectural clarity:

1.  The CMS must remain content-driven, not logic-driven.
2.  The CMS must not evolve into a business rules engine.
3.  API contract changes impacting consuming domains must follow governance approval.
4.  Runtime behaviour must always be owned by the domain executing the journey.

Any proposal to extend CMS responsibilities beyond the scope defined above must undergo architectural review.

### 2.4 Strapi CMS

The specific technology chosen for this capability is Strapi (v5), a headless Node.js CMS that natively supports the deeply nested polymorphic arrays (Dynamic Zones) required for component-based UI construction.

### 2.5 Upstream & Downstream Systems

- **Upstream:** Content Operations, Product Owners, and Designers logging into the Strapi Administration Panel.
- **Downstream:**
  - **MFE (Micro-Frontends / App):** Consumes `/api/screens/:documentId` to paint the UI.
  - **STP (Straight-Through Processing Engine):** Consumes `/api/journeys/:slug` to understand step orchestration and execution policies.

### 2.6 Key User Journeys

1. **Configuration Publishing:** A Product Owner creates a flow, assigns UI blocks, and publishes.
2. **STP Initialization:** When a user starts a flow, the STP engine queries the CMS for the overarching metadata (number of screens, idempotency rules).
3. **MFE Rendering:** As the user navigates, the MFE queries the CMS for the specific block layout for the active screen step.

### 2.7 Domain Context Diagram

_A C4 Context perspective:_

- **End User** -> interacts with -> **MFE Client App**
- **MFE Client App** -> fetches screen component JSON from -> **CMS**
- **MFE Client App** -> submits action payloads to -> **STP Orchestration Engine**
- **STP Orchestration Engine** -> fetches validation/journey logic from -> **CMS**
- **STP Orchestration Engine** -> routes final transactions to -> **Core Domain Microservices**

---

## 3. CMS Domain Overview

### 3.1 CMS API Structure

The CMS exposes RESTful APIs built on the **Strapi v5 Documents Service** (`strapi.documents()`). All responses are JSON-formatted and wrapped in a standard `data`/`meta` envelope via the `transformResponse` helper.

Key structural characteristics:

- **Controller-enforced deep population:** Population depth is declared as a static `SCREENS_POPULATE` constant inside each custom controller. Downstream consumers may **not** override population depth via query parameters — this prevents N+1 chains and enforces a consistent response contract.
- **Custom `findBySlug` extension:** In addition to the standard `find` / `findOne` by `documentId`, a custom `findBySlug` action is registered on the Journey controller, resolving entries by their human-readable `slug` field. This is the primary entrypoint for STP consumers.
- **Published-only enforcement:** All externally invoked read operations apply a `status: "published"` filter at the service call level, ensuring draft content is never leaked to downstream consumers regardless of query parameters.
- **Sanitize → Transform pipeline:** Every controller action runs the full Strapi security pipeline — `sanitizeQuery` on input, `sanitizeOutput` on the entity, and `transformResponse` for envelope wrapping — before returning to the client.

### 3.2 CMS API Methods

| Method | Endpoint                    | Internal Controller | Description                                                                  |
| :----- | :-------------------------- | :------------------ | :--------------------------------------------------------------------------- |
| GET    | `/api/<content-type>`       | `find`              | Retrieves a list of published content.                                       |
| GET    | `/api/<content-type>/:id`   | `findOne`           | Retrieves a specific published content entry by its Document ID.             |
| GET    | `/api/<content-type>/:slug` | `findBySlug`        | (Custom Extension) Retrieves an entry by a human-readable unique identifier. |
| POST   | `/api/<content-type>`       | `create`            | **DISABLED FOR CLIENT CONSUMERS**                                            |
| PUT    | `/api/<content-type>/:id`   | `update`            | **DISABLED FOR CLIENT CONSUMERS**                                            |
| DELETE | `/api/<content-type>/:id`   | `delete`            | **DISABLED FOR CLIENT CONSUMERS**                                            |

> **Note:** POST, PUT, and DELETE methods are structurally disabled via Strapi RBAC for API tokens. Only `GET` methods will be exposed to downstream consumers. Data mutation occurs solely via the authenticated Strapi Admin UI panel.

### 3.3 CMS API Governance

All CMS APIs represent a **Provider Contract**. Downstream services parse these endpoints expecting exact structures.

- Breaking changes (removing a field, altering a component structure) require a new schema instantiation or strict backwards-compatibility mapping.
- Adding fields to existing components is non-breaking.

### 3.4 CMS Response Structure

#### 1. Base Structure

The Strapi v5 base response structure provides a standardized envelope mapping:

```json
{
  "data": {
    "id": 1,
    "documentId": "xyz123...", // The global UUID used for API lookups across localized versions
    ...fields
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 1
    }
  }
}
```

- **`data`**: Contains the requested entity (or array of entities). This is where consumers will extract business properties (like `screens` or UI component arrays).
- **`meta.pagination`**: Included on collection requests.

#### 2. STP Journey Configuration Response Example

_Endpoint:_ `GET /api/journeys/slug/:slug`
_Consumer:_ STP Engine
_Purpose:_ Informs the STP of the journey steps, structural metadata, and execution policies.

```json
{
  "data": {
    "documentId": "ua19l6sbe7r...",
    "slug": "apply-ca",
    "name": "Apply Current Account",
    "description": "End-to-end current account application journey",
    "schemaVersion": "1.0",
    "bundleVersion": "2025-Q1",
    "productType": "ACCOUNTS",
    "segment": "NTB",
    "owner": "onboarding-squad",
    "idempotencyRequired": true,
    "checkpointEnabled": true,
    "maxRetry": 3,
    "async": false,
    "initialState": {
      "accountPurpose": null,
      "selectedCurrency": null
    },
    "onExit": {
      "__component": "sdui.action",
      "key": "exit-journey",
      "type": "navigate",
      "payload": { "screen": "home" }
    },
    "analytics": {
      "journeyTag": "account-opening",
      "segmentEvent": "journey_started"
    },
    "screens": [
      {
        "documentId": "scr-abc123...",
        "screenKey": "apply-ca.intro",
        "meta": {
          "__component": "sdui.screen-meta",
          "title": "Open an Account",
          "showBack": false
        },
        "header": [],
        "body": [],
        "footer": []
      }
    ]
  },
  "meta": {}
}
```

#### 3. MFE Screen Content Response Example

_Endpoint:_ `GET /api/screens/:documentId`
_Consumer:_ MFE Client App
_Purpose:_ Dictates the exact components to paint on the glass.

```json
{
  "data": {
    "documentId": "xyz...",
    "screenKey": "apply-ca.intro",
    "meta": {
      "__component": "sdui.screen-meta",
      "title": "Welcome",
      "showBack": true
    },
    "body": [
      {
        "__component": "ui.hero",
        "title": "Open your account today",
        "illustration": { "url": "/uploads/hero.png" }
      },
      {
        "__component": "ui.button",
        "label": "Continue",
        "action": {
          "type": "navigate",
          "payload": { "nextStep": "apply-ca.account-purpose" }
        }
      }
    ]
  }
}
```

### 3.5 CMS Content Types

1. **Journeys (Collection Type):** The root orchestrator defining global properties, sequence definitions, and linking to child Screens.
2. **Screens (Collection Type):** Standalone interface blueprints containing three distinct Dynamic Zones (`header`, `body`, `footer`) capable of housing any polymorphic UI component.
3. **Components (Strapi Reusable Blocks):**
   - **`ui.*`:** Renderable blocks (e.g., `text-input`, `button`).
   - **`sdui.*`:** Behavioural configuration (e.g., `action`, `binding`, `visibility`).

### 3.6 CMS Content Governance

#### 1. Content Naming Conventions

- **Journey Slugs:** Kebab-case, representing the product flow (e.g., `apply-ca`, `apply-cc-gold`).
- **Screen Keys:** Prefixed by the journey slug, followed by a dot, followed by the specific step context (e.g., `apply-ca.intro`, `apply-ca.kyc-capture`).
- **Component Names:** Always prefixed with their domain boundary (`ui.` for components painted on glass, `sdui.` for invisible behavioral blocks).

#### 2. Content Configuration Best Practices

- **Configure Screens First:** Authors must define all Screen entities in isolation before creating the Parent Journey and mapping their order.
- **Fail Gracefully:** Use the `sdui.visibility` blocks to hide components missing upstream data rather than failing the entire screen render.

### 3.7 Versioning Strategy

- **Journey Bundles:** The Journey schema explicitly includes a `bundleVersion` field. This allows content authors to snapshot specific groupings of screens without disrupting the `v1` configuration currently executing in production.
- **API Versioning:** Maintained at the application routing infrastructure level. Should the base JSON shape fundamentally change, a `/api/v2/screens` routing prefix will be introduced.

### 3.8 Caching Strategy

- **Aggressive Edge Caching:** Given that GET operations are globally identical for a given `documentId` and `locale`, the response payloads will be cached at an Edge Gateway/CDN layer for minimum 5 minutes `TTL`.
- **Webhook Invalidation:** A Strapi Webhook linked to the `entry.publish` and `entry.unpublish` events will emit a targeted cache invalidation request to the Edge Gateway ensuring near real-time propagation of configuration updates.

### 3.9 Internationalisation Strategy

- Managed natively via Strapi's i18n plugin.
- A single `documentId` encompasses all language translations.
- Consumers append the query parameter `?locale=id` to fetch Indonesian copy. If unsupplied, the CMS defaults to `locale=en`.
- Fallbacks are explicit: If an ID translation is in 'Draft' but the EN version is 'Published', the API returns a 404 for the `?locale=id` request to avoid rendering split-language interfaces at runtime.

### 3.10 Error Handling

- **404 Not Found:** Supplied slug/documentId does not exist, or the explicitly requested locale translation is unpublished.
- **403 Forbidden:** Downstream consumer is attempting to execute a mutated REST operation (PUT/POST/DELETE).
- **500 Internal Server Error:** Standard fallback; original stack traces are automatically sanitized and stripped from the production payload to prevent security leakage.

---

## 4. Appendix

### 4.1 Glossaries

- **MFE (Micro-Frontend):** The client-facing application responsible for pulling Screen definitions from the CMS and rendering the native UI.
- **STP (Straight-Through Processing):** The backend orchestration engine responsible for digesting the CMS Journey definitions, verifying user input, and interacting with core banking/domain APIs.
- **Dynamic Zone:** A polymorphic array configuration in Strapi that allows authors to insert varied reusable components (`ui.button`, `ui.text-input`) sequentially into a defined layout slot forming the page.
- **State Binding:** A configuration mapping indicating which path in the global runtime state tree a form input should map its values to.
