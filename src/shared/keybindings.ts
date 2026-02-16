import type { ActionName } from "./types";

const SEQUENCE_TIMEOUT_MS = 500;

export interface KeySequenceMatch {
  action: ActionName;
  type: "exact";
}

export interface KeySequencePrefix {
  type: "prefix";
}

export interface KeySequenceNone {
  type: "none";
}

export type KeyResolveResult =
  | KeySequenceMatch
  | KeySequencePrefix
  | KeySequenceNone;

/**
 * Resolves multi-key sequences (e.g. "gg") against the current key mappings.
 * Maintains a buffer of recently typed keys with a timeout.
 */
export class KeySequenceResolver {
  private buffer = "";
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private mappings: ReadonlyArray<readonly [string, ActionName]> = [];

  constructor(keyMappings: Readonly<Record<ActionName, string>>) {
    this.setMappings(keyMappings);
  }

  setMappings(keyMappings: Readonly<Record<ActionName, string>>): void {
    // Sort by sequence length descending so longer sequences match first
    this.mappings = Object.entries(keyMappings)
      .map(([action, seq]) => [seq, action as ActionName] as const)
      .sort((a, b) => b[0].length - a[0].length);
    this.reset();
  }

  feed(key: string): KeyResolveResult {
    this.clearTimer();
    this.buffer += key;

    // Check for exact match
    for (const [seq, action] of this.mappings) {
      if (seq === this.buffer) {
        this.reset();
        return { action, type: "exact" };
      }
    }

    // Check if buffer is a prefix of any mapping
    const isPrefix = this.mappings.some(([seq]) =>
      seq.startsWith(this.buffer),
    );

    if (isPrefix) {
      this.startTimer();
      return { type: "prefix" };
    }

    // No match — check if the last key alone starts a new sequence
    // (handles the case where e.g. "gj" fails: "g" was consumed, try "j" fresh)
    // Only do this for single-character keys; special keys like "ArrowLeft" should not
    // have their last character extracted (e.g., "t" from "ArrowLeft" would match newTab)
    if (key.length > 1) {
      // Special key (Arrow*, Enter, Escape, etc.) — don't try to extract last char
      this.reset();
      return { type: "none" };
    }

    const lastKey = this.buffer.slice(-1);
    this.buffer = "";

    if (lastKey !== key) {
      // Avoid infinite recursion — only retry if buffer changed
      return this.feed(lastKey);
    }

    // Check if lastKey alone matches
    for (const [seq, action] of this.mappings) {
      if (seq === lastKey) {
        this.reset();
        return { action, type: "exact" };
      }
    }

    // Check if lastKey is a prefix
    const lastIsPrefix = this.mappings.some(([seq]) =>
      seq.startsWith(lastKey),
    );
    if (lastIsPrefix) {
      this.buffer = lastKey;
      this.startTimer();
      return { type: "prefix" };
    }

    this.reset();
    return { type: "none" };
  }

  reset(): void {
    this.buffer = "";
    this.clearTimer();
  }

  getBuffer(): string {
    return this.buffer;
  }

  private startTimer(): void {
    this.timerId = setTimeout(() => {
      this.buffer = "";
    }, SEQUENCE_TIMEOUT_MS);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
