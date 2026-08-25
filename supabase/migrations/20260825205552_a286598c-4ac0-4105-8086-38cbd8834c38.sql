REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_couple_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_couple_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_couple_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_couple_id() TO authenticated;