import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { updateProposal } from '@/lib/proposalsApi';

export async function PUT(req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params;

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const customUrl = formData.get('customUrl') as string;
    const file = formData.get('file') as File | null;
    const code = formData.get('code') as string | null;
    const newFilename = (formData.get('newFilename') as string)?.trim();

    if (!title?.trim()) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Find the proposal in the database
    const { data: proposal, error: dbError } = await supabase
      .from('proposals')
      .select('*')
      .eq('filename', filename)
      .single();

    if (dbError || !proposal) {
      return NextResponse.json({ message: 'Component not found' }, { status: 404 });
    }

    // Check for custom URL conflict (excluding current proposal)
    if (customUrl?.trim()) {
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('custom_url', customUrl.trim())
        .neq('id', proposal.id)
        .single();

      if (existingProposal) {
        return NextResponse.json({ message: 'This custom URL is already in use' }, { status: 400 });
      }
    }

    // Determine file type and storage paths
    const isHtml = proposal.type === 'html';
    const currentStoragePath = isHtml ? `html/${filename}` : `react/${filename}`;
    
    let finalFilename = filename;
    let finalStoragePath = currentStoragePath;

    // Handle filename change
    if (newFilename && newFilename !== filename) {
      // Check for filename conflict
      const { data: existingWithNewName } = await supabase
        .from('proposals')
        .select('id')
        .eq('filename', newFilename)
        .neq('id', proposal.id)
        .single();

      if (existingWithNewName) {
        return NextResponse.json({ message: 'A file with the new filename already exists' }, { status: 400 });
      }

      finalFilename = newFilename;
      finalStoragePath = isHtml ? `html/${newFilename}` : `react/${newFilename}`;
    }

    // Update file content in storage if provided
    if (file || code) {
      let fileContent: Buffer;
      
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        fileContent = Buffer.from(arrayBuffer);
      } else if (code) {
        fileContent = Buffer.from(code, 'utf-8');
      } else {
        return NextResponse.json({ message: 'No file content provided' }, { status: 400 });
      }

      // If filename changed, copy to new location and delete old
      if (finalFilename !== filename) {
        // Upload to new location
        const { error: uploadError } = await supabase.storage
          .from('proposals')
          .upload(finalStoragePath, fileContent, {
            contentType: isHtml ? 'text/html' : 'text/plain',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json(
            { message: 'Failed to upload updated file', error: uploadError.message },
            { status: 500 }
          );
        }

        // Delete old file
        const { error: deleteError } = await supabase.storage
          .from('proposals')
          .remove([currentStoragePath]);

        if (deleteError) {
          console.error('Storage delete error:', deleteError);
          // Continue even if delete fails
        }
      } else {
        // Update existing file
        const { error: updateError } = await supabase.storage
          .from('proposals')
          .update(finalStoragePath, fileContent, {
            contentType: isHtml ? 'text/html' : 'text/plain',
            upsert: true
          });

        if (updateError) {
          console.error('Storage update error:', updateError);
          return NextResponse.json(
            { message: 'Failed to update file', error: updateError.message },
            { status: 500 }
          );
        }
      }
    }

    // Get the updated file URL
    const { data: urlData } = supabase.storage
      .from('proposals')
      .getPublicUrl(finalStoragePath);

    // Update proposal in database
    const updatedProposal = await updateProposal(proposal.id, {
      title: title.trim(),
      filename: finalFilename,
      custom_url: customUrl?.trim() || undefined,
      file_url: urlData.publicUrl
    });

    return NextResponse.json({ 
      message: 'Component updated successfully', 
      metadata: {
        id: updatedProposal.id,
        title: updatedProposal.title,
        filename: updatedProposal.filename,
        customUrl: updatedProposal.custom_url,
        uploadDate: updatedProposal.created_at,
        type: updatedProposal.type,
        size: updatedProposal.size,
        fileUrl: updatedProposal.file_url
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update component' }, 
      { status: 500 }
    );
  }
} 