alter table public.profiles
add column if not exists profile_role text not null default 'user';

alter table public.profiles
drop constraint if exists profiles_profile_role_check;

alter table public.profiles
add constraint profiles_profile_role_check
check (profile_role in ('user', 'admin'));

create table if not exists public.business_account_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  full_name text not null,
  phone text,
  profession text,
  company_name text,
  industry text,
  location text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_business_requests_user on public.business_account_requests(user_id);
create index if not exists idx_business_requests_status on public.business_account_requests(status);
create index if not exists idx_business_requests_created_at on public.business_account_requests(created_at desc);

drop trigger if exists set_business_account_requests_updated_at on public.business_account_requests;

create trigger set_business_account_requests_updated_at
before update on public.business_account_requests
for each row
execute function update_modified_column();

alter table public.business_account_requests enable row level security;

create or replace function public.review_business_account_request(
  p_request_id uuid,
  p_status text,
  p_admin_notes text default null
)
returns public.business_account_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_profile public.profiles;
  target_request public.business_account_requests;
  updated_request public.business_account_requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid review status.';
  end if;

  select *
  into acting_profile
  from public.profiles
  where id = auth.uid();

  if acting_profile.id is null or acting_profile.profile_role <> 'admin' then
    raise exception 'Admin access required.';
  end if;

  select *
  into target_request
  from public.business_account_requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Business request not found.';
  end if;

  if p_status = 'approved' then
    update public.profiles
    set user_type = 'business'
    where id = target_request.user_id;

    insert into public.notifications (
      user_id,
      title,
      body,
      type,
      data
    )
    values (
      target_request.user_id,
      'Business Account Approved',
      'Your business account request has been approved. You can now access business tools.',
      'company_status',
      jsonb_build_object(
        'type', 'business_request_approved',
        'request_id', target_request.id,
        'status', 'approved'
      )
    );
  else
    insert into public.notifications (
      user_id,
      title,
      body,
      type,
      data
    )
    values (
      target_request.user_id,
      'Business Account Request Rejected',
      coalesce(
        'Your business account request was not approved. Reason: ' || nullif(trim(coalesce(p_admin_notes, '')), ''),
        'Your business account request was not approved.'
      ),
      'company_status',
      jsonb_build_object(
        'type', 'business_request_rejected',
        'request_id', target_request.id,
        'status', 'rejected',
        'admin_notes', nullif(trim(coalesce(p_admin_notes, '')), '')
      )
    );
  end if;

  update public.business_account_requests
  set
    status = p_status,
    admin_notes = nullif(trim(coalesce(p_admin_notes, '')), ''),
    reviewed_at = timezone('utc'::text, now()),
    reviewed_by = auth.uid()
  where id = p_request_id
  returning *
  into updated_request;

  return updated_request;
end;
$$;

create or replace function public.retract_business_account_approval(
  p_request_id uuid
)
returns public.business_account_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_profile public.profiles;
  target_request public.business_account_requests;
  updated_request public.business_account_requests;
  remaining_approved_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into acting_profile
  from public.profiles
  where id = auth.uid();

  if acting_profile.id is null or acting_profile.profile_role <> 'admin' then
    raise exception 'Admin access required.';
  end if;

  select *
  into target_request
  from public.business_account_requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Business request not found.';
  end if;

  if target_request.status <> 'approved' then
    raise exception 'Only approved requests can be retracted.';
  end if;

  update public.business_account_requests
  set
    status = 'pending',
    admin_notes = null,
    reviewed_at = null,
    reviewed_by = null
  where id = p_request_id
  returning *
  into updated_request;

  select count(*)
  into remaining_approved_count
  from public.business_account_requests
  where user_id = target_request.user_id
    and status = 'approved';

  if remaining_approved_count = 0 then
    update public.profiles
    set user_type = 'user'
    where id = target_request.user_id;
  end if;

  insert into public.notifications (
    user_id,
    title,
    body,
    type,
    data
  )
  values (
    target_request.user_id,
    'Business Access Returned To Review',
    'Your business access has been moved back to pending review by an admin.',
    'company_status',
    jsonb_build_object(
      'type', 'business_request_retracted',
      'request_id', target_request.id,
      'status', 'pending'
    )
  );

  return updated_request;
end;
$$;

drop policy if exists "Users can create their own business requests" on public.business_account_requests;
create policy "Users can create their own business requests"
on public.business_account_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own business requests" on public.business_account_requests;
create policy "Users can read their own business requests"
on public.business_account_requests
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_role = 'admin'
  )
);

drop policy if exists "Admins can update business requests" on public.business_account_requests;
create policy "Admins can update business requests"
on public.business_account_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_role = 'admin'
  )
);

drop policy if exists "Users can delete their own pending business requests" on public.business_account_requests;
create policy "Users can delete their own pending business requests"
on public.business_account_requests
for delete
to authenticated
using (
  auth.uid() = user_id
  and status = 'pending'
);

drop policy if exists "Admins can update profiles for approvals" on public.profiles;
create policy "Admins can update profiles for approvals"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_role = 'admin'
  )
);
