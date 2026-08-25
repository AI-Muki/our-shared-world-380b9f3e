import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; display_name: string; avatar_url: string | null };
export type Space = {
  id: string;
  name: string;
  photo_url: string | null;
  anniversary_date: string | null;
  created_by: string;
};

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, loading };
}

export function useSpace() {
  const { userId, loading } = useUser();

  const query = useQuery({
    queryKey: ["space", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: membership, error: mErr } = await supabase
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", userId!)
        .maybeSingle();
      if (mErr) throw mErr;
      if (!membership) return null;

      const [{ data: space, error: sErr }, { data: members, error: memErr }] = await Promise.all([
        supabase.from("couple_spaces").select("*").eq("id", membership.couple_id).maybeSingle(),
        supabase.from("couple_members").select("user_id").eq("couple_id", membership.couple_id),
      ]);
      if (sErr) throw sErr;
      if (memErr) throw memErr;

      const ids = (members ?? []).map((m) => m.user_id);
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      if (pErr) throw pErr;

      const me = (profiles ?? []).find((p) => p.id === userId) ?? null;
      const partner = (profiles ?? []).find((p) => p.id !== userId) ?? null;

      return {
        space: space as Space | null,
        me: me as Profile | null,
        partner: partner as Profile | null,
        memberIds: ids,
      };
    },
  });

  return {
    userId,
    authLoading: loading,
    isLoading: loading || query.isLoading,
    space: query.data?.space ?? null,
    me: query.data?.me ?? null,
    partner: query.data?.partner ?? null,
    coupleId: query.data?.space?.id ?? null,
    refetch: query.refetch,
  };
}

/** Keeps couple-scoped tables in sync between both partners in realtime. */
export function useRealtimeSync(coupleId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;
    const tables = ["activities", "bucket_items", "matches", "date_ideas", "couple_spaces", "games"];
    const channel = supabase.channel(`space-${coupleId}`);
    for (const table of tables) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries();
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, queryClient]);
}
