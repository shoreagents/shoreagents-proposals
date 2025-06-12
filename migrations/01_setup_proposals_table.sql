-- Complete setup for proposals table in new Supabase project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create proposals table
create table if not exists proposals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  filename text not null,
  custom_url text unique,
  type text not null, -- 'html' or 'react'
  size integer,
  file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add index for faster lookups by custom_url
create index if not exists idx_proposals_custom_url on proposals(custom_url);

-- Enable Row Level Security
alter table proposals enable row level security;

-- Allow anyone to insert into proposals (for development)
create policy "Allow insert for all users"
  on proposals
  for insert
  with check (true);

-- Allow anyone to select from proposals
create policy "Allow select for all users"
  on proposals
  for select
  using (true); -- Complete setup for proposals table in new Supabase project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create proposals table
create table if not exists proposals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  filename text not null,
  custom_url text unique,
  type text not null, -- 'html' or 'react'
  size integer,
  file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add index for faster lookups by custom_url
create index if not exists idx_proposals_custom_url on proposals(custom_url);

-- Enable Row Level Security
alter table proposals enable row level security;

-- Allow anyone to insert into proposals (for development)
create policy "Allow insert for all users"
  on proposals
  for insert
  with check (true);

-- Allow anyone to select from proposals
create policy "Allow select for all users"
  on proposals
  for select
  using (true); -- Complete setup for proposals table in new Supabase project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create proposals table
create table if not exists proposals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  filename text not null,
  custom_url text unique,
  type text not null, -- 'html' or 'react'
  size integer,
  file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add index for faster lookups by custom_url
create index if not exists idx_proposals_custom_url on proposals(custom_url);

-- Enable Row Level Security
alter table proposals enable row level security;

-- Allow anyone to insert into proposals (for development)
create policy "Allow insert for all users"
  on proposals
  for insert
  with check (true);

-- Allow anyone to select from proposals
create policy "Allow select for all users"
  on proposals
  for select
  using (true); 