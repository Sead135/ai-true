"use client";

import { Button, FieldError, Input, Label, TextField, Modal, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { useModalSize } from "@/lib/use-is-mobile";
import { IconCancel, IconSave } from "./filter-icons";
import { ImageDropArea } from "./image-drop-area";

const MAX_LOGO_BYTES = 350_000;

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

function LogoFace({ url, name }: { url: string | null; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="size-full object-cover" />;
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return <>{initial}</>;
}

export function LogoNameFields({
  name,
  logoUrl,
  onNameChange,
  onLogoChange,
  disabled,
  nameLabel = "Название",
  nameRequired = true,
  imageLabel = "Логотип",
  imageAriaLabel = "Изменить логотип",
  removeLabel = "Убрать логотип",
}: {
  name: string;
  logoUrl: string | null;
  onNameChange: (value: string) => void;
  onLogoChange: (value: string | null) => void;
  disabled?: boolean;
  nameLabel?: string;
  nameRequired?: boolean;
  imageLabel?: string;
  imageAriaLabel?: string;
  removeLabel?: string;
}) {
  const size = useModalSize("sm");
  const [draft, setDraft] = useState<string | null>(logoUrl);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const logoModal = useOverlayState({
    onOpenChange: (open) => {
      if (open) {
        setDraft(logoUrl);
        setUrlMode(false);
        setUrlInput(logoUrl?.startsWith("http") ? logoUrl : "");
        setError(null);
      }
    },
  });

  function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Нужен файл изображения (PNG, JPG, WebP, GIF)");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Максимум ~350 КБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setError("Не удалось прочитать файл");
        return;
      }
      setDraft(result);
      setUrlMode(false);
      setError(null);
    };
    reader.onerror = () => setError("Не удалось прочитать файл");
    reader.readAsDataURL(file);
  }

  function applyLogo() {
    setError(null);
    if (urlMode) {
      const url = urlInput.trim();
      if (!url) {
        setError("Вставьте ссылку на изображение");
        return;
      }
      onLogoChange(url);
    } else {
      onLogoChange(draft);
    }
    logoModal.setOpen(false);
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          className="settings-avatar-btn"
          aria-label={imageAriaLabel}
          disabled={disabled}
          onClick={() => logoModal.setOpen(true)}
        >
          <span className="cabinet-account-avatar entity-logo-avatar overflow-hidden text-base">
            <LogoFace url={logoUrl} name={name} />
          </span>
          <span className="settings-avatar-overlay">
            <UploadIcon />
          </span>
        </button>

        <TextField
          isRequired={nameRequired}
          name="name"
          value={name}
          onChange={onNameChange}
          isDisabled={disabled}
          className="min-w-0 flex-1"
          fullWidth
        >
          <Label className="sr-only">{nameLabel}</Label>
          <Input placeholder={nameLabel} />
          <FieldError />
        </TextField>
      </div>

      <Modal state={logoModal}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold">{imageLabel}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <ImageDropArea
                  preview={<LogoFace url={draft} name={name} />}
                  onFile={onPickFile}
                  hint="Перетащите изображение сюда или нажмите. PNG, JPG, WebP, GIF · до ~350 КБ"
                />

                {!urlMode ? (
                  <Button variant="ghost" className="w-full" onPress={() => setUrlMode(true)}>
                    Загрузить по ссылке
                  </Button>
                ) : (
                  <TextField value={urlInput} onChange={setUrlInput} fullWidth>
                    <Label>URL картинки</Label>
                    <Input type="url" placeholder="https://…" />
                  </TextField>
                )}

                {draft ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onPress={() => {
                      setDraft(null);
                      setUrlInput("");
                      setUrlMode(false);
                      setError(null);
                    }}
                  >
                    {removeLabel}
                  </Button>
                ) : null}

                {error ? <p className="text-sm text-red-500">{error}</p> : null}
              </Modal.Body>
              <Modal.Footer className="flex gap-2">
                <Button
                  variant="ghost"
                  className="btn-danger-plain flex-1"
                  onPress={() => logoModal.setOpen(false)}
                >
                  <IconCancel />
                  Отменить
                </Button>
                <Button className="flex-1" onPress={applyLogo}>
                  <IconSave />
                  Готово
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
