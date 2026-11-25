"use client";

import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { type AuthError, login, register } from "@/lib/auth";
import { markOnboardingPending } from "@/lib/onboarding";
import { usePageTransition } from "./page-transition";

type Mode = "login" | "register";

type AuthFormProps = {
  mode: Mode;
};

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

/** useSearchParams needs Suspense for static prerender (/login, /register). */
export function AuthForm(props: AuthFormProps) {
  return (
    <Suspense>
      <AuthFormInner {...props} />
    </Suspense>
  );
}

function AuthFormInner({ mode }: AuthFormProps) {
  const { navigate } = usePageTransition();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setPending(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
        markOnboardingPending();
      }
      // Drop focus so iOS Safari releases input zoom before cabinet mounts
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      navigate(mode === "login" ? safeNext(searchParams.get("next")) : "/", { overlay: true });
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message ?? "Не удалось выполнить запрос");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-fields flex flex-col">
      <TextField
        isRequired
        name="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setError(null);
        }}
        isDisabled={pending}
        fullWidth
      >
        <Label>Email</Label>
        <Input type="email" placeholder="name@company.ru" autoComplete="email" />
      </TextField>

      <TextField
        isRequired
        name="password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setError(null);
        }}
        isDisabled={pending}
        fullWidth
        validate={(v) => (v.length < 6 ? "Минимум 6 символов" : true)}
      >
        <Label>Пароль</Label>
        <Input
          type="password"
          placeholder={mode === "login" ? "Ваш пароль" : "Не меньше 6 символов"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
        />
        <FieldError />
      </TextField>

      {mode === "register" ? (
        <TextField
          isRequired
          name="confirm"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setError(null);
          }}
          isDisabled={pending}
          fullWidth
          validate={(v) => (v !== password ? "Пароли не совпадают" : true)}
        >
          <Label>Ещё раз пароль</Label>
          <Input type="password" placeholder="Повторите пароль" autoComplete="new-password" />
          <FieldError />
        </TextField>
      ) : null}

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" fullWidth isPending={pending} className="auth-submit">
        {mode === "login" ? "Войти" : "Создать аккаунт"}
      </Button>

      <p className="auth-switch">
        {mode === "login" ? (
          <>
            Нет аккаунта?{" "}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => navigate("/register")}
            >
              Создать
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <button type="button" className="auth-switch-link" onClick={() => navigate("/login")}>
              Войти
            </button>
          </>
        )}
      </p>
    </form>
  );
}
