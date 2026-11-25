"use client";

import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import type { Company, CompanyInput } from "@/lib/companies";
import { IconSave } from "./filter-icons";
import { LogoNameFields } from "./logo-name-fields";

const empty: CompanyInput = {
  name: "",
  address: "",
  city: "",
  phone: "",
  description: "",
  logoUrl: null,
  website: "",
  email: "",
};

export function CompanyForm({
  initial,
  submitLabel,
  onSubmit,
  formId,
  hideSubmit,
  onPendingChange,
}: {
  initial?: Company;
  submitLabel: string;
  onSubmit: (data: CompanyInput) => Promise<void>;
  formId?: string;
  hideSubmit?: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [form, setForm] = useState<CompanyInput>(
    initial
      ? {
          name: initial.name,
          address: initial.address,
          city: initial.city,
          phone: initial.phone,
          description: initial.description,
          logoUrl: initial.logoUrl,
          website: initial.website,
          email: initial.email,
        }
      : empty,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPendingState(next: boolean) {
    setPending(next);
    onPendingChange?.(next);
  }

  function set<K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) {
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
          ["description", "Описание", "text"],
        ] as const
      ).map(([key, label, type]) => (
        <TextField
          key={key}
          name={key}
          value={form[key] ?? ""}
          onChange={(v) => set(key, v)}
          isDisabled={pending}
          fullWidth
        >
          <Label>{label}</Label>
          <Input type={type} />
          <FieldError />
        </TextField>
      ))}

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
