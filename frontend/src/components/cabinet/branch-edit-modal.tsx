"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { IconSave } from "./filter-icons";
import { useEffect, useState } from "react";
import {
  createBranch,
  getBranch,
  updateBranch,
  type Branch,
  type BranchInput,
} from "@/lib/branches";
import { useModalSize } from "@/lib/use-is-mobile";
import { BranchForm } from "./branch-form";
import { DetailSkeleton } from "./skeletons";

const FORM_ID = "branch-edit-form";

type BranchEditModalProps = {
  target: string | "new" | null;
  companyId?: string | null;
  onClose: () => void;
  onSaved: (branch: Branch) => void;
};

export function BranchEditModal({ target, companyId, onClose, onSaved }: BranchEditModalProps) {
  const size = useModalSize("md");
  const open = target !== null;
  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) {
        onClose();
      }
    },
  });
  const [branch, setBranch] = useState<Branch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isNew = target === "new";
  const ready = isNew || !!branch;
  const submitLabel = isNew ? "Создать" : "Сохранить";

  useEffect(() => {
    if (!target || target === "new") {
      setBranch(null);
      setError(null);
      setPending(false);
      return;
    }
    let cancelled = false;
    setBranch(null);
    setError(null);
    setPending(false);
    getBranch(target)
      .then((b) => {
        if (!cancelled) {
          setBranch(b);
        }
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) {
          setError(err.message ?? "Не найдено");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function onSubmit(data: BranchInput) {
    if (isNew) {
      if (!companyId) {
        throw { message: "Сначала создайте компанию" };
      }
      const saved = await createBranch({ ...data, companyId });
      onSaved(saved);
    } else {
      const saved = await updateBranch(target!, data);
      onSaved(saved);
    }
    onClose();
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size={size} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold">
                {isNew ? "Новый филиал" : "Редактирование филиала"}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className={size === "full" ? undefined : "max-h-[70vh] overflow-y-auto"}>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {!isNew && !branch && !error ? <DetailSkeleton /> : null}
              {ready ? (
                <BranchForm
                  key={isNew ? "new" : branch!.id}
                  formId={FORM_ID}
                  hideSubmit
                  onPendingChange={setPending}
                  initial={branch ?? undefined}
                  submitLabel={submitLabel}
                  onSubmit={onSubmit}
                />
              ) : null}
            </Modal.Body>
            {ready ? (
              <Modal.Footer className="flex w-full">
                <Button type="submit" form={FORM_ID} isDisabled={pending} className="w-full">
                  <IconSave />
                  {pending ? "Сохранение…" : submitLabel}
                </Button>
              </Modal.Footer>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
