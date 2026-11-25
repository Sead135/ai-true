"use client";

import type { Selection } from "@heroui/react";
import { Dropdown, Label } from "@heroui/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { findDialogPortal } from "@/lib/modal-portal";

const EMPTY = "__all__";

export type FilterOption = { id: string; label: string; content?: ReactNode };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  labelVisible?: boolean;
  icon?: ReactNode;
};

function Chevron() {
  return (
    <svg className="filter-dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilterComboBox({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
  labelVisible = false,
  icon,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<Element | undefined>();
  const normalized = (Array.isArray(options) ? options : []).map((o) => ({
    id: o.id === "" ? EMPTY : o.id,
    label: o.label,
    content: o.content,
  }));
  let selectedKey: string | null;
  if (value === "") {
    const hasEmptyOption = normalized.some((o) => o.id === EMPTY);
    selectedKey = hasEmptyOption ? EMPTY : null;
  } else {
    selectedKey = value;
  }
  const selected = normalized.find((o) => o.id === selectedKey);
  const selectedDisplay = selected?.content ?? selected?.label ?? placeholder ?? label;

  useLayoutEffect(() => {
    setPortalContainer(findDialogPortal(rootRef.current));
  }, []);

  return (
    <div ref={rootRef} className={className ? `filter-combo ${className}` : "filter-combo"}>
      {labelVisible ? <Label>{label}</Label> : null}
      <Dropdown>
        <Dropdown.Trigger
          aria-label={label}
          className={`filter-dropdown-trigger${icon ? " filter-field-group" : ""}`}
        >
          {icon ? (
            <span className="filter-field-icon" aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className="filter-dropdown-value">{selectedDisplay}</span>
          <Chevron />
        </Dropdown.Trigger>
        <Dropdown.Popover
          className="min-w-[var(--trigger-width)]"
          {...(portalContainer ? { UNSTABLE_portalContainer: portalContainer } : {})}
        >
          <Dropdown.Menu
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={selectedKey ? new Set([selectedKey]) : new Set()}
            onSelectionChange={(keys: Selection) => {
              if (keys === "all") {
                return;
              }
              const next = String([...keys][0] ?? "");
              // Empty set = clear → default "all" option
              if (!next) {
                onChange("");
                return;
              }
              onChange(next === EMPTY ? "" : next);
            }}
          >
            {normalized.map((item) => (
              <Dropdown.Item key={item.id} id={item.id} textValue={item.label}>
                <Label>{item.content ?? item.label}</Label>
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
