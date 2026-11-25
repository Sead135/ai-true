"use client";

import { Button, FieldError, Input, Label, Modal, TextField, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { createBranch } from "@/lib/branches";
import { createCompany, listCompanies } from "@/lib/companies";
import { takeOnboardingPending } from "@/lib/onboarding";
import { useModalSize } from "@/lib/use-is-mobile";
import { useSession } from "./session-context";

function dismissKey(userId: string) {
  return `onboardingDismissed:${userId}`;
}

type OnboardingWizardProps = {
  onDone: () => void;
};

export function OnboardingWizard({ onDone }: OnboardingWizardProps) {
  const { me } = useSession();
  const size = useModalSize("sm");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function dismiss() {
    try {
      localStorage.setItem(dismissKey(me.sub), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  const state = useOverlayState({
    isOpen: open,
    onOpenChange: (next) => {
      if (!next) {
        dismiss();
      }
    },
  });

  useEffect(() => {
    if (me.role !== "client") {
      return;
    }

    if (!takeOnboardingPending()) {
      return;
    }

    try {
      if (localStorage.getItem(dismissKey(me.sub))) {
        return;
      }
    } catch {
      /* continue */
    }

    let cancelled = false;
    listCompanies({ limit: 1 })
      .then((page) => {
        if (!cancelled && !page.items[0]) {
          setOpen(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [me.role, me.sub]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(step === 1 ? "Введите название компании" : "Введите название филиала");
      return;
    }
    setPending(true);
    setError(null);
    try {
      if (step === 1) {
        const company = await createCompany({ name: trimmed });
        setCompanyId(company.id);
        onDone();
        setName("");
        setStep(2);
      } else if (companyId) {
        await createBranch({ companyId, name: trimmed, isActive: true });
        onDone();
        dismiss();
      }
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (step === 1 && status === 409) {
        onDone();
        dismiss();
        return;
      }
      setError(
        (err as { message?: string }).message ??
          (step === 1 ? "Не удалось создать компанию" : "Не удалось создать филиал"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable={!pending} className="onboarding-backdrop">
        <Modal.Container size={size} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Body className="flex flex-col gap-4">
              <nav className="onboarding-steps" aria-label="Шаги онбординга">
                <span
                  className={`onboarding-step${step === 1 ? " onboarding-step--active" : " onboarding-step--done"}`}
                  aria-current={step === 1 ? "step" : undefined}
                >
                  1
                </span>
                <span
                  className={`onboarding-step-line${step === 2 ? " onboarding-step-line--done" : ""}`}
                  aria-hidden
                />
                <span
                  className={`onboarding-step${step === 2 ? " onboarding-step--active" : ""}`}
                  aria-current={step === 2 ? "step" : undefined}
                >
                  2
                </span>
              </nav>
              <Modal.Heading className="text-lg font-semibold">
                {step === 1 ? "Добавьте компанию" : "Добавьте филиал"}
              </Modal.Heading>
              {error ? (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              ) : null}
              <form id="onboarding-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                <TextField
                  isRequired
                  name="name"
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    setError(null);
                  }}
                  isDisabled={pending}
                  fullWidth
                >
                  <Label>{step === 1 ? "Название компании" : "Название филиала"}</Label>
                  <Input
                    placeholder={
                      step === 1 ? "Например, Кофейня «У реки»" : "Например, Филиал на Баумана"
                    }
                    autoFocus
                  />
                  <FieldError />
                </TextField>
              </form>
            </Modal.Body>
            <Modal.Footer className="flex w-full flex-col gap-2">
              <Button type="submit" form="onboarding-form" isDisabled={pending} className="w-full">
                {pending ? "Создание…" : "Создать"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                isDisabled={pending}
                className="w-full"
                onPress={dismiss}
              >
                {step === 1 ? "Пропустить" : "Добавлю позже"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
