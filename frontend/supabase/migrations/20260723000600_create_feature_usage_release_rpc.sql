create or replace function public.release_feature_usage(
  p_feature_key text,
  p_period_type text default 'monthly'
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_period_start timestamptz;
  v_usage_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if p_feature_key is null or btrim(p_feature_key) = '' then
    raise exception 'Feature key is required.'
      using errcode = '22023';
  end if;

  if p_period_type = 'daily' then
    v_period_start := date_trunc('day', now());
  elsif p_period_type = 'monthly' then
    v_period_start := date_trunc('month', now());
  elsif p_period_type = 'lifetime' then
    v_period_start := '2000-01-01 00:00:00+00'::timestamptz;
  else
    raise exception 'Unsupported quota period type: %', p_period_type
      using errcode = '22023';
  end if;

  update public.feature_usage
  set usage_count = greatest(feature_usage.usage_count - 1, 0)
  where user_id = v_user_id
    and feature_key = p_feature_key
    and period_type = p_period_type
    and feature_usage.period_start = v_period_start
    and feature_usage.usage_count > 0
  returning feature_usage.usage_count
  into v_usage_count;

  return coalesce(v_usage_count, 0);
end;
$$;

revoke all on function public.release_feature_usage(
  text,
  text
) from public;

revoke all on function public.release_feature_usage(
  text,
  text
) from anon;

grant execute on function public.release_feature_usage(
  text,
  text
) to authenticated;

comment on function public.release_feature_usage(
  text,
  text
) is
  'Returns one previously consumed feature quota unit after an unsuccessful operation.';
