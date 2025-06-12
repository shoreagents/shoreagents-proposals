import { supabase } from './supabaseClient';

// Fetch all proposals
export async function fetchProposals() {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new proposal
export async function addProposal(proposal: {
  title: string;
  filename: string;
  custom_url?: string;
  type: string;
  size?: number;
  file_url?: string;
}) {
  const { data, error } = await supabase
    .from('proposals')
    .insert([proposal])
    .select();
  if (error) throw error;
  return data?.[0];
}

// Update a proposal
export async function updateProposal(id: string, updates: Partial<{
  title: string;
  filename: string;
  custom_url: string;
  type: string;
  size: number;
  file_url: string;
}>) {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data?.[0];
}

// Delete a proposal
export async function deleteProposal(id: string) {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
} 