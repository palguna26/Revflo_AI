create table if not exists public.workspace_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('github', 'linear', 'csv')),
  access_token text,
  connected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_synced_at timestamp with time zone,
  signal_count integer default 0 not null,
  unique (workspace_id, provider)
);

-- RLS
alter table public.workspace_integrations enable row level security;

create policy "Users can view their workspace integrations" 
  on public.workspace_integrations for select 
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_integrations.workspace_id
      and wm.user_id = auth.uid()
    )
  );

create policy "Users can insert integrations for their workspace" 
  on public.workspace_integrations for insert 
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_integrations.workspace_id
      and wm.user_id = auth.uid()
    )
  );

create policy "Users can update their workspace integrations" 
  on public.workspace_integrations for update 
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_integrations.workspace_id
      and wm.user_id = auth.uid()
    )
  );

create policy "Users can delete their workspace integrations" 
  on public.workspace_integrations for delete 
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_integrations.workspace_id
      and wm.user_id = auth.uid()
    )
  );
