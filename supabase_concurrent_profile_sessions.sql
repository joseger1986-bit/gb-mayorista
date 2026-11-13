-- Prevent future sign-ins from revoking other devices. No historical writes.
begin;

create or replace function public.internal_start_profile_session(
  p_username text, p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  verification jsonb;
  verified_username text;
  verified_role text;
  raw_token text;
  token_expires_at timestamptz := now() + interval '365 days';
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;
  verification := public.internal_verify_profile_password(p_username, p_password);
  if coalesce((verification->>'ok')::boolean, false) is not true then
    return verification;
  end if;
  verified_username := lower(trim(coalesce(verification->>'username', p_username, '')));
  verified_role := lower(trim(coalesce(verification->>'role', '')));
  if verified_username not in ('admin', 'empleado') or verified_role not in ('admin', 'employee') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_profile');
  end if;
  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into public.internal_profile_sessions (
    auth_user_id, username, role, token_hash, expires_at
  ) values (
    auth.uid(), verified_username, verified_role,
    public.internal_hash_profile_token(raw_token), token_expires_at
  );
  return verification || jsonb_build_object(
    'ok', true, 'username', verified_username, 'role', verified_role,
    'profile_session_token', raw_token, 'profile_session_expires_at', token_expires_at
  );
end;
$$;

revoke execute on function public.internal_start_profile_session(text,text) from public,anon;
grant execute on function public.internal_start_profile_session(text,text) to authenticated;
commit;

select 'concurrent_profile_sessions_ready' as result,
  has_function_privilege('authenticated','public.internal_start_profile_session(text,text)','execute') as authenticated_can_start,
  has_function_privilege('anon','public.internal_start_profile_session(text,text)','execute') as anon_can_start;
