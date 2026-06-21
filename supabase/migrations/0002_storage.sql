-- Private storage bucket for uploaded client docs + generated-file blobs (SupabaseRepo).
insert into storage.buckets (id, name, public)
values ('dcc-blobs', 'dcc-blobs', false)
on conflict (id) do nothing;
