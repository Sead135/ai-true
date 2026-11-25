"use client";

import { Button, Input, Label, TextField, Modal, useOverlayState } from "@heroui/react";

type OverlayModalState = ReturnType<typeof useOverlayState>;
type ModalContainerSize = "xs" | "sm" | "md" | "lg" | "full";
import { useEffect, useState } from "react";
import { uploadImage, validateImageFile } from "@/lib/uploads";
import { IconCancel, IconSave } from "./filter-icons";
import { ImageDropArea } from "./image-drop-area";

type LogoFaceProps = {
  url: string | null;
  name: string;
};

function LogoFace({ url, name }: LogoFaceProps) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="size-full object-cover" />;
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return <>{initial}</>;
}

type LogoImageModalProps = {
  state: OverlayModalState;
  size: ModalContainerSize;
  name: string;
  logoUrl: string | null;
  imageLabel: string;
  removeLabel: string;
  onLogoChange: (value: string | null) => void;
};

export function LogoImageModal({
  state,
  size,
  name,
  logoUrl,
  imageLabel,
  removeLabel,
  onLogoChange,
}: LogoImageModalProps) {
  const [draft, setDraft] = useState<string | null>(logoUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function revokePreview() {
    if (draft?.startsWith("blob:")) {
      URL.revokeObjectURL(draft);
    }
  }

  function resetOnOpen() {
    revokePreview();
    setDraft(logoUrl);
    setPendingFile(null);
    setUrlMode(false);
    setUrlInput(logoUrl?.startsWith("http") ? logoUrl : "");
    setError(null);
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
      setError(invalid);
      return;
    }
    revokePreview();
    setPendingFile(file);
    setDraft(URL.createObjectURL(file));
    setUrlMode(false);
    setError(null);
  }

  async function applyLogo() {
    setError(null);
    setPending(true);
    try {
      if (urlMode) {
        const url = urlInput.trim();
        if (!url) {
          setError("Вставьте ссылку на изображение");
          setPending(false);
          return;
        }
        onLogoChange(url);
      } else if (pendingFile) {
        const publicUrl = await uploadImage("logo", pendingFile);
        revokePreview();
        onLogoChange(publicUrl);
      } else {
        onLogoChange(draft);
      }
      setPendingFile(null);
      setPending(false);
      state.setOpen(false);
    } catch (err) {
      setError((err as { message?: string }).message ?? "Не удалось загрузить изображение");
      setPending(false);
    }
  }

  function clearLogo() {
    revokePreview();
    setDraft(null);
    setPendingFile(null);
    setUrlInput("");
    setUrlMode(false);
    setError(null);
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable={!pending}>
        <Modal.Container size={size} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold">{imageLabel}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <ImageDropArea
                preview={<LogoFace url={draft} name={name} />}
                disabled={pending}
                onFile={onPickFile}
                hint="Перетащите изображение сюда или нажмите. PNG, JPG, WebP, GIF · до 5 МБ"
              />

              {!urlMode ? (
                <Button
                  variant="ghost"
                  className="w-full"
                  isDisabled={pending}
                  onPress={() => setUrlMode(true)}
                >
                  Загрузить по ссылке
                </Button>
              ) : (
                <TextField value={urlInput} onChange={setUrlInput} isDisabled={pending} fullWidth>
                  <Label>URL картинки</Label>
                  <Input type="url" placeholder="https://…" />
                </TextField>
              )}

              {draft ? (
                <Button variant="ghost" className="w-full" isDisabled={pending} onPress={clearLogo}>
                  {removeLabel}
                </Button>
              ) : null}

              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </Modal.Body>
            <Modal.Footer className="flex gap-2">
              <Button
                variant="ghost"
                className="btn-danger-plain flex-1"
                isDisabled={pending}
                onPress={() => state.setOpen(false)}
              >
                <IconCancel />
                Отменить
              </Button>
              <Button className="flex-1" isDisabled={pending} onPress={applyLogo}>
                <IconSave />
                {pending ? "Загрузка…" : "Готово"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

type LogoFacePreviewProps = {
  url: string | null;
  name: string;
};

export function LogoFacePreview({ url, name }: LogoFacePreviewProps) {
  return <LogoFace url={url} name={name} />;
}
