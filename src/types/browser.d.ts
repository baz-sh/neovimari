/** Minimal type declarations for Safari's browser.* WebExtension APIs */

declare namespace browser {
  namespace storage {
    interface StorageArea {
      get(
        keys?: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }

    const local: StorageArea;
    const session: StorageArea;
  }

  namespace runtime {
    interface MessageSender {
      tab?: tabs.Tab;
      frameId?: number;
    }

    function sendMessage(message: unknown): Promise<unknown>;

    const onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void | Promise<unknown>,
      ): void;
      removeListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void | Promise<unknown>,
      ): void;
    };
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      index: number;
      windowId: number;
    }

    function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
    }): Promise<Tab[]>;
    function remove(tabId: number): Promise<void>;
    function create(createProperties: {
      url?: string;
      active?: boolean;
    }): Promise<Tab>;
    function duplicate(tabId: number): Promise<Tab>;
    function update(
      tabId: number,
      updateProperties: { active?: boolean },
    ): Promise<Tab>;
    function sendMessage(tabId: number, message: unknown): Promise<unknown>;

    const onRemoved: {
      addListener(
        callback: (
          tabId: number,
          removeInfo: { windowId: number; isWindowClosing: boolean },
        ) => void,
      ): void;
    };
  }
}
