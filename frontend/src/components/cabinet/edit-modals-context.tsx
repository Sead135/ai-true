"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { listCompanies } from "@/lib/companies";
import { qk } from "@/lib/query-keys";
import { BranchEditModal } from "./branch-edit-modal";
import { CompanyEditModal } from "./company-edit-modal";
import { OnboardingWizard } from "./onboarding-wizard";
import { useSession } from "./session-context";
import { UserEditModal } from "./user-edit-modal";

type EditModalsApi = {
  openCompany: (id: string | "new") => void;
  openBranch: (id: string | "new") => void;
  openUser: (id: string) => void;
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
  const qc = useQueryClient();
  const [companyTarget, setCompanyTarget] = useState<string | "new" | null>(null);
  const [branchTarget, setBranchTarget] = useState<string | "new" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { data: clientCompany = null } = useQuery({
    queryKey: qk.companies.mine,
    queryFn: async () => (await listCompanies({ limit: 1 })).items[0] ?? null,
    enabled: me.role === "client",
  });
  const clientCompanyId = clientCompany?.id ?? null;

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
    }),
    [me.role, clientCompanyId],
  );

  return (
    <EditModalsCtx.Provider value={api}>
      {children}
      <CompanyEditModal
        target={companyTarget}
        onClose={() => setCompanyTarget(null)}
        onSaved={(c) => {
          if (me.role === "client") {
            qc.setQueryData(qk.companies.mine, c);
          }
          void qc.invalidateQueries({ queryKey: qk.companies.all });
        }}
      />
      <BranchEditModal
        target={branchTarget}
        companyId={me.role === "client" ? clientCompanyId : undefined}
        onClose={() => setBranchTarget(null)}
        onSaved={() => {
          void qc.invalidateQueries({ queryKey: qk.branches.all });
          void qc.invalidateQueries({ queryKey: qk.stats.all });
        }}
      />
      {me.role === "admin" ? (
        <UserEditModal
          userId={userId}
          onClose={() => setUserId(null)}
          onSaved={() => void qc.invalidateQueries({ queryKey: qk.users.all })}
          onDeleted={() => void qc.invalidateQueries({ queryKey: qk.users.all })}
        />
      ) : (
        <OnboardingWizard
          onDone={() => {
            void qc.invalidateQueries({ queryKey: qk.companies.all });
            void qc.invalidateQueries({ queryKey: qk.branches.all });
            void qc.invalidateQueries({ queryKey: qk.stats.all });
          }}
        />
      )}
    </EditModalsCtx.Provider>
  );
}
