create or replace function public.consume_feature_usage(
  p_feature_key text,
  p_limit integer,
  p_period_type text default 'monthly'
)
returns table (
  allowed boolean,
  usage_count integer,
  remaining integer,
  period_start timestamptz,
  period_end timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_user_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
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

  if p_limit <= 0 then
    raise exception 'Quota limit must be greater than zero.'
      using errcode = '22023';
  end if;

  if p_period_type = 'daily' then
    v_period_start := date_trunc('day', now());
    v_period_end := v_period_start + interval '1 day';
  elsif p_period_type = 'monthly' then
    v_period_start := date_trunc('month', now());
    v_period_end := v_period_start + interval '1 month';
  elsif p_period_type = 'lifetime' then
    v_period_start :=
      '2000-01-01 00:00:00+00'::timestamptz;

    v_period_end :=
      '9999-12-31 23:59:59+00'::timestamptz;
  else
    raise exception
      'Unsupported quota period type: %',
      p_period_type
      using errcode = '22023';
  end if;

  insert into public.feature_usage (
    user_id,
    feature_key,
    period_type,
    period_start,
    period_end,
    usage_count
  )
  values (
    v_user_id,
    p_feature_key,
    p_period_type,
    v_period_start,
    v_period_end,
    0
  )
  on conflict (
    user_id,
    feature_key,
    period_type,
    period_start
  )
  do nothing;

  update public.feature_usage
  set usage_count =
    public.feature_usage.usage_count + 1
  where public.feature_usage.user_id = v_user_id
    and public.feature_usage.feature_key = p_feature_key
    and public.feature_usage.period_type = p_period_type
    and public.feature_usage.period_start = v_period_start
    and public.feature_usage.usage_count < p_limit
  returning public.feature_usage.usage_count
  into v_usage_count;

  if v_usage_count is null then
    select fu.usage_count
    into v_usage_count
    from public.feature_usage as fu
    where fu.user_id = v_user_id
      and fu.feature_key = p_feature_key
      and fu.period_type = p_period_type
      and fu.period_start = v_period_start;

    return query
    select
      false,
      coalesce(v_usage_count, 0),
      0,
      v_period_start,
      v_period_end;

    return;
  end if;

  return query
  select
    true,
    v_usage_count,
    greatest(p_limit - v_usage_count, 0),
    v_period_start,
    v_period_end;
end;
$$;

revoke all on function public.consume_feature_usage(
  text,
  integer,
  text
) from public;

revoke all on function public.consume_feature_usage(
  text,
  integer,
  text
) from anon;

grant execute on function public.consume_feature_usage(
  text,
  integer,
  text
) to authenticated;

comment on function public.consume_feature_usage(
  text,
  integer,
  text
) is
  'Atomically consumes one authenticated-user feature quota unit and returns the updated allowance state.';
