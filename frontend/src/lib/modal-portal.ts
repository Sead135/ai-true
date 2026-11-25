/** Nearest modal dialog for portaling overlays (Dropdown/Popover) inside focus trap. */
export function findDialogPortal(node: HTMLElement | null): Element | undefined {
  if (!node) {
    return undefined;
  }
  return node.closest('[role="dialog"]') ?? node.closest(".modal__dialog") ?? undefined;
}
