import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Find the proposal in the database
    const { data: proposal, error: dbError } = await supabase
      .from('proposals')
      .select('*')
      .eq('filename', filename)
      .single();

    if (dbError || !proposal) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Determine the storage path based on file type
    const isHtml = proposal.type === 'html';
    const storagePath = isHtml ? `html/${filename}` : `react/${filename}`;

    // Download the file content from Supabase storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('proposals')
      .download(storagePath);

    if (storageError || !fileData) {
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { message: 'Failed to fetch file content from storage' },
        { status: 500 }
      );
    }

    // Convert blob to text
    const content = await fileData.text();

    return NextResponse.json({
      content,
      metadata: {
        title: proposal.title,
        filename: proposal.filename,
        uploadDate: proposal.created_at,
        customUrl: proposal.custom_url,
        type: proposal.type,
        size: proposal.size
      }
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { message: 'Failed to fetch file', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 