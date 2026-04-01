type StrapiComponent = Record<string, unknown> & {
  __component?: string;
  id?: number;
};

type RawScreenMeta = {
  id?: number;
  title?: string | null;
  subtitle?: string | null;
  showBack?: boolean | null;
  showClose?: boolean | null;
  analytics?: unknown;
  onBack?: unknown;
};

export type RawScreenEntity = {
  id: number;
  documentId: string;
  screenId: string;
  content_version: number | null;
  hideProgressBar: boolean;
  meta: RawScreenMeta | null;
  header: StrapiComponent[];
  body: StrapiComponent[];
  footer: StrapiComponent[];
  contents: StrapiComponent[];
};

export type MappedScreen = {
  screenId: string;
  hideProgressBar: boolean;
  version: number;
  content: Record<string, unknown>;
};

// ui.button → "buttons"
// ui.radio-group → "radio_groups"
// ui.section-label → "section_labels"
const resolveContentKey = (component: string): string => {
  const suffix = component.split(".")[1]; // e.g. "radio-group"
  const snake = suffix.replace(/-/g, "_"); // e.g. "radio_group"

  // Basic irregular plurals
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

const stripStrapiFields = ({ __component, id, ...rest }: StrapiComponent): Record<string, unknown> => rest;

const groupComponents = (components: StrapiComponent[]): Record<string, unknown[]> => {
  return components.reduce<Record<string, unknown[]>>((acc, component) => {
    const rawComponent = component.__component;
    if (!rawComponent) return acc;

    const key = resolveContentKey(rawComponent);
    const stripped = stripStrapiFields(component);

    if (!acc[key]) acc[key] = [];
    acc[key].push(stripped);

    return acc;
  }, {});
};

const mergeGroupedComponents = (...groupedSets: Record<string, unknown[]>[]): Record<string, unknown[]> => {
  return groupedSets.reduce<Record<string, unknown[]>>((acc, grouped) => {
    for (const [key, items] of Object.entries(grouped)) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(...items);
    }
    return acc;
  }, {});
};

export const mapScreenResponse = (entity: RawScreenEntity): MappedScreen => {
  const { screenId, hideProgressBar, content_version, meta, header, body, footer, contents } = entity;

  const groupedHeader = groupComponents(header ?? []);
  const groupedBody = groupComponents(body ?? []);
  const groupedFooter = groupComponents(footer ?? []);
  const groupedContents = groupComponents(contents ?? []);

  const mergedComponents = mergeGroupedComponents(groupedHeader, groupedBody, groupedFooter, groupedContents);

  const metaFields: Record<string, unknown> = {
    ...(meta?.title !== undefined && { title: meta.title }),
    ...(meta?.subtitle !== undefined && { subtitle: meta.subtitle }),
    ...(meta?.showBack !== undefined && { show_back: meta.showBack }),
    ...(meta?.showClose !== undefined && { show_close: meta.showClose }),
    ...(meta?.analytics !== undefined && { analytics: meta.analytics }),
    ...(meta?.onBack !== undefined && { on_back: meta.onBack }),
  };

  return {
    screenId,
    hideProgressBar,
    version: content_version ?? 1,
    content: {
      ...metaFields,
      ...mergedComponents,
    },
  };
};
