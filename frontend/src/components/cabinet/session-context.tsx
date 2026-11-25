"use client";

import { createContext, useContext, useState } from "react";
import type { Me } from "@/lib/auth";

type SessionValue = {
  me: Me;
  setMe: (me: Me) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

type SessionProviderProps = {
  me: Me;
  children: React.ReactNode;
};

export function SessionProvider({ me: initialMe, children }: SessionProviderProps) {
  const [me, setMe] = useState(initialMe);
  return <SessionContext.Provider value={{ me, setMe }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession outside SessionProvider");
  }
  return ctx;
}
