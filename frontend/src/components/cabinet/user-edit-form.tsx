"use client";

import { FieldError, Input, Label, TextField } from "@heroui/react";
import type { Company } from "@/lib/companies";
import { FilterComboBox } from "./filter-combo-box";
import { LogoNameFields } from "./logo-name-fields";

export const USER_EDIT_FORM_ID = "user-edit-form";

type UserEditFormProps = {
  formId?: string;
  pending: boolean;
  error: string | null;
  name: string;
  avatarUrl: string | null;
  email: string;
  role: "admin" | "client";
  companyId: string;
  password: string;
  companies: Company[];
  onNameChange: (value: string) => void;
  onAvatarChange: (value: string | null) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: "admin" | "client") => void;
  onCompanyIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function UserEditForm({
  formId = USER_EDIT_FORM_ID,
  pending,
  error,
  name,
  avatarUrl,
  email,
  role,
  companyId,
  password,
  companies,
  onNameChange,
  onAvatarChange,
  onEmailChange,
  onRoleChange,
  onCompanyIdChange,
  onPasswordChange,
  onSubmit,
}: UserEditFormProps) {
  return (
    <form id={formId} onSubmit={onSubmit} className="auth-fields flex flex-col">
      <LogoNameFields
        name={name}
        logoUrl={avatarUrl}
        onNameChange={onNameChange}
        onLogoChange={onAvatarChange}
        disabled={pending}
        nameLabel="ФИО"
        nameRequired={false}
        imageLabel="Аватар"
        imageAriaLabel="Изменить аватар"
        removeLabel="Убрать аватар"
      />

      <TextField isRequired value={email} onChange={onEmailChange} isDisabled={pending} fullWidth>
        <Label>Email</Label>
        <Input type="email" />
        <FieldError />
      </TextField>

      <FilterComboBox
        labelVisible
        label="Роль"
        placeholder="Роль"
        value={role}
        onChange={(v) => onRoleChange(v as "admin" | "client")}
        options={[
          { id: "client", label: "client" },
          { id: "admin", label: "admin" },
        ]}
      />

      {role === "client" ? (
        <FilterComboBox
          labelVisible
          label="Компания"
          placeholder="Без компании"
          value={companyId}
          onChange={onCompanyIdChange}
          options={[
            { id: "", label: "Без компании" },
            ...companies.map((c) => ({ id: c.id, label: c.name })),
          ]}
        />
      ) : null}

      <TextField value={password} onChange={onPasswordChange} isDisabled={pending} fullWidth>
        <Label>Новый пароль</Label>
        <Input type="password" placeholder="Оставьте пустым, чтобы не менять" minLength={6} />
      </TextField>

      {error ? <p className="auth-error px-3 py-2 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
