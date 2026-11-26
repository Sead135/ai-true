"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { IconSave, IconTrash } from "./filter-icons";
import { useEffect, useState } from "react";
import { listCompanies, type Company } from "@/lib/companies";
import { useModalSize } from "@/lib/use-is-mobile";
import { deleteUser, getUser, updateUser, type UserRow } from "@/lib/users";
import { ConfirmModal } from "./confirm-modal";
import { DetailSkeleton } from "./skeletons";
import { USER_EDIT_FORM_ID, UserEditForm } from "./user-edit-form";

type UserEditModalProps = {
  userId: string | null;
  onClose: () => void;
  onSaved: (user: UserRow) => void;
  onDeleted: (userId: string) => void;
};

export function UserEditModal({ userId, onClose, onSaved, onDeleted }: UserEditModalProps) {
  const size = useModalSize("md");
  const open = userId !== null;
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) {
        onClose();
      }
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
  const confirm = useOverlayState();

  useEffect(() => {
    confirm.setOpen(false);
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
        if (cancelled) {
          return;
        }
        setUser(u);
        setName(u.name ?? "");
        setAvatarUrl(u.avatarUrl);
        setEmail(u.email);
        setRole(u.role);
        setCompanyId(u.companyId ?? "");
        setCompanies(page.items);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          setError(err.message ?? "Не найдено");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }
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

  return (
    <>
      <Modal state={state}>
        <Modal.Backdrop isDismissable={!confirm.isOpen}>
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
                  <UserEditForm
                    pending={pending}
                    error={error}
                    name={name}
                    avatarUrl={avatarUrl}
                    email={email}
                    role={role}
                    companyId={companyId}
                    password={password}
                    companies={companies}
                    onNameChange={setName}
                    onAvatarChange={setAvatarUrl}
                    onEmailChange={setEmail}
                    onRoleChange={setRole}
                    onCompanyIdChange={setCompanyId}
                    onPasswordChange={setPassword}
                    onSubmit={onSave}
                  />
                ) : null}
              </Modal.Body>
              {user ? (
                <Modal.Footer className="flex w-full flex-col gap-2">
                  <Button
                    type="submit"
                    form={USER_EDIT_FORM_ID}
                    isDisabled={pending}
                    className="w-full"
                  >
                    <IconSave />
                    {pending ? "Сохранение…" : "Сохранить"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    isDisabled={pending}
                    className="btn-danger-plain w-full"
                    onPress={() => confirm.setOpen(true)}
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
      {user ? (
        <ConfirmModal
          state={confirm}
          title="Удалить пользователя?"
          message={`Точно удалить пользователя ${user.email}? Вместе с ним будут удалены компания и филиалы.`}
          onConfirm={async () => {
            await deleteUser(user.id);
            onDeleted(user.id);
            onClose();
          }}
        />
      ) : null}
    </>
  );
}
