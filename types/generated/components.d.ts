import type { Schema, Struct } from '@strapi/strapi';

export interface SduiAction extends Struct.ComponentSchema {
  collectionName: 'components_sdui_actions';
  info: {
    description: 'Generic action for slots.actions and inline component events';
    displayName: 'Action';
  };
  attributes: {
    analytics: Schema.Attribute.JSON;
    guards: Schema.Attribute.Relation<'manyToMany', 'api::rule-set.rule-set'>;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    payload: Schema.Attribute.JSON;
    type: Schema.Attribute.Enumeration<
      [
        'navigate',
        'start_journey',
        'resume_journey',
        'api_call',
        'open_modal',
        'open_sheet',
        'open_confirm',
        'open_native',
        'set_state',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SduiBinding extends Struct.ComponentSchema {
  collectionName: 'components_sdui_bindings';
  info: {
    description: 'State path binding for a component';
    displayName: 'Binding';
  };
  attributes: {
    defaultValue: Schema.Attribute.JSON;
    onClear: Schema.Attribute.JSON;
    path: Schema.Attribute.String & Schema.Attribute.Required;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    syncDebounceMs: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1000>;
    syncOnChange: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SduiDataSource extends Struct.ComponentSchema {
  collectionName: 'components_sdui_data_sources';
  info: {
    description: 'Live API data source for async selectable components';
    displayName: 'Data Source';
  };
  attributes: {
    cache: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    cacheTtlMs: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<300000>;
    endpoint: Schema.Attribute.String & Schema.Attribute.Required;
    mapping: Schema.Attribute.JSON & Schema.Attribute.Required;
    method: Schema.Attribute.Enumeration<['GET', 'POST']> &
      Schema.Attribute.DefaultTo<'GET'>;
    params: Schema.Attribute.JSON;
  };
}

export interface SduiOnComplete extends Struct.ComponentSchema {
  collectionName: 'components_sdui_on_completes';
  info: {
    description: 'Action fired when a component self-completes';
    displayName: 'On Complete';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    payload: Schema.Attribute.JSON;
    type: Schema.Attribute.Enumeration<
      ['navigate', 'api_call', 'open_sheet', 'open_modal']
    > &
      Schema.Attribute.Required;
  };
}

export interface SduiSource extends Struct.ComponentSchema {
  collectionName: 'components_sdui_sources';
  info: {
    description: 'Read-only state path for display components';
    displayName: 'Source';
  };
  attributes: {
    currency: Schema.Attribute.String;
    format: Schema.Attribute.Enumeration<
      ['none', 'currency', 'date', 'percent']
    > &
      Schema.Attribute.DefaultTo<'none'>;
    path: Schema.Attribute.String & Schema.Attribute.Required;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    transform: Schema.Attribute.Enumeration<
      ['none', 'capitalize', 'uppercase', 'currency', 'date', 'mask']
    > &
      Schema.Attribute.DefaultTo<'none'>;
  };
}

export interface SduiValidation extends Struct.ComponentSchema {
  collectionName: 'components_sdui_validations';
  info: {
    description: 'Single discrete validation rule. Used as repeatable \u2014 one entry per constraint.';
    displayName: 'Validation Rule';
  };
  attributes: {
    message: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    rule: Schema.Attribute.Enumeration<
      ['required', 'minLength', 'maxLength', 'pattern', 'match', 'ruleSet']
    > &
      Schema.Attribute.Required;
    ruleSet: Schema.Attribute.Relation<'oneToOne', 'api::rule-set.rule-set'>;
    value: Schema.Attribute.String;
  };
}

export interface SduiVisibility extends Struct.ComponentSchema {
  collectionName: 'components_sdui_visibilities';
  info: {
    description: 'Rule-driven visibility for any component';
    displayName: 'Visibility';
  };
  attributes: {
    elseHidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    rule: Schema.Attribute.Relation<'oneToOne', 'api::rule-set.rule-set'>;
  };
}

export interface UiAccountSelector extends Struct.ComponentSchema {
  collectionName: 'components_ui_account_selectors';
  info: {
    description: 'Live account picker from API. type: ui.account-selector';
    displayName: 'Account Selector';
  };
  attributes: {
    allowChange: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    display: Schema.Attribute.JSON;
    endpoint: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    params: Schema.Attribute.JSON;
  };
}

export interface UiBadge extends Struct.ComponentSchema {
  collectionName: 'components_ui_badges';
  info: {
    description: 'Conditional label badge inside review-card';
    displayName: 'Badge';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false>;
    variant: Schema.Attribute.Enumeration<
      ['success', 'warning', 'info', 'error']
    > &
      Schema.Attribute.DefaultTo<'info'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiBanner extends Struct.ComponentSchema {
  collectionName: 'components_ui_banners';
  info: {
    description: 'Contextual banner. type: ui.banner';
    displayName: 'Banner';
  };
  attributes: {
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false>;
    value: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    variant: Schema.Attribute.Enumeration<
      ['info', 'warning', 'success', 'error']
    > &
      Schema.Attribute.DefaultTo<'info'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiCameraCapture extends Struct.ComponentSchema {
  collectionName: 'components_ui_camera_captures';
  info: {
    description: 'Document camera with overlay. type: ui.camera-capture';
    displayName: 'Camera Capture';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    mode: Schema.Attribute.Enumeration<['document', 'selfie', 'barcode']> &
      Schema.Attribute.DefaultTo<'document'>;
    onComplete: Schema.Attribute.Component<'sdui.on-complete', false> &
      Schema.Attribute.Required;
    overlayAspect: Schema.Attribute.String;
    overlayHint: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    overlayShape: Schema.Attribute.Enumeration<
      ['rectangle', 'circle', 'none']
    > &
      Schema.Attribute.DefaultTo<'rectangle'>;
  };
}

export interface UiCascadingSelect extends Struct.ComponentSchema {
  collectionName: 'components_ui_cascading_selects';
  info: {
    description: 'Linked dropdowns e.g. country > city > district. type: ui.cascading-select';
    displayName: 'Cascading Select';
  };
  attributes: {
    tiers: Schema.Attribute.Component<'ui.cascading-select-tier', true> &
      Schema.Attribute.Required;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiCascadingSelectTier extends Struct.ComponentSchema {
  collectionName: 'components_ui_cascading_select_tiers';
  info: {
    description: 'Single tier inside ui.cascading-select';
    displayName: 'Cascading Select Tier';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    dependsOn: Schema.Attribute.String;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiCheckboxList extends Struct.ComponentSchema {
  collectionName: 'components_ui_checkbox_lists';
  info: {
    description: 'Multi-select checkbox group. type: ui.checkbox-list';
    displayName: 'Checkbox List';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    items: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiCheckboxListAsync extends Struct.ComponentSchema {
  collectionName: 'components_ui_checkbox_list_asyncs';
  info: {
    description: 'Multi-select from live API. type: ui.checkbox-list-async';
    displayName: 'Checkbox List (Async)';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiDropdown extends Struct.ComponentSchema {
  collectionName: 'components_ui_dropdowns';
  info: {
    description: 'Single-select from static options. type: ui.dropdown';
    displayName: 'Dropdown';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiDropdownAsync extends Struct.ComponentSchema {
  collectionName: 'components_ui_dropdown_asyncs';
  info: {
    description: 'Searchable single-select from live API. type: ui.dropdown-async';
    displayName: 'Dropdown (Async)';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiHero extends Struct.ComponentSchema {
  collectionName: 'components_ui_heros';
  info: {
    description: 'Illustrative success/error hero block. type: ui.hero';
    displayName: 'Hero';
  };
  attributes: {
    illustration: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    referenceLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    referenceSource: Schema.Attribute.Component<'sdui.source', false>;
    subtitleFields: Schema.Attribute.JSON;
    subtitleTemplate: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiImagePreview extends Struct.ComponentSchema {
  collectionName: 'components_ui_image_previews';
  info: {
    description: 'Displays a base64 image from state. type: ui.image-preview';
    displayName: 'Image Preview';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false> &
      Schema.Attribute.Required;
  };
}

export interface UiItemList extends Struct.ComponentSchema {
  collectionName: 'components_ui_item_lists';
  info: {
    description: 'Generic tappable list with optional tab filtering. type: ui.item-list';
    displayName: 'Item List';
  };
  attributes: {
    filterBy: Schema.Attribute.Component<'sdui.binding', false>;
    items: Schema.Attribute.Component<'ui.list-item', true> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiKvRow extends Struct.ComponentSchema {
  collectionName: 'components_ui_kv_rows';
  info: {
    description: 'Key-value display row used inside review-card';
    displayName: 'KV Row';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false>;
    value: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiListItem extends Struct.ComponentSchema {
  collectionName: 'components_ui_list_items';
  info: {
    description: 'Single row inside ui.item-list';
    displayName: 'List Item';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    icon: Schema.Attribute.String;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false> &
      Schema.Attribute.Required;
    tab: Schema.Attribute.String;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiLocalState extends Struct.ComponentSchema {
  collectionName: 'components_ui_local_states';
  info: {
    displayName: 'Local State';
  };
  attributes: {
    allowedStates: Schema.Attribute.JSON & Schema.Attribute.Required;
    initial: Schema.Attribute.String & Schema.Attribute.Required;
    key: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface UiMoneyDisplay extends Struct.ComponentSchema {
  collectionName: 'components_ui_money_displays';
  info: {
    description: 'Read-only currency amount. type: ui.money-display';
    displayName: 'Money Display';
  };
  attributes: {
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'IDR'>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false> &
      Schema.Attribute.Required;
  };
}

export interface UiMoneyInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_money_inputs';
  info: {
    displayName: 'Money Input';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    currency: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    max: Schema.Attribute.Decimal;
    min: Schema.Attribute.Decimal;
    validation: Schema.Attribute.Component<'sdui.validation', false>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiOption extends Struct.ComponentSchema {
  collectionName: 'components_ui_options';
  info: {
    description: 'Single selectable option item';
    displayName: 'Option';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    icon: Schema.Attribute.String;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false>;
  };
}

export interface UiPasscodeInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_passcode_inputs';
  info: {
    description: 'Masked numeric passcode entry. type: ui.passcode-input';
    displayName: 'Passcode Input';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    keyboard: Schema.Attribute.Enumeration<['numpad', 'default']> &
      Schema.Attribute.DefaultTo<'numpad'>;
    length: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<6>;
    masked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    onComplete: Schema.Attribute.Component<'sdui.on-complete', false> &
      Schema.Attribute.Required;
    onForgot: Schema.Attribute.Component<'sdui.action', false>;
  };
}

export interface UiRadioGroup extends Struct.ComponentSchema {
  collectionName: 'components_ui_radio_groups';
  info: {
    description: 'Single-select option group. type: ui.radio-group';
    displayName: 'Radio Group';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiRadioGroupAsync extends Struct.ComponentSchema {
  collectionName: 'components_ui_radio_group_asyncs';
  info: {
    description: 'Single-select radio cards from live API. type: ui.radio-group-async';
    displayName: 'Radio Group (Async)';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiReviewCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_review_cards';
  info: {
    description: 'Summary section with rows and optional edit. type: ui.review-card';
    displayName: 'Review Card';
  };
  attributes: {
    allowChange: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    badges: Schema.Attribute.Component<'ui.badge', true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onEdit: Schema.Attribute.Component<'sdui.action', false>;
    rows: Schema.Attribute.Component<'ui.kv-row', true> &
      Schema.Attribute.Required;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiSectionLabel extends Struct.ComponentSchema {
  collectionName: 'components_ui_section_labels';
  info: {
    description: 'Visual section divider. type: ui.section-label';
    displayName: 'Section Label';
  };
  attributes: {
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiSlideToConfirm extends Struct.ComponentSchema {
  collectionName: 'components_ui_slide_to_confirms';
  info: {
    displayName: 'Slide To Confirm';
  };
  attributes: {
    action: Schema.Attribute.Component<'sdui.action', false> &
      Schema.Attribute.Required;
    guardRules: Schema.Attribute.Relation<
      'manyToMany',
      'api::rule-set.rule-set'
    >;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiTabGroup extends Struct.ComponentSchema {
  collectionName: 'components_ui_tab_groups';
  info: {
    description: 'Horizontal tab switcher. type: ui.tab-group';
    displayName: 'Tab Group';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
  };
}

export interface UiText extends Struct.ComponentSchema {
  collectionName: 'components_ui_texts';
  info: {
    description: 'Static text block. type: ui.text';
    displayName: 'Text';
  };
  attributes: {
    value: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    variant: Schema.Attribute.Enumeration<
      ['title', 'body', 'caption', 'label']
    > &
      Schema.Attribute.DefaultTo<'body'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiTextInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_text_inputs';
  info: {
    description: 'Single-line text input. type: ui.text-input';
    displayName: 'Text Input';
  };
  attributes: {
    binding: Schema.Attribute.Component<'sdui.binding', false> &
      Schema.Attribute.Required;
    keyboard: Schema.Attribute.Enumeration<
      ['default', 'number-pad', 'email', 'phone']
    > &
      Schema.Attribute.DefaultTo<'default'>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    secured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sdui.action': SduiAction;
      'sdui.binding': SduiBinding;
      'sdui.data-source': SduiDataSource;
      'sdui.on-complete': SduiOnComplete;
      'sdui.source': SduiSource;
      'sdui.validation': SduiValidation;
      'sdui.visibility': SduiVisibility;
      'ui.account-selector': UiAccountSelector;
      'ui.badge': UiBadge;
      'ui.banner': UiBanner;
      'ui.camera-capture': UiCameraCapture;
      'ui.cascading-select': UiCascadingSelect;
      'ui.cascading-select-tier': UiCascadingSelectTier;
      'ui.checkbox-list': UiCheckboxList;
      'ui.checkbox-list-async': UiCheckboxListAsync;
      'ui.dropdown': UiDropdown;
      'ui.dropdown-async': UiDropdownAsync;
      'ui.hero': UiHero;
      'ui.image-preview': UiImagePreview;
      'ui.item-list': UiItemList;
      'ui.kv-row': UiKvRow;
      'ui.list-item': UiListItem;
      'ui.local-state': UiLocalState;
      'ui.money-display': UiMoneyDisplay;
      'ui.money-input': UiMoneyInput;
      'ui.option': UiOption;
      'ui.passcode-input': UiPasscodeInput;
      'ui.radio-group': UiRadioGroup;
      'ui.radio-group-async': UiRadioGroupAsync;
      'ui.review-card': UiReviewCard;
      'ui.section-label': UiSectionLabel;
      'ui.slide-to-confirm': UiSlideToConfirm;
      'ui.tab-group': UiTabGroup;
      'ui.text': UiText;
      'ui.text-input': UiTextInput;
    }
  }
}
