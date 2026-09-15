import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { useSpace } from "@/hooks/useSpace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Space — a private world for two" },
      {
        name: "description",
        content:
          "A private home for couples: shared bucket list, plans, a date jar and friendly competition.",
      },
      { property: "og:title", content: "Our Space — a private world for two" },
      {
        property: "og:description",
        content: "A private home for couples: shared lists, plans, a date jar and games.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const { userId, space, isLoading } = useSpace();

  if (isLoading) {
    return (
      <div className="hero-gradient flex min-h-screen flex-col items-center justify-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-primary-foreground/15">
          <Heart className="size-8 text-primary-foreground" fill="currentColor" />
        </span>
        <p className="font-display text-2xl text-primary-foreground">Our Space</p>
      </div>
    );
  }

  if (!userId) return <Navigate to="/auth" />;
  if (!space) return <Navigate to="/onboarding" />;
  return <Navigate to="/app" />;
}
