"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useIsMobile, useModalSize } from "@/lib/use-is-mobile";
import { IconCancel, IconSave } from "./filter-icons";

function FiltersIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
    </svg>
  );
}

function countActive<T extends Record<string, unknown>>(values: T, defaults: T): number {
  return (Object.keys(defaults) as (keyof T)[]).reduce((n, key) => {
    return Object.is(values[key], defaults[key]) ? n : n + 1;
  }, 0);
}

export function FiltersBar<T extends Record<string, unknown>>({
  values,
  defaults,
  onChange,
  search,
  children,
  className,
  collapseOnMobile = true,
}: {
  values: T;
  defaults: T;
  onChange: (next: T) => void;
  search?: ReactNode;
  children: (ctx: {
    values: T;
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    patch: (next: Partial<T>) => void;
  }) => ReactNode;
  className?: string;
  collapseOnMobile?: boolean;
}) {
  const mobile = useIsMobile();
  const size = useModalSize("md");
  const [draft, setDraft] = useState(values);
  const modal = useOverlayState({
    onOpenChange: (open) => {
      if (open) setDraft(values);
    },
  });

  useEffect(() => {
    if (!modal.isOpen) setDraft(values);
  }, [values, modal.isOpen]);

  const active = useMemo(() => countActive(values, defaults), [values, defaults]);
  const hasFilters = Object.keys(defaults).length > 0;

  function setLive<K extends keyof T>(key: K, value: T[K]) {
    onChange({ ...values, [key]: value });
  }

  function patchLive(next: Partial<T>) {
    onChange({ ...values, ...next });
  }

  function setDraftField<K extends keyof T>(key: K, value: T[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function patchDraft(next: Partial<T>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function save() {
    onChange(draft);
    modal.setOpen(false);
  }

  function reset() {
    onChange(defaults);
    setDraft(defaults);
    modal.setOpen(false);
  }

  if (!mobile || !collapseOnMobile) {
    return (
      <div className={`filters-bar filters-bar--desktop ${className ?? ""}`}>
        <div className="filters-bar-fields">
          {children({ values, set: setLive, patch: patchLive })}
        </div>
        {search ? <div className="filters-bar-search">{search}</div> : null}
      </div>
    );
  }

  return (
    <div className={`filters-bar filters-bar--mobile ${className ?? ""}`}>
      <div className="filters-bar-mobile-row">
        {search ? <div className="filters-bar-search">{search}</div> : null}
        {hasFilters ? (
          <button
            type="button"
            className={`filters-bar-burger ${active > 0 ? "filters-bar-burger--active" : ""}`}
            aria-label="Фильтры"
            onClick={() => modal.setOpen(true)}
          >
            <FiltersIcon />
            {active > 0 ? <span className="filters-bar-burger-badge">{active}</span> : null}
          </button>
        ) : null}
      </div>

      <Modal state={modal}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold">Фильтры</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="filters-bar-modal-body">
                {children({ values: draft, set: setDraftField, patch: patchDraft })}
              </Modal.Body>
              <Modal.Footer className="flex gap-2">
                <Button variant="ghost" className="btn-danger-plain flex-1" onPress={reset}>
                  <IconCancel />
                  Сбросить
                </Button>
                <Button className="flex-1" onPress={save}>
                  <IconSave />
                  Сохранить
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
