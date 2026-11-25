"use client";

import { Button, Input, Label, TextField, Modal, useOverlayState } from "@heroui/react";

type OverlayModalState = ReturnType<typeof useOverlayState>;
type ModalContainerSize = "xs" | "sm" | "md" | "lg" | "full";
import { useEffect, useState } from "react";
import { profileDisplayName, updateProfile, type AuthError, type Me } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/uploads";
import { IconCancel, IconSave } from "./filter-icons";
import { ImageDropArea } from "./image-drop-area";

type AvatarFaceProps = {
  me: Me;
  url: string | null;
};

export function AvatarFace({ me, url }: AvatarFaceProps) {
  const display = profileDisplayName(me);
  const initial = display.charAt(0).toUpperCase() || me.email.charAt(0).toUpperCase();
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="size-full object-cover" />;
  }
  return <>{initial}</>;
}

type AccountAvatarModalProps = {
  state: OverlayModalState;
  me: Me;
  size: ModalContainerSize;
  onProfileUpdated: (me: Me) => void;
};

export function AccountAvatarModal({ state, me, size, onProfileUpdated }: AccountAvatarModalProps) {
  const [avatarDraft, setAvatarDraft] = useState<string | null>(me.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrlMode, setAvatarUrlMode] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function revokeAvatarPreview() {
    if (avatarDraft?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarDraft);
    }
  }

  function resetOnOpen() {
    revokeAvatarPreview();
    setAvatarDraft(me.avatarUrl);
    setAvatarFile(null);
    setAvatarUrlMode(false);
    setAvatarUrlInput(me.avatarUrl?.startsWith("http") ? me.avatarUrl : "");
    setAvatarError(null);
  }

  useEffect(() => {
    if (state.isOpen) {
      resetOnOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog opens
  }, [state.isOpen]);

  function onPickFile(file: File) {
    const invalid = validateImageFile(file);
    if (invalid) {
      setAvatarError(invalid);
      return;
    }
    revokeAvatarPreview();
    setAvatarFile(file);
    setAvatarDraft(URL.createObjectURL(file));
    setAvatarUrlMode(false);
    setAvatarError(null);
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
      } else if (avatarFile) {
        next = await uploadImage("avatar", avatarFile);
      }
      const updated = await updateProfile({ avatarUrl: next });
      revokeAvatarPreview();
      onProfileUpdated(updated);
      setAvatarDraft(updated.avatarUrl);
      setAvatarFile(null);
      setAvatarPending(false);
      state.setOpen(false);
    } catch (err) {
      setAvatarError((err as AuthError).message ?? "Не удалось сохранить аватар");
      setAvatarPending(false);
    }
  }

  function clearAvatar() {
    revokeAvatarPreview();
    setAvatarDraft(null);
    setAvatarFile(null);
    setAvatarUrlInput("");
    setAvatarUrlMode(false);
    setAvatarError(null);
  }

  return (
    <Modal state={state}>
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
                hint="Перетащите изображение сюда или нажмите. PNG, JPG, WebP, GIF · до 5 МБ"
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
                  onPress={clearAvatar}
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
                onPress={() => state.setOpen(false)}
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
  );
}
