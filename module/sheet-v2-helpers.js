function renderHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function buildLegacySheetContext(sheet, document) {
  const source = document.toObject(false);
  const items = Array.from(document.items?.values?.() ?? []);
  source.items = items;
  source.effects = Array.from(document.effects?.values?.() ?? []);
  source.actor = document;
  source.item = document;
  source.document = document;
  source.object = document;
  source.dtypes = ["String", "Number", "Boolean"];
  source.owner = document.isOwner;
  source.editable = sheet.isEditable;
  source.options = sheet.options;
  source.cssClass = sheet.isEditable ? "editable" : "locked";

  return {
    actor: source,
    item: source,
    document,
    object: document,
    data: source,
    system: document.system,
    items,
    effects: source.effects,
    dtypes: ["String", "Number", "Boolean"],
    owner: document.isOwner,
    editable: sheet.isEditable,
    options: sheet.options,
    cssClass: sheet.isEditable ? "editable" : "locked"
  };
}

function activateTabs(element, initial) {
  const root = element instanceof HTMLElement ? element : element[0];
  const nav = root.querySelector(".sheet-tabs");
  if (!nav) return;

  const tabs = Array.from(root.querySelectorAll(".tab[data-tab]"));
  const links = Array.from(nav.querySelectorAll("[data-tab]"));
  const showTab = tabName => {
    for (const link of links) link.classList.toggle("active", link.dataset.tab === tabName);
    for (const tab of tabs) tab.classList.toggle("active", tab.dataset.tab === tabName);
  };

  const active = nav.querySelector("[data-tab].active")?.dataset.tab
    ?? links.find(link => link.dataset.tab === initial)?.dataset.tab
    ?? links[0]?.dataset.tab;
  if (active) showTab(active);

  nav.addEventListener("click", event => {
    const link = event.target.closest("[data-tab]");
    if (!link) return;
    event.preventDefault();
    showTab(link.dataset.tab);
  });
}

function applyDocumentSheetTheme(sheet) {
  const apiTheme = foundry.applications.apps.DocumentSheetConfig.getSheetThemeForDocument(sheet.document);
  const theme = String(apiTheme || sheet.document.getFlag("core", "sheetTheme") || "").toLowerCase();
  sheet.element.classList.remove("theme-light", "theme-dark");
  if (theme === "light" || theme === "dark") sheet.element.classList.add(`theme-${theme}`);
}

function activateImageEditing(sheet) {
  if (!sheet.isEditable) return;
  for (const img of sheet.element.querySelectorAll("img[data-edit]")) {
    img.addEventListener("click", () => {
      const attr = img.dataset.edit;
      new foundry.applications.apps.FilePicker.implementation({
        type: "image",
        current: foundry.utils.getProperty(sheet.document, attr),
        callback: path => sheet.document.update({ [attr]: path })
      }).browse();
    });
  }
}

function activateItemCardPositioning(sheet) {
  if (!sheet.isEditable) return;

  const root = sheet.element instanceof HTMLElement ? sheet.element : sheet.element[0];
  const cards = root.querySelectorAll(".item-card.dragItems.dropitem");
  for (const card of cards) {
    card.draggable = false;
    card.addEventListener("pointerdown", event => startItemCardPositioning(sheet, card, event));
  }
}

function startItemCardPositioning(sheet, card, event) {
  if (event.button !== 0) return;
  if (event.target.closest("a, button, input, textarea, select, .item-controls, .pip-button, .damage-swap, .item-roll")) {
    return;
  }

  const itemId = card.dataset.itemId;
  const dragArea = card.closest("#drag-area");
  if (!itemId || !dragArea) return;

  event.preventDefault();
  event.stopPropagation();
  card.setPointerCapture?.(event.pointerId);
  card.classList.add("dragging");

  const areaRect = dragArea.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const offset = {
    x: event.clientX - cardRect.left - cardRect.width / 2,
    y: event.clientY - cardRect.top - cardRect.height / 2
  };
  let position = getItemCardPosition(event, areaRect, offset);

  card.style.zIndex = 1000;

  const onPointerMove = moveEvent => {
    moveEvent.preventDefault();
    position = getItemCardPosition(moveEvent, areaRect, offset);
    card.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  };

  const onPointerUp = async moveEvent => {
    card.releasePointerCapture?.(event.pointerId);
    card.classList.remove("dragging");
    card.removeEventListener("pointermove", onPointerMove);
    card.removeEventListener("pointerup", onPointerUp);
    card.removeEventListener("pointercancel", onPointerUp);

    const item = sheet.actor.items.get(itemId);
    if (!item) return;
    await item.update({
      "system.sheet": {
        currentX: position.x,
        currentY: position.y,
        initialX: position.x,
        initialY: position.y,
        xOffset: position.x,
        yOffset: position.y
      }
    });
  };

  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerUp);
}

function getItemCardPosition(event, areaRect, offset) {
  const roundScale = 5;
  const x = event.clientX - areaRect.left - areaRect.width / 2 - offset.x;
  const y = event.clientY - areaRect.top - areaRect.height / 2 - offset.y;
  return {
    x: Math.round(x / roundScale) * roundScale,
    y: Math.round(y / roundScale) * roundScale
  };
}

function getControlUpdateData(control) {
  if (!control?.name || control.disabled) return null;
  if (control.type === "radio" && !control.checked) return null;

  let value = control.type === "checkbox" ? control.checked : control.value;
  const dtype = control.dataset?.dtype;
  if (dtype === "Number") value = value === "" ? null : Number(value);
  else if (dtype === "Boolean") value = control.type === "checkbox" ? control.checked : value === "true";

  return foundry.utils.expandObject({ [control.name]: value });
}

// ponytail: deliberate per-control save instead of native whole-form submit —
// whole-form FormDataExtended wiped fields on these legacy templates (b949786)
async function updateSheetFromChangedControl(sheet, event) {
  const control = event.target instanceof HTMLElement
    ? event.target.closest("input[name], textarea[name], select[name], prose-mirror[name]")
    : null;
  if (!control || control.classList.contains("item-input")) return;

  const updateData = getControlUpdateData(control);
  if (!updateData) return;
  return sheet.document.update(updateData, { diff: false });
}

export class MausritterActorSheetV2 extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    actions: {},
    classes: ["mausritter", "sheet", "actor"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: MausritterActorSheetV2.onSubmitActorForm
    },
    position: {
      width: 742,
      height: 800
    },
    window: {
      resizable: true
    }
  };

  static async onSubmitActorForm(event, form, formData) {
    return this.document.update(foundry.utils.expandObject(formData.object), { diff: false });
  }

  get template() {
    return this.constructor.DEFAULT_OPTIONS.template;
  }

  async _prepareContext(options) {
    const context = buildLegacySheetContext(this, this.actor);
    const data = this.getData(context);
    if (Array.isArray(data.items) && data.gear) data.items.gear = data.gear;
    return data;
  }

  getData(data = buildLegacySheetContext(this, this.actor)) {
    return data;
  }

  async _renderHTML(context, options) {
    const html = await foundry.applications.handlebars.renderTemplate(this.template, context);
    return renderHtml(html);
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    applyDocumentSheetTheme(this);
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
    activateItemCardPositioning(this);
    activateImageEditing(this);
  }

  _onChangeForm(formConfig, event) {
    if (formConfig.submitOnChange) return updateSheetFromChangedControl(this, event);
    return super._onChangeForm(formConfig, event);
  }

  async _onDropItemCreate(itemData) {
    const items = Array.isArray(itemData) ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments("Item", items);
  }

  activateListeners(html) {}
}

export class MausritterItemSheetV2 extends foundry.applications.sheets.ItemSheetV2 {
  static DEFAULT_OPTIONS = {
    actions: {},
    classes: ["mausritter", "sheet", "item"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: MausritterItemSheetV2.onSubmitItemForm
    },
    position: {
      width: 520,
      height: 480
    },
    window: {
      resizable: true
    }
  };

  static async onSubmitItemForm(event, form, formData) {
    return this.document.update(foundry.utils.expandObject(formData.object), { diff: false });
  }

  async _prepareContext(options) {
    const context = buildLegacySheetContext(this, this.item);
    return this.getData(context);
  }

  getData(data = buildLegacySheetContext(this, this.item)) {
    return data;
  }

  async _renderHTML(context, options) {
    const html = await foundry.applications.handlebars.renderTemplate(this.template, context);
    return renderHtml(html);
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    applyDocumentSheetTheme(this);
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
    activateImageEditing(this);
  }

  _onChangeForm(formConfig, event) {
    if (formConfig.submitOnChange) return updateSheetFromChangedControl(this, event);
    return super._onChangeForm(formConfig, event);
  }

  activateListeners(html) {}
}
