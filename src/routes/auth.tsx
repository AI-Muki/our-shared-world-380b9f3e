import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Our Space" },
      { name: "description", content: "Sign in to your private couple space." },
      { property: "og:title", content: "Sign in — Our Space" },
      { property: "og:description", content: "Sign in to your private couple space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Tell us your name.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          const { error: pErr } = await supabase
            .from("profiles")
            .upsert({ id: data.user.id, display_name: name.trim() });
          if (pErr) throw pErr;
        }
        toast.success("Welcome to Our Space 💞");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hero-gradient flex flex-col items-center gap-3 px-6 pb-12 pt-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-primary-foreground/15 float-shadow">
          <Heart className="size-8 text-primary-foreground" fill="currentColor" />
        </span>
        <h1 className="font-display text-4xl text-primary-foreground">Our Space</h1>
        <p className="max-w-xs text-sm text-primary-foreground/80">
          One private place for your plans, dreams and friendly rivalries.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="surface animate-rise mx-4 -mt-6 grid gap-4 p-6 sm:mx-auto sm:w-full sm:max-w-sm"
      >
        <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`tap tap-active rounded-full py-2 text-sm font-semibold ${
                mode === m ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {mode === "signup" ? (
          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amira"
              autoComplete="name"
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </div>

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create my account"}
        </Button>
      </form>
    </div>
  );
}
