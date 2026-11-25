"use client";

import { Button, Chip, Input, Label, TextField, Modal, useOverlayState } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout, profileDisplayName, updateProfile, type AuthError, type Me } from "@/lib/auth";
import { useModalSize } from "@/lib/use-is-mobile";
import { IconCancel, IconSave } from "./filter-icons";
import { ImageDropArea } from "./image-drop-area";
import { useSession } from "./session-context";

const MAX_AVATAR_BYTES = 350_000;

function UploadIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 16V6M8.5 9.5 12 6l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function AvatarFace({ me, url }: { me: Me; url: string | null }) {
  const display = profileDisplayName(me);
  const initial = display.charAt(0).toUpperCase() || me.email.charAt(0).toUpperCase();
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="size-full object-cover" />;
  }
  return <>{initial}</>;
}

export function AccountMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { me, setMe } = useSession();
  const router = useRouter();
  const size = useModalSize("sm");

  const settings = useOverlayState();
  const avatarModal = useOverlayState({
    onOpenChange: (open) => {
      if (open) {
        setAvatarDraft(me.avatarUrl);
        setAvatarUrlMode(false);
        setAvatarUrlInput(me.avatarUrl?.startsWith("http") ? me.avatarUrl : "");
        setAvatarError(null);
      }
    },
  });
  const nameModal = useOverlayState({
    onOpenChange: (open) => {
      if (open) {
        setNameDraft(me.name ?? "");
        setNameError(null);
      }
    },
  });

  const [avatarDraft, setAvatarDraft] = useState<string | null>(me.avatarUrl);
  const [avatarUrlMode, setAvatarUrlMode] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState(me.name ?? "");
  const [namePending, setNamePending] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  async function onLogout() {
    await logout();
    settings.setOpen(false);
    router.replace("/login");
    router.refresh();
  }

  function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Нужен файл изображения (PNG, JPG, WebP, GIF)");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Максимум ~350 КБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setAvatarError("Не удалось прочитать файл");
        return;
      }
      setAvatarDraft(result);
      setAvatarError(null);
    };
    reader.onerror = () => setAvatarError("Не удалось прочитать файл");
    reader.readAsDataURL(file);
  }

  async function saveAvatar() {
    setAvatarPending(true);
    setAvatarError(null);
    try {
      let next = avatarDraft;
      if (avatarUrlMode) {
        const url = avatarUrlInput.trim();
        if (!url) {
          setAvatarError("Вставьте ссылку на изображение");
          setAvatarPending(false);
          return;
        }
        next = url;
      }
      const updated = await updateProfile({ avatarUrl: next });
      setMe(updated);
      setAvatarDraft(updated.avatarUrl);
      setAvatarPending(false);
      avatarModal.setOpen(false);
    } catch (err) {
      setAvatarError((err as AuthError).message ?? "Не удалось сохранить аватар");
      setAvatarPending(false);
    }
  }

  async function saveName() {
    setNamePending(true);
    setNameError(null);
    try {
      const updated = await updateProfile({ name: nameDraft.trim() });
      setMe(updated);
      setNameDraft(updated.name ?? "");
      setNamePending(false);
      nameModal.setOpen(false);
    } catch (err) {
      setNameError((err as AuthError).message ?? "Не удалось сохранить ФИО");
      setNamePending(false);
    }
  }

  const trigger = collapsed ? (
    <Modal.Trigger>
      <button type="button" className="cabinet-account-avatar" aria-label="Меню аккаунта">
        <AvatarFace me={me} url={me.avatarUrl} />
      </button>
    </Modal.Trigger>
  ) : (
    <>
      <span className="cabinet-account-avatar overflow-hidden" aria-hidden>
        <AvatarFace me={me} url={me.avatarUrl} />
      </span>
      <span className="cabinet-account-meta">
        <span className="cabinet-account-name">{profileDisplayName(me)}</span>
        <span className="cabinet-account-email">{me.email}</span>
      </span>
      <Modal.Trigger>
        <button type="button" className="cabinet-account-more" aria-label="Меню аккаунта">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      </Modal.Trigger>
    </>
  );

  return (
    <>
      <Modal state={settings}>
        <div className={`cabinet-account ${collapsed ? "cabinet-account--collapsed" : ""}`}>
          {trigger}
        </div>

        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Modal.Heading className="text-lg font-semibold">Настройки</Modal.Heading>
                  <span className="text-foreground/25" aria-hidden>
                    ·
                  </span>
                  <Chip size="sm" variant="soft" color={me.role === "admin" ? "accent" : "default"}>
                    {me.role}
                  </Chip>
                </div>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="settings-avatar-btn"
                    aria-label="Изменить аватар"
                    onClick={() => avatarModal.setOpen(true)}
                  >
                    <span className="cabinet-account-avatar entity-logo-avatar overflow-hidden text-base">
                      <AvatarFace me={me} url={me.avatarUrl} />
                    </span>
                    <span className="settings-avatar-overlay">
                      <UploadIcon />
                    </span>
                  </button>

                  <button
                    type="button"
                    className="settings-name-btn min-w-0 flex-1 text-left"
                    onClick={() => nameModal.setOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-base font-semibold text-foreground">
                        {profileDisplayName(me)}
                      </span>
                      <PencilIcon className="settings-name-pencil size-3.5 shrink-0 text-foreground/40" />
                    </span>
                    <span className="mt-0.5 block text-xs text-foreground/45">
                      Нажмите, чтобы изменить ФИО
                    </span>
                  </button>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground/45">Email</p>
                  <p className="mt-1 truncate text-sm text-foreground">{me.email}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground/45">Дата регистрации</p>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(me.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" className="w-full" onPress={onLogout}>
                  Выйти
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={avatarModal}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold">Аватар</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <ImageDropArea
                  preview={<AvatarFace me={me} url={avatarDraft} />}
                  disabled={avatarPending}
                  onFile={onPickFile}
                  hint="Перетащите изображение сюда или нажмите. PNG, JPG, WebP, GIF · до ~350 КБ"
                />

                {!avatarUrlMode ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    isDisabled={avatarPending}
                    onPress={() => setAvatarUrlMode(true)}
                  >
                    Загрузить по ссылке
                  </Button>
                ) : (
                  <TextField
                    value={avatarUrlInput}
                    onChange={setAvatarUrlInput}
                    isDisabled={avatarPending}
                    fullWidth
                  >
                    <Label>URL картинки</Label>
                    <Input type="url" placeholder="https://…" />
                  </TextField>
                )}

                {avatarDraft ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    isDisabled={avatarPending}
                    onPress={() => {
                      setAvatarDraft(null);
                      setAvatarUrlInput("");
                      setAvatarError(null);
                    }}
                  >
                    Убрать аватар
                  </Button>
                ) : null}

                {avatarError ? <p className="text-sm text-red-500">{avatarError}</p> : null}
              </Modal.Body>
              <Modal.Footer className="flex gap-2">
                <Button
                  variant="ghost"
                  className="btn-danger-plain flex-1"
                  isDisabled={avatarPending}
                  onPress={() => avatarModal.setOpen(false)}
                >
                  <IconCancel />
                  Отменить
                </Button>
                <Button className="flex-1" isDisabled={avatarPending} onPress={saveAvatar}>
                  <IconSave />
                  {avatarPending ? "Сохранение…" : "Сохранить"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={nameModal}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold">Изменение ФИО</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <TextField
                  value={nameDraft}
                  onChange={setNameDraft}
                  isDisabled={namePending}
                  fullWidth
                >
                  <Input placeholder="Иван Иванов" aria-label="ФИО" />
                </TextField>
                {nameError ? <p className="text-sm text-red-500">{nameError}</p> : null}
              </Modal.Body>
              <Modal.Footer className="flex gap-2">
                <Button
                  variant="ghost"
                  className="btn-danger-plain flex-1"
                  isDisabled={namePending}
                  onPress={() => nameModal.setOpen(false)}
                >
                  <IconCancel />
                  Отменить
                </Button>
                <Button className="flex-1" isDisabled={namePending} onPress={saveName}>
                  <IconSave />
                  {namePending ? "Сохранение…" : "Сохранить"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
