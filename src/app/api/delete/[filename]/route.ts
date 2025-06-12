import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { deleteProposal } from '@/lib/proposalsApi';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

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

    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('proposals')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      await deleteProposal(proposal.id);

      return NextResponse.json({
        message: 'Component deleted successfully',
        filename: filename
      });

    } catch (deleteError: any) {
      console.error('Database deletion error:', deleteError);
      return NextResponse.json(
        { message: 'Failed to delete from database', error: deleteError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Delete failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 