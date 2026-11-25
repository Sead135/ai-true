"use client";

import { useEffect } from "react";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { useSession } from "@/components/cabinet/session-context";
import { usePageTransition } from "@/components/page-transition";

/** Legacy deep-link: open create-company modal. */
export default function NewCompanyRedirectPage() {
  const { me } = useSession();
  const { navigate } = usePageTransition();
  const { openCompany } = useEditModals();

  useEffect(() => {
    if (me.role === "client") openCompany("new");
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
