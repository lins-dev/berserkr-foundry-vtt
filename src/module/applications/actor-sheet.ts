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
      template: "",
    },
  };

  /** @type {any} */
  #svelteApp: any;

  /**
   * Armazena a aba ativa na instância da classe
   */
  currentTab = "violence";

  /**
   * Armazena a posição do scroll para persistência
   */
  scrollTop = 0;

  /**
   * Cache do contexto para garantir persistência no Svelte
   */
  #renderContext: any;

  /** @override */
  async _prepareContext(options: any) {
    const context = await super._prepareContext(options);
    context.activeTab = this.currentTab;
    context.scrollTop = this.scrollTop;
    this.#renderContext = context;
    return context;
  }

  /**
   * Altera a aba ativa
   */
  setTab(tabId: string) {
    this.currentTab = tabId;
    this.scrollTop = 0; // Reseta o scroll ao trocar de aba
  }

  /**
   * Salva a posição do scroll
   */
  updateScroll(position: number) {
    this.scrollTop = position;
  }

  /** @override */
  async _renderHTML(context: any, options: any) {
    this.#renderContext = context;
    return document.createElement("div");
  }

  /** @override */
  _replaceHTML(result: HTMLElement, content: HTMLElement, options: any) {
    content.innerHTML = "";
    content.appendChild(result);

    if (this.#svelteApp) unmount(this.#svelteApp);
    
    this.#svelteApp = mount(CharacterSheet, {
      target: result,
      props: {
        actor: this.document as BerserkrActor,
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
