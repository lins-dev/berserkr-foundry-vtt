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
      template: "", // Not used with Svelte
    },
  };

  /** @type {any} */
  #svelteApp: any;

  /** @override */
  async _renderHTML(context: any, options: any) {
    return document.createElement("div");
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
        context: this.context,
      },
    });
  }

  /** @override */
  _onClose() {
    if (this.#svelteApp) {
      unmount(this.#svelteApp);
    }
  }
}
