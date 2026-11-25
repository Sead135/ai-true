"use client";

import { AdminDashboard } from "@/components/cabinet/admin-dashboard";
import { ClientDashboard } from "@/components/cabinet/client-dashboard";
import { useSession } from "@/components/cabinet/session-context";

export default function DashboardPage() {
  const { me } = useSession();
  return me.role === "admin" ? <AdminDashboard /> : <ClientDashboard />;
}
