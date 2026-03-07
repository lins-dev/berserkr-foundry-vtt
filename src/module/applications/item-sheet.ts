import { BerserkrItem } from "../documents/item";
import ItemSheet from "../../svelte/sheets/ItemSheet.svelte";
import { mount, unmount } from "svelte";

/**
 * Custom Item Sheet for Berserkr
 * Uses Svelte for the UI
 */
// @ts-ignore
export class BerserkrItemSheet extends (foundry.applications.sheets?.ItemSheetV2 ?? foundry.applications.api.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["berserkr", "berserkr-item-sheet"],
    tag: "form",
    window: {
      resizable: true,
      minimizable: true,
      title: "Berserkr Item Sheet",
      width: 500,
      height: 600,
    },
    actions: {},
    forms: {
      submitOnChange: false,
      closeOnSubmit: false,
    },
  };

  /** @override */
  static PARTS = {
    main: {
      template: "",
    },
  };

  /** @type {any} */
  #svelteApp: any;

  /**
   * Cache do contexto para garantir persistência no Svelte
   */
  #renderContext: any;

  /** @override */
  async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    this.#renderContext = context;
    return context;
  }

  /** @override */
  async _renderHTML(context: any, options: any) {
    this.#renderContext = context;
    const div = document.createElement("div");
    div.style.height = "100%";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    return div;
  }

  /** @override */
  _replaceHTML(result: HTMLElement, content: HTMLElement, options: any) {
    content.innerHTML = "";
    content.appendChild(result);

    if (this.#svelteApp) unmount(this.#svelteApp);
    
    this.#svelteApp = mount(ItemSheet, {
      target: result,
      props: {
        item: this.document as BerserkrItem,
        context: this.#renderContext,
      },
    });
  }

  /**
   * Helper to edit the document image
   */
  async editImage() {
    // @ts-ignore
    const fp = new (foundry.applications.apps.FilePicker || FilePicker)({
      type: "image",
      current: this.document.img,
      callback: (path: string) => {
        this.document.update({ img: path });
      }
    });
    return fp.browse();
  }

  /** @override */
  _onClose() {
    if (this.#svelteApp) {
      unmount(this.#svelteApp);
    }
  }
}
