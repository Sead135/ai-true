"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { listCompanies } from "@/lib/companies";
import { BranchEditModal } from "./branch-edit-modal";
import { CompanyEditModal } from "./company-edit-modal";
import { useSession } from "./session-context";
import { UserEditModal } from "./user-edit-modal";

type EditModalsApi = {
  openCompany: (id: string | "new") => void;
  openBranch: (id: string | "new") => void;
  openUser: (id: string) => void;
  /** Bumps when any entity is saved/deleted — lists can refetch. */
  revision: number;
};

const EditModalsCtx = createContext<EditModalsApi | null>(null);

export function useEditModals() {
  const ctx = useContext(EditModalsCtx);
  if (!ctx) {
    throw new Error("useEditModals outside provider");
  }
  return ctx;
}

type EditModalsProviderProps = {
  children: React.ReactNode;
};

export function EditModalsProvider({ children }: EditModalsProviderProps) {
  const { me } = useSession();
  const [companyTarget, setCompanyTarget] = useState<string | "new" | null>(null);
  const [branchTarget, setBranchTarget] = useState<string | "new" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientCompanyId, setClientCompanyId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const bump = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    if (me.role !== "client") {
      setClientCompanyId(null);
      return;
    }
    let cancelled = false;
    listCompanies({ limit: 1 })
      .then((page) => {
        if (!cancelled) {
          setClientCompanyId(page.items[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClientCompanyId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [me.role, revision]);

  const api = useMemo<EditModalsApi>(
    () => ({
      openCompany: (id) => setCompanyTarget(id),
      openBranch: (id) => {
        if (id === "new" && me.role === "client" && !clientCompanyId) {
          setCompanyTarget("new");
          return;
        }
        setBranchTarget(id);
      },
      openUser: (id) => setUserId(id),
      revision,
    }),
    [me.role, clientCompanyId, revision],
  );

  return (
    <EditModalsCtx.Provider value={api}>
      {children}
      <CompanyEditModal
        target={companyTarget}
        onClose={() => setCompanyTarget(null)}
        onSaved={(c) => {
          if (me.role === "client") {
            setClientCompanyId(c.id);
          }
          bump();
        }}
      />
      <BranchEditModal
        target={branchTarget}
        companyId={me.role === "client" ? clientCompanyId : undefined}
        onClose={() => setBranchTarget(null)}
        onSaved={() => bump()}
      />
      {me.role === "admin" ? (
        <UserEditModal
          userId={userId}
          onClose={() => setUserId(null)}
          onSaved={() => bump()}
          onDeleted={() => bump()}
        />
      ) : null}
    </EditModalsCtx.Provider>
  );
}
