-- Add missing RLS policies for delete and update operations

-- Allow anyone to delete proposals (for development)
create policy "Allow delete for all users"
  on proposals
  for delete
  using (true);

-- Allow anyone to update proposals (for development)
create policy "Allow update for all users"
  on proposals
  for update
  using (true); 