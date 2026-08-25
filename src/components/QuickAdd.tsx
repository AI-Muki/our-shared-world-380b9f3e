import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BUDGETS, CATEGORIES, DURATIONS, STARTER_GAMES, VIBES } from "@/lib/ourspace";
import type { Profile } from "@/hooks/useSpace";

type Kind = "menu" | "activity" | "date" | "bucket" | "match";

const MENU: { kind: Exclude<Kind, "menu">; emoji: string; label: string; hint: string }[] = [
  { kind: "activity", emoji: "🎯", label: "Activity", hint: "Something to do together" },
  { kind: "date", emoji: "❤️", label: "Date idea", hint: "Drop it in the date jar" },
  { kind: "bucket", emoji: "🪣", label: "Bucket list item", hint: "A someday-for-sure" },
  { kind: "match", emoji: "🏆", label: "Match result", hint: "Settle the score" },
];

function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; emoji: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`tap tap-active rounded-full border px-3 py-1.5 text-sm ${
            value === option.value
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border bg-secondary text-secondary-foreground"
          }`}
        >
          {option.emoji} {option.label}
        </button>
      ))}
    </div>
  );
}

export function QuickAdd({
  coupleId,
  userId,
  me,
  partner,
}: {
  coupleId: string;
  userId: string;
  me: Profile | null;
  partner: Profile | null;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("menu");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  // activity
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("adventure");
  const [budget, setBudget] = useState("normal");
  const [duration, setDuration] = useState("hours");
  const [vibe, setVibe] = useState("anything");
  const [plannedDate, setPlannedDate] = useState("");
  // date jar
  const [dateText, setDateText] = useState("");
  const [secret, setSecret] = useState(false);
  // match
  const [gameId, setGameId] = useState("");
  const [newGame, setNewGame] = useState("");
  const [score, setScore] = useState("");
  const [winner, setWinner] = useState<string>(userId);

  const games = useQuery({
    queryKey: ["games", coupleId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  function reset() {
    setKind("menu");
    setTitle("");
    setDescription("");
    setPlannedDate("");
    setDateText("");
    setSecret(false);
    setScore("");
    setNewGame("");
  }

  async function submit() {
    setBusy(true);
    try {
      if (kind === "activity") {
        if (!title.trim()) throw new Error("Give it a title.");
        const { error } = await supabase.from("activities").insert({
          couple_id: coupleId,
          created_by: userId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          budget,
          duration,
          vibe,
          status: plannedDate ? "planned" : "want",
          planned_date: plannedDate ? new Date(plannedDate).toISOString() : null,
        });
        if (error) throw error;
        toast.success("Added to your list 🎯");
      } else if (kind === "date") {
        if (!dateText.trim()) throw new Error("Write your date idea.");
        const { error } = await supabase.from("date_ideas").insert({
          couple_id: coupleId,
          created_by: userId,
          text: dateText.trim(),
          is_secret: secret,
        });
        if (error) throw error;
        toast.success("Dropped in the jar ❤️");
      } else if (kind === "bucket") {
        if (!title.trim()) throw new Error("Give it a title.");
        const { error } = await supabase.from("bucket_items").insert({
          couple_id: coupleId,
          created_by: userId,
          title: title.trim(),
          notes: description.trim() || null,
        });
        if (error) throw error;
        toast.success("On the bucket list 🪣");
      } else if (kind === "match") {
        let id = gameId;
        if (!id) {
          if (!newGame.trim()) throw new Error("Pick or name a game.");
          const { data, error } = await supabase
            .from("games")
            .insert({
              couple_id: coupleId,
              created_by: userId,
              name: newGame.trim(),
              emoji: "🏆",
            })
            .select("id")
            .single();
          if (error) throw error;
          id = data.id;
        }
        const { error } = await supabase.from("matches").insert({
          couple_id: coupleId,
          created_by: userId,
          game_id: id,
          winner_id: winner || null,
          score_text: score.trim() || null,
        });
        if (error) throw error;
        toast.success("Score saved 🏆");
      }
      await queryClient.invalidateQueries();
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Quick add"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="tap tap-active float-shadow -mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Plus className="size-7" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">
              {kind === "menu" ? "What do you want to add?" : "Quick add"}
            </SheetTitle>
          </SheetHeader>

          {kind === "menu" ? (
            <div className="grid gap-2 pb-6">
              {MENU.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setKind(item.kind)}
                  className="tap tap-active flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 pb-8">
              {kind === "activity" || kind === "bucket" ? (
                <>
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={kind === "bucket" ? "Visit Japan" : "Try a shooting range"}
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{kind === "bucket" ? "Notes" : "Description"}</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              ) : null}

              {kind === "activity" ? (
                <>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Chips options={CATEGORIES} value={category} onChange={setCategory} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Budget</Label>
                    <Chips options={BUDGETS} value={budget} onChange={setBudget} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Time needed</Label>
                    <Chips options={DURATIONS} value={duration} onChange={setDuration} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Vibe</Label>
                    <Chips options={VIBES} value={vibe} onChange={setVibe} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Planned for (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={plannedDate}
                      onChange={(e) => setPlannedDate(e.target.value)}
                    />
                  </div>
                </>
              ) : null}

              {kind === "date" ? (
                <>
                  <div className="grid gap-2">
                    <Label>Date idea</Label>
                    <Textarea
                      value={dateText}
                      onChange={(e) => setDateText(e.target.value)}
                      rows={3}
                      placeholder="Night drive + ice cream"
                      autoFocus
                    />
                  </div>
                  <label className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <span className="text-sm">Keep it a surprise until it's picked</span>
                    <Switch checked={secret} onCheckedChange={setSecret} />
                  </label>
                </>
              ) : null}

              {kind === "match" ? (
                <>
                  <div className="grid gap-2">
                    <Label>Game</Label>
                    <div className="flex flex-wrap gap-2">
                      {(games.data ?? []).map((game) => (
                        <button
                          key={game.id}
                          type="button"
                          onClick={() => setGameId(game.id)}
                          className={`tap tap-active rounded-full border px-3 py-1.5 text-sm ${
                            gameId === game.id
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border bg-secondary"
                          }`}
                        >
                          {game.emoji} {game.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newGame}
                        onChange={(e) => {
                          setNewGame(e.target.value);
                          setGameId("");
                        }}
                        placeholder="…or a new game"
                      />
                    </div>
                    {!games.data?.length ? (
                      <p className="text-xs text-muted-foreground">
                        Ideas: {STARTER_GAMES.map((g) => `${g.emoji} ${g.name}`).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label>Score (optional)</Label>
                    <Input
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="6-4 · 3-6 · 6-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Winner</Label>
                    <div className="flex flex-wrap gap-2">
                      {[me, partner].filter(Boolean).map((profile) => (
                        <button
                          key={profile!.id}
                          type="button"
                          onClick={() => setWinner(profile!.id)}
                          className={`tap tap-active rounded-full border px-3 py-1.5 text-sm ${
                            winner === profile!.id
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border bg-secondary"
                          }`}
                        >
                          🏅 {profile!.display_name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWinner("")}
                        className={`tap tap-active rounded-full border px-3 py-1.5 text-sm ${
                          winner === ""
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border bg-secondary"
                        }`}
                      >
                        🤝 Draw
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={reset} className="flex-1">
                  Back
                </Button>
                <Button onClick={submit} disabled={busy} className="flex-1">
                  {busy ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
