type StrapiComponent = Record<string, unknown> & {
  __component?: string;
  id?: number;
};

export type RawStaticScreenEntity = {
  id: number;
  documentId: string;
  screenId: string;
  content_version: number | null;
  contents: StrapiComponent[];
};

export type MappedStaticScreen = {
  screenId: string;
  version: number;
  content: Record<string, unknown>;
  // Placeholder enriched by BE with user session / core banking data.
  // FE uses this to interpolate template tokens e.g. "Your Account, {accountName}"
  context: Record<string, unknown>;
};

// ui.button → "buttons"
// ui.item-list → "item_lists"
const resolveContentKey = (component: string): string => {
  const suffix = component.split(".")[1];
  const snake = suffix.replace(/-/g, "_");

  const IRREGULAR: Record<string, string> = {
    radio_group: "radio_groups",
    checkbox_list: "checkbox_lists",
    item_list: "item_lists",
    list_item: "list_items",
    rich_text: "rich_texts",
    image_preview: "image_previews",
    icon_text: "icon_texts",
    money_input: "money_inputs",
    text_input: "text_inputs",
    section_label: "section_labels",
    slide_to_confirm: "slide_to_confirms",
    camera_capture: "camera_captures",
    dropdown: "dropdowns",
    button: "buttons",
    banner: "banners",
    hero: "heroes",
  };

  return IRREGULAR[snake] ?? `${snake}s`;
};

// Components where each instance in the dynamic zone is one item.
// Multiple instances are collected into { items: [...] } rather than
// being exposed as individual objects.
const COLLECT_AS_ITEMS = new Set([
  "buttons",
  "kv_rows",
  "text_inputs",
  "list_items",
  "texts",
  "links",
  "badges",
  "icon_texts",
  "rows",
]);

// Components that stay as a plain array in the response.
// Each element keeps its own shape — e.g. item_lists → [{ key, items }, ...]
const KEEP_AS_ARRAY = new Set([
  "item_lists",
]);

const stripStrapiId = <T extends Record<string, unknown>>(obj: T): Omit<T, "id"> => {
  const { id, ...rest } = obj;
  return rest as Omit<T, "id">;
};

const stripNestedIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripNestedIds);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const stripped = stripStrapiId(obj);
    return Object.fromEntries(
      Object.entries(stripped)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNestedIds(v)]),
    );
  }
  return value;
};

const mapComponent = ({ __component, id, ...rest }: StrapiComponent): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(rest)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, stripNestedIds(v)]),
  );
};

// All content properties follow one of these three shapes:
//
//   KEEP_AS_ARRAY    → [ { key, items, ... }, ... ]   e.g. item_lists
//   COLLECT_AS_ITEMS → { items: [ ...all instances ] } e.g. buttons
//   has `options` array field → rename options → items, output as single object
//   everything else → first instance as direct object (singleton)
const groupComponents = (components: StrapiComponent[]): Record<string, unknown> => {
  // First pass: group by resolved content key
  const grouped = components.reduce<Record<string, Record<string, unknown>[]>>((acc, component) => {
    const rawComponent = component.__component;
    if (!rawComponent) return acc;

    const key = resolveContentKey(rawComponent);
    const mapped = mapComponent(component);

    if (!acc[key]) acc[key] = [];
    acc[key].push(mapped);

    return acc;
  }, {});

  // Second pass: shape each group into its final form
  return Object.fromEntries(
    Object.entries(grouped).map(([key, mappedArray]) => {
      // Plain array — each element keeps its own shape e.g. [{ key, items }, ...]
      if (KEEP_AS_ARRAY.has(key)) {
        return [key, mappedArray];
      }

      // Individual items collected into a wrapper object e.g. { items: [...] }
      if (COLLECT_AS_ITEMS.has(key)) {
        return [key, { items: mappedArray }];
      }

      // Take the first occurrence (singleton or self-contained collection)
      const first = mappedArray[0] ?? {};

      // Auto-remap: if the component has an `options` array field, rename it to `items`
      // Covers: tab_groups, radio_groups, dropdowns, etc.
      if (Array.isArray(first.options)) {
        const { options, ...rest } = first;
        return [key, { ...rest, items: options }];
      }

      return [key, first];
    }),
  );
};

export const mapStaticScreenResponse = (entity: RawStaticScreenEntity): MappedStaticScreen => {
  const { screenId, content_version, contents } = entity;

  const content = groupComponents(contents ?? []);

  return {
    screenId,
    version: content_version ?? 1,
    content,
    context: {},
  };
};
