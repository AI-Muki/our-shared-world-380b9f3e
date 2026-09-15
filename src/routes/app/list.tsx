import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { useSpace } from "@/hooks/useSpace";
import {
  BUDGETS,
  CATEGORIES,
  DURATIONS,
  STATUSES,
  formatDateTime,
  labelFor,
} from "@/lib/ourspace";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/list")({
  head: () => ({
    meta: [
      { title: "Our List — Our Space" },
      { name: "description", content: "Shared bucket list and activities." },
      { property: "og:title", content: "Our List — Our Space" },
      { property: "og:description", content: "Shared bucket list and activities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OurList,
});

type Tab = "want" | "planned" | "done" | "bucket";

const TAB_META: { value: Tab; label: string; emoji: string }[] = [
  { value: "want", label: "Want to do", emoji: "💭" },
  { value: "planned", label: "Planned", emoji: "📅" },
  { value: "done", label: "Done", emoji: "✅" },
  { value: "bucket", label: "Bucket list", emoji: "🪣" },
];

function OurList() {
  const { coupleId, me, partner } = useSpace();
  const [tab, setTab] = useState<Tab>("want");
  const queryClient = useQueryClient();

  const activities = useQuery({
    queryKey: ["activities", coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("couple_id", coupleId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const bucket = useQuery({
    queryKey: ["bucket", coupleId],
    enabled: !!coupleId && tab === "bucket",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bucket_items")
        .select("*")
        .eq("couple_id", coupleId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("activities")
      .update({
        status,
        completed_at: status === "done" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) toast.error(error.message);
    else await queryClient.invalidateQueries({ queryKey: ["activities", coupleId] });
  }

  async function toggleBucket(id: string, done: boolean) {
    const { error } = await supabase
      .from("bucket_items")
      .update({ completed_at: done ? null : new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else await queryClient.invalidateQueries({ queryKey: ["bucket", coupleId] });
  }

  const names = new Map(
    [me, partner].filter(Boolean).map((p) => [p!.id, p!.display_name]),
  );
  const list = (activities.data ?? []).filter((a) => a.status === tab);

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Our List</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAB_META.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`tap tap-active shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold ${
              tab === t.value
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab !== "bucket" ? (
        list.length ? (
          <div className="grid gap-3">
            {list.map((a) => (
              <article key={a.id} className="surface animate-rise p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-snug">
                      {labelFor(CATEGORIES, a.category).emoji} {a.title}
                    </h3>
                    {a.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    ) : null}
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{labelFor(BUDGETS, a.budget).emoji} {labelFor(BUDGETS, a.budget).label}</span>
                      <span>{labelFor(DURATIONS, a.duration).emoji} {labelFor(DURATIONS, a.duration).label}</span>
                      <span>by {names.get(a.created_by) ?? "…"}</span>
                    </p>
                    {a.planned_date ? (
                      <p className="mt-1 text-xs font-medium text-primary">
                        📅 {formatDateTime(a.planned_date)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {STATUSES.filter((st) => st.value !== a.status).map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setStatus(a.id, st.value)}
                      className="tap tap-active rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                    >
                      {st.emoji} {st.label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji={TAB_META.find((t) => t.value === tab)!.emoji}
            title={`Nothing ${tab === "want" ? "on the wishlist" : tab === "planned" ? "planned" : "done"} yet`}
            hint="Tap + below to add something you'll love doing together."
          />
        )
      ) : (bucket.data ?? []).length ? (
        <div className="grid gap-3">
          {(bucket.data ?? []).map((b) => {
            const done = !!b.completed_at;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBucket(b.id, done)}
                className="surface tap tap-active animate-rise flex items-center gap-3 p-4 text-left"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-sm ${
                    done ? "border-transparent bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="flex-1">
                  <span className={`block font-semibold ${done ? "line-through opacity-60" : ""}`}>
                    {b.title}
                  </span>
                  {b.notes ? (
                    <span className="block text-sm text-muted-foreground">{b.notes}</span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {names.get(b.created_by) ?? ""}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          emoji="🪣"
          title="Dream big together"
          hint="Bucket list items are the someday-for-sures. Add your first with +."
        />
      )}
    </div>
  );
}
