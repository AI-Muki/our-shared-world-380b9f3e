-- helper: membership check
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Partner',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.couple_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Our Space',
  photo_url text,
  anniversary_date date,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_spaces TO authenticated;
GRANT ALL ON public.couple_spaces TO service_role;
ALTER TABLE public.couple_spaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_members TO authenticated;
GRANT ALL ON public.couple_members TO service_role;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_couple_member(_couple_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE couple_id = _couple_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.my_couple_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email,'Partner'), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- profiles policies
CREATE POLICY "profiles_select_self_or_partner" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.couple_members m WHERE m.user_id = profiles.id AND m.couple_id = public.my_couple_id()
));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- couple_spaces policies
CREATE POLICY "spaces_select_members" ON public.couple_spaces FOR SELECT TO authenticated
USING (public.is_couple_member(id, auth.uid()));
CREATE POLICY "spaces_insert_own" ON public.couple_spaces FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "spaces_update_members" ON public.couple_spaces FOR UPDATE TO authenticated
USING (public.is_couple_member(id, auth.uid())) WITH CHECK (public.is_couple_member(id, auth.uid()));
CREATE POLICY "spaces_delete_creator" ON public.couple_spaces FOR DELETE TO authenticated USING (created_by = auth.uid());

-- couple_members policies
CREATE POLICY "members_select_same_space" ON public.couple_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR couple_id = public.my_couple_id());
CREATE POLICY "members_insert_self" ON public.couple_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_delete_self" ON public.couple_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- invites
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT ALL ON public.invites TO service_role;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites_select_members_or_open" ON public.invites FOR SELECT TO authenticated
USING (
  public.is_couple_member(couple_id, auth.uid())
  OR (used_at IS NULL AND expires_at > now())
);
CREATE POLICY "invites_insert_members" ON public.invites FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND public.is_couple_member(couple_id, auth.uid()));
CREATE POLICY "invites_update_claim" ON public.invites FOR UPDATE TO authenticated
USING (used_at IS NULL AND expires_at > now())
WITH CHECK (used_by = auth.uid());
CREATE POLICY "invites_delete_members" ON public.invites FOR DELETE TO authenticated
USING (public.is_couple_member(couple_id, auth.uid()));

-- activities
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'random',
  status text NOT NULL DEFAULT 'want',
  priority int NOT NULL DEFAULT 2,
  budget text NOT NULL DEFAULT 'normal',
  duration text NOT NULL DEFAULT 'hours',
  vibe text NOT NULL DEFAULT 'anything',
  location text,
  planned_date timestamptz,
  notes text,
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- bucket items
CREATE TABLE public.bucket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  location text,
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bucket_items TO authenticated;
GRANT ALL ON public.bucket_items TO service_role;
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;

-- games
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🏆',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  score_text text,
  notes text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- date jar
CREATE TABLE public.date_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_secret boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.date_ideas TO authenticated;
GRANT ALL ON public.date_ideas TO service_role;
ALTER TABLE public.date_ideas ENABLE ROW LEVEL SECURITY;

-- shared couple-scoped policies
CREATE POLICY "activities_all_members" ON public.activities FOR ALL TO authenticated
USING (public.is_couple_member(couple_id, auth.uid())) WITH CHECK (public.is_couple_member(couple_id, auth.uid()));
CREATE POLICY "bucket_all_members" ON public.bucket_items FOR ALL TO authenticated
USING (public.is_couple_member(couple_id, auth.uid())) WITH CHECK (public.is_couple_member(couple_id, auth.uid()));
CREATE POLICY "games_all_members" ON public.games FOR ALL TO authenticated
USING (public.is_couple_member(couple_id, auth.uid())) WITH CHECK (public.is_couple_member(couple_id, auth.uid()));
CREATE POLICY "matches_all_members" ON public.matches FOR ALL TO authenticated
USING (public.is_couple_member(couple_id, auth.uid())) WITH CHECK (public.is_couple_member(couple_id, auth.uid()));
CREATE POLICY "dates_all_members" ON public.date_ideas FOR ALL TO authenticated
USING (public.is_couple_member(couple_id, auth.uid())) WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

CREATE TRIGGER t_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_spaces_updated BEFORE UPDATE ON public.couple_spaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_activities_updated BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_bucket_updated BEFORE UPDATE ON public.bucket_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_activities_couple ON public.activities(couple_id);
CREATE INDEX idx_bucket_couple ON public.bucket_items(couple_id);
CREATE INDEX idx_matches_couple ON public.matches(couple_id);
CREATE INDEX idx_dates_couple ON public.date_ideas(couple_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bucket_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.date_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_members;