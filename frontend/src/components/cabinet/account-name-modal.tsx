"use client";

import { Button, Input, TextField, Modal, useOverlayState } from "@heroui/react";

type OverlayModalState = ReturnType<typeof useOverlayState>;
type ModalContainerSize = "xs" | "sm" | "md" | "lg" | "full";
import { useEffect, useState } from "react";
import { updateProfile, type AuthError, type Me } from "@/lib/auth";
import { IconCancel, IconSave } from "./filter-icons";

type AccountNameModalProps = {
  state: OverlayModalState;
  me: Me;
  size: ModalContainerSize;
  onProfileUpdated: (me: Me) => void;
};

export function AccountNameModal({ state, me, size, onProfileUpdated }: AccountNameModalProps) {
  const [nameDraft, setNameDraft] = useState(me.name ?? "");
  const [namePending, setNamePending] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  function resetOnOpen() {
    setNameDraft(me.name ?? "");
    setNameError(null);
  }

  useEffect(() => {
    if (state.isOpen) {
      resetOnOpen();
    }
  }, [state.isOpen, me.name]);

  async function saveName() {
    setNamePending(true);
    setNameError(null);
    try {
      const updated = await updateProfile({ name: nameDraft.trim() });
      onProfileUpdated(updated);
      setNameDraft(updated.name ?? "");
      setNamePending(false);
      state.setOpen(false);
    } catch (err) {
      setNameError((err as AuthError).message ?? "Не удалось сохранить ФИО");
      setNamePending(false);
    }
  }

  return (
    <Modal state={state}>
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
                onPress={() => state.setOpen(false)}
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
  );
}
