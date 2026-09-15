import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { HeartHandshake, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpace } from "@/hooks/useSpace";
import { makeInviteCode } from "@/lib/ourspace";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Create your space — Our Space" },
      { name: "description", content: "Create your private couple space or join with a code." },
      { property: "og:title", content: "Create your space — Our Space" },
      {
        property: "og:description",
        content: "Create your private couple space or join with a code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { userId, space, isLoading, refetch } = useSpace();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [busy, setBusy] = useState(false);

  const [spaceName, setSpaceName] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [code, setCode] = useState("");

  if (isLoading) return null;
  if (!userId) return <Navigate to="/auth" />;
  if (space) return <Navigate to="/app" />;

  async function createSpace(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: created, error } = await supabase
        .from("couple_spaces")
        .insert({
          name: spaceName.trim() || "Our Space",
          anniversary_date: anniversary || null,
          created_by: userId!,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: mErr } = await supabase
        .from("couple_members")
        .insert({ couple_id: created.id, user_id: userId! });
      if (mErr) throw mErr;

      toast.success("Your space is ready 💫 Invite your partner next!");
      await refetch();
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the space.");
    } finally {
      setBusy(false);
    }
  }

  async function joinSpace(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const normalized = code.trim().toUpperCase();
      if (normalized.length < 6) throw new Error("Enter the full invite code.");

      const { data: invite, error } = await supabase
        .from("invites")
        .select("id, couple_id, expires_at, used_at")
        .eq("code", normalized)
        .maybeSingle();
      if (error) throw error;
      if (!invite) throw new Error("That code doesn't exist.");
      if (invite.used_at) throw new Error("That code was already used.");
      if (new Date(invite.expires_at).getTime() < Date.now())
        throw new Error("That code expired — ask for a new one.");

      const { error: mErr } = await supabase
        .from("couple_members")
        .insert({ couple_id: invite.couple_id, user_id: userId! });
      if (mErr) throw mErr;

      const { error: uErr } = await supabase
        .from("invites")
        .update({ used_at: new Date().toISOString(), used_by: userId! })
        .eq("id", invite.id);
      if (uErr) throw uErr;

      toast.success("You're in! 💞");
      await refetch();
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't join with that code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 pb-10 pt-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-center text-4xl">Your space for two</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Create a new private space, or join the one your partner made.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(["create", "join"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`tap tap-active rounded-full py-2 text-sm font-semibold ${
                tab === t ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t === "create" ? "Create new" : "I have a code"}
            </button>
          ))}
        </div>

        {tab === "create" ? (
          <form onSubmit={createSpace} className="surface animate-rise mt-4 grid gap-4 p-6">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary">
              <HeartHandshake className="size-6 text-primary" />
            </span>
            <div className="grid gap-2">
              <Label htmlFor="space-name">Space name</Label>
              <Input
                id="space-name"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Our Space"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="anniversary">Anniversary (optional)</Label>
              <Input
                id="anniversary"
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Creating…" : "Create our space"}
            </Button>
          </form>
        ) : (
          <form onSubmit={joinSpace} className="surface animate-rise mt-4 grid gap-4 p-6">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary">
              <KeyRound className="size-6 text-primary" />
            </span>
            <div className="grid gap-2">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="8-character code"
                className="text-center font-mono text-lg tracking-[0.3em] uppercase"
                maxLength={8}
                autoCapitalize="characters"
              />
            </div>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Joining…" : "Join our space"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
