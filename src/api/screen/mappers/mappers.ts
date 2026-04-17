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

export type MappedScreen = Exclude<RawScreenEntity, "header" | "body" | "footer"> & {
  sections?: Array<{
    type: "header" | "body" | "footer";
    components: any[];
  }>;
};

// ui.button → "Button", ui.radio-group → "RadioGroup"
const COMPONENT_TYPE_MAP: Record<string, string> = {
  "ui.progress-bar": "ProgressBar",
  "ui.text": "Text",
  "ui.image-preview": "ImagePreview",
  "ui.banner": "Banner",
  "ui.tab-group": "TabGroup",
  "ui.radio-group": "RadioGroup",
  "ui.checkbox": "Checkbox",
  "ui.text-input": "TextInput",
  "ui.date-input": "DateInput",
  "ui.dropdown": "Dropdown",
  "ui.money-input": "MoneyInput",
  "ui.camera-capture": "CameraCapture",
  "ui.item-list": "ItemList",
  "ui.money-display": "MoneyDisplay",
  "ui.passcode-input": "PasscodeInput",
  "ui.rich-text": "RichText",
  "ui.link": "Link",
  "ui.divider": "Divider",
  "ui.review-card": "ReviewCard",
  "ui.slide-to-confirm": "SlideToConfirm",
  "ui.button": "Button",
  "ui.option": "Option",
};

const resolveComponentType = (component: string): string => {
  return COMPONENT_TYPE_MAP[component] ?? "Unknown";
};

// ui.button → "buttons"
// ui.radio-group → "radio_groups"
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

const stripStrapiFields = ({ __component, id, ...rest }: StrapiComponent): Record<string, unknown> => {
  const result = { ...rest };
  if (__component) {
    result.type = resolveComponentType(__component);
  }
  return result;
};

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

const stripComponents = (components: StrapiComponent[]): Record<string, unknown>[] => components.map(stripStrapiFields);

export const mapScreenResponse = (entity: RawScreenEntity) => {
  const groupedHeader = groupComponents(entity.header ?? []);
  const groupedBody = groupComponents(entity.body ?? []);
  const groupedFooter = groupComponents(entity.footer ?? []);

  const removedKey = ["documentId", "createdAt", "updatedAt", "publishedAt", "locale"];

  const sections: MappedScreen["sections"] = [];
  if (entity.header.length > 0) {
    sections.push({ type: "header", components: stripComponents(entity.header) });
  }
  if (entity.body.length > 0) {
    sections.push({ type: "body", components: stripComponents(entity.body) });
  }
  if (entity.footer.length > 0) {
    sections.push({ type: "footer", components: stripComponents(entity.footer) });
  }

  const cleanedRest = Object.fromEntries(Object.entries(entity).filter(([key]) => !removedKey.includes(key)));

  return { ...cleanedRest };
};
