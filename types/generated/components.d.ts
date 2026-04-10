import type { Schema, Struct } from '@strapi/strapi';

export interface SduiAction extends Struct.ComponentSchema {
  collectionName: 'components_sdui_actions';
  info: {
    description: 'Generic action for slots.actions and inline component events';
    displayName: 'Action';
  };
  attributes: {
    analytics: Schema.Attribute.JSON;
    guards: Schema.Attribute.JSON;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    onFailed: Schema.Attribute.JSON;
    onSuccess: Schema.Attribute.JSON;
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
        'open_document',
        'submit_journey',
      ]
    > &
      Schema.Attribute.Required;
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

export interface SduiDynamic extends Struct.ComponentSchema {
  collectionName: 'components_sdui_dynamics';
  info: {
    description: 'Declares a runtime injection onto a specific field of a UI component. Repeatable \u2014 one entry per injected target.';
    displayName: 'Dynamic Injector';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    source: Schema.Attribute.Component<'sdui.dynamic-source', false> &
      Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<
      [
        'label',
        'title',
        'subtitle',
        'placeholder',
        'description',
        'helperText',
        'richTextContent',
        'options',
        'defaultValue',
        'prefill',
      ]
    > &
      Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<['CONTENT', 'OPTIONS', 'VALUE']> &
      Schema.Attribute.Required;
  };
}

export interface SduiDynamicSource extends Struct.ComponentSchema {
  collectionName: 'components_sdui_dynamic_sources';
  info: {
    description: 'Source descriptor for a dynamic injector \u2014 either a runtime fact or a downstream service call';
    displayName: 'Dynamic Source';
  };
  attributes: {
    path: Schema.Attribute.String;
    serviceCode: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['FACT', 'SERVICE']> &
      Schema.Attribute.Required;
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

export interface UiBanner extends Struct.ComponentSchema {
  collectionName: 'components_ui_banners';
  info: {
    description: 'Contextual banner. type: ui.banner';
    displayName: 'Banner';
  };
  attributes: {
    action: Schema.Attribute.Component<'sdui.action', false>;
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    icon: Schema.Attribute.JSON;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'ghost', 'danger', 'promo']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
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
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiCheckbox extends Struct.ComponentSchema {
  collectionName: 'components_ui_checkboxes';
  info: {
    description: 'Single checkbox with optional section title. type: ui.checkbox';
    displayName: 'Checkbox';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiDateInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_date_inputs';
  info: {
    description: 'Date picker input. type: ui.date-input';
    displayName: 'Date Input';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    displayFormat: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'dd MMM yyyy'>;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    valueFormat: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'yyyy-MM-dd'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    options: Schema.Attribute.Component<'ui.option', true>;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    dataSource: Schema.Attribute.JSON;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    searchable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiImagePreview extends Struct.ComponentSchema {
  collectionName: 'components_ui_image_previews';
  info: {
    description: 'Displays a base64 image from state. type: ui.image-preview';
    displayName: 'Image Preview';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    filterBy: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    options: Schema.Attribute.Component<'ui.option', true>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiLink extends Struct.ComponentSchema {
  collectionName: 'components_ui_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    action: Schema.Attribute.Component<'sdui.action', false>;
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiMoneyDisplay extends Struct.ComponentSchema {
  collectionName: 'components_ui_money_displays';
  info: {
    description: 'Read-only currency amount. type: ui.money-display';
    displayName: 'Money Display';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'IDR'>;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    source: Schema.Attribute.Component<'sdui.source', false> &
      Schema.Attribute.Required;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiMoneyInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_money_inputs';
  info: {
    displayName: 'Money Input';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    currency: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    max: Schema.Attribute.Decimal;
    maxLength: Schema.Attribute.String;
    min: Schema.Attribute.Decimal;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiOption extends Struct.ComponentSchema {
  collectionName: 'components_ui_options';
  info: {
    description: 'Single selectable option item. type: ui.option';
    displayName: 'Option';
  };
  attributes: {
    dependsOn: Schema.Attribute.String;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    media: Schema.Attribute.Media<'images'>;
    testId: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    value: Schema.Attribute.String & Schema.Attribute.Required;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiPasscodeInput extends Struct.ComponentSchema {
  collectionName: 'components_ui_passcode_inputs';
  info: {
    description: 'Masked numeric passcode entry. type: ui.passcode-input';
    displayName: 'Passcode Input';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    keyboard: Schema.Attribute.Enumeration<['numpad', 'default']> &
      Schema.Attribute.DefaultTo<'numpad'>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    length: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<6>;
    masked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    onComplete: Schema.Attribute.Component<'sdui.on-complete', false> &
      Schema.Attribute.Required;
    onForgot: Schema.Attribute.Component<'sdui.action', false>;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiProgressBar extends Struct.ComponentSchema {
  collectionName: 'components_ui_progress_bars';
  info: {
    description: 'Step progress indicator. type: ui.progress-bar';
    displayName: 'Progress Bar';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    currentStep: Schema.Attribute.Integer & Schema.Attribute.Required;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    maxStep: Schema.Attribute.Integer & Schema.Attribute.Required;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiReviewCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_review_cards';
  info: {
    description: 'Read-only summary card for confirmation screens. type: ui.review-card';
    displayName: 'Review Card';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.JSON;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface UiRichText extends Struct.ComponentSchema {
  collectionName: 'components_ui_rich_texts';
  info: {
    displayName: 'Rich Text';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    guardRules: Schema.Attribute.JSON;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
  };
}

export interface UiText extends Struct.ComponentSchema {
  collectionName: 'components_ui_texts';
  info: {
    description: 'Static text block. type: ui.text';
    displayName: 'Text';
  };
  attributes: {
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    maxLength: Schema.Attribute.String;
    name: Schema.Attribute.String;
    placement: Schema.Attribute.JSON;
    prefix: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    valueSource: Schema.Attribute.JSON;
    variant: Schema.Attribute.Enumeration<
      ['title', 'subtitle', 'body', 'note', 'caption', 'label']
    > &
      Schema.Attribute.DefaultTo<'body'>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
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
    collapsable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    collapseCondition: Schema.Attribute.String;
    componentId: Schema.Attribute.String;
    defaultValue: Schema.Attribute.String;
    dependsOn: Schema.Attribute.String;
    dynamic: Schema.Attribute.Component<'sdui.dynamic', false>;
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
    scope: Schema.Attribute.Enumeration<
      ['journeyState', 'localState', 'serverState']
    > &
      Schema.Attribute.DefaultTo<'journeyState'>;
    span: Schema.Attribute.Integer;
    suffix: Schema.Attribute.String;
    testId: Schema.Attribute.String;
    toggleField: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    toggleFieldCollapse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    toggleFieldReff: Schema.Attribute.String;
    validations: Schema.Attribute.Component<'sdui.validation', true>;
    visibility: Schema.Attribute.Component<'sdui.visibility', false>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sdui.action': SduiAction;
      'sdui.data-source': SduiDataSource;
      'sdui.dynamic': SduiDynamic;
      'sdui.dynamic-source': SduiDynamicSource;
      'sdui.on-complete': SduiOnComplete;
      'sdui.screen-meta': SduiScreenMeta;
      'sdui.source': SduiSource;
      'sdui.steps': SduiSteps;
      'sdui.validation': SduiValidation;
      'sdui.visibility': SduiVisibility;
      'ui.banner': UiBanner;
      'ui.button': UiButton;
      'ui.camera-capture': UiCameraCapture;
      'ui.checkbox': UiCheckbox;
      'ui.date-input': UiDateInput;
      'ui.divider': UiDivider;
      'ui.dropdown': UiDropdown;
      'ui.dropdown-async': UiDropdownAsync;
      'ui.image-preview': UiImagePreview;
      'ui.item-list': UiItemList;
      'ui.link': UiLink;
      'ui.money-display': UiMoneyDisplay;
      'ui.money-input': UiMoneyInput;
      'ui.option': UiOption;
      'ui.passcode-input': UiPasscodeInput;
      'ui.progress-bar': UiProgressBar;
      'ui.radio-group': UiRadioGroup;
      'ui.review-card': UiReviewCard;
      'ui.rich-text': UiRichText;
      'ui.slide-to-confirm': UiSlideToConfirm;
      'ui.tab-group': UiTabGroup;
      'ui.text': UiText;
      'ui.text-input': UiTextInput;
    }
  }
}
