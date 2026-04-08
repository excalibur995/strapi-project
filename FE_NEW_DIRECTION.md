Ready for review
Select text to add comments on the plan
Plan: Update README & Frontend Implementation Guide for New Schema
Context
The Strapi component schemas and content-type schemas were refactored to use a flat, baseline-aligned structure. The existing frontend docs (README.md and SDUI_FRONTEND_IMPLEMENTATION_GUIDE.md) still describe the old SDUI sub-component model (nested binding, validation, visibility, source objects). They also reference deleted components and missing new ones. Frontend developers and AI agents reading these docs will generate incorrect types and broken implementations.

Files to Modify
README.md — TypeScript interface definitions for all UI components
SDUI_FRONTEND_IMPLEMENTATION_GUIDE.md — Rendering pipeline, interfaces, input/action patterns, agent directives
What Changed (Schema → Docs Impact)
Journey
journeyId → flowId; removed slug, name, description, segment, checkpointEnabled, navigator (now string), api_version/content_version → version (decimal)
Screen
Added screenKey (string, required)
Removed description
api_version + content_version → version (decimal)
sdui.screen-meta: showBack/showClose → enableBackButton/enableCloseButton; added label
Components — Flat fields replace SDUI sub-components
Component Old New
ui.text text, variant (4 values), visibility label, name, variant (6 values: adds subtitle/note), enabled, visible, valueSource (JSON), placement (JSON)
ui.text-input keyboard, secured, binding, validation[], visibility name, inputMode (enum), defaultValue, minLength, maxLength, required, enabled, editable, visible, validations (JSON), conditions (JSON)
ui.button variant (4), guardRules, visibility name, variant (5: adds promo), enabled, visible, action (JSON), icon (JSON), placement (JSON)
ui.image-preview source (sdui.source) name, enabled, editable, visible, valueSource (JSON), placement (JSON)
ui.review-card rows (ui.kv-row[]), badges, allowChange, onEdit, visibility name, enabled, visible, options (JSON array [{id, label, value}])
ui.dropdown binding, validation[], visibility name, required, enabled, editable, visible, conditions (JSON); options (ui.option[]) stays
ui.dropdown-async dataSource (sdui.data-source component), binding, validation[], visibility name, required, enabled, editable, visible, dataSource (JSON flat), conditions (JSON)
Deleted
ui.kv-row — row layout handled by span on body-level components
New Components
ui.progress-bar — name, currentStep, maxStep, enabled, visible, span
ui.date-input — label, name, placeholder, displayFormat, valueFormat, defaultValue, required, enabled, editable, visible, validations (JSON), conditions (JSON)
ui.divider — label, name, visible
ui.checkbox — label, name, title, defaultValue, required, enabled, editable, visible
ui.card — name, variant, title, subtitle, icon, valueSource (JSON), enabled, visible
README.md Changes
Section "Common Types"
Remove SduiBinding, SduiVisibility, SduiSource from the common types (they're no longer fields on flat components)
Keep SduiAction as JSON shape { type: string; [key: string]: any }
Update existing interfaces
TextWidget: text → label; add name, enabled, visible, valueSource?, placement?; variant: add "subtitle" | "note"; remove visibility
ButtonWidget: add name, enabled, visible, action (plain JSON), icon? (JSON), placement? (JSON); variant add "promo"; remove guardRules, visibility
TextInputWidget: rename keyboard → inputMode; remove secured, binding, validation, visibility; add name, defaultValue?, minLength?, maxLength?, required, enabled, editable, visible, validations? (any[]), conditions?
DropdownWidget: remove binding, validation, visibility; add name, required, enabled, editable, visible, conditions?
ImagePreviewWidget: remove source; add name, enabled, editable, visible, valueSource?, placement?
ReviewCardWidget: rename rows → options (type: Array<{id: string; label: string; value: string}>); remove badges, allowChange, onEdit, visibility; add name, enabled, visible
AsyncSelectorWidget (dropdown-async, radio-group-async, checkbox-list-async): change dataSource from SDUI component type to plain JSON; add name, required, enabled, editable, visible, conditions?; remove binding, validation, visibility from dropdown-async only
Remove
KVRowWidget (deleted component)
Add new interfaces
interface ProgressBarWidget { name?, currentStep, maxStep, enabled, visible, span? }
interface DateInputWidget { label, name?, placeholder?, displayFormat?, valueFormat?, defaultValue?, required, enabled, editable, visible, validations?, conditions? }
interface DividerWidget { label?, name?, visible }
interface CheckboxWidget { label, name?, title?, defaultValue, required, enabled, editable, visible }
interface CardWidget { name?, variant, title?, subtitle?, icon?, valueSource?, enabled, visible }
Screen Meta
Update ScreenMeta interface: showBack/showClose → enableBackButton/enableCloseButton; add label?

Versioning
Update any reference to api_version/content_version → version: number

SDUI_FRONTEND_IMPLEMENTATION_GUIDE.md Changes
Section 1 — Rendering Pipeline
Step 4: Update "State Management" — no longer via sdui.binding on components; inputs store to JourneyState using the component's name field as the state key
Step 5: Update "Event Execution" — actions are now plain JSON on ui.button.action, not sdui.action component objects
Section 2 — Global State & Context
Update JourneyStore — updateField(name, value) keyed by component name (not binding.path)
Section 3 — Core TypeScript Interfaces
Apply all interface changes from README.md above
Remove SDUIBinding, SDUIVisibility interfaces (no longer component fields on flat components)
Update SDUIAction to plain JSON shape
Update ScreenMeta: showBack/showClose → enableBackButton/enableCloseButton
Section 4 — Component Registry
Add new components: ui.progress-bar, ui.date-input, ui.divider, ui.checkbox, ui.card
Remove ui.kv-row
Section 5 — Dynamic Renderer
Remove useVisibilityEvaluator(visibility) from DynamicBlock — visibility is now a flat visible: boolean field
Updated DynamicBlock: check block.visible === false to skip rendering
Section 6 — Input & Bindings
Rewrite TextInputComponent example: no binding prop; use block.name as state key; inputMode instead of keyboardType; inline validations array
Section 7 — Action Engine
Update: action is plain JSON { type, ...payload } directly on the component, not a nested sdui.action object
Remove guard evaluation from action executor (guards removed from button/slide-to-confirm)
Section 8 — Agent Directives
Update directive: inputs wire to JourneyState using component name (not binding.path)
Update directive: visible: boolean field controls visibility (not sdui.visibility hook)
Update directive: validations is a JSON array on the component itself (not a repeatable SDUI sub-component)
Update directive: action, icon, placement on buttons are plain JSON — parse directly, no sub-component hydration needed
Verification
After updating:

Search for any remaining binding.path, sdui.binding, sdui.visibility, sdui.source, showBack, showClose, api_version, content_version, kv-row in both files — all should be gone
Check all TypeScript interfaces compile cleanly against the actual schema JSON files in src/components/ui/
Confirm new components (progress-bar, date-input, divider, checkbox, card) appear in the registry section
