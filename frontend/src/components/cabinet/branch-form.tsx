"use client";

import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import type { Branch, BranchInput } from "@/lib/branches";
import { FilterComboBox } from "./filter-combo-box";
import { IconSave } from "./filter-icons";
import { LogoNameFields } from "./logo-name-fields";

const empty: BranchInput = {
  name: "",
  address: "",
  city: "",
  phone: "",
  logoUrl: null,
  website: "",
  email: "",
  businessCategory: "",
  isActive: true,
};

type BranchFormProps = {
  initial?: Branch;
  submitLabel: string;
  onSubmit: (data: BranchInput) => Promise<void>;
  formId?: string;
  hideSubmit?: boolean;
  onPendingChange?: (pending: boolean) => void;
};

export function BranchForm({
  initial,
  submitLabel,
  onSubmit,
  formId,
  hideSubmit,
  onPendingChange,
}: BranchFormProps) {
  const [form, setForm] = useState<BranchInput>(
    initial
      ? {
          name: initial.name,
          address: initial.address,
          city: initial.city,
          phone: initial.phone,
          logoUrl: initial.logoUrl,
          website: initial.website,
          email: initial.email,
          businessCategory: initial.businessCategory,
          isActive: initial.isActive,
        }
      : empty,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPendingState(next: boolean) {
    setPending(next);
    onPendingChange?.(next);
  }

  function set<K extends keyof BranchInput>(key: K, value: BranchInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPendingState(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        logoUrl: form.logoUrl?.trim() ? form.logoUrl.trim() : null,
      });
    } catch (err) {
      setError((err as { message?: string }).message ?? "Не удалось сохранить");
      setPendingState(false);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="auth-fields flex w-full flex-col gap-1">
      <LogoNameFields
        name={form.name}
        logoUrl={form.logoUrl}
        onNameChange={(v) => set("name", v)}
        onLogoChange={(v) => set("logoUrl", v)}
        disabled={pending}
      />

      {(
        [
          ["city", "Город", "text"],
          ["address", "Адрес", "text"],
          ["phone", "Телефон", "tel"],
          ["email", "Email", "email"],
          ["website", "Сайт", "url"],
          ["businessCategory", "Категория", "text"],
        ] as const
      ).map(([key, label, type]) => (
        <TextField
          key={key}
          name={key}
          value={(form[key] as string | null) ?? ""}
          onChange={(v) => set(key, v)}
          isDisabled={pending}
          fullWidth
        >
          <Label>{label}</Label>
          <Input type={type} />
          <FieldError />
        </TextField>
      ))}

      <FilterComboBox
        labelVisible
        label="Статус"
        placeholder="Статус"
        value={form.isActive ? "active" : "inactive"}
        onChange={(v) => set("isActive", v === "active")}
        options={[
          { id: "active", label: "Активен" },
          { id: "inactive", label: "Неактивен" },
        ]}
      />

      {error ? <p className="auth-error px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {!hideSubmit ? (
        <Button type="submit" isDisabled={pending} className="mt-2 w-full">
          <IconSave />
          {pending ? "Сохранение…" : submitLabel}
        </Button>
      ) : null}
    </form>
  );
}
