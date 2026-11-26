"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { useModalSize } from "@/lib/use-is-mobile";
import { IconCancel, IconTrash } from "./filter-icons";

type OverlayModalState = ReturnType<typeof useOverlayState>;

type ConfirmModalProps = {
  state: OverlayModalState;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmModal({
  state,
  title,
  message,
  confirmLabel = "Удалить",
  onConfirm,
}: ConfirmModalProps) {
  const size = useModalSize("sm");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.isOpen) {
      setPending(false);
      setError(null);
    }
  }, [state.isOpen]);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      state.setOpen(false);
    } catch (err) {
      setError((err as { message?: string }).message ?? "Не удалось удалить");
      setPending(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable={!pending}>
        <Modal.Container size={size} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold">{title}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <p className="text-sm text-foreground/70">{message}</p>
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
              <Button className="flex-1" isDisabled={pending} onPress={handleConfirm}>
                <IconTrash />
                {pending ? "Удаление…" : confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
