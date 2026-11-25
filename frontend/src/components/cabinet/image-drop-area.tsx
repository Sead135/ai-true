"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "./upload-icon";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type ImageDropAreaProps = {
  preview: React.ReactNode;
  disabled?: boolean;
  onFile: (file: File) => void;
  hint?: string;
};

export function ImageDropArea({
  preview,
  disabled,
  onFile,
  hint = "Перетащите изображение сюда или нажмите, чтобы выбрать",
}: ImageDropAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  function takeFile(file: File | undefined | null) {
    if (!file || disabled) {
      return;
    }
    onFile(file);
  }

  return (
    <button
      type="button"
      className={`image-drop-area ${dragging ? "image-drop-area--active" : ""}`}
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current = 0;
        setDragging(false);
        takeFile(e.dataTransfer.files?.[0]);
      }}
    >
      <span className="cabinet-account-avatar size-20 overflow-hidden text-xl">{preview}</span>
      <span className="image-drop-area-copy">
        <UploadIcon className="size-5 shrink-0 text-foreground/45" />
        <span>{hint}</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          takeFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
}
