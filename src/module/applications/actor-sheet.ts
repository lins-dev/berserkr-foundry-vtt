import { BerserkrActor } from "../documents/actor";
import CharacterSheet from "../../svelte/sheets/CharacterSheet.svelte";
import { mount, unmount } from "svelte";

/**
 * Custom Actor Sheet for Berserkr
 * Uses Svelte for the UI
 */
// @ts-ignore
export class BerserkrActorSheet extends (foundry.applications.sheets?.ActorSheetV2 ?? foundry.applications.api.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["berserkr", "berserkr-sheet"],
    tag: "form",
    window: {
      resizable: true,
      minimizable: true,
      title: "Berserkr Character Sheet",
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
    // Retornamos um elemento vazio ou básico; o Svelte o preencherá.
    return document.createElement("div");
  }

  /** @override */
  _replaceHTML(result: HTMLElement, content: HTMLElement, options: any) {
    // Limpar e inserir o conteúdo base
    content.innerHTML = "";
    content.appendChild(result);

    // Montar o Svelte no elemento resultante
    if (this.#svelteApp) unmount(this.#svelteApp);
    
    this.#svelteApp = mount(CharacterSheet, {
      target: result,
      props: {
        actor: this.document as BerserkrActor,
        context: this.context, // Contexto da ficha
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
