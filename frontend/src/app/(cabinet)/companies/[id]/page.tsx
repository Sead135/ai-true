"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditModals } from "@/components/cabinet/edit-modals-context";
import { useSession } from "@/components/cabinet/session-context";
import { usePageTransition } from "@/components/page-transition";

/** Legacy deep-link: open company modal. */
export default function CompanyEditRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const { me } = useSession();
  const { navigate } = usePageTransition();
  const { openCompany } = useEditModals();

  useEffect(() => {
    openCompany(id);
    navigate(me.role === "admin" ? "/companies" : "/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
