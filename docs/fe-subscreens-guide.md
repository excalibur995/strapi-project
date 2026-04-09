# Subscreens — Frontend Implementation Guide

This document describes how to implement **subscreen** support in the React Native SDUI app. The Strapi backend now returns an optional `subscreens` array on any Screen response. The frontend must handle internal navigation within subscreens while keeping the journey's screen index (and progress bar) unchanged.

---

## 1. What Changed on the Backend

The Screen content type now has an optional `subscreens` field — a `oneToMany` relation to other Screen entries. When a screen has subscreens, the API response looks like:

```json
{
  "data": {
    "screenId": "ektp_verification",
    "meta": { "title": "eKTP Verification", "enableBackButton": true },
    "header": [{ "__component": "ui.progress-bar", ... }],
    "body": [],
    "footer": [],
    "subscreens": [
      {
        "screenId": "ektp_instructions",
        "meta": { "title": "e-KTP Instructions", ... },
        "header": [...],
        "body": [{ "__component": "ui.icon-text", ... }, ...],
        "footer": [{ "__component": "ui.button", "action": { "type": "NEXT_SCREEN" }, ... }]
      },
      {
        "screenId": "ektp_camera",
        "meta": { "title": "Capture e-KTP", ... },
        "header": [...],
        "body": [{ "__component": "ui.camera-capture", ... }],
        "footer": [{ "__component": "ui.button", "action": { "type": "NEXT_SCREEN" }, ... }]
      },
      {
        "screenId": "ektp_info_form",
        "meta": { "title": "Your e-KTP details", ... },
        "header": [...],
        "body": [{ "__component": "ui.text-input", ... }, ...],
        "footer": [{ "__component": "ui.button", "action": { "type": "NEXT_SCREEN" }, ... }]
      }
    ]
  }
}
```

**Key rules:**
- If `subscreens` is absent or empty, the screen works exactly as before (no changes needed).
- If `subscreens` has entries, the frontend renders subscreens sequentially instead of the parent's body/footer.
- The parent's `header` (e.g. progress bar) can optionally be shared across subscreens — see Section 5.
- Each subscreen has its own complete `meta`, `header`, `body`, and `footer`.

Two additional boolean fields exist on the parent screen:
- `isHeaderNullInstead` (default `false`) — when `true`, the parent screen's header zone should be treated as `null` (not rendered, not inherited).
- `isFooterNullInstead` (default `false`) — when `true`, the parent screen's footer zone should be treated as `null`.

---

## 2. Type Changes

Update `src/types/sdui.types.ts`:

```typescript
// Add subscreens to the Screen interface
interface Screen {
  screenId: string;
  meta: SduiScreenMeta;
  header: HeaderComponent[];
  body: BodyComponent[];
  footer: FooterComponent[];
  // NEW
  subscreens?: Screen[];
  isHeaderNullInstead?: boolean;
  isFooterNullInstead?: boolean;
}
```

No new component types or action types are needed.

---

## 3. Subscreen State Management

Add a `subscreenIndex` to the journey session in `src/store/useJourneyStore.ts`:

```typescript
interface JourneySession {
  currentScreenIndex: number;
  journeyState: Record<string, unknown>;
  // NEW — tracks which subscreen is active (undefined = no subscreens)
  subscreenIndex?: number;
}
```

**Important:** `subscreenIndex` is local to the current screen. When the journey advances to the next screen, reset `subscreenIndex` to `0` (or `undefined`).

---

## 4. Navigation Logic Changes

### File: `src/hooks/useJourneyNavigation.ts`

Update the navigation handler to be subscreen-aware. The core logic:

```
On NEXT_SCREEN:
  1. Run validateAll() — block if invalid
  2. Check: does current screen have subscreens?
     YES → Is this the last subscreen?
       YES → Advance journey screen index (existing behavior)
       NO  → Increment subscreenIndex (stay on same journey screen)
     NO  → Advance journey screen index (existing behavior)

On PREV_SCREEN:
  1. No validation (existing behavior)
  2. Check: does current screen have subscreens AND subscreenIndex > 0?
     YES → Decrement subscreenIndex
     NO  → Go to previous journey screen (existing behavior)
```

Pseudocode:

```typescript
function handleNavigate(action: SduiAction, screen: Screen) {
  if (action.type === 'NEXT_SCREEN') {
    const isValid = validateAll();
    if (!isValid) return;

    if (screen.subscreens?.length && subscreenIndex < screen.subscreens.length - 1) {
      // Advance within subscreens
      updateSession(journeyId, { subscreenIndex: subscreenIndex + 1 });
      return;
    }

    // Advance to next journey screen (existing logic)
    advanceToNextScreen();
  }

  if (action.type === 'PREV_SCREEN') {
    if (screen.subscreens?.length && subscreenIndex > 0) {
      // Go back within subscreens
      updateSession(journeyId, { subscreenIndex: subscreenIndex - 1 });
      return;
    }

    // Go to previous journey screen (existing logic)
    goToPreviousScreen();
  }
}
```

### File: `src/hooks/useDynamicScreenState.ts`

The `handleNavigate` function here gates forward navigation with validation. Update it to call the subscreen-aware logic from `useJourneyNavigation` instead of directly calling `navigation.navigate()`.

---

## 5. Rendering Changes

### File: `src/components/core/DynamicScreenZone.tsx`

This is the main screen shell. It currently loads screen data and renders three zones. Update it to detect subscreens and render the active subscreen instead.

```typescript
function DynamicScreenZone({ route }) {
  const { journeyId, screenId } = route.params;
  const { data: screen } = useScreen(screenId);
  const session = useJourneyStore(state => state.getSession(journeyId));
  const subscreenIndex = session?.subscreenIndex ?? 0;

  // Determine what to render
  const hasSubscreens = screen?.subscreens && screen.subscreens.length > 0;
  const activeScreen = hasSubscreens ? screen.subscreens[subscreenIndex] : screen;

  // The active screen's zones
  const headerBlocks = activeScreen?.header ?? [];
  const bodyBlocks = activeScreen?.body ?? [];
  const footerBlocks = activeScreen?.footer ?? [];

  // Render using existing pipeline — no changes to DynamicZoneRenderer needed
  return (
    <ValidationProvider>
      <ScreenHeader meta={activeScreen?.meta} />
      <ScrollView>
        <DynamicZoneRenderer blocks={headerBlocks} ... />
        <DynamicZoneRenderer blocks={bodyBlocks} ... />
      </ScrollView>
      <DynamicZoneRenderer blocks={footerBlocks} ... />  {/* sticky footer */}
    </ValidationProvider>
  );
}
```

**Key points:**
- `DynamicZoneRenderer` does not change — it already renders any array of SDUI blocks.
- `ScreenHeader` receives the active subscreen's `meta` (so the title/back button can differ per subscreen).
- `ValidationProvider` wraps the active subscreen — when `subscreenIndex` changes, fields re-register their validations.

### Validation re-registration

When `subscreenIndex` changes, the rendered widgets change. Since widgets register/unregister validations on mount/unmount (via `useEffect`), this works automatically. No validation changes needed.

---

## 6. Progress Bar Behavior

The progress bar should **not advance** across subscreens — all subscreens belong to the same journey step.

Two approaches (pick one):

### Option A: Parent's progress bar (recommended)

If the parent screen has a progress bar in its `header`, render it above the active subscreen. The parent's header acts as a persistent shell:

```typescript
const parentHeader = screen?.header ?? [];  // progress bar lives here
const activeBody = activeScreen?.body ?? [];
const activeFooter = activeScreen?.footer ?? [];

return (
  <ValidationProvider>
    <ScreenHeader meta={activeScreen?.meta} />
    <ScrollView>
      {/* Parent header (progress bar) — always visible */}
      <DynamicZoneRenderer blocks={parentHeader} ... />
      {/* Active subscreen header (if any, below progress bar) */}
      <DynamicZoneRenderer blocks={activeScreen?.header ?? []} ... />
      {/* Active subscreen body */}
      <DynamicZoneRenderer blocks={activeBody} ... />
    </ScrollView>
    <DynamicZoneRenderer blocks={activeFooter} ... />
  </ValidationProvider>
);
```

### Option B: Duplicate progress bar on each subscreen

Put the same progress bar config in each subscreen's `header` in Strapi. No frontend logic needed — each subscreen renders its own header. The step value stays the same across all subscreens because the content editor sets it that way.

---

## 7. Screen Transition

When `subscreenIndex` changes, the body content swaps. Consider adding a transition animation:

```typescript
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View key={subscreenIndex} entering={FadeIn} exiting={FadeOut}>
  <DynamicZoneRenderer blocks={activeBody} ... />
</Animated.View>
```

The `key={subscreenIndex}` forces React to unmount/remount, which also triggers proper validation cleanup and re-registration.

---

## 8. File Change Summary

| File | Change |
|---|---|
| `src/types/sdui.types.ts` | Add `subscreens?: Screen[]`, `isHeaderNullInstead?: boolean`, `isFooterNullInstead?: boolean` to `Screen` |
| `src/store/useJourneyStore.ts` | Add `subscreenIndex?: number` to `JourneySession` |
| `src/hooks/useJourneyNavigation.ts` | Subscreen-aware NEXT/PREV logic |
| `src/hooks/useDynamicScreenState.ts` | Pass subscreen context to navigation handler |
| `src/components/core/DynamicScreenZone.tsx` | Detect subscreens, render active subscreen |

**Files that do NOT change:**
- `DynamicZoneRenderer.tsx` — already renders any block array
- `ComponentRegistry.ts` — no new widget types
- `ValidationContext.tsx` — mount/unmount lifecycle handles re-registration
- Widget files — no changes needed
- `MainNavigator.tsx` / `CurrentAccountJourneyNavigator.tsx` — journey routes are unchanged (subscreens don't create new routes)

---

## 9. Edge Cases

| Scenario | Behavior |
|---|---|
| Screen has 0 subscreens | Render normally (backward compatible) |
| Screen has 1 subscreen | Render that single subscreen. NEXT advances the journey. |
| User kills app mid-subscreen | `subscreenIndex` is persisted in MMKV via Zustand. On resume, the correct subscreen renders. |
| Deep link to a parent screen | Start at `subscreenIndex = 0` |
| Back on first subscreen | Same as back on a regular screen (previous journey screen or exit) |

---

## 10. Testing Checklist

- [ ] Screen without subscreens renders exactly as before
- [ ] Screen with subscreens renders `subscreens[0]` initially
- [ ] NEXT_SCREEN on non-last subscreen increments `subscreenIndex`
- [ ] NEXT_SCREEN on last subscreen advances journey to next screen
- [ ] PREV_SCREEN on `subscreenIndex > 0` decrements `subscreenIndex`
- [ ] PREV_SCREEN on `subscreenIndex === 0` goes to previous journey screen
- [ ] Validation runs per-subscreen (only active subscreen's fields are validated)
- [ ] Progress bar step stays constant across all subscreens
- [ ] Journey state (`journeyState`) is shared across all subscreens (e.g., camera capture result is readable in the info form)
- [ ] App restart mid-subscreen resumes at correct subscreen
- [ ] `ScreenHeader` shows correct title/back button per subscreen
