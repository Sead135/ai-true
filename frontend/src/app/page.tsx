import type { Role } from "@ii/shared";

export default function Home() {
  const role: Role = "admin";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Истинный интеллект · каркас ({role})</p>
    </main>
  );
}
