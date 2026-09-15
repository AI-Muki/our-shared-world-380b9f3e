import { createFileRoute, Navigate, Outlet, useNavigate } from "@tanstack/react-router";
import { Heart, Home, ListChecks, Trophy } from "lucide-react";

import { AppLockGate } from "@/components/AppLock";
import { QuickAdd } from "@/components/QuickAdd";
import { useRealtimeSync, useSpace } from "@/hooks/useSpace";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const TABS = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/list", label: "Our List", icon: ListChecks, exact: false },
  { to: "/app/jar", label: "Date Jar", icon: Heart, exact: false },
  { to: "/app/vs", label: "Us vs Us", icon: Trophy, exact: false },
] as const;

function AppShell() {
  const { userId, space, me, partner, isLoading } = useSpace();
  const navigate = useNavigate();
  useRealtimeSync(space?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Heart className="size-8 animate-pulse text-primary" fill="currentColor" />
      </div>
    );
  }
  if (!userId) return <Navigate to="/auth" />;
  if (!space) return <Navigate to="/onboarding" />;

  return (
    <AppLockGate>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <main className="flex-1 px-4 pb-32 pt-6">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-5">
          <div className="surface float-shadow flex items-end justify-around rounded-full px-2 py-2">
            {TABS.slice(0, 2).map((tab) => (
              <TabButton key={tab.to} {...tab} onClick={() => navigate({ to: tab.to })} />
            ))}
            <QuickAdd coupleId={space.id} userId={userId} me={me} partner={partner} />
            {TABS.slice(2).map((tab) => (
              <TabButton key={tab.to} {...tab} onClick={() => navigate({ to: tab.to })} />
            ))}
          </div>
        </nav>
      </div>
    </AppLockGate>
  );
}

function TabButton({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  exact: boolean;
  onClick: () => void;
}) {
  // Active state via window location keeps this client-only and simple.
  const active =
    typeof window !== "undefined" &&
    (to === "/app" ? window.location.pathname === "/app" : window.location.pathname.startsWith(to));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap tap-active flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-semibold ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </button>
  );
}
