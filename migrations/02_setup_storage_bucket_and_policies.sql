-- Setup Supabase Storage bucket and policies for proposals

-- Create the proposals storage bucket (public)
insert into storage.buckets (id, name, public) 
values ('proposals', 'proposals', true) 
on conflict (id) do nothing;

-- Allow anyone to upload files to the proposals bucket
create policy "Allow uploads for all users" 
on storage.objects
for insert 
with check (bucket_id = 'proposals');

-- Allow anyone to view/download files from the proposals bucket
create policy "Allow public access" 
on storage.objects
for select 
using (bucket_id = 'proposals');

-- Allow anyone to update files in the proposals bucket (optional)
create policy "Allow updates for all users" 
on storage.objects
for update 
using (bucket_id = 'proposals');

-- Allow anyone to delete files from the proposals bucket (optional)
create policy "Allow deletes for all users" 
on storage.objects
for delete 
using (bucket_id = 'proposals'); 