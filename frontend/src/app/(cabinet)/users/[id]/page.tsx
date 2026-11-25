"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { usePageTransition } from "@/components/page-transition";

/** Legacy deep-link: open modal on users list. */
export default function UserEditRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const { navigate } = usePageTransition();
  const { openUser } = useEditModals();

  useEffect(() => {
    openUser(id);
    navigate("/users");
    // provider lives in cabinet shell — modal state survives route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
