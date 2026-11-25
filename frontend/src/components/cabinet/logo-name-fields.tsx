"use client";

import { FieldError, Input, Label, TextField, useOverlayState } from "@heroui/react";
import { useModalSize } from "@/lib/use-is-mobile";
import { LogoFacePreview, LogoImageModal } from "./logo-image-modal";
import { UploadIcon } from "./upload-icon";

type LogoNameFieldsProps = {
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
};

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
}: LogoNameFieldsProps) {
  const size = useModalSize("sm");
  const logoModal = useOverlayState();

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
            <LogoFacePreview url={logoUrl} name={name} />
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

      <LogoImageModal
        state={logoModal}
        size={size}
        name={name}
        logoUrl={logoUrl}
        imageLabel={imageLabel}
        removeLabel={removeLabel}
        onLogoChange={onLogoChange}
      />
    </>
  );
}
