import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useSpace } from "@/hooks/useSpace";
import { daysTogether, formatDateTime, labelFor, makeInviteCode, CATEGORIES } from "@/lib/ourspace";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Home — Our Space" },
      { name: "description", content: "Your private couple dashboard." },
      { property: "og:title", content: "Home — Our Space" },
      { property: "og:description", content: "Your private couple dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const { space, me, partner, coupleId, userId } = useSpace();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const stats = useQuery({
    queryKey: ["home-stats", coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const [acts, dates, matchRows] = await Promise.all([
        supabase
          .from("activities")
          .select("id, title, status, category, planned_date")
          .eq("couple_id", coupleId!),
        supabase.from("date_ideas").select("id, used_at").eq("couple_id", coupleId!),
        supabase.from("matches").select("id, winner_id").eq("couple_id", coupleId!),
      ]);
      if (acts.error) throw acts.error;
      if (dates.error) throw dates.error;
      if (matchRows.error) throw matchRows.error;

      const planned = (acts.data ?? [])
        .filter((a) => a.status === "planned" && a.planned_date)
        .sort((a, b) => new Date(a.planned_date!).getTime() - new Date(b.planned_date!).getTime());

      const myWins = (matchRows.data ?? []).filter((m) => m.winner_id === userId).length;
      const theirWins = (matchRows.data ?? []).filter(
        (m) => m.winner_id && m.winner_id !== userId,
      ).length;

      return {
        wantCount: (acts.data ?? []).filter((a) => a.status === "want").length,
        doneCount: (acts.data ?? []).filter((a) => a.status === "done").length,
        nextPlanned: planned[0] ?? null,
        jarCount: (dates.data ?? []).filter((d) => !d.used_at).length,
        myWins,
        theirWins,
      };
    },
  });

  async function createInvite() {
    if (!coupleId || !userId) return;
    setInviting(true);
    try {
      const code = makeInviteCode();
      const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
      const { error } = await supabase
        .from("invites")
        .insert({ code, couple_id: coupleId, created_by: userId, expires_at: expires });
      if (error) throw error;
      setInviteCode(code);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create a code.");
    } finally {
      setInviting(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await queryClient.clear();
    window.location.href = "/auth";
  }

  const days = daysTogether(space?.anniversary_date);
  const s = stats.data;

  return (
    <div className="grid gap-4">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {space?.name ?? "Our Space"}
          </p>
          <h1 className="font-display mt-1 text-3xl">
            Hi {me?.display_name ?? "there"} 👋
          </h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="tap tap-active rounded-full border border-border p-2.5 text-muted-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      <section className="hero-gradient float-shadow animate-rise rounded-3xl p-5 text-primary-foreground">
        {partner ? (
          <>
            <p className="text-sm opacity-80">
              {me?.display_name} & {partner.display_name}
            </p>
            <p className="font-display mt-2 text-4xl">
              {days !== null ? `${days} days together` : "Together, always"}
            </p>
            <p className="mt-1 text-xs opacity-75">…and counting 💞</p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl">This space fits two</p>
            <p className="mt-1 text-sm opacity-85">
              Invite your partner with a one-time code.
            </p>
            {inviteCode ? (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  toast.success("Code copied — send it to your partner 💌");
                }}
                className="tap tap-active mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-foreground/15 px-4 py-3 font-mono text-xl tracking-[0.3em]"
              >
                {inviteCode} <Copy className="size-4" />
              </button>
            ) : (
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={createInvite}
                disabled={inviting}
              >
                {inviting ? "Making a code…" : "Get an invite code"}
              </Button>
            )}
          </>
        )}
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="💭" value={s?.wantCount ?? 0} label="Want to do" />
        <StatCard emoji="✅" value={s?.doneCount ?? 0} label="Done" />
        <StatCard emoji="❤️" value={s?.jarCount ?? 0} label="In the jar" />
      </div>

      {s?.nextPlanned ? (
        <Link to="/app/list" className="block">
          <section className="surface animate-rise p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3.5" /> Up next
            </p>
            <p className="mt-2 text-lg font-semibold">
              {labelFor(CATEGORIES, s.nextPlanned.category).emoji} {s.nextPlanned.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(s.nextPlanned.planned_date)}
            </p>
          </section>
        </Link>
      ) : null}

      {(s?.myWins ?? 0) + (s?.theirWins ?? 0) > 0 ? (
        <Link to="/app/vs" className="block">
          <section className="surface animate-rise p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Us vs Us
            </p>
            <div className="mt-3 flex items-center justify-center gap-6">
              <Score name={me?.display_name ?? "You"} value={s!.myWins} mine />
              <span className="font-display text-2xl text-muted-foreground">:</span>
              <Score name={partner?.display_name ?? "Them"} value={s!.theirWins} mine={false} />
            </div>
          </section>
        </Link>
      ) : null}

      {s && s.wantCount === 0 && s.doneCount === 0 && s.jarCount === 0 ? (
        <EmptyState
          emoji="✨"
          title="A blank canvas"
          hint="Tap the big + button below and add your first shared idea."
        />
      ) : null}
    </div>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="surface animate-rise flex flex-col items-center gap-1 px-2 py-4 text-center">
      <span className="text-xl">{emoji}</span>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function Score({ name, value, mine }: { name: string; value: number; mine: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-display text-4xl"
        style={{ color: mine ? "var(--color-mine)" : "var(--color-theirs)" }}
      >
        {value}
      </span>
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {value > 0 && <Check className="size-3" />}
        {name}
      </span>
    </div>
  );
}
