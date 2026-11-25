import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell title="Регистрация" subtitle="Клиентский доступ к аналитике филиалов">
      <AuthForm mode="register" />
    </AuthShell>
  );
}
