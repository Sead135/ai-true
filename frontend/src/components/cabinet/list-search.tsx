"use client";

import { useEffect, useRef, useState } from "react";
import { IconSearch } from "./filter-icons";

const DEBOUNCE_MS = 450;

export function ListSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const dirtyRef = useRef(false);
  const sentRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Apply external URL/filter changes only when we didn't just send them
  // and the user isn't mid-typing.
  useEffect(() => {
    if (value === sentRef.current) return;
    if (dirtyRef.current) return;
    setDraft(value);
    sentRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!dirtyRef.current) return;

    const id = window.setTimeout(() => {
      const next = draft.trim();
      dirtyRef.current = false;
      sentRef.current = next;
      if (draft !== next) setDraft(next);
      if (next !== value) onChangeRef.current(next);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(id);
  }, [draft, value]);

  return (
    <div className={`list-search ${className ?? ""}`} role="search">
      <span className="filter-field-icon" aria-hidden>
        <IconSearch />
      </span>
      <input
        type="search"
        value={draft}
        onChange={(e) => {
          dirtyRef.current = true;
          setDraft(e.target.value);
        }}
        placeholder={placeholder}
        enterKeyHint="search"
        className="list-search-input"
        aria-label={placeholder}
      />
    </div>
  );
}
