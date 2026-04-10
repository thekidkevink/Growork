alter table public.profiles
add column if not exists date_of_birth date;

update public.profiles as p
set date_of_birth = nullif(u.raw_user_meta_data->>'date_of_birth', '')::date
from auth.users as u
where p.id = u.id
  and p.date_of_birth is null
  and coalesce(u.raw_user_meta_data->>'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$';
