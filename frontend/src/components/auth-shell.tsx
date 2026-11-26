import { AuthOrbs } from "./auth-orbs";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-shell relative flex h-dvh max-h-dvh flex-col overflow-hidden md:flex-row">
      <div className="auth-brand-panel pointer-events-none absolute inset-0 md:hidden">
        <AuthOrbs />
      </div>

      <aside className="auth-brand-panel relative hidden h-full w-[46%] shrink-0 flex-col justify-between px-14 py-12 md:flex">
        <AuthOrbs />

        <div>
          <BrandLogo className="h-10 w-auto" />
        </div>

        <div className="max-w-lg">
          <h1 className="auth-brand-title text-[3.35rem] leading-[1.05] font-semibold tracking-[-0.04em]">
            Точки
          </h1>
          <p className="auth-brand-copy mt-5 max-w-[21rem] text-[15px] leading-relaxed">
            Показатели присутствия на геосервисах — просмотры, звонки, маршруты и рейтинг по
            филиалам.
          </p>

          <div className="auth-spark mt-11 grid" aria-hidden>
            <span style={{ height: "28%" }} />
            <span style={{ height: "46%" }} />
            <span style={{ height: "38%" }} />
            <span style={{ height: "72%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "88%" }} />
            <span style={{ height: "64%" }} />
          </div>
        </div>

        <p className="auth-brand-foot text-xs">Для команд с несколькими точками</p>
      </aside>

      <main className="auth-form-column relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="auth-form-header">
          <BrandLogo className="auth-form-header-logo h-7 w-auto" />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-10 md:py-14">
          <div className="auth-form-surface w-full max-w-[24rem]">
            <h2 className="auth-form-title">{title}</h2>
            {subtitle ? <p className="auth-form-subtitle">{subtitle}</p> : null}
            <div className="auth-form-body">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
