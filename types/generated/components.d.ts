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
    action: Schema.Attribute.Component<'sdui.action', false> &
      Schema.Attribute.Required;
  };
}

export interface SduiScreenMeta extends Struct.ComponentSchema {
  collectionName: 'components_sdui_screen_metas';
  info: {
    description: 'Screen-level title bar, subtitle, and navigation behaviour';
    displayName: 'Screen Meta';
  };
  attributes: {
    analytics: Schema.Attribute.JSON;
    enableBackButton: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    enableCloseButton: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onBack: Schema.Attribute.Component<'sdui.action', false>;
    subtitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
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

export interface SduiSteps extends Struct.ComponentSchema {
  collectionName: 'components_sdui_steps';
  info: {
    description: 'A combined step (SYSTEM or USER)';
    displayName: 'Steps';
  };
  attributes: {
    actionId: Schema.Attribute.String;
    maxRetry: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<3>;
    onFailure: Schema.Attribute.JSON;
    onSubmit: Schema.Attribute.JSON;
    onSuccess: Schema.Attribute.JSON;
    operation: Schema.Attribute.String;
    params: Schema.Attribute.JSON;
    screen: Schema.Attribute.Relation<'oneToOne', 'api::screen.screen'>;
    service: Schema.Attribute.String;
    skip: Schema.Attribute.Component<'sdui.visibility', false>;
    skipValidation: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    stepCode: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<['system', 'user']> &
      Schema.Attribute.Required;
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
    componentId: Schema.Attribute.String;
    display: Schema.Attribute.JSON;
    endpoint: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    params: Schema.Attribute.JSON;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
  };
}

export interface UiBadge extends Struct.ComponentSchema {
  collectionName: 'components_ui_badges';
  info: {
    description: 'Conditional label badge inside review-card';
    displayName: 'Badge';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    label: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['info', 'warning', 'success', 'error']
    > &
      Schema.Attribute.DefaultTo<'info'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiButton extends Struct.ComponentSchema {
  collectionName: 'components_ui_buttons';
  info: {
    description: 'Interactive button. type: ui.button';
    displayName: 'Button';
  };
  attributes: {
    action: Schema.Attribute.JSON;
    componentId: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    icon: Schema.Attribute.JSON;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'ghost', 'danger', 'promo']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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
    componentId: Schema.Attribute.String;
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
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
  };
}

export interface UiCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_cards';
  info: {
    description: 'Product/info card with dynamic bindings. type: ui.card';
    displayName: 'Card';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    icon: Schema.Attribute.String;
    name: Schema.Attribute.String;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    subtitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    valueSource: Schema.Attribute.JSON;
    variant: Schema.Attribute.Enumeration<['default', 'compact']> &
      Schema.Attribute.DefaultTo<'default'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiCascadingSelect extends Struct.ComponentSchema {
  collectionName: 'components_ui_cascading_selects';
  info: {
    description: 'Linked dropdowns e.g. country > city > district. type: ui.cascading-select';
    displayName: 'Cascading Select';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    testId: Schema.Attribute.String;
  };
}

export interface UiCheckbox extends Struct.ComponentSchema {
  collectionName: 'components_ui_checkboxes';
  info: {
    description: 'Single checkbox with optional section title. type: ui.checkbox';
    displayName: 'Checkbox';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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
    componentId: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    options: Schema.Attribute.Component<'ui.option', true>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiDateInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_date_inputs';
  info: {
    description: 'Date picker input. type: ui.date-input';
    displayName: 'Date Input';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    conditions: Schema.Attribute.JSON;
    defaultValue: Schema.Attribute.String;
    displayFormat: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'dd MMM yyyy'>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    testId: Schema.Attribute.String;
    validations: Schema.Attribute.JSON;
    valueFormat: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'yyyy-MM-dd'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiDivider extends Struct.ComponentSchema {
  collectionName: 'components_ui_dividers';
  info: {
    description: 'Visual divider line with optional label. type: ui.divider';
    displayName: 'Divider';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    testId: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiDropdown extends Struct.ComponentSchema {
  collectionName: 'components_ui_dropdowns';
  info: {
    description: 'Single-select from static options. type: ui.dropdown';
    displayName: 'Dropdown';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    conditions: Schema.Attribute.JSON;
    defaultValue: Schema.Attribute.String;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiDropdownAsync extends Struct.ComponentSchema {
  collectionName: 'components_ui_dropdown_asyncs';
  info: {
    description: 'Single-select from API data source. type: ui.dropdown-async';
    displayName: 'Dropdown (Async)';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    conditions: Schema.Attribute.JSON;
    dataSource: Schema.Attribute.JSON;
    defaultValue: Schema.Attribute.String;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiHero extends Struct.ComponentSchema {
  collectionName: 'components_ui_heros';
  info: {
    description: 'Illustrative success/error hero block. type: ui.hero';
    displayName: 'Hero';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    illustration: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    referenceLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    referenceSource: Schema.Attribute.Component<'sdui.source', false>;
    span: Schema.Attribute.Integer;
    subtitleFields: Schema.Attribute.JSON;
    subtitleTemplate: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface UiIconText extends Struct.ComponentSchema {
  collectionName: 'components_ui_icon_texts';
  info: {
    description: 'A row displaying an icon alongside text. type: ui.icon-text';
    displayName: 'Icon Text';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    label: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiImagePreview extends Struct.ComponentSchema {
  collectionName: 'components_ui_image_previews';
  info: {
    description: 'Displays a base64 image from state. type: ui.image-preview';
    displayName: 'Image Preview';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    valueSource: Schema.Attribute.JSON;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    options: Schema.Attribute.Component<'ui.list-item', true> &
      Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
  };
}

export interface UiLink extends Struct.ComponentSchema {
  collectionName: 'components_ui_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    action: Schema.Attribute.Component<'sdui.action', false>;
    componentId: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    validation: Schema.Attribute.Component<'sdui.validation', false>;
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
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false>;
    span: Schema.Attribute.Integer;
    tab: Schema.Attribute.String;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'IDR'>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    source: Schema.Attribute.Component<'sdui.source', false> &
      Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    currency: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    max: Schema.Attribute.Decimal;
    min: Schema.Attribute.Decimal;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    onTap: Schema.Attribute.Component<'sdui.action', false>;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    keyboard: Schema.Attribute.Enumeration<['numpad', 'default']> &
      Schema.Attribute.DefaultTo<'numpad'>;
    length: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<6>;
    masked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    onComplete: Schema.Attribute.Component<'sdui.on-complete', false> &
      Schema.Attribute.Required;
    onForgot: Schema.Attribute.Component<'sdui.action', false>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
  };
}

export interface UiProgressBar extends Struct.ComponentSchema {
  collectionName: 'components_ui_progress_bars';
  info: {
    description: 'Step progress indicator. type: ui.progress-bar';
    displayName: 'Progress Bar';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    currentStep: Schema.Attribute.Integer & Schema.Attribute.Required;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    maxStep: Schema.Attribute.Integer & Schema.Attribute.Required;
    name: Schema.Attribute.String;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    testId: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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
    componentId: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    dataSource: Schema.Attribute.Component<'sdui.data-source', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    validation: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiReviewCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_review_cards';
  info: {
    description: 'Summary section with key-value options. type: ui.review-card';
    displayName: 'Review Card';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    options: Schema.Attribute.JSON & Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiRichText extends Struct.ComponentSchema {
  collectionName: 'components_ui_rich_texts';
  info: {
    displayName: 'Rich Text';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiRow extends Struct.ComponentSchema {
  collectionName: 'components_ui_rows';
  info: {
    displayName: 'Row';
    icon: 'layout';
  };
  attributes: {
    columns: Schema.Attribute.DynamicZone<
      [
        'ui.account-selector',
        'ui.badge',
        'ui.banner',
        'ui.button',
        'ui.camera-capture',
        'ui.cascading-select',
        'ui.checkbox-list',
        'ui.checkbox-list-async',
        'ui.dropdown',
        'ui.dropdown-async',
        'ui.hero',
        'ui.icon-text',
        'ui.image-preview',
        'ui.item-list',
        'ui.link',
        'ui.list-item',
        'ui.money-display',
        'ui.money-input',
        'ui.passcode-input',
        'ui.radio-group',
        'ui.radio-group-async',
        'ui.review-card',
        'ui.rich-text',
        'ui.section-label',
        'ui.slide-to-confirm',
        'ui.tab-group',
        'ui.text',
        'ui.text-input',
      ]
    >;
    componentId: Schema.Attribute.String;
    gap: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<8>;
    testId: Schema.Attribute.String;
  };
}

export interface UiSectionLabel extends Struct.ComponentSchema {
  collectionName: 'components_ui_section_labels';
  info: {
    description: 'Visual section divider. type: ui.section-label';
    displayName: 'Section Label';
  };
  attributes: {
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    span: Schema.Attribute.Integer;
    subtitle: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String &
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
    componentId: Schema.Attribute.String;
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
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiSubtitleLabelSection extends Struct.ComponentSchema {
  collectionName: 'components_ui_subtitle_label_sections';
  info: {
    displayName: 'SubtitleLabelSection';
  };
  attributes: {
    componentId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    subtitle: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String;
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
    componentId: Schema.Attribute.String;
    options: Schema.Attribute.Component<'ui.option', true> &
      Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
  };
}

export interface UiText extends Struct.ComponentSchema {
  collectionName: 'components_ui_texts';
  info: {
    description: 'Static text block. type: ui.text';
    displayName: 'Text';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    valueSource: Schema.Attribute.JSON;
    variant: Schema.Attribute.Enumeration<
      ['title', 'subtitle', 'body', 'note', 'caption', 'label']
    > &
      Schema.Attribute.DefaultTo<'body'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiTextInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_text_inputs';
  info: {
    description: 'Single-line text input. type: ui.text-input';
    displayName: 'Text Input';
  };
  attributes: {
    componentId: Schema.Attribute.String;
    conditions: Schema.Attribute.JSON;
    defaultValue: Schema.Attribute.String;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    helperText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    inputMode: Schema.Attribute.Enumeration<
      ['text', 'numeric', 'email', 'phone']
    > &
      Schema.Attribute.DefaultTo<'text'>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.Integer;
    minLength: Schema.Attribute.Integer;
    name: Schema.Attribute.String;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Integer;
    testId: Schema.Attribute.String;
    validations: Schema.Attribute.JSON;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sdui.action': SduiAction;
      'sdui.binding': SduiBinding;
      'sdui.data-source': SduiDataSource;
      'sdui.on-complete': SduiOnComplete;
      'sdui.screen-meta': SduiScreenMeta;
      'sdui.source': SduiSource;
      'sdui.steps': SduiSteps;
      'sdui.validation': SduiValidation;
      'sdui.visibility': SduiVisibility;
      'ui.account-selector': UiAccountSelector;
      'ui.badge': UiBadge;
      'ui.banner': UiBanner;
      'ui.button': UiButton;
      'ui.camera-capture': UiCameraCapture;
      'ui.card': UiCard;
      'ui.cascading-select': UiCascadingSelect;
      'ui.cascading-select-tier': UiCascadingSelectTier;
      'ui.checkbox': UiCheckbox;
      'ui.checkbox-list': UiCheckboxList;
      'ui.checkbox-list-async': UiCheckboxListAsync;
      'ui.date-input': UiDateInput;
      'ui.divider': UiDivider;
      'ui.dropdown': UiDropdown;
      'ui.dropdown-async': UiDropdownAsync;
      'ui.hero': UiHero;
      'ui.icon-text': UiIconText;
      'ui.image-preview': UiImagePreview;
      'ui.item-list': UiItemList;
      'ui.link': UiLink;
      'ui.list-item': UiListItem;
      'ui.local-state': UiLocalState;
      'ui.money-display': UiMoneyDisplay;
      'ui.money-input': UiMoneyInput;
      'ui.option': UiOption;
      'ui.passcode-input': UiPasscodeInput;
      'ui.progress-bar': UiProgressBar;
      'ui.radio-group': UiRadioGroup;
      'ui.radio-group-async': UiRadioGroupAsync;
      'ui.review-card': UiReviewCard;
      'ui.rich-text': UiRichText;
      'ui.row': UiRow;
      'ui.section-label': UiSectionLabel;
      'ui.slide-to-confirm': UiSlideToConfirm;
      'ui.subtitle-label-section': UiSubtitleLabelSection;
      'ui.tab-group': UiTabGroup;
      'ui.text': UiText;
      'ui.text-input': UiTextInput;
    }
  }
}
