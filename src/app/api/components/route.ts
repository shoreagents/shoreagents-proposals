import { NextRequest, NextResponse } from 'next/server';
import { fetchProposals } from '@/lib/proposalsApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    // Fetch all proposals from Supabase
    const allProposals = await fetchProposals();
    
    // Apply search filter
    let filteredProposals = allProposals;
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredProposals = allProposals.filter(proposal => 
        proposal.title.toLowerCase().includes(searchLower) ||
        proposal.filename.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (type && type !== 'all') {
      filteredProposals = filteredProposals.filter(proposal => 
        proposal.type === type
      );
    }

    // Transform data to match expected frontend format
    const components = filteredProposals.map(proposal => ({
      name: proposal.title,
      filename: proposal.filename,
      uploadDate: proposal.created_at,
      title: proposal.title,
      customUrl: proposal.custom_url,
      type: proposal.type
    }));

    return NextResponse.json({
      components,
      total: filteredProposals.length
    });

  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { message: 'Failed to fetch components', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 