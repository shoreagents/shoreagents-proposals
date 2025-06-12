import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { addProposal } from '@/lib/proposalsApi';

// Function to get next available sequential number for filename
async function getNextSequentialNumber(baseName: string, extension: string): Promise<number> {
  // Get all existing proposals with similar filenames
  const { data: existingProposals } = await supabase
    .from('proposals')
    .select('filename')
    .ilike('filename', `${baseName}%${extension}`);

  if (!existingProposals || existingProposals.length === 0) {
    return 0; // No duplicates, use original name without number
  }

  const existingNumbers: number[] = [];
  
  existingProposals.forEach(proposal => {
    const filename = proposal.filename;
    
    // Check for exact match (no number)
    if (filename === `${baseName}${extension}`) {
      existingNumbers.push(0);
      return;
    }
    
    // Check for numbered versions: basename_1.html, basename_2.html, etc.
    const match = filename.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_([0-9]+)\\${extension.replace('.', '\\.')}$`));
    if (match) {
      existingNumbers.push(parseInt(match[1]));
    }
  });

  // Find the next available number
  if (existingNumbers.length === 0) {
    return 0; // No matches found, use original name
  }

  // Sort numbers and find the next available
  existingNumbers.sort((a, b) => a - b);
  
  let nextNumber = 1;
  for (const num of existingNumbers) {
    if (num === 0) continue; // Skip the original (no number)
    if (num === nextNumber) {
      nextNumber++;
    } else {
      break;
    }
  }

  return nextNumber;
}

// Function to get next available sequential number for custom URL
async function getNextSequentialCustomUrl(baseUrl: string): Promise<string> {
  // Get all existing proposals with similar custom URLs
  const { data: existingProposals } = await supabase
    .from('proposals')
    .select('custom_url')
    .ilike('custom_url', `${baseUrl}%`);

  if (!existingProposals || existingProposals.length === 0) {
    return baseUrl; // No duplicates, use original URL
  }

  const existingNumbers: number[] = [];
  
  existingProposals.forEach(proposal => {
    const customUrl = proposal.custom_url;
    
    if (!customUrl) return;
    
    // Check for exact match (no number)
    if (customUrl === baseUrl) {
      existingNumbers.push(0);
      return;
    }
    
    // Check for numbered versions: base-url-1, base-url-2, etc.
    const match = customUrl.match(new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-([0-9]+)$`));
    if (match) {
      existingNumbers.push(parseInt(match[1]));
    }
  });

  // Find the next available number
  if (existingNumbers.length === 0) {
    return baseUrl; // No matches found, use original URL
  }

  // Sort numbers and find the next available
  existingNumbers.sort((a, b) => a - b);
  
  let nextNumber = 1;
  for (const num of existingNumbers) {
    if (num === 0) continue; // Skip the original (no number)
    if (num === nextNumber) {
      nextNumber++;
    } else {
      break;
    }
  }

  return `${baseUrl}-${nextNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const customUrl = formData.get('customUrl') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate or validate custom URL
    let finalCustomUrl: string | undefined;
    
    if (customUrl?.trim()) {
      // User provided custom URL - validate it
      if (!/^[a-z0-9-_]+$/.test(customUrl.trim())) {
        return NextResponse.json(
          { message: 'Custom URL can only contain lowercase letters, numbers, hyphens, and underscores' },
          { status: 400 }
        );
      }

      // Check if custom URL is already in use in Supabase
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('custom_url', customUrl.trim())
        .single();

      if (existingProposal) {
        return NextResponse.json(
          { message: 'This custom URL is already in use' },
          { status: 400 }
        );
      }
      
      finalCustomUrl = customUrl.trim();
    } else {
      // Auto-generate custom URL from title with sequential numbering
      const baseUrl = title.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      finalCustomUrl = await getNextSequentialCustomUrl(baseUrl);
    }

    // Validate file type
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      return NextResponse.json(
        { message: 'Only .html and .htm files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 500 }
      );
    }

    // Read file content for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf-8');
    
    // Check if it's a valid HTML file
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
      return NextResponse.json(
        { message: 'File must be a valid HTML document' },
        { status: 400 }
      );
    }

    // Generate unique filename with sequential numbering
    const originalName = file.name.replace(/\.(html|htm)$/, '');
    const extension = '.html';
    const sequentialNumber = await getNextSequentialNumber(originalName, extension);
    
    const filename = sequentialNumber === 0 
      ? `${originalName}${extension}` 
      : `${originalName}_${sequentialNumber}${extension}`;
    const storagePath = `html/${filename}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('proposals')
      .upload(storagePath, buffer, {
        contentType: 'text/html',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { message: 'Failed to upload file to storage', error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('proposals')
      .getPublicUrl(storagePath);

    // Add proposal record to database
    try {
      const proposal = await addProposal({
        title: title.trim(),
        filename: filename,
        custom_url: finalCustomUrl,
        type: 'html',
        size: file.size,
        file_url: urlData.publicUrl
      });

      return NextResponse.json({
        message: 'File uploaded successfully',
        proposal,
        filename: filename,
        originalName: file.name,
        size: file.size,
        title: title.trim(),
        customUrl: finalCustomUrl,
        fileUrl: urlData.publicUrl
      });

    } catch (dbError: unknown) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage
        .from('proposals')
        .remove([storagePath]);

      console.error('Database error:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      return NextResponse.json(
        { message: 'Failed to save proposal to database', error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 