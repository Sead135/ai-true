import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell title="Вход" subtitle="Email и пароль от вашего кабинета">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
