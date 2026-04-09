/**
 * sdui.ts — SDUI TypeScript interfaces for frontend consumption
 *
 * Derived from the Strapi component schemas in:
 *   src/components/sdui/
 *   src/components/ui/
 *   src/api/screen/content-types/screen/schema.json
 *   src/api/journey/content-types/journey/schema.json
 */

// ─────────────────────────────────────────────────────────────────────────────
// Strapi primitives
// ─────────────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  url: string;
  mime: string;
  ext: string;
  size: number;
  width?: number;
  height?: number;
  alternativeText?: string | null;
  caption?: string | null;
  formats?: Record<string, unknown>;
}

/** Strapi Blocks (rich text) node */
export interface StrapiBlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: StrapiBlockChild[];
}

export interface StrapiBlock {
  type: "paragraph" | "heading" | "list" | "list-item" | "quote" | "code" | "image" | string;
  level?: number;
  format?: "ordered" | "unordered";
  children: StrapiBlockChild[];
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SDUI — Core components (sdui.*)
// ─────────────────────────────────────────────────────────────────────────────

/** sdui.binding — maps a component's value to a state path */
export interface SduiBinding {
  path: string;
  scope?: "journeyState" | "localState" | "serverState";
  defaultValue?: unknown;
  onClear?: Record<string, unknown>;
}

/** sdui.validation — single discrete validation rule (repeatable array on components) */
export interface SduiValidationRule {
  rule: "required" | "minLength" | "maxLength" | "pattern" | "match" | "ruleSet";
  /** String value for length / pattern / match rules */
  value?: string;
  message: string;
  ruleSet?: { id: number; documentId: string } | null;
}

/** sdui.dynamic-source — where a runtime injection comes from */
export interface SduiDynamicSource {
  type: "FACT" | "SERVICE";
  /** Dot-path into the dynamicFacts object. Used when type = FACT */
  path?: string;
  /** Downstream service code. Used when type = SERVICE */
  serviceCode?: string;
}

/** sdui.dynamic — declares a single runtime injection on a component field */
export interface SduiDynamic {
  enabled: boolean;
  /** CONTENT = textual replacement; OPTIONS = list replacement; VALUE = default value prefill */
  type: "CONTENT" | "OPTIONS" | "VALUE";
  target:
    | "label"
    | "title"
    | "subtitle"
    | "placeholder"
    | "description"
    | "helperText"
    | "richTextContent"
    | "options"
    | "defaultValue"
    | "prefill";
  source: SduiDynamicSource;
}

/** sdui.action — event handler attached to buttons, onTap, onComplete, etc. */
export interface SduiAction {
  key: string;
  type:
    | "navigate"
    | "start_journey"
    | "resume_journey"
    | "api_call"
    | "open_modal"
    | "open_sheet"
    | "open_confirm"
    | "open_native"
    | "set_state"
    | "open_document"
    | "submit_journey";
  payload?: Record<string, unknown>;
  guards?: Array<{ id: number; documentId: string }>;
  analytics?: Record<string, unknown>;
}

/** sdui.on-complete — action fired when a component self-completes (e.g. camera-capture) */
export interface SduiOnComplete {
  action: SduiAction;
}

/** sdui.visibility — rule-driven conditional visibility */
export interface SduiVisibility {
  rule?: { id: number; documentId: string } | null;
  elseHidden?: boolean;
}

/** sdui.source — read-only state path for display-only components */
export interface SduiSource {
  path: string;
  scope?: "journeyState" | "localState" | "serverState";
  transform?: "none" | "capitalize" | "uppercase" | "currency" | "date" | "mask";
  format?: "none" | "currency" | "date" | "percent";
  currency?: string;
}

/** sdui.data-source — live API descriptor for async selectable components */
export interface SduiDataSource {
  endpoint: string;
  method?: "GET" | "POST";
  params?: Record<string, unknown>;
  /** Maps API response fields to option keys, e.g. { key: "code", label: "name" } */
  mapping: Record<string, string>;
  cache?: boolean;
  cacheTtlMs?: number;
}

/** sdui.screen-meta — screen-level navigation bar configuration */
export interface SduiScreenMeta {
  label?: string;
  title?: string;
  subtitle?: string;
  enableBackButton?: boolean;
  enableCloseButton?: boolean;
  onBack?: SduiAction;
  analytics?: Record<string, unknown>;
}

/**
 * JSON valueSource field used by display components (ui.text, ui.image-preview, etc.)
 * to read a value from state rather than from the static CMS label.
 */
export interface ValueSource {
  type: "binding" | "journeyState" | "localState" | "serverState";
  path: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI component shared base
// ─────────────────────────────────────────────────────────────────────────────

interface UiBase {
  id?: number;
  componentId?: string;
  testId?: string;
  span?: number;
  binding?: SduiBinding | null;
  validations?: SduiValidationRule[];
  dynamic?: SduiDynamic | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitive / nested sub-components (not dynamic zone members)
// ─────────────────────────────────────────────────────────────────────────────

/** ui.option — single selectable item inside dropdown / radio-group / tab-group */
export interface UiOption {
  id?: number;
  componentId?: string;
  testId?: string;
  /** Stored value submitted to state */
  value: string;
  label: string;
  description?: string;
  icon?: StrapiMedia | null;
  onTap?: SduiAction | null;
  binding?: SduiBinding | null;
  validations?: SduiValidationRule[];
}

/** ui.list-item — single row inside ui.item-list */
export interface UiListItem {
  id?: number;
  testId?: string;
  key: string;
  label: string;
  description?: string;
  icon?: StrapiMedia | null;
  tab?: string;
  onTap?: SduiAction | null;
  visibility?: SduiVisibility | null;
  binding?: SduiBinding | null;
  validations?: SduiValidationRule[];
  dynamic?: SduiDynamic | null;
  span?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components — Header zone
// ─────────────────────────────────────────────────────────────────────────────

export interface UiProgressBar extends UiBase {
  __component: "ui.progress-bar";
  name?: string;
  currentStep: number;
  maxStep: number;
  enabled?: boolean;
  visible?: boolean;
}

export interface UiText extends UiBase {
  __component: "ui.text";
  label?: string;
  name?: string;
  variant?: "title" | "subtitle" | "body" | "note" | "caption" | "label";
  enabled?: boolean;
  visible?: boolean;
  valueSource?: ValueSource | null;
  placement?: Record<string, unknown> | null;
}

export interface UiImagePreview extends UiBase {
  __component: "ui.image-preview";
  label?: string;
  name?: string;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
  placement?: Record<string, unknown> | null;
  media?: StrapiMedia | null;
  /** JSON path to a base64 image stored in state */
  valueSource?: Record<string, unknown> | null;
}

export interface UiBanner extends UiBase {
  __component: "ui.banner";
  label: string;
  variant?: "info" | "warning" | "success" | "error";
  icon?: StrapiMedia | null;
  onTap?: SduiAction | null;
  visibility?: SduiVisibility | null;
}

export interface UiTabGroup extends UiBase {
  __component: "ui.tab-group";
  options: UiOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components — Body zone
// ─────────────────────────────────────────────────────────────────────────────

export interface UiRadioGroup extends UiBase {
  __component: "ui.radio-group";
  label?: string;
  options: UiOption[];
  visibility?: SduiVisibility | null;
}

export interface UiCheckbox extends UiBase {
  __component: "ui.checkbox";
  label: string;
  name?: string;
  title?: string;
  defaultValue?: boolean;
  required?: boolean;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
}

export interface UiTextInput extends UiBase {
  __component: "ui.text-input";
  label: string;
  name?: string;
  placeholder?: string;
  helperText?: string;
  prefix?: string;
  inputMode?: "text" | "numeric" | "email" | "phone";
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
}

export interface UiDateInput extends UiBase {
  __component: "ui.date-input";
  label: string;
  name?: string;
  placeholder?: string;
  /** Display format, e.g. "dd MMM yyyy" */
  displayFormat?: string;
  /** Value format, e.g. "yyyy-MM-dd" */
  valueFormat?: string;
  defaultValue?: string;
  required?: boolean;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
}

export interface UiDropdown extends UiBase {
  __component: "ui.dropdown";
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  searchable?: boolean;
  required?: boolean;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
  options: UiOption[];
}

export interface UiDropdownAsync extends UiBase {
  __component: "ui.dropdown-async";
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  searchable?: boolean;
  required?: boolean;
  enabled?: boolean;
  editable?: boolean;
  visible?: boolean;
  /** JSON data source descriptor */
  dataSource?: Record<string, unknown> | null;
}

export interface UiMoneyInput extends UiBase {
  __component: "ui.money-input";
  label?: string;
  currency?: string;
  min?: number;
  max?: number;
  visibility?: SduiVisibility | null;
}

export interface UiCameraCapture extends UiBase {
  __component: "ui.camera-capture";
  name?: string;
  overlayShape?: "rectangle" | "circle" | "none";
  overlayAspect?: string;
  overlayHint?: string;
  onComplete: SduiOnComplete;
}

export interface UiItemList {
  __component: "ui.item-list";
  id?: number;
  testId?: string;
  /** Unique identifier for this list */
  key: string;
  label?: string;
  filterBy?: SduiBinding | null;
  options: UiListItem[];
  binding?: SduiBinding | null;
  validations?: SduiValidationRule[];
  dynamic?: SduiDynamic | null;
  span?: number;
}

export interface UiReviewCard extends UiBase {
  __component: "ui.review-card";
  label?: string;
  name?: string;
  enabled?: boolean;
  visible?: boolean;
  /** Key-value pairs for the summary rows */
  options: Record<string, unknown>;
}

export interface UiMoneyDisplay extends UiBase {
  __component: "ui.money-display";
  label?: string;
  currency?: string;
  source: SduiSource;
}

export interface UiPasscodeInput extends UiBase {
  __component: "ui.passcode-input";
  length?: number;
  masked?: boolean;
  keyboard?: "numpad" | "default";
  onForgot?: SduiAction | null;
  onComplete: SduiOnComplete;
}

export interface UiRichText extends UiBase {
  __component: "ui.rich-text";
  content: StrapiBlock[];
  visibility?: SduiVisibility | null;
}

export interface UiLink extends UiBase {
  __component: "ui.link";
  label: string;
  action?: SduiAction | null;
}

export interface UiDivider extends UiBase {
  __component: "ui.divider";
  label?: string;
  name?: string;
  visible?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Button action payloads
// ─────────────────────────────────────────────────────────────────────────────

/** Advance to the next screen in the journey flow */
export interface NextScreenActionPayload {
  type: "NEXT_SCREEN";
}

/** Go back to the previous screen in the journey flow */
export interface PrevScreenActionPayload {
  type: "PREV_SCREEN";
}

/** Exit / complete the journey */
export interface FinishJourneyActionPayload {
  type: "FINISH_JOURNEY";
}

/**
 * NavigateActionPayload — union of all in-journey screen navigation actions.
 * Used as the `action` value on `UiButton` when the button moves the user
 * between screens without triggering an API call or external service.
 */
export type NavigateActionPayload = NextScreenActionPayload | PrevScreenActionPayload | FinishJourneyActionPayload;

/** Social login via an identity provider */
export interface SocialLoginActionPayload {
  type: "SOCIAL_LOGIN";
  provider: "GOOGLE" | "APPLE";
}

/**
 * ButtonAction — discriminated union of every action type a `UiButton` can carry.
 * Navigation actions are grouped under `NavigateActionPayload`; other action
 * types that need richer orchestration use `SduiAction` directly.
 */
export type ButtonAction = NavigateActionPayload | SocialLoginActionPayload | SduiAction;

// ─────────────────────────────────────────────────────────────────────────────
// UI Components — Footer zone
// ─────────────────────────────────────────────────────────────────────────────

export interface UiButton extends UiBase {
  __component: "ui.button";
  label: string;
  name?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "promo";
  enabled?: boolean;
  visible?: boolean;
  action?: ButtonAction | null;
  icon?: Record<string, unknown> | null;
  placement?: Record<string, unknown> | null;
}

export interface UiSlideToConfirm extends UiBase {
  __component: "ui.slide-to-confirm";
  label: string;
  action: SduiAction;
  guardRules?: Array<{ id: number; documentId: string }>;
  visibility?: SduiVisibility | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic zone union types
// ─────────────────────────────────────────────────────────────────────────────

export type HeaderComponent = UiProgressBar | UiText | UiImagePreview | UiBanner | UiTabGroup;

export type FooterComponent = UiSlideToConfirm | UiButton | UiBanner | UiDivider;

export type BodyComponent =
  | UiText
  | UiBanner
  | UiRadioGroup
  | UiCheckbox
  | UiTextInput
  | UiDateInput
  | UiDropdown
  | UiDropdownAsync
  | UiMoneyInput
  | UiCameraCapture
  | UiImagePreview
  | UiItemList
  | UiReviewCard
  | UiMoneyDisplay
  | UiTabGroup
  | UiPasscodeInput
  | UiRichText
  | UiLink
  | UiDivider;

export type AnyUiComponent = HeaderComponent | FooterComponent | BodyComponent;

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export interface Screen {
  id: number;
  documentId: string;
  screenId: string;
  screenKey: string;
  version: number;
  meta: SduiScreenMeta;
  header: HeaderComponent[];
  body: BodyComponent[];
  footer: FooterComponent[];
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Journey
// ─────────────────────────────────────────────────────────────────────────────

export type JourneyPresentation =
  | "card"
  | "modal"
  | "transparentModal"
  | "containedModal"
  | "containedTransparentModal"
  | "fullScreenModal"
  | "formSheet";

export interface Journey {
  id: number;
  documentId: string;
  journeyId: string;
  version: number;
  presentation?: JourneyPresentation;
  /** Screen ID to show before the journey initiates (e.g. a loading or pre-check screen) */
  preInitiateScreen: string;
  navigator?: string;
  /** Initial journey state — keys depend on the specific journey */
  initialState?: Record<string, unknown>;
  screens?: Screen[];
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API response wrappers
// ─────────────────────────────────────────────────────────────────────────────

export type ScreenResponse = StrapiResponse<Screen>;
export type JourneyResponse = StrapiResponse<Journey>;
export type ScreenListResponse = StrapiResponse<Screen[]>;
export type JourneyListResponse = StrapiResponse<Journey[]>;
