"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { IconSave, IconTrash } from "./filter-icons";
import { useEffect, useState } from "react";
import {
  createCompany,
  deleteCompany,
  getCompany,
  updateCompany,
  type Company,
  type CompanyInput,
} from "@/lib/companies";
import { useModalSize } from "@/lib/use-is-mobile";
import { CompanyForm } from "./company-form";
import { ConfirmModal } from "./confirm-modal";
import { DetailSkeleton } from "./skeletons";

const FORM_ID = "company-edit-form";

type CompanyEditModalProps = {
  target: string | "new" | null;
  onClose: () => void;
  onSaved: (company: Company) => void;
  onDeleted?: (companyId: string) => void;
};

export function CompanyEditModal({ target, onClose, onSaved, onDeleted }: CompanyEditModalProps) {
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
  const confirm = useOverlayState();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isNew = target === "new";
  const ready = isNew || !!company;
  const submitLabel = isNew ? "Создать" : "Сохранить";

  useEffect(() => {
    confirm.setOpen(false);
    if (!target || target === "new") {
      setCompany(null);
      setError(null);
      setPending(false);
      return;
    }
    let cancelled = false;
    setCompany(null);
    setError(null);
    setPending(false);
    getCompany(target)
      .then((c) => {
        if (!cancelled) {
          setCompany(c);
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

  async function onSubmit(data: CompanyInput) {
    const saved = isNew ? await createCompany(data) : await updateCompany(target!, data);
    onSaved(saved);
    onClose();
  }

  return (
    <>
      <Modal state={state}>
        <Modal.Backdrop isDismissable={!confirm.isOpen}>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading className="text-lg font-semibold">
                  {isNew ? "Новая компания" : "Редактирование компании"}
                </Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className={size === "full" ? undefined : "max-h-[70vh] overflow-y-auto"}>
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                {!isNew && !company && !error ? <DetailSkeleton /> : null}
                {ready ? (
                  <CompanyForm
                    key={isNew ? "new" : company!.id}
                    formId={FORM_ID}
                    hideSubmit
                    onPendingChange={setPending}
                    initial={company ?? undefined}
                    submitLabel={submitLabel}
                    onSubmit={onSubmit}
                  />
                ) : null}
              </Modal.Body>
              {ready ? (
                <Modal.Footer className="flex w-full flex-col gap-2">
                  <Button type="submit" form={FORM_ID} isDisabled={pending} className="w-full">
                    <IconSave />
                    {pending ? "Сохранение…" : submitLabel}
                  </Button>
                  {!isNew ? (
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
                  ) : null}
                </Modal.Footer>
              ) : null}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      {company ? (
        <ConfirmModal
          state={confirm}
          title="Удалить компанию?"
          message={`Точно удалить компанию «${company.name}»? Вместе с ней будут удалены все филиалы.`}
          onConfirm={async () => {
            await deleteCompany(company.id);
            onDeleted?.(company.id);
            onClose();
          }}
        />
      ) : null}
    </>
  );
}
