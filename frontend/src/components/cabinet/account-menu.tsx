"use client";

import { Button, Chip, Modal, useOverlayState } from "@heroui/react";
import { useRouter } from "next/navigation";
import { logout, profileDisplayName } from "@/lib/auth";
import { useModalSize } from "@/lib/use-is-mobile";
import { AccountAvatarModal, AvatarFace } from "./account-avatar-modal";
import { AccountNameModal } from "./account-name-modal";
import { useSession } from "./session-context";
import { UploadIcon } from "./upload-icon";

type IconProps = {
  className?: string;
};

function PencilIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

type AccountMenuProps = {
  collapsed?: boolean;
};

export function AccountMenu({ collapsed = false }: AccountMenuProps) {
  const { me, setMe } = useSession();
  const router = useRouter();
  const size = useModalSize("sm");

  const settings = useOverlayState();
  const avatarModal = useOverlayState();
  const nameModal = useOverlayState();

  async function onLogout() {
    await logout();
    settings.setOpen(false);
    router.replace("/login");
    router.refresh();
  }

  const trigger = collapsed ? (
    <Modal.Trigger>
      <button type="button" className="cabinet-account-avatar" aria-label="Меню аккаунта">
        <AvatarFace me={me} url={me.avatarUrl} />
      </button>
    </Modal.Trigger>
  ) : (
    <>
      <span className="cabinet-account-avatar overflow-hidden" aria-hidden>
        <AvatarFace me={me} url={me.avatarUrl} />
      </span>
      <span className="cabinet-account-meta">
        <span className="cabinet-account-name">{profileDisplayName(me)}</span>
        <span className="cabinet-account-email">{me.email}</span>
      </span>
      <Modal.Trigger>
        <button type="button" className="cabinet-account-more" aria-label="Меню аккаунта">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      </Modal.Trigger>
    </>
  );

  return (
    <>
      <Modal state={settings}>
        <div className={`cabinet-account ${collapsed ? "cabinet-account--collapsed" : ""}`}>
          {trigger}
        </div>

        <Modal.Backdrop isDismissable>
          <Modal.Container size={size} placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Modal.Heading className="text-lg font-semibold">Настройки</Modal.Heading>
                  <span className="text-foreground/25" aria-hidden>
                    ·
                  </span>
                  <Chip size="sm" variant="soft" color={me.role === "admin" ? "accent" : "default"}>
                    {me.role}
                  </Chip>
                </div>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="settings-avatar-btn"
                    aria-label="Изменить аватар"
                    onClick={() => avatarModal.setOpen(true)}
                  >
                    <span className="cabinet-account-avatar entity-logo-avatar overflow-hidden text-base">
                      <AvatarFace me={me} url={me.avatarUrl} />
                    </span>
                    <span className="settings-avatar-overlay">
                      <UploadIcon />
                    </span>
                  </button>

                  <button
                    type="button"
                    className="settings-name-btn min-w-0 flex-1 text-left"
                    onClick={() => nameModal.setOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-base font-semibold text-foreground">
                        {profileDisplayName(me)}
                      </span>
                      <PencilIcon className="settings-name-pencil size-3.5 shrink-0 text-foreground/40" />
                    </span>
                    <span className="mt-0.5 block text-xs text-foreground/45">
                      Нажмите, чтобы изменить ФИО
                    </span>
                  </button>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground/45">Email</p>
                  <p className="mt-1 truncate text-sm text-foreground">{me.email}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground/45">Дата регистрации</p>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(me.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" className="w-full" onPress={onLogout}>
                  Выйти
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <AccountAvatarModal state={avatarModal} me={me} size={size} onProfileUpdated={setMe} />
      <AccountNameModal state={nameModal} me={me} size={size} onProfileUpdated={setMe} />
    </>
  );
}
