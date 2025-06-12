import { NextRequest, NextResponse } from 'next/server';
import { fetchProposals } from '@/lib/proposalsApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
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

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProposals = filteredProposals.slice(startIndex, endIndex);
    
    // Transform data to match expected frontend format
    const components = paginatedProposals.map(proposal => ({
      name: proposal.title,
      filename: proposal.filename,
      uploadDate: proposal.created_at,
      title: proposal.title,
      customUrl: proposal.custom_url,
      type: proposal.type
    }));

    const hasMore = endIndex < filteredProposals.length;

    return NextResponse.json({
      components,
      hasMore,
      total: filteredProposals.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { message: 'Failed to fetch components', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 