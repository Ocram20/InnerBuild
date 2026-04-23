insert into storage.buckets (id, name, public) 
values ('article-covers', 'article-covers', true) 
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select 
using ( bucket_id = 'article-covers' );

create policy "Authenticated Uploads" on storage.objects for insert 
with check ( bucket_id = 'article-covers' AND auth.role() = 'authenticated' );

create policy "Authenticated Updates" on storage.objects for update 
with check ( bucket_id = 'article-covers' AND auth.role() = 'authenticated' );
