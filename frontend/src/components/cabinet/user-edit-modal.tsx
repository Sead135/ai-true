"use client";

import { Button, FieldError, Input, Label, TextField, Modal, useOverlayState } from "@heroui/react";
import { IconSave, IconTrash } from "./filter-icons";
import { useEffect, useState } from "react";
import { listCompanies, type Company } from "@/lib/companies";
import { useModalSize } from "@/lib/use-is-mobile";
import { deleteUser, getUser, updateUser, type UserRow } from "@/lib/users";
import { FilterComboBox } from "./filter-combo-box";
import { LogoNameFields } from "./logo-name-fields";
import { DetailSkeleton } from "./skeletons";

const FORM_ID = "user-edit-form";

export function UserEditModal({
  userId,
  onClose,
  onSaved,
  onDeleted,
}: {
  userId: string | null;
  onClose: () => void;
  onSaved: (user: UserRow) => void;
  onDeleted: (userId: string) => void;
}) {
  const size = useModalSize("md");
  const open = userId !== null;
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
  });

  const [user, setUser] = useState<UserRow | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");
  const [companyId, setCompanyId] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    let cancelled = false;
    setUser(null);
    setError(null);
    setPassword("");
    Promise.all([getUser(userId), listCompanies({ limit: 100 })])
      .then(([u, page]) => {
        if (cancelled) return;
        setUser(u);
        setName(u.name ?? "");
        setAvatarUrl(u.avatarUrl);
        setEmail(u.email);
        setRole(u.role);
        setCompanyId(u.companyId ?? "");
        setCompanies(page.items);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) setError(err.message ?? "Не найдено");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setPending(true);
    setError(null);
    try {
      const updated = await updateUser(userId, {
        email,
        name: name.trim() || null,
        avatarUrl,
        role,
        companyId: role === "admin" ? null : companyId || null,
        ...(password ? { password } : {}),
      });
      setUser(updated);
      setName(updated.name ?? "");
      setAvatarUrl(updated.avatarUrl);
      setPassword("");
      setPending(false);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError((err as { message?: string }).message ?? "Не удалось сохранить");
      setPending(false);
    }
  }

  async function onDelete() {
    if (!userId || !user) return;
    if (!confirm(`Удалить пользователя ${user.email}?`)) return;
    setPending(true);
    try {
      await deleteUser(userId);
      onDeleted(userId);
      onClose();
    } catch (err) {
      setError((err as { message?: string }).message ?? "Не удалось удалить");
      setPending(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size={size} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold">Пользователь</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className={size === "full" ? undefined : "max-h-[70vh] overflow-y-auto"}>
              {error && !user ? <p className="text-sm text-red-500">{error}</p> : null}
              {!user && !error ? <DetailSkeleton /> : null}
              {user ? (
                <form id={FORM_ID} onSubmit={onSave} className="auth-fields flex flex-col">
                  <LogoNameFields
                    name={name}
                    logoUrl={avatarUrl}
                    onNameChange={setName}
                    onLogoChange={setAvatarUrl}
                    disabled={pending}
                    nameLabel="ФИО"
                    nameRequired={false}
                    imageLabel="Аватар"
                    imageAriaLabel="Изменить аватар"
                    removeLabel="Убрать аватар"
                  />

                  <TextField
                    isRequired
                    value={email}
                    onChange={setEmail}
                    isDisabled={pending}
                    fullWidth
                  >
                    <Label>Email</Label>
                    <Input type="email" />
                    <FieldError />
                  </TextField>

                  <FilterComboBox
                    labelVisible
                    label="Роль"
                    placeholder="Роль"
                    value={role}
                    onChange={(v) => setRole(v as "admin" | "client")}
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
                      onChange={setCompanyId}
                      options={[
                        { id: "", label: "Без компании" },
                        ...companies.map((c) => ({ id: c.id, label: c.name })),
                      ]}
                    />
                  ) : null}

                  <TextField value={password} onChange={setPassword} isDisabled={pending} fullWidth>
                    <Label>Новый пароль</Label>
                    <Input
                      type="password"
                      placeholder="Оставьте пустым, чтобы не менять"
                      minLength={6}
                    />
                  </TextField>

                  {error ? (
                    <p className="auth-error px-3 py-2 text-sm text-red-600">{error}</p>
                  ) : null}
                </form>
              ) : null}
            </Modal.Body>
            {user ? (
              <Modal.Footer className="flex w-full flex-col gap-2">
                <Button type="submit" form={FORM_ID} isDisabled={pending} className="w-full">
                  <IconSave />
                  {pending ? "Сохранение…" : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  isDisabled={pending}
                  className="btn-danger-plain w-full"
                  onPress={onDelete}
                >
                  <IconTrash />
                  Удалить
                </Button>
              </Modal.Footer>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
